import { getPublicProductBySlug, getPublicProducts } from "../lib/publicApi";
import { getAbsoluteSiteUrl } from "../lib/siteUrl";
import { buildProductSitemapEntries, isIndexablePublishedProduct } from "../lib/seoFoundation.mjs";

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

    // Re-read every candidate through the canonical detail endpoint. This
    // protects the sitemap from a stale list cache or a product which no
    // longer resolves at /products/[slug]. A partial result is not safe: if
    // this authority check fails, only the two static public routes are sent.
    const verifiedProducts = await Promise.all(allProducts
      .filter(isIndexablePublishedProduct)
      .map(async (candidate) => {
        const product = await getPublicProductBySlug(candidate.slug);
        if (!isIndexablePublishedProduct(product) || product.slug !== candidate.slug) {
          throw new Error("Product sitemap candidate no longer resolves");
        }
        return product;
      }));

    return [
      ...sitemapEntries,
      ...buildProductSitemapEntries(verifiedProducts, getAbsoluteSiteUrl("/")),
    ];
  } catch {
    // Never invent product URLs when the authoritative catalogue cannot be read.
    // The two public landing pages remain truthful and crawlable.
    return sitemapEntries;
  }
}
