"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import PremiumHero from "./PremiumHero";

export default function DynamicHeroSlider() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    let mounted = true;
    api.products.public.heroBanners()
      .then((response) => {
        if (mounted) setBanners(response?.data?.banners || []);
      })
      .catch(() => { if (mounted) setBanners([]); });
    return () => { mounted = false; };
  }, []);

  if (!banners.length) {
    return (
      <section className="flex min-h-[420px] items-center bg-[#0f0a1a] px-6 sm:min-h-[500px] sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-7xl"><p className="text-[10px] font-bold uppercase tracking-[0.38em] text-[#e5c66e]">Sagunthala Dance Jewellery</p><h1 className="mt-5 max-w-2xl font-serif text-4xl leading-tight text-white sm:text-6xl">Jewellery that honours every movement.</h1><p className="mt-5 max-w-xl text-sm leading-7 text-stone-300 sm:text-base">Discover temple and dance jewellery created for performances, celebrations, and treasured family moments.</p><Link href="/products" className="mt-8 inline-flex min-h-11 items-center border border-[#d4af37]/70 px-5 text-xs font-bold uppercase tracking-[0.16em] text-[#f0d984] transition hover:bg-[#d4af37] hover:text-[#1a121b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984]">Explore the collection</Link></div>
      </section>
    );
  }

  return <PremiumHero slides={banners} />;
}
