const DEVELOPMENT_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return process.env.NODE_ENV === "production" ? null : DEVELOPMENT_SITE_URL;
}

export function getAbsoluteSiteUrl(path = "/") {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return null;

  return new URL(path, `${siteUrl}/`).toString();
}
