import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { categoryAncestors, categoryDescendantIds, collectionHref } from "../src/lib/categoryUrl.js";
import { collectionProducts, publicCollectionCategories } from "../src/lib/collectionData.js";

const categories = [
  { id: "temple", name: "Temple Jewellery", slug: "temple-jewellery", is_active: true },
  { id: "oddiyanam", name: "Oddiyanam", slug: "oddiyanam", parent_id: "temple", is_active: true },
  { id: "inactive", name: "Inactive", slug: "inactive", is_active: false },
  { id: "demo", name: "Demo", slug: "demo-pieces", is_active: true },
];
const products = [
  { id: "one", slug: "lakshmi-oddiyanam", category_id: "oddiyanam", is_published: true },
  { id: "two", slug: "demo-product", category_id: "demo", is_published: true },
];

test("collection URLs use only active, non-sample category slugs", () => {
  assert.equal(collectionHref(categories[0]), "/collections/temple-jewellery");
  assert.equal(collectionHref(categories[2]), null);
  assert.equal(collectionHref(categories[3]), null);
});

test("parent collections retain current descendant-category catalogue semantics", () => {
  assert.deepEqual(categoryDescendantIds(categories, "temple"), ["temple", "oddiyanam"]);
  assert.deepEqual(categoryAncestors(categories, "oddiyanam").map((category) => category.slug), ["temple-jewellery"]);
  assert.deepEqual(collectionProducts(categories[0], categories, products).map((product) => product.slug), ["lakshmi-oddiyanam"]);
  assert.deepEqual(publicCollectionCategories(categories, products).map((category) => category.slug), ["temple-jewellery", "oddiyanam"]);
});

test("collection route has server metadata, breadcrumb and visible product/item-list support", async () => {
  const source = await readFile(new URL("../src/app/collections/[slug]/page.js", import.meta.url), "utf8");
  const sitemapSource = await readFile(new URL("../src/app/sitemap.js", import.meta.url), "utf8");
  const productPageSource = await readFile(new URL("../src/app/products/[slug]/page.js", import.meta.url), "utf8");
  assert.match(source, /export async function generateMetadata/);
  assert.match(source, /notFound\(\)/);
  assert.match(source, /<Breadcrumbs items=\{breadcrumbs\}/);
  assert.match(source, /"@type": "ItemList"/);
  assert.match(source, /<ProductCard/);
  assert.match(sitemapSource, /publicCollectionCategories/);
  assert.match(sitemapSource, /collectionHref/);
  assert.match(productPageSource, /<Breadcrumbs items=\{breadcrumbs\}/);
});
