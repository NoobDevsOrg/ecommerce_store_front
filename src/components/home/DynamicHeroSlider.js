"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import HeroSlider from "./HeroSlider";

export default function DynamicHeroSlider() {
  const [banners, setBanners] = useState(null);
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return undefined;
    hasLoadedRef.current = true;

    let mounted = true;
    api.products.public.heroBanners()
      .then((response) => {
        if (mounted) setBanners(response?.data?.banners || []);
      })
      .catch((requestError) => {
        if (mounted) setError(requestError?.message || "Unable to load the Hero banners.");
      });
    return () => { mounted = false; };
  }, []);

  if (banners === null && !error) {
    return <section className="h-[90vh] md:h-screen bg-[#0f0a1a]" aria-label="Loading hero banners" />;
  }

  if (error || !banners.length) {
    return (
      <section className="flex h-[45vh] items-center justify-center bg-[#0f0a1a] px-6 text-center text-sm text-stone-400">
        {error || "Hero banners have not been configured yet."}
      </section>
    );
  }

  return <HeroSlider slides={banners} />;
}
