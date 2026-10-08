import { getPublicProducts } from "../../lib/publicApi";
import { getAbsoluteSiteUrl } from "../../lib/siteUrl";
import { isIndexablePublishedProduct } from "../../lib/seoFoundation.mjs";
import { productHref } from "../../lib/productUrl";

const title = "Temple & Dance Jewellery Collection | Sagunthala Jewellers";
const description = "Browse Sagunthala's published temple and dance jewellery collection, crafted for performances, celebrations, and heirloom moments.";
const canonical = getAbsoluteSiteUrl("/products");

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  verification: {
    google: "K9KRNLR5sHmrxSotlwziFdIBTDgnHEwLZbVkhNcr6es",
  },
};

async function getPublishedProductLinks() {
  try {
    const firstPage = await getPublicProducts(1, 100);
    const products = [...(firstPage?.products || [])];
    const totalPages = Number(firstPage?.pagination?.totalPages || 1);

    for (let page = 2; page <= totalPages; page += 1) {
      const result = await getPublicProducts(page, 100);
      products.push(...(result?.products || []));
    }

    return products.filter(isIndexablePublishedProduct);
  } catch {
    // Do not render guessed product URLs if the catalogue is unavailable.
    return [];
  }
}

export default async function ProductsLayout({ children }) {
  const products = await getPublishedProductLinks();

  return <>
    {children}
    <noscript>
      <section aria-label="Published jewellery catalogue">
        <h2>Published jewellery catalogue</h2>
        {products.length ? <ul>{products.map((product) => <li key={product.id || product.slug}><a href={productHref(product)}>{product.name || product.slug}</a></li>)}</ul> : <p>The catalogue is temporarily unavailable.</p>}
      </section>
    </noscript>
  </>;
}
