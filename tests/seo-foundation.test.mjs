import assert from "node:assert/strict";
import test from "node:test";
import {
  CANONICAL_PRODUCTION_SITE_URL,
  absoluteProductUrl,
  buildProductSitemapEntries,
  resolveSiteUrl,
} from "../src/lib/seoFoundation.mjs";

test("production always resolves to the canonical HTTPS site URL", () => {
  assert.equal(resolveSiteUrl({ configuredUrl: "https://preview.example.com", nodeEnv: "production" }), CANONICAL_PRODUCTION_SITE_URL);
  assert.equal(resolveSiteUrl({ configuredUrl: undefined, nodeEnv: "production" }), CANONICAL_PRODUCTION_SITE_URL);
  assert.equal(resolveSiteUrl({ configuredUrl: CANONICAL_PRODUCTION_SITE_URL, nodeEnv: "production" }), CANONICAL_PRODUCTION_SITE_URL);
});

test("sitemap emits only published products with absolute canonical URLs", () => {
  const entries = buildProductSitemapEntries([
    { id: "published", slug: "temple-necklace", is_published: true, updated_at: "2026-10-04T00:00:00.000Z" },
    { id: "unpublished", slug: "private-piece", is_published: false },
    { id: "missing-slug", is_published: true },
    { id: "deleted", slug: "deleted-piece", is_published: true, is_deleted: true },
    { id: "sample", slug: "abc-product", is_published: true },
    { id: "demo", slug: "demo-necklace", is_published: true },
    { id: "bad-slug", slug: "gold & pearl", is_published: true },
  ]);

  assert.deepEqual(entries.map((entry) => entry.url), ["https://www.sagunthaladancejewellery.com/products/temple-necklace"]);
  assert.equal(entries[0].lastModified.toISOString(), "2026-10-04T00:00:00.000Z");
});

test("product URL generation rejects unpublished, deleted, test, and malformed records", () => {
  assert.equal(absoluteProductUrl({ slug: "gold & pearl", is_published: true }), null);
  assert.equal(absoluteProductUrl({ slug: "abc-product", is_published: true }), null);
  assert.equal(absoluteProductUrl({ slug: "real-piece", is_published: false }), null);
});
