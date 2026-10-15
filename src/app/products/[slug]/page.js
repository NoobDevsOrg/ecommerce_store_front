import ProductDetailClient from "./ProductDetailClient";
import { getPublicProductBySlug, getPublicProductFilters, PublicApiError } from "../../../lib/publicApi";
import { getAbsoluteSiteUrl } from "../../../lib/siteUrl";
import Breadcrumbs from "../../../components/seo/Breadcrumbs";
import { categoryAncestors, collectionHref, isIndexablePublicCategory } from "../../../lib/categoryUrl";
import { notFound } from "next/navigation";

const BRAND_NAME = "Sagunthala Jewellers";

function getPrimaryImage(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  return images.find((image) => image.is_primary) || images[0] || null;
}

function getProductMetadata(product) {
  const primaryImage = getPrimaryImage(product);
  const identity = product.sku?.trim() || product.slug;
  const baseTitle = product.meta_title?.trim() || product.name;
  // Keep any editorial metadata, but add the immutable product identifier so
  // a copied title/description in the catalogue cannot create duplicate SEO
  // metadata across two otherwise distinct product detail pages.
  const title = `${baseTitle} | ${identity} | ${BRAND_NAME}`;
  const baseDescription = product.meta_desc?.trim() || product.description?.trim()
    || `Discover ${product.name}, a handcrafted piece from Sagunthala Jewellers.`;
  const description = `${baseDescription} Product reference: ${identity}.`;
  const canonical = getAbsoluteSiteUrl(`/products/${product.slug}`);

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
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      return {
        title: "Product Not Found",
        robots: { index: false, follow: false },
      };
    }

    throw error;
  }

}

export default async function Page({ params }) {
  const { slug } = await params;
  let product;
  try {
    product = await getPublicProductBySlug(slug);
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) notFound();
    throw error;
  }
  if (!product) notFound();

  let categories = [];
  try {
    const filters = await getPublicProductFilters({ timeoutMs: 5_000 });
    categories = Array.isArray(filters?.categories) ? filters.categories : [];
  } catch {
    // A product remains valid even if category navigation is temporarily
    // unavailable. Do not invent a category URL in that case.
  }

  const category = categories.find((item) => item.id === product.category_id) || null;
  const categoryIsPublic = isIndexablePublicCategory(category);
  const categoryHref = categoryIsPublic ? collectionHref(category) : null;
  const breadcrumbs = [
    { name: "Home", href: "/" },
    ...(categoryIsPublic
      ? [
        ...categoryAncestors(categories, category.id)
          .filter(isIndexablePublicCategory)
          .map((item) => ({ name: item.name, href: collectionHref(item) })),
        { name: category.name, href: categoryHref },
      ]
      : []),
    { name: product.name, href: `/products/${product.slug}` },
  ];

  const primaryImage = getPrimaryImage(product);
  const canonicalUrl = getAbsoluteSiteUrl(`/products/${product.slug}`);
  const hasVisiblePrice = product.isPurchasable === true
    && Number.isFinite(Number(product.price))
    && Number(product.price) > 0;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(primaryImage?.url ? { image: product.images.map((image) => image.url).filter(Boolean) } : {}),
    ...(product.stock_qty !== null && product.stock_qty !== undefined
      ? {
        offers: {
          "@type": "Offer",
          ...(hasVisiblePrice ? { price: String(product.price), priceCurrency: "INR" } : {}),
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
      <Breadcrumbs items={breadcrumbs} />
      <ProductDetailClient product={product} categoryHref={categoryHref} showBreadcrumbs={false} />

    </>
  );
}
