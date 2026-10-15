import { cache } from "react";
import Link from "next/link";
import Breadcrumbs from "../../components/seo/Breadcrumbs";
import { collectionHref } from "../../lib/categoryUrl";
import { publicCollectionCategories } from "../../lib/collectionData";
import { getPublicProductFilters, getPublicProducts } from "../../lib/publicApi";
import { getAbsoluteSiteUrl } from "../../lib/siteUrl";

export const dynamic = "force-dynamic";
const title = "Jewellery Collections | Sagunthala Dance Jewellery";
const description = "Explore Sagunthala Dance Jewellery collections for Indian classical dance, bridal wear, and traditional occasions.";
const canonical = getAbsoluteSiteUrl("/collections");

export const metadata = {
  title: { absolute: title }, description, alternates: { canonical },
  openGraph: { title, description, url: canonical, type: "website" },
};

const getCollections = cache(async () => {
  const [catalogue, filters] = await Promise.all([
    getPublicProducts(1, 1000, "", { timeoutMs: 5_000 }),
    getPublicProductFilters({ timeoutMs: 5_000 }),
  ]);
  return publicCollectionCategories(filters?.categories || [], catalogue?.products || []);
});

export default async function CollectionsPage() {
  let collections = [];
  try { collections = await getCollections(); } catch { /* Honest empty state below. */ }
  return <main className="min-h-screen bg-[#0f0a1a] pb-16">
    <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Collections", href: "/collections" }]} />
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4af37]">Sagunthala Dance Jewellery</p><h1 className="mt-3 font-serif text-3xl text-white sm:text-4xl">Collections</h1><p className="mt-4 max-w-2xl text-stone-300">Browse our active jewellery collections, curated for dance, bridal, and traditional occasions.</p>
      {collections.length ? <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{collections.map((category) => <li key={category.id}><Link href={collectionHref(category)} className="block rounded-xl border border-stone-800 bg-[#161022] p-5 text-stone-200 transition hover:border-[#b48a3c]/60 hover:text-[#f0d984]"><span className="font-serif text-xl">{category.name}</span>{category.description ? <span className="mt-2 block text-sm leading-6 text-stone-400">{category.description}</span> : null}</Link></li>)}</ul> : <p className="mt-8 text-stone-400">Collections are temporarily unavailable.</p>}
    </section>
  </main>;
}
