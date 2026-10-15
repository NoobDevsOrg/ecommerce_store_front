import Link from "next/link";
import InformationalPage, { ContentSection } from "../../components/content/InformationalPage";
import { informationalMetadata } from "../../lib/businessInfo";

export const metadata = informationalMetadata("about");

export default function AboutPage() {
  return <InformationalPage title="About Us" intro="Sagunthala Dance Jewellery presents a traditional jewellery catalogue for Indian classical dance, celebrations, and special occasions.">
    <ContentSection title="Discover the catalogue">
      <p>Browse published jewellery pieces online, including details, images, pricing where available, and product-specific enquiry options.</p>
      <p><Link href="/products" className="text-[#d4af37] underline decoration-[#b48a3c]/60 underline-offset-4 hover:text-[#f0d984]">Explore the jewellery catalogue</Link> or visit the collections hub to browse the current public categories.</p>
    </ContentSection>
    <ContentSection title="Purchase and enquiry options">
      <p>Eligible products can be purchased through the online checkout. Where an item is available for enquiry, its product page provides an enquiry option so you can ask about that specific piece.</p>
      <p>For general store contact and order support, please use the details on our <Link href="/contact" className="text-[#d4af37] underline decoration-[#b48a3c]/60 underline-offset-4 hover:text-[#f0d984]">Contact Us</Link> page.</p>
    </ContentSection>
  </InformationalPage>;
}
