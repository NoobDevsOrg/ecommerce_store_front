import InformationalPage, { ContentSection } from "../../components/content/InformationalPage";
import { BUSINESS, informationalMetadata } from "../../lib/businessInfo";

export const metadata = informationalMetadata("privacy");

export default function PrivacyPage() {
  return <InformationalPage title="Privacy Policy" intro="This page explains the customer information used when you browse, create an account, make an enquiry, or place an order through this website.">
    <ContentSection title="Information used for the service">
      <p>We use the information you provide to create and access customer accounts, verify checkout email addresses, respond to product enquiries, process orders, and provide order-related updates.</p>
      <p>This can include your name, email address, phone number, delivery address, account details, order details, and the information you include in an enquiry.</p>
    </ContentSection>
    <ContentSection title="Payments and checkout">
      <p>Online payments are processed through Razorpay. Payment processing identifiers may be associated with an order so that payment status can be confirmed. This website does not ask you to send card details by email or through an enquiry.</p>
      <p>Delivery and order information is used to calculate checkout totals and fulfil an order.</p>
    </ContentSection>
    <ContentSection title="Site operation">
      <p>Account, order, enquiry, and technical records may be retained where reasonably necessary to operate the website, provide customer support, maintain transaction records, prevent misuse, and meet applicable record-keeping requirements.</p>
    </ContentSection>
    <ContentSection title="Questions about privacy">
      <p>For questions about information connected to this website, contact <a href={`mailto:${BUSINESS.email}`} className="text-[#d4af37] underline decoration-[#b48a3c]/60 underline-offset-4 hover:text-[#f0d984]">{BUSINESS.email}</a>.</p>
    </ContentSection>
  </InformationalPage>;
}
