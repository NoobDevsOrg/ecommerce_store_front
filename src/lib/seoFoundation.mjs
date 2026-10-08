export const CANONICAL_PRODUCTION_SITE_URL = "https://www.sagunthaladancejewellery.com";
export const DEVELOPMENT_SITE_URL = "http://localhost:5000";

export function normalizeSiteUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function resolveSiteUrl({ configuredUrl, nodeEnv }) {
  // Production metadata must always name the one public canonical host. This
  // deliberately prevents a missing or preview-host environment value from
  // producing relative canonical URLs, Open Graph URLs, or sitemap entries.
  if (nodeEnv === "production") return CANONICAL_PRODUCTION_SITE_URL;

  return normalizeSiteUrl(configuredUrl) || DEVELOPMENT_SITE_URL;
}

export function isIndexablePublishedProduct(product) {
  if (!product || typeof product.slug !== "string") return false;

  const slug = product.slug.trim();
  const isPublished = product.is_published === true
    || product.isPublished === true
    || product.published === true;
  const isDeleted = product.is_deleted === true || product.isDeleted === true;
  // Public product URLs are a contract, not a name-derived convenience. Old
  // sample records (such as abc-product, demo-* and test-*) must never become
  // crawlable merely because a stale listing response contained them.
  const isTestRecord = /(?:^|-)(?:abc|demo|test)(?:-|$)/i.test(slug);

  return isPublished
    && !isDeleted
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    && !isTestRecord;
}

export function absoluteProductUrl(product, siteUrl = CANONICAL_PRODUCTION_SITE_URL) {
  if (!isIndexablePublishedProduct(product)) return null;
  return new URL(`/products/${encodeURIComponent(product.slug.trim())}`, `${siteUrl}/`).toString();
}


export function buildProductSitemapEntries(products, siteUrl = CANONICAL_PRODUCTION_SITE_URL) {
  return (Array.isArray(products) ? products : []).flatMap((product) => {
    const url = absoluteProductUrl(product, siteUrl);
    if (!url) return [];

    const updatedAt = product.updated_at ? new Date(product.updated_at) : null;
    return [{
      url,
      ...(updatedAt && !Number.isNaN(updatedAt.getTime()) ? { lastModified: updatedAt } : {}),
      changeFrequency: "weekly",
      priority: 0.8,
    }];
  });
}
