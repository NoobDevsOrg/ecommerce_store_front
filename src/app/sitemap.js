import { getPublicProducts } from "../lib/publicApi";
import { getAbsoluteSiteUrl } from "../lib/siteUrl";
import { buildProductSitemapEntries } from "../lib/seoFoundation.mjs";

export const dynamic = "force-dynamic";

const staticRoutes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
];

export default async function sitemap() {
  const sitemapEntries = staticRoutes
    .map((route) => {
      const url = getAbsoluteSiteUrl(route.path);
      return url ? { url, changeFrequency: route.changeFrequency, priority: route.priority } : null;
    })
    .filter(Boolean);

  try {
    const firstPage = await getPublicProducts(1, 100);
    const allProducts = [...(firstPage?.products || [])];
    const totalPages = Number(firstPage?.pagination?.totalPages || 1);

    for (let page = 2; page <= totalPages; page += 1) {
      const result = await getPublicProducts(page, 100);
      allProducts.push(...(result?.products || []));
    }

    return [
      ...sitemapEntries,
      ...buildProductSitemapEntries(allProducts, getAbsoluteSiteUrl("/")),
    ];
  } catch {
    // Never invent product URLs when the authoritative catalogue cannot be read.
    // The two public landing pages remain truthful and crawlable.
    return sitemapEntries;
  }
}
