import { getAbsoluteSiteUrl, getSiteUrl } from "../lib/siteUrl";

export default function robots() {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/cart", "/login", "/search", "/review/"],
    },
    ...(siteUrl ? { host: siteUrl } : {}),
    ...(siteUrl ? { sitemap: getAbsoluteSiteUrl("/sitemap.xml") } : {}),
  };
}
