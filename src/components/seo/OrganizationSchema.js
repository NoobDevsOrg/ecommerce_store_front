import { BUSINESS } from "../../lib/businessInfo";
import { getAbsoluteSiteUrl } from "../../lib/siteUrl";

export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BUSINESS.name,
    url: BUSINESS.url,
    logo: getAbsoluteSiteUrl(BUSINESS.logoPath),
    email: BUSINESS.email,
    telephone: BUSINESS.phones[0],
    sameAs: [BUSINESS.instagram],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />;
}
