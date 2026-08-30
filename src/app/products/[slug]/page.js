import ProductDetailClient from "./ProductDetailClient";
import { getPublicProductBySlug } from "../../../lib/publicApi";
import { getAbsoluteSiteUrl } from "../../../lib/siteUrl";
import { notFound } from "next/navigation";

const BRAND_NAME = "Sagunthala Jewellers";

function getPrimaryImage(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  return images.find((image) => image.is_primary) || images[0] || null;
}

function getProductMetadata(product) {
  const primaryImage = getPrimaryImage(product);
  const title = product.meta_title?.trim() || `${product.name} | ${BRAND_NAME}`;
  const description = product.meta_desc?.trim() || product.description?.trim() || undefined;
  const canonical = `/products/${product.slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: primaryImage?.url
        ? [{ url: primaryImage.url, alt: primaryImage.alt_text || product.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage?.url ? [primaryImage.url] : undefined,
    },
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const product = await getPublicProductBySlug(slug);
    if (!product) {
      return {
        title: "Product Not Found",
        robots: { index: false, follow: false },
      };
    }

    return getProductMetadata(product);
  } catch {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

}

export default async function Page({ params }) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  // console.log("Product slug data hvsgdhsbdvjsd line 69", slug)

  if (!product) {
    notFound();
  }

  const primaryImage = getPrimaryImage(product);
  const canonicalUrl = getAbsoluteSiteUrl(`/products/${product.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(primaryImage?.url ? { image: product.images.map((image) => image.url).filter(Boolean) } : {}),
    ...(product.price !== null && product.price !== undefined
      ? {
        offers: {
          "@type": "Offer",
          price: String(product.price),
          priceCurrency: "INR",
          availability: product.stock_qty > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          ...(canonicalUrl ? { url: canonicalUrl } : {}),
        },
      }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetailClient product={product} />

    </>
  );
}
