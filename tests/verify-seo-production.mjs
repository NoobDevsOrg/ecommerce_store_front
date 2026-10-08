#!/usr/bin/env node
import assert from "node:assert/strict";

const site = (process.env.SITE_URL || "https://www.sagunthaladancejewellery.com").replace(/\/+$/, "");
const sampleCount = Math.max(1, Number(process.env.PRODUCT_SAMPLE_COUNT || 3));
const sitemapConcurrency = Math.max(1, Number(process.env.SITEMAP_CONCURRENCY || 8));
const forbiddenProductPath = /\/products\/(?:abc-product|(?:demo|test)(?:-|$))/i;

async function get(pathOrUrl) {
  const url = new URL(pathOrUrl, `${site}/`).toString();
  const response = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(30_000),
    headers: { "user-agent": "SagunthalaSEOPhase1Verifier/1.0" },
  });
  const body = await response.text();
  assert.equal(response.status, 200, `${url} returned HTTP ${response.status}`);
  return { url, body, headers: response.headers };
}

function urlsFromSitemap(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
  return match?.[1] || null;
}

function metaContent(html, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if (attribute(tag, "name") === key || attribute(tag, "property") === key) return attribute(tag, "content");
  }
  return null;
}

function canonical(html) {
  const tag = (html.match(/<link\b[^>]*>/gi) || []).find((candidate) => attribute(candidate, "rel") === "canonical");
  return tag ? attribute(tag, "href") : null;
}

function productJsonLd(html) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  for (const [, attrs, content] of scripts) {
    if (!/type=["']application\/ld\+json["']/i.test(attrs)) continue;
    const parsed = JSON.parse(content.trim());
    const values = Array.isArray(parsed) ? parsed : [parsed];
    const product = values.find((value) => value?.["@type"] === "Product");
    if (product) return product;
  }
  return null;
}

function assertAbsoluteUrl(value, label) {
  assert.ok(value && /^https:\/\//.test(value), `${label} must be an absolute HTTPS URL`);
}

async function mapWithConcurrency(items, limit, action) {
  const pending = [...items];
  const workers = Array.from({ length: Math.min(limit, pending.length) }, async () => {
    while (pending.length) await action(pending.shift());
  });
  await Promise.all(workers);
}

async function verifyProduct(url, expectedTitles, expectedDescriptions) {
  const { body: html } = await get(url);
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = metaContent(html, "description");
  const canonicalUrl = canonical(html);
  const ogUrl = metaContent(html, "og:url");
  const jsonLd = productJsonLd(html);

  assert.ok(title, `${url} has no title`);
  assert.ok(description, `${url} has no meta description`);
  assert.ok(!expectedTitles.has(title), `${url} repeats the title used by another product`);
  assert.ok(!expectedDescriptions.has(description), `${url} repeats the meta description used by another product`);
  expectedTitles.add(title);
  expectedDescriptions.add(description);
  assertAbsoluteUrl(canonicalUrl, `${url} canonical`);
  assertAbsoluteUrl(ogUrl, `${url} Open Graph URL`);
  assert.equal(canonicalUrl, url, `${url} canonical does not match its product URL`);
  assert.equal(ogUrl, url, `${url} og:url does not match its product URL`);
  assert.ok(jsonLd, `${url} has no Product JSON-LD`);
  assert.ok(jsonLd.name && html.includes(jsonLd.name), `${url} JSON-LD name is not visible on the page`);

  const jsonImages = Array.isArray(jsonLd.image) ? jsonLd.image : jsonLd.image ? [jsonLd.image] : [];
  assert.ok(jsonImages.length > 0, `${url} Product JSON-LD has no image`);
  for (const image of jsonImages) assert.ok(html.includes(image), `${url} JSON-LD image is not visible on the page`);

  const offer = jsonLd.offers;
  assert.ok(offer?.availability, `${url} Product JSON-LD has no availability`);
  const visibleAvailability = offer.availability.endsWith("InStock") ? "Available to order" : "Out of Stock";
  assert.ok(html.includes(visibleAvailability), `${url} structured availability does not match visible availability`);
  if (offer.price !== undefined) {
    const visiblePrice = `₹${Number(offer.price).toLocaleString("en-IN")}`;
    assert.ok(html.includes(visiblePrice), `${url} structured price does not match the visible price`);
  } else {
    assert.ok(html.includes("Price on request"), `${url} has no structured price but does not show Price on request`);
  }
}

async function main() {
  const home = await get("/");
  const products = await get("/products");
  const { body: robots } = await get("/robots.txt");
  const { body: sitemapXml } = await get("/sitemap.xml");

  assert.ok(home.body.includes("Explore the collection"), "Homepage is missing its crawlable collection CTA");
  const sitemapUrls = urlsFromSitemap(sitemapXml);
  assert.ok(sitemapUrls.includes(`${site}/`), "Sitemap is missing the home URL");
  assert.ok(sitemapUrls.includes(`${site}/products`), "Sitemap is missing /products");
  assert.ok(!/Disallow:\s*\/products(?:\/|\s|$)/i.test(robots), "robots.txt blocks the public products route");
  const productUrls = sitemapUrls.filter((url) => new URL(url).pathname.startsWith("/products/"));
  assert.ok(productUrls.length > 0, "Sitemap contains no product URLs");
  assert.ok(!sitemapUrls.some((url) => forbiddenProductPath.test(new URL(url).pathname)), "Sitemap contains a demo/test product URL");
  assert.ok(!products.body.includes("0 exquisite pieces found"), "/products SSR falsely reports zero products");
  assert.ok(!products.body.includes("No categories available"), "/products SSR falsely reports no categories");
  assert.ok(!/href=["'][^"']*\/products\/(?:abc-product|(?:demo|test)(?:-|["']))/i.test(products.body), "/products SSR contains a sample product link");

  await mapWithConcurrency(sitemapUrls, sitemapConcurrency, get);

  const productTitles = new Set();
  const productDescriptions = new Set();
  for (const url of productUrls.slice(0, sampleCount)) {
    await verifyProduct(url, productTitles, productDescriptions);
  }

  console.log(`SEO production verification passed: ${sitemapUrls.length} sitemap URLs, ${Math.min(sampleCount, productUrls.length)} product pages.`);
}

main().catch((error) => {
  console.error(`SEO production verification failed: ${error.message}`);
  process.exitCode = 1;
});
