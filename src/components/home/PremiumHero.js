"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { productHref } from "../../lib/productUrl";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const isSupabaseStorageUrl = (value) => typeof value === "string" && value.includes(".supabase.co/storage/");

export default function PremiumHero({ slides = [] }) {
  const [current, setCurrent] = useState(0);
  const heroRef = useRef(null);
  const imageFrameRef = useRef(null);
  const imageRef = useRef(null);
  const slide = slides[current];
  const imageAlt = slide?.image_alt_text || slide?.product?.name || "Sagunthala Dance Jewellers";
  const destination = productHref(slide?.product);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      if (!slide || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .fromTo(imageFrameRef.current, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.08, ease: "power4.inOut" })
        .fromTo(imageRef.current, { scale: 1.08 }, { scale: 1, duration: 1.45, ease: "power2.out" }, 0)
        .fromTo("[data-hero-eyebrow]", { autoAlpha: 0, x: -18 }, { autoAlpha: 1, x: 0, duration: 0.5 }, "-=0.45")
        .fromTo("[data-hero-line]", { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.55 }, "-=0.35")
        .fromTo("[data-hero-heading-line]", { yPercent: 112 }, { yPercent: 0, duration: 0.72, stagger: 0.11 }, "-=0.2")
        .fromTo("[data-hero-copy]", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.48 }, "-=0.3")
        .fromTo("[data-hero-cta]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.1 }, "-=0.2");

      const media = gsap.matchMedia();
      media.add("(min-width: 1024px)", () => {
        gsap.to(imageRef.current, { yPercent: -3, ease: "none", scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 0.65 } });
        gsap.to("[data-hero-content]", { yPercent: -8, autoAlpha: 0.45, ease: "none", scrollTrigger: { trigger: heroRef.current, start: "18% top", end: "bottom top", scrub: 0.55 } });
        const cleanups = gsap.utils.toArray("[data-magnetic]").map((button) => {
          const move = (event) => {
            const bounds = button.getBoundingClientRect();
            gsap.to(button, { x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 9, y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 7, duration: 0.25, ease: "power2.out", overwrite: "auto" });
          };
          const leave = () => gsap.to(button, { x: 0, y: 0, duration: 0.42, ease: "power3.out", overwrite: "auto" });
          button.addEventListener("pointermove", move);
          button.addEventListener("pointerleave", leave);
          return () => { button.removeEventListener("pointermove", move); button.removeEventListener("pointerleave", leave); };
        });
        return () => cleanups.forEach((cleanup) => cleanup());
      });
      return () => media.revert();
    }, heroRef);
    return () => context.revert();
  }, [slide]);

  if (!slide) return null;

  return (
    <section ref={heroRef} className="relative min-h-[540px] overflow-hidden bg-[#0f0a1a] sm:min-h-[620px] lg:min-h-[680px]" aria-label="Featured jewellery">
      <div ref={imageFrameRef} className="absolute inset-0">
        <Image ref={imageRef} key={slide.id} src={slide.image_url} alt={imageAlt} fill priority={current === 0} unoptimized={isSupabaseStorageUrl(slide.image_url)} sizes="100vw" className="object-cover" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0f0a1a]/95 via-[#0f0a1a]/62 to-[#0f0a1a]/20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f0a1a]/75 via-transparent to-transparent" />

      <div data-hero-content className="relative mx-auto flex min-h-[540px] max-w-7xl items-center px-6 py-24 sm:min-h-[620px] sm:px-10 lg:min-h-[680px] lg:px-16">
        <div className="max-w-2xl">
          <p data-hero-eyebrow className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.38em] text-[#e5c66e]"> Sagunthala Dance Jewellery</p>
          <span data-hero-line className="mb-5 block h-px w-16 bg-[#d4af37]" />
          <h1 className="font-serif text-4xl leading-[1.06] text-white sm:text-5xl lg:text-7xl"><span className="block overflow-hidden"><span data-hero-heading-line className="block">Jewellery crafted for</span></span><span className="block overflow-hidden"><span data-hero-heading-line className="block">the art of performance.</span></span></h1>
          <p data-hero-copy className="mt-6 max-w-xl text-sm leading-7 text-stone-200 sm:text-base">Classical dance jewellery designed to complete every expression.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link data-hero-cta data-magnetic href={destination} className="inline-flex min-h-12 items-center justify-center rounded-sm bg-[#d4af37] px-6 text-xs font-bold uppercase tracking-[0.2em] text-[#17101c] transition hover:bg-[#f0d984] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984]">Explore jewellery</Link>
            <Link data-hero-cta href="/products" className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/40 px-6 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:border-[#e5c66e] hover:text-[#f0d984] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Shop collections</Link>
          </div>
        </div>
      </div>
      <p className="absolute bottom-7 left-6 text-[9px] font-bold uppercase tracking-[0.32em] text-white/75 sm:bottom-10 sm:left-10">Scroll to discover <span className="ml-2 text-[#d4af37]" aria-hidden>↓</span></p>

      {slides.length > 1 ? <div className="absolute bottom-7 right-6 z-10 flex gap-2 sm:bottom-10 sm:right-10" aria-label="Hero slides">
        {slides.map((item, index) => <button key={item.id} type="button" onClick={() => setCurrent(index)} aria-label={`Show featured image ${index + 1}`} aria-current={index === current ? "true" : undefined} className={`h-10 w-10 rounded-full border text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0d984] ${index === current ? "border-[#d4af37] bg-[#d4af37] text-[#17101c]" : "border-white/35 bg-black/20 text-white hover:border-white"}`}>{index + 1}</button>)}
      </div> : null}
    </section>
  );
}
