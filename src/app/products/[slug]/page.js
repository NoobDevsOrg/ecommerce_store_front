import ProductDetailClient from "./ProductDetailClient";
import { getPublicProductBySlug } from "../../../lib/publicApi";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const product = await getPublicProductBySlug(slug);
    if (!product) {
      return {
        title: "Product Not Found",
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image_urls?.map(img => img.url),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <ProductDetailClient product={product} />

    </>
  );
}