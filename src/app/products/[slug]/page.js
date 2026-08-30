import ProductDetailClient from "./ProductDetailClient";
import { getPublicProductBySlug } from "../../../lib/publicApi";
<<<<<<< HEAD
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

=======
import { notFound } from "next/navigation";

>>>>>>> 861c4cf1cb7a35e468d5836098b6e70d5b3b2774
export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const product = await getPublicProductBySlug(slug);
    if (!product) {
      return {
        title: "Product Not Found",
<<<<<<< HEAD
        robots: { index: false, follow: false },
      };
    }

    return getProductMetadata(product);
  } catch {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
=======
      };
    }

    return {
      title: product.name,
      description:
        product.description ||
        `${product.name} from Sagunthala Jewellers`,

      alternates: {
        canonical: `https://sagunthalajewellers.com/products/${product.slug}`,
      },

      openGraph: {
        title: product.name,
        description: product.description,
        url: `https://sagunthalajewellers.com/products/${product.slug}`,
        siteName: "Sagunthala Jewellers",
        images: product.image_urls?.length
          ? [
            {
              url: product.image_urls[0].url,
              width: 1200,
              height: 630,
            },
          ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description,
        images: product.image_urls?.length
          ? [product.image_urls[0].url]
          : [],
      },
      keywords: [
        product.name,
        "Gold Jewellery",
        "Diamond Jewellery",
        "Sagunthala Jewellers",
      ],
    };
  } catch (err) {
    return {
      title: "Sagunthala Jewellers",
>>>>>>> 861c4cf1cb7a35e468d5836098b6e70d5b3b2774
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

<<<<<<< HEAD
  const primaryImage = getPrimaryImage(product);
  const canonicalUrl = getAbsoluteSiteUrl(`/products/${product.slug}`);
=======
>>>>>>> 861c4cf1cb7a35e468d5836098b6e70d5b3b2774
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
<<<<<<< HEAD
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
=======
    description: product.description,
    image: product.image_urls?.map(img => img.url),
>>>>>>> 861c4cf1cb7a35e468d5836098b6e70d5b3b2774
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
<<<<<<< HEAD
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
=======
          __html: JSON.stringify(jsonLd),
>>>>>>> 861c4cf1cb7a35e468d5836098b6e70d5b3b2774
        }}
      />
      <ProductDetailClient product={product} />

    </>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 861c4cf1cb7a35e468d5836098b6e70d5b3b2774
