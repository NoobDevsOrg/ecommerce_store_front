import Link from "next/link";
import InformationalPage, { ContentSection } from "../../components/content/InformationalPage";
import { BUSINESS, informationalMetadata } from "../../lib/businessInfo";

export const metadata = informationalMetadata("terms");

export default function TermsPage() {
  return <InformationalPage title="Terms & Conditions" intro="These terms describe the use of the Sagunthala Dance Jewellery website and its catalogue, enquiry, and online checkout features.">
    <ContentSection title="Catalogue and availability">
      <p>Product information, images, prices, and availability are presented for the current catalogue. Availability and checkout totals are confirmed through the purchase process before payment.</p>
    </ContentSection>
    <ContentSection title="Orders and payment">
      <p>Orders placed through this website are paid online through Razorpay. Cash on delivery is not currently available for website orders. A product enquiry is not an order or payment confirmation.</p>
    </ContentSection>
    <ContentSection title="Shipping and customer information">
      <p>Delivery charges and availability depend on the delivery address and current shipping configuration. Please review the <Link href="/shipping" className="text-[#d4af37] underline decoration-[#b48a3c]/60 underline-offset-4 hover:text-[#f0d984]">Shipping Policy</Link> before checkout and provide accurate contact and delivery information.</p>
    </ContentSection>
    <ContentSection title="Website use">
      <p>Please use the website lawfully and do not interfere with its operation, access another customer&apos;s account, or misuse catalogue, checkout, or enquiry features.</p>
    </ContentSection>
    <ContentSection title="Contact">
      <p>For questions about these website terms, contact <a href={`mailto:${BUSINESS.email}`} className="text-[#d4af37] underline decoration-[#b48a3c]/60 underline-offset-4 hover:text-[#f0d984]">{BUSINESS.email}</a>.</p>
    </ContentSection>
  </InformationalPage>;
}
