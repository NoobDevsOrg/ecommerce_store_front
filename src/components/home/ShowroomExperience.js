"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { addToCart } from "../../store/cartStore";
import { productHref } from "../../lib/productUrl";
import ProductCard from "../product/ProductCard";
import FinalCtaMotion from "./FinalCtaMotion";
import ShowroomMotion from "./ShowroomMotion";

const imageFor = (product) => product?.image_urls?.[0]?.url || product?.thumbnail_url || "/placeholder.png";
const isSupabaseStorageUrl = (value) => typeof value === "string" && value.includes(".supabase.co/storage/");
const priceFor = (product) => `₹${Number(product?.price || 0).toLocaleString("en-IN")}`;

function SignatureMoment({ product }) {
  const router = useRouter();
  if (!product) return null;
  const canPurchase = Boolean(product.isPurchasable) && Number(product.stock_qty || 0) > 0;
  const buyNow = () => { if (canPurchase && addToCart(product).changed) router.push("/checkout"); };
  return <section data-showroom-section data-motion="split" className="overflow-hidden bg-[#100b13] py-20 sm:py-28"><div className="mx-auto grid max-w-[90rem] gap-10 px-6 sm:px-10 lg:grid-cols-[1.25fr_.75fr] lg:items-end lg:px-16">
    <Link data-showroom-card data-showroom-hover href={productHref(product)} className="group relative block aspect-[5/4] overflow-hidden bg-[#1d1620] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984]"><Image data-showroom-image src={imageFor(product)} alt={product.name} fill unoptimized={isSupabaseStorageUrl(imageFor(product))} sizes="(max-width: 1024px) 100vw, 62vw" className="object-cover transition duration-[1200ms] group-hover:scale-[1.04]" /><span className="absolute inset-0 bg-gradient-to-t from-[#100b13]/80 via-transparent to-transparent" /><span className="absolute bottom-6 left-6 text-[10px] font-bold uppercase tracking-[0.28em] text-[#f0d984]">View signature piece <span data-showroom-arrow>→</span></span></Link>
    <div data-showroom-heading className="max-w-md lg:pb-8"><p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[#d4af37]">Signature jewellery moment</p><h2 className="mt-4 font-serif text-4xl leading-[1.02] text-white sm:text-6xl">{product.name}</h2><p className="mt-5 text-sm leading-7 text-stone-400">A highlighted piece from the live Sagunthala catalogue.</p><p className="mt-7 font-serif text-2xl text-[#f0d984]">{product.isPurchasable ? priceFor(product) : "Price on request"}</p><div className="mt-8 flex flex-wrap gap-3"><Link data-magnetic href={productHref(product)} className="inline-flex min-h-12 items-center bg-[#d4af37] px-5 text-xs font-bold uppercase tracking-[0.16em] text-[#1a121b] transition hover:bg-[#f0d984] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984]">Explore piece</Link>{canPurchase ? <button data-magnetic type="button" onClick={buyNow} className="inline-flex min-h-12 items-center border border-[#d4af37]/60 px-5 text-xs font-bold uppercase tracking-[0.16em] text-[#f0d984] transition hover:bg-[#d4af37] hover:text-[#1a121b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984]">Buy now</button> : null}</div></div>
  </div></section>;
}

function CollectionStory({ products }) {
  const collections = useMemo(() => {
    const groups = new Map();
    products.forEach((product) => { if (product.collection_id && product.collection_name) { const collection = groups.get(product.collection_id) || { id: product.collection_id, name: product.collection_name, products: [] }; collection.products.push(product); groups.set(product.collection_id, collection); } });
    return [...groups.values()].filter((collection) => collection.products.length > 0).slice(0, 4);
  }, [products]);
  if (!collections.length) return null;
  return <section data-showroom-section data-motion="mask" className="bg-[#0f0a1a] py-20 text-white sm:py-28"><div className="mx-auto max-w-[90rem] px-6 sm:px-10 lg:px-16"><div data-showroom-heading className="mb-10 max-w-xl"><p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[#d4af37]">Collection stories</p><h2 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl">A slower way to discover.</h2></div><div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 sm:mx-0 sm:px-0">{collections.map((collection, index) => { const product = collection.products[0]; return <article data-showroom-card key={collection.id} className={`w-[82vw] shrink-0 snap-start sm:w-[32rem] ${index % 2 ? "sm:mt-14" : ""}`}><Link data-showroom-hover href={`/products?search=${encodeURIComponent(collection.name)}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]"><span className="relative block aspect-[5/4] overflow-hidden bg-[#1a1425]"><Image src={imageFor(product)} alt={product.name} fill unoptimized={isSupabaseStorageUrl(imageFor(product))} sizes="(max-width: 640px) 82vw, 32rem" className="object-cover transition duration-700 group-hover:scale-[1.04]" /></span><span className="mt-5 flex items-end justify-between gap-4 border-b border-[#b48a3c]/35 pb-4"><span><span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4af37]">Collection {String(index + 1).padStart(2, "0")}</span><span className="mt-2 block font-serif text-3xl leading-tight">{collection.name}</span></span><span data-showroom-arrow className="mb-1 text-lg text-[#d4af37] transition-transform group-hover:translate-x-1" aria-hidden>→</span></span></Link></article>; })}</div></div></section>;
}

function CuratedComposition({ products }) {
  if (!products.length) return null;
  return <section data-showroom-section data-motion="commerce" className="bg-[#120d1b] py-20 text-white sm:py-28"><div className="mx-auto max-w-[90rem] px-6 sm:px-10 lg:px-16"><div data-showroom-heading className="mb-10 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[#d4af37]">Curated commerce</p><h2 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl">Pieces to make your own.</h2></div><Link href="/products" className="text-xs font-bold uppercase tracking-[0.18em] text-[#e5c66e] underline decoration-[#b48a3c]/60 underline-offset-8 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]">Browse all →</Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((product, index) => <div data-showroom-card key={product.id}><ProductCard product={product} showroomMotion unoptimizedImages className={index === 0 ? "sm:col-span-2" : ""} /></div>)}</div></div></section>;
}

function CompleteTheLook({ products }) {
  const collection = useMemo(() => {
    const groups = new Map();
    products.forEach((product) => { if (product.collection_id && product.collection_name) { const group = groups.get(product.collection_id) || { name: product.collection_name, products: [] }; group.products.push(product); groups.set(product.collection_id, group); } });
    return [...groups.values()].find((group) => group.products.length > 1) || null;
  }, [products]);
  if (!collection) return null;
  const [lead, ...related] = collection.products;
  return <section data-showroom-section data-motion="split" className="bg-[#17101b] py-20 sm:py-28"><div className="mx-auto grid max-w-[90rem] gap-9 px-6 sm:px-10 lg:grid-cols-[1.05fr_.95fr] lg:px-16"><div data-showroom-card className="relative aspect-[4/5] overflow-hidden bg-[#251a29]"><Image data-showroom-image src={imageFor(lead)} alt={lead.name} fill unoptimized={isSupabaseStorageUrl(imageFor(lead))} sizes="(max-width: 1024px) 100vw, 52vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#17101b]/70 via-transparent to-transparent" /><p className="absolute bottom-6 left-6 max-w-xs font-serif text-3xl leading-tight text-white">{collection.name}</p></div><div data-showroom-heading className="flex flex-col justify-center"><p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[#d4af37]">Complete the look</p><h2 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">Discover complementary pieces, together.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-stone-400">These live catalogue pieces share the same collection relationship.</p><div className="mt-9 divide-y divide-stone-700/60 border-y border-stone-700/60">{[lead, ...related.slice(0, 3)].map((product) => <Link data-showroom-card key={product.id} href={productHref(product)} className="group flex items-center justify-between gap-4 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984]"><span className="font-serif text-lg text-stone-200 transition group-hover:text-[#f0d984]">{product.name}</span><span data-showroom-arrow className="text-[#d4af37] transition-transform group-hover:translate-x-1" aria-hidden>→</span></Link>)}</div></div></div></section>;
}

function CraftAndTrust({ product }) {
  const trust = ["Secure payment", "Order tracking", "Customer support"];
  return <><section data-showroom-section data-motion="editorial" className="relative isolate overflow-hidden bg-[#0f0a1a] py-20 text-white sm:py-28"><div className="mx-auto grid max-w-[90rem] gap-9 px-6 sm:px-10 lg:grid-cols-[.75fr_1.25fr] lg:items-center lg:px-16"><div data-showroom-heading className="relative z-10"><p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[#d4af37]">Sagunthala</p><h2 className="mt-5 font-serif text-5xl leading-[.88] sm:text-7xl">Crafted<br />for<br />performance.</h2><Link href="/products" className="mt-9 inline-flex text-xs font-bold uppercase tracking-[0.18em] text-[#e5c66e] underline decoration-[#b48a3c] underline-offset-8 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]">Explore jewellery →</Link></div>{product ? <div data-showroom-card className="relative aspect-[5/3] overflow-hidden bg-[#1a1425]"><Image data-showroom-image src={imageFor(product)} alt={product.name} fill unoptimized={isSupabaseStorageUrl(imageFor(product))} sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover opacity-90" /></div> : null}</div></section><section data-showroom-section data-motion="stagger" className="bg-[#100b13] py-8"><div data-showroom-heading className="mx-auto flex max-w-[90rem] flex-wrap justify-center gap-x-10 gap-y-4 px-6 sm:justify-between sm:px-10 lg:px-16">{trust.map((item) => <span key={item} className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-300 before:mr-3 before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#d4af37]">{item}</span>)}</div></section></>;
}

export default function ShowroomExperience() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  useEffect(() => { let active = true; api.products.public.list({ page: 1, limit: 12, sort: "newest" }).then((response) => { if (active) { setProducts(response?.data?.products || []); setStatus("ready"); } }).catch(() => { if (active) setStatus("error"); }); return () => { active = false; }; }, []);
  if (status === "error" || (status === "ready" && !products.length)) return null;
  if (status === "loading") return <section className="bg-[#100b13] py-20" aria-label="Loading jewellery"><div className="mx-auto grid max-w-[90rem] grid-cols-2 gap-5 px-6 sm:grid-cols-4 sm:px-10 lg:px-16">{Array.from({ length: 4 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse bg-stone-900" />)}</div></section>;
  const curated = products.filter((product) => product.is_featured || product.is_best_sell);
  const signature = curated[0] || products[0];
  const merchandising = curated.length ? curated : products;
  const remaining = products.filter((product) => !merchandising.slice(0, 4).some((selected) => selected.id === product.id));
  return <ShowroomMotion><SignatureMoment product={signature} /><CollectionStory products={products} /><CuratedComposition products={merchandising} /><CompleteTheLook products={products} /><CraftAndTrust product={remaining[0] || signature} /><FinalCtaMotion product={remaining[0] || signature} /></ShowroomMotion>;
}
