"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { addToCart } from "../../store/cartStore";
import { productHref } from "../../lib/productUrl";

const price = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function RelatedProductSection({ product }) {
  const [state, setState] = useState({ loading: Boolean(product?.category_id), products: [] });

  useEffect(() => {
    if (!product?.category_id || !product?.id) {
      return undefined;
    }
    let cancelled = false;
    api.products.public.list({ page: 1, limit: 5, category: product.category_id })
      .then((response) => {
        if (cancelled) return;
        const data = response?.data || response || {};
        setState({ loading: false, products: (data.products || []).filter((item) => item.id !== product.id).slice(0, 4) });
      })
      .catch(() => { if (!cancelled) setState({ loading: false, products: [] }); });
    return () => { cancelled = true; };
  }, [product?.category_id, product?.id]);

  if (!product?.category_id || (!state.loading && !state.products.length)) return null;
  return (
    <section className="border-t border-stone-900/70 px-[clamp(1rem,2.5vw,2rem)] py-[clamp(2.5rem,5vw,5.5rem)]" aria-labelledby="related-products-heading">
      <div className="mx-auto w-full max-w-[min(1700px,96vw)]">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b48a3c]">Curated for you</p><h2 id="related-products-heading" className="mt-2 font-serif text-2xl text-white sm:text-3xl">More to complement your <span className="font-light italic text-stone-500">collection</span></h2></div><Link href={`/products?category=${encodeURIComponent(product.category_id)}`} className="text-sm font-medium text-[#d4af37] hover:text-[#f0d984] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]">Browse {product.category_name || "similar pieces"} →</Link></div>
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {state.loading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-2xl border border-stone-800 bg-[#161022]" />) : state.products.map((item) => {
            const image = item.image_urls?.[0]?.url || item.images?.[0]?.url || item.thumbnail_url || "/images/placeholder.jpg";
            const canBuy = Boolean(item.isPurchasable) && Number(item.stock_qty || 0) > 0;
            return <article key={item.id} className="group overflow-hidden rounded-2xl border border-stone-800/80 bg-[#161022] transition duration-300 hover:-translate-y-1 hover:border-[#b48a3c]/50 hover:shadow-xl hover:shadow-black/30"><Link href={productHref(item)} className="block overflow-hidden"><img src={image} alt={item.name} className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /></Link><div className="p-3 sm:p-4"><Link href={productHref(item)} className="line-clamp-2 font-serif text-sm text-white hover:text-[#d4af37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#d4af37] sm:text-base">{item.name}</Link><div className="mt-3 flex items-center justify-between gap-2"><p className="text-sm font-semibold text-[#d4af37]">{item.isPurchasable ? price(item.price) : "Price on request"}</p>{canBuy ? <button type="button" onClick={() => addToCart(item)} className="rounded-full border border-[#b48a3c]/50 p-2 text-[#d4af37] transition hover:bg-[#b48a3c] hover:text-[#0f0a1a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]" aria-label={`Add ${item.name} to cart`}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3h2l2.2 11.1a2 2 0 002 1.6h7.9a2 2 0 001.95-1.55L20 7H7"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg></button> : null}</div></div></article>;
          })}
        </div>
      </div>
    </section>
  );
}
