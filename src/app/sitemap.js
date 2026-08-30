import { getPublicProducts } from "../lib/publicApi";
import { getAbsoluteSiteUrl } from "../lib/siteUrl";

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
      ...allProducts.flatMap((product) => {
        const url = product.slug ? getAbsoluteSiteUrl(`/products/${product.slug}`) : null;
        if (!url) return [];

        const updatedAt = product.updated_at ? new Date(product.updated_at) : null;
        return [{
          url,
          ...(updatedAt && !Number.isNaN(updatedAt.getTime()) ? { lastModified: updatedAt } : {}),
          changeFrequency: "weekly",
          priority: 0.8,
        }];
      }),
    ];
  } catch {
    // Keep the public landing-page sitemap available if the catalog API is temporarily unavailable.
    return sitemapEntries;
  }
}
