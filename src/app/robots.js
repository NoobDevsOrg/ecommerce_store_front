import { getAbsoluteSiteUrl, getSiteUrl } from "../lib/siteUrl";

export default function robots() {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private routes use route-level noindex metadata. Leaving robots open
      // lets crawlers receive that directive instead of indexing a URL simply
      // because they could not crawl it. Authentication protects the data.
    },
    host: siteUrl,
    sitemap: getAbsoluteSiteUrl("/sitemap.xml"),
  };
}
