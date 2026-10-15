import { getAbsoluteSiteUrl } from "./siteUrl";

export const BUSINESS = Object.freeze({
  name: "Sagunthala Dance Jewellers",
  url: "https://www.sagunthaladancejewellery.com",
  logoPath: "/sagunthala_logo2.jpg",
  email: "sagunthalajewellers@gmail.com",
  phones: ["+91 8189840100", "+91 7305873829"],
  address: "38/46, N Mada St, near Kapaleeshwarar Temple, Vinayaka Nagar Colony, Mylapore, Chennai, Tamil Nadu - 600004.",
  instagram: "https://www.instagram.com/sagunthala_dance_jewellery/",
});

export const INFORMATION_PAGES = Object.freeze({
  about: {
    path: "/about",
    title: "About Us | Sagunthala Dance Jewellery",
    description: "Learn about Sagunthala Dance Jewellery and explore traditional jewellery for Indian classical dance and special occasions.",
  },
  contact: {
    path: "/contact",
    title: "Contact Us | Sagunthala Dance Jewellery",
    description: "Contact Sagunthala Dance Jewellery for product enquiries, order support, and general assistance.",
  },
  privacy: {
    path: "/privacy",
    title: "Privacy Policy | Sagunthala Dance Jewellery",
    description: "Understand how Sagunthala Dance Jewellery uses customer information for accounts, enquiries, orders, and checkout.",
  },
  terms: {
    path: "/terms",
    title: "Terms & Conditions | Sagunthala Dance Jewellery",
    description: "Read the website and purchasing terms for Sagunthala Dance Jewellery.",
  },
  shipping: {
    path: "/shipping",
    title: "Shipping Policy | Sagunthala Dance Jewellery",
    description: "Learn how delivery charges and availability are calculated for Sagunthala Dance Jewellery orders.",
  },
});

export function informationalMetadata(key) {
  const page = INFORMATION_PAGES[key];
  const canonical = getAbsoluteSiteUrl(page.path);
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical },
    openGraph: { title: page.title, description: page.description, url: canonical, type: "website" },
    robots: { index: true, follow: true },
  };
}
