"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const imageFor = (product) => product?.image_urls?.[0]?.url || product?.thumbnail_url || null;

export default function FinalCtaMotion({ product }) {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
      const timeline = gsap.timeline({ scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true } });
      const visual = sectionRef.current?.querySelector("[data-final-image]");
      if (visual) timeline.fromTo(visual, { scale: 1.1, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.1, ease: "power3.out" });
      timeline
        .fromTo("[data-final-line]", { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.55, ease: "power3.out" }, visual ? "-=0.68" : 0)
        .fromTo("[data-final-reveal]", { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.1, ease: "power3.out" }, "-=0.2");
      const media = gsap.matchMedia();
      media.add("(min-width: 1024px)", () => {
        if (imageRef.current) gsap.to(imageRef.current, { yPercent: -4, ease: "none", scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 0.6 } });
        const button = sectionRef.current?.querySelector("[data-magnetic]");
        if (!button) return undefined;
        const move = (event) => {
          const bounds = button.getBoundingClientRect();
          gsap.to(button, { x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 9, y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 7, duration: 0.25, ease: "power2.out", overwrite: "auto" });
        };
        const leave = () => gsap.to(button, { x: 0, y: 0, duration: 0.42, ease: "power3.out", overwrite: "auto" });
        button.addEventListener("pointermove", move);
        button.addEventListener("pointerleave", leave);
        return () => { button.removeEventListener("pointermove", move); button.removeEventListener("pointerleave", leave); };
      });
      return () => media.revert();
    }, sectionRef);
    return () => context.revert();
  }, [product]);

  const image = imageFor(product);
  return <section ref={sectionRef} className="relative isolate overflow-hidden bg-[#0b080d] py-24 sm:py-32">
    {image ? <div data-final-image ref={imageRef} className="absolute inset-0"><Image src={image} alt="" fill sizes="100vw" className="object-cover opacity-30" /><div className="absolute inset-0 bg-[#0b080d]/78" /></div> : null}
    <div className="pointer-events-none absolute inset-0 opacity-90" style={{ background: "radial-gradient(circle at 50% 0%, rgba(212,175,55,.18), transparent 42%), linear-gradient(125deg, transparent 20%, rgba(112,77,40,.2) 50%, transparent 75%)" }} />
    <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 text-center sm:px-10">
      <p data-final-reveal className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d4af37]">Sagunthala Dance Jewellers</p>
      <span data-final-line className="mt-5 h-px w-16 bg-[#d4af37]" />
      <h2 data-final-reveal className="mt-5 font-serif text-4xl leading-[1.05] text-white sm:text-6xl">Find the jewellery that completes your performance.</h2>
      <p data-final-reveal className="mt-5 max-w-xl text-sm leading-7 text-stone-300">Explore the available collection and discover a piece for your next expression.</p>
      <Link data-final-reveal data-magnetic href="/products" className="group mt-9 inline-flex min-h-12 items-center bg-[#d4af37] px-6 text-xs font-bold uppercase tracking-[0.18em] text-[#1b141d] transition hover:bg-[#f0d984] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d984]">Explore all jewellery <span className="ml-3 transition-transform group-hover:translate-x-1" aria-hidden>→</span></Link>
    </div>
  </section>;
}
