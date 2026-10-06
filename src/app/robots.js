import { getAbsoluteSiteUrl, getSiteUrl } from "../lib/siteUrl";

export default function robots() {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Public crawlers must be able to receive each page's explicit noindex
      // directive. Application auth, not robots.txt, protects private routes.
      disallow: ["/admin/"],
    },
    host: siteUrl,
    sitemap: getAbsoluteSiteUrl("/sitemap.xml"),
  };
}
