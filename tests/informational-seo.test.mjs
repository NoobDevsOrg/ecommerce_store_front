import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageKeys = ["about", "contact", "privacy", "terms", "shipping"];

test("public information pages use the shared server-rendered content and metadata architecture", async () => {
  const sharedPage = await readFile(new URL("../src/components/content/InformationalPage.js", import.meta.url), "utf8");
  assert.match(sharedPage, /<Breadcrumbs items=/);
  assert.match(sharedPage, /<article/);

  for (const key of pageKeys) {
    const source = await readFile(new URL(`../src/app/${key}/page.js`, import.meta.url), "utf8");
    assert.match(source, new RegExp(`informationalMetadata\\(\\"${key}\\"\\)`));
    assert.match(source, /<InformationalPage/);
  }
});

test("footer and sitemap expose only implemented public information routes", async () => {
  const [footer, sitemap] = await Promise.all([
    readFile(new URL("../src/components/layout/Footer.js", import.meta.url), "utf8"),
    readFile(new URL("../src/app/sitemap.js", import.meta.url), "utf8"),
  ]);

  for (const path of pageKeys.map((key) => `/${key}`)) {
    assert.match(footer, new RegExp(`href: \\"${path}\\"`));
    assert.match(sitemap, new RegExp(`path: \\"${path}\\"`));
  }
  assert.doesNotMatch(footer, /href=["']#/i);
  assert.doesNotMatch(footer, /Refund Policy/);
});

test("policy copy does not promise unsupported returns, COD, or delivery timelines", async () => {
  const pages = await Promise.all(pageKeys.map((key) => readFile(new URL(`../src/app/${key}/page.js`, import.meta.url), "utf8")));
  const copy = pages.join("\n").toLowerCase();
  assert.doesNotMatch(copy, /\b(?:7|14|30)[- ]day returns?\b/);
  assert.doesNotMatch(copy, /easy refunds?|free returns?|refund within/);
  assert.doesNotMatch(copy, /deliver(?:y)? within \d/);
  assert.match(copy, /cash on delivery is not currently available for website orders/);
});
