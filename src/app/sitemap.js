import { getPublicProducts } from "../lib/publicApi";
import { getAbsoluteSiteUrl } from "../lib/siteUrl";
import { buildProductSitemapEntries, isIndexablePublishedProduct } from "../lib/seoFoundation.mjs";

export const dynamic = "force-dynamic";

const staticRoutes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
];
const SITEMAP_CATALOGUE_LIMIT = 1000;
const SITEMAP_CATALOGUE_TIMEOUT_MS = 5_000;

export default async function sitemap() {
  const sitemapEntries = staticRoutes
    .map((route) => {
      const url = getAbsoluteSiteUrl(route.path);
      return url ? { url, changeFrequency: route.changeFrequency, priority: route.priority } : null;
    })
    .filter(Boolean);

  try {
    // One bounded, authoritative catalogue request. The API's public-query
    // predicate already limits records to published, non-deleted products;
    // the local predicate is a defensive URL-shape/demo-record guard.
    const catalogue = await getPublicProducts(
      1,
      SITEMAP_CATALOGUE_LIMIT,
      "",
      { timeoutMs: SITEMAP_CATALOGUE_TIMEOUT_MS },
    );
    const products = Array.isArray(catalogue?.products) ? catalogue.products : [];

    return [
      ...sitemapEntries,
      ...buildProductSitemapEntries(products.filter(isIndexablePublishedProduct), getAbsoluteSiteUrl("/")),
    ];
  } catch {
    // Never invent product URLs when the authoritative catalogue cannot be
    // read in time. The two public landing pages remain truthful/crawlable.
    return sitemapEntries;
  }
}
