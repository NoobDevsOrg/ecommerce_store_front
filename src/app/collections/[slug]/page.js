import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "../../../components/product/ProductCard";
import Breadcrumbs from "../../../components/seo/Breadcrumbs";
import { categoryAncestors, collectionHref, directChildCategories } from "../../../lib/categoryUrl";
import { collectionProducts, publicCollectionCategories } from "../../../lib/collectionData";
import { getPublicProductFilters, getPublicProducts } from "../../../lib/publicApi";
import { getAbsoluteSiteUrl } from "../../../lib/siteUrl";
import { productHref } from "../../../lib/productUrl";

export const dynamic = "force-dynamic";

const COLLECTION_LIMIT = 1000;
const COLLECTION_TIMEOUT_MS = 5_000;
const BRAND_NAME = "Sagunthala Dance Jewellery";

const getCollectionData = cache(async (slug) => {
  const [catalogue, filters] = await Promise.all([
    getPublicProducts(1, COLLECTION_LIMIT, "", { timeoutMs: COLLECTION_TIMEOUT_MS }),
    getPublicProductFilters({ timeoutMs: COLLECTION_TIMEOUT_MS }),
  ]);
  const categories = Array.isArray(filters?.categories) ? filters.categories : [];
  const products = Array.isArray(catalogue?.products) ? catalogue.products : [];
  const category = categories.find((item) => item.slug === slug) || null;
  const usableCategories = publicCollectionCategories(categories, products);
  const isUsable = category && usableCategories.some((item) => item.id === category.id);
  if (!isUsable) return null;

  const collectionItems = collectionProducts(category, categories, products);
  const usableCategoryIds = new Set(usableCategories.map((item) => item.id));
  const children = directChildCategories(categories, category.id)
    .filter((child) => usableCategoryIds.has(child.id));

  return { category, categories, products: collectionItems, children };
});

function descriptionFor(category) {
  return category.meta_desc?.trim()
    || category.description?.trim()
    || `Explore ${category.name} from ${BRAND_NAME}, featuring jewellery for Indian classical dance and traditional occasions.`;
}

function titleFor(category) {
  return category.meta_title?.trim() || `${category.name} | ${BRAND_NAME}`;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const data = await getCollectionData(slug);
    if (!data) return { title: "Collection Not Found", robots: { index: false, follow: false } };
    const canonical = getAbsoluteSiteUrl(collectionHref(data.category));
    const title = titleFor(data.category);
    const description = descriptionFor(data.category);
    return {
      title: { absolute: title },
      description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, type: "website" },
    };
  } catch {
    return { title: "Collection Not Found", robots: { index: false, follow: false } };
  }
}

export default async function CollectionPage({ params }) {
  const { slug } = await params;
  let data;
  try {
    data = await getCollectionData(slug);
  } catch {
    notFound();
  }
  if (!data) notFound();

  const { category, categories, products, children } = data;
  const ancestors = categoryAncestors(categories, category.id);
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Collections", href: "/collections" },
    ...ancestors.map((item) => ({ name: item.name, href: collectionHref(item) })),
    { name: category.name, href: collectionHref(category) },
  ];
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: getAbsoluteSiteUrl(productHref(product)),
      name: product.name,
    })),
  };

  return <main className="min-h-screen bg-[#0f0a1a] pb-16">
    <Breadcrumbs items={breadcrumbs} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, "\\u003c") }} />
    <section className="border-b border-stone-900/60 bg-gradient-to-r from-[#0f0a1a] to-[#1a1525] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4af37]">Collection</p>
        <h1 className="mt-3 font-serif text-3xl text-white sm:text-4xl">{category.name}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">{category.description?.trim() || descriptionFor(category)}</p>
        <p className="mt-5 text-sm text-stone-400">{products.length} {products.length === 1 ? "piece" : "pieces"} in this collection</p>
      </div>
    </section>

    {children.length ? <section className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-6 lg:px-8">
      <h2 className="font-serif text-2xl text-white">Explore subcategories</h2>
      <ul className="mt-4 flex flex-wrap gap-3">
        {children.map((child) => <li key={child.id}><Link href={collectionHref(child)} className="inline-flex rounded-full border border-[#b48a3c]/40 px-4 py-2 text-sm text-[#f0d984] transition hover:bg-[#b48a3c]/15">{child.name}</Link></li>)}
      </ul>
    </section> : null}

    <section className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-6 lg:px-8">
      <h2 className="sr-only">{category.name} products</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => <ProductCard key={product.id} product={product} unoptimizedImages />)}
      </div>
    </section>
  </main>;
}
