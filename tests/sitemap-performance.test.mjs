import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sitemapSource = await readFile(new URL("../src/app/sitemap.js", import.meta.url), "utf8");

test("sitemap makes bounded catalogue/category requests and never fan-outs to product detail", () => {
  assert.match(sitemapSource, /getPublicProducts\(\s*1,\s*SITEMAP_CATALOGUE_LIMIT,\s*"",\s*\{ timeoutMs: SITEMAP_CATALOGUE_TIMEOUT_MS \}/);
  assert.match(sitemapSource, /getPublicProductFilters\(\{ timeoutMs: SITEMAP_CATALOGUE_TIMEOUT_MS \}\)/);
  assert.doesNotMatch(sitemapSource, /getPublicProductBySlug/);
  assert.doesNotMatch(sitemapSource, /for \(let page/);
});
