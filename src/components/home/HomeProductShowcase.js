"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import ProductCard from "../product/ProductCard";
import { productHref } from "../../lib/productUrl";

const productImage = (product) => product.image_urls?.[0]?.url || product.thumbnail_url || "/placeholder.png";

function SectionHeading({ eyebrow, title, href, action }) {
  return <div className="mb-8 flex items-end justify-between gap-5 sm:mb-10">
    <div><p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#d4af37]">{eyebrow}</p><h2 className="mt-3 font-serif text-3xl text-white sm:text-4xl">{title}</h2></div>
    {href ? <Link href={href} className="shrink-0 text-xs font-bold uppercase tracking-[0.18em] text-[#e5c66e] underline decoration-[#b48a3c]/50 underline-offset-8 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984]">{action || "View all"} <span aria-hidden>→</span></Link> : null}
  </div>;
}

function ProductGrid({ products }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}

function CategoryDiscovery({ products }) {
  const categories = [];
  const used = new Set();
  products.forEach((product) => {
    if (!product.category_id || !product.category_name || used.has(product.category_id) || categories.length === 4) return;
    used.add(product.category_id);
    categories.push({ id: product.category_id, name: product.category_name, image: productImage(product) });
  });
  if (!categories.length) return null;
  return <section className="bg-[#120d1b] py-14 sm:py-20">
    <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16"><SectionHeading eyebrow="Begin your discovery" title="Shop by jewellery type" href="/products" action="All jewellery" />
      <div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-3 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">{categories.map((category) => <Link key={category.id} href={`/products?category=${encodeURIComponent(category.id)}`} className="group w-36 shrink-0 snap-start text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984] sm:w-auto">
        <span className="relative block aspect-square overflow-hidden rounded-full border border-[#b48a3c]/30 bg-[#1a1425]"><Image src={category.image} alt="" fill sizes="(max-width: 640px) 9rem, 25vw" className="object-cover transition duration-700 group-hover:scale-105" /><span className="absolute inset-0 bg-gradient-to-t from-[#0f0a1a]/65 via-transparent to-transparent" /></span>
        <span className="mt-4 block font-serif text-base text-white transition group-hover:text-[#e5c66e] sm:text-lg">{category.name}</span><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#b48a3c]">Explore</span>
      </Link>)}</div>
    </div>
  </section>;
}

function EditorialCollection({ products }) {
  const collections = new Map();
  products.forEach((product) => {
    if (!product.collection_id || !product.collection_name) return;
    const collection = collections.get(product.collection_id) || { id: product.collection_id, name: product.collection_name, products: [] };
    collection.products.push(product);
    collections.set(product.collection_id, collection);
  });
  const collection = [...collections.values()].sort((left, right) => right.products.length - left.products.length)[0];
  if (!collection) return null;
  const [lead, ...pieces] = collection.products;
  const href = `/products?search=${encodeURIComponent(collection.name)}`;

  return <section className="bg-[#0f0a1a] py-16 sm:py-24"><div className="mx-auto grid max-w-7xl gap-8 px-6 sm:px-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)] lg:items-center lg:px-16">
    <Link href={productHref(lead)} className="group relative block aspect-[4/3] overflow-hidden bg-[#18111e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984]"><Image src={productImage(lead)} alt={lead.name} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover transition duration-1000 group-hover:scale-[1.035]" /><span className="absolute inset-0 bg-gradient-to-t from-[#0f0a1a]/80 via-transparent to-transparent" /><span className="absolute bottom-5 left-5 text-xs font-bold uppercase tracking-[0.2em] text-[#f0d984]">View piece →</span></Link>
    <div className="lg:pl-8"><p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#d4af37]">Signature collection</p><h2 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">{collection.name}</h2><p className="mt-5 max-w-md text-sm leading-7 text-stone-400">A considered edit from the {collection.name} collection, selected from the pieces currently available to explore.</p><Link href={href} className="group mt-8 inline-flex min-h-11 items-center border-b border-[#d4af37] text-xs font-bold uppercase tracking-[0.18em] text-[#f0d984] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984]">Explore collection <span className="ml-3 transition-transform group-hover:translate-x-1">→</span></Link>
      {pieces.length ? <div className="mt-10 grid grid-cols-2 gap-4">{pieces.slice(0, 2).map((piece) => <Link key={piece.id} href={productHref(piece)} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984]"><span className="relative block aspect-square overflow-hidden bg-[#18111e]"><Image src={productImage(piece)} alt={piece.name} fill sizes="(max-width: 1024px) 50vw, 18vw" className="object-cover transition duration-700 group-hover:scale-105" /></span><span className="mt-3 block truncate font-serif text-sm text-stone-200 group-hover:text-[#e5c66e]">{piece.name}</span></Link>)}</div> : null}
    </div>
  </div></section>;
}

function BrandStory() {
  return <section className="relative isolate overflow-hidden border-y border-[#b48a3c]/20 bg-[#17101f] py-16 sm:py-24"><div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at 20% 45%, rgba(212,175,55,.14), transparent 28%), radial-gradient(circle at 85% 20%, rgba(119,75,35,.15), transparent 26%)" }} /><div className="relative mx-auto max-w-3xl px-6 text-center sm:px-10"><p className="text-[10px] font-bold uppercase tracking-[0.36em] text-[#d4af37]">Contemporary classical luxury</p><h2 className="mt-5 font-serif text-3xl leading-tight text-white sm:text-5xl">A focused showroom for the jewellery that completes a performance.</h2><Link href="/products" className="mt-8 inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-[0.18em] text-[#f0d984] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984]">Explore all jewellery <span className="ml-3">→</span></Link></div></section>;
}

function TrustSection() {
  const commitments = [
    ["Secure checkout", "Payments are completed through our secure checkout."],
    ["Order tracking", "Keep track of your order from confirmation to delivery."],
    ["Personal assistance", "Need help selecting a piece? Our team is here to help."],
  ];
  return <section className="border-t border-stone-800/70 py-16 sm:py-20"><div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16"><div className="grid gap-9 border border-[#b48a3c]/25 bg-[#161022] p-7 sm:grid-cols-3 sm:p-10">{commitments.map(([title, copy]) => <div key={title}><span className="mb-5 block h-1.5 w-1.5 rounded-full bg-[#d4af37]" /><h2 className="font-serif text-xl text-white">{title}</h2><p className="mt-3 text-sm leading-6 text-stone-400">{copy}</p></div>)}</div></div></section>;
}

export default function HomeProductShowcase() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    api.products.public.list({ page: 1, limit: 12, sort: "newest" })
      .then((response) => { if (active) { setProducts(response?.data?.products || []); setStatus("ready"); } })
      .catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, []);

  if (status === "error" || (status === "ready" && !products.length)) return null;
  if (status === "loading") return <section className="bg-[#0f0a1a] py-16 sm:py-20" aria-label="Loading jewellery"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 sm:grid-cols-4 sm:px-10 lg:px-16">{Array.from({ length: 4 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse bg-stone-900" />)}</div></section>;

  const featured = products.filter((product) => product.is_featured || product.is_best_sell).slice(0, 4);
  const featuredIds = new Set(featured.map((product) => product.id));
  const arrivals = products.filter((product) => !featuredIds.has(product.id)).slice(0, 4);

  return <>
    <CategoryDiscovery products={products} />
    <EditorialCollection products={products} />
    {featured.length ? <section className="bg-[#0f0a1a] py-16 sm:py-20"><div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16"><SectionHeading eyebrow="The Sagunthala edit" title="Featured pieces" href="/products" /><ProductGrid products={featured} /></div></section> : null}
    <BrandStory />
    {arrivals.length ? <section className="bg-[#0f0a1a] py-8 pb-16 sm:py-10 sm:pb-20"><div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16"><SectionHeading eyebrow="Recently added" title="New arrivals" href="/products?sort=newest" /><ProductGrid products={arrivals} /></div></section> : null}
    <TrustSection />
  </>;
}
