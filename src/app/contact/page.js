import Link from "next/link";
import InformationalPage, { ContentSection } from "../../components/content/InformationalPage";
import { BUSINESS, informationalMetadata } from "../../lib/businessInfo";

export const metadata = informationalMetadata("contact");

export default function ContactPage() {
  return <InformationalPage title="Contact Us" intro="Contact Sagunthala Dance Jewellery for general questions, product enquiries, or support relating to an order.">
    <ContentSection title="Contact details">
      <address className="not-italic">
        <p><span className="font-semibold text-stone-100">Email: </span><a href={`mailto:${BUSINESS.email}`} className="text-[#d4af37] underline decoration-[#b48a3c]/60 underline-offset-4 hover:text-[#f0d984]">{BUSINESS.email}</a></p>
        <p><span className="font-semibold text-stone-100">Phone: </span><a href="tel:+918189840100" className="text-[#d4af37] underline decoration-[#b48a3c]/60 underline-offset-4 hover:text-[#f0d984]">+91 8189840100</a> / <a href="tel:+917305873829" className="text-[#d4af37] underline decoration-[#b48a3c]/60 underline-offset-4 hover:text-[#f0d984]">7305873829</a></p>
        <p><span className="font-semibold text-stone-100">Address: </span>{BUSINESS.address}</p>
      </address>
    </ContentSection>
    <ContentSection title="Product enquiries">
      <p>For a question about a particular piece, open its product page and select the available enquiry option. This helps us receive your question with the relevant product details.</p>
      <p><Link href="/products" className="text-[#d4af37] underline decoration-[#b48a3c]/60 underline-offset-4 hover:text-[#f0d984]">Browse products</Link></p>
    </ContentSection>
    <ContentSection title="Order support">
      <p>Customers with an account can view order information in their account area. You may also use the contact details above for order-related assistance.</p>
    </ContentSection>
  </InformationalPage>;
}
