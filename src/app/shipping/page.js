import Link from "next/link";
import InformationalPage, { ContentSection } from "../../components/content/InformationalPage";
import { BUSINESS, informationalMetadata } from "../../lib/businessInfo";

export const metadata = informationalMetadata("shipping");

export default function ShippingPage() {
  return <InformationalPage title="Shipping Policy" intro="Shipping availability and charges are calculated from the delivery address and the current shipping configuration during checkout.">
    <ContentSection title="Delivery charges">
      <p>Applicable delivery charges are shown in checkout before online payment. Charges can vary by delivery location and the current shipping settings.</p>
      <p>If your order qualifies for free shipping under the current shipping rules, this will be shown automatically in your checkout total.</p>
    </ContentSection>
    <ContentSection title="Delivery locations">
      <p>Checkout evaluates the delivery address, including applicable domestic zones such as Tamil Nadu and other supported Indian destinations. If a destination cannot be priced through checkout, you may be asked to contact the store instead of proceeding with online payment.</p>
      <p>International delivery availability is determined from the address and current shipping configuration; it is not guaranteed by this page.</p>
    </ContentSection>
    <ContentSection title="Order updates">
      <p>Customers can view available order information in their account area. When shipment details are added to an order, the account may show the relevant courier and tracking information.</p>
    </ContentSection>
    <ContentSection title="Shipping questions">
      <p>For help before placing an order, contact <a href={`mailto:${BUSINESS.email}`} className="text-[#d4af37] underline decoration-[#b48a3c]/60 underline-offset-4 hover:text-[#f0d984]">{BUSINESS.email}</a> or review the <Link href="/contact" className="text-[#d4af37] underline decoration-[#b48a3c]/60 underline-offset-4 hover:text-[#f0d984]">Contact Us</Link> details.</p>
    </ContentSection>
  </InformationalPage>;
}
