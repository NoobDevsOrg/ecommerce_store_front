import { CANONICAL_PRODUCTION_SITE_URL, normalizeSiteUrl, resolveSiteUrl } from "./seoFoundation.mjs";

export { CANONICAL_PRODUCTION_SITE_URL };

export function getSiteUrl() {
  const configuredUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL);
  return resolveSiteUrl({ configuredUrl, nodeEnv: process.env.NODE_ENV });
}

export function getAbsoluteSiteUrl(path = "/") {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return null;

  return new URL(path, `${siteUrl}/`).toString();
}
