"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import TestimonialCard from "./TestimonialCard";

export default function Testimonials({ showcasePosition = false }) {
  const [content, setContent] = useState(null);
  const railRef = useRef(null); const dragRef = useRef(null);
  useEffect(() => { let current = true; api.products.testimonials.public().then((response) => { if (current) setContent(response.data); }).catch(() => { if (current) setContent({ settings: { enabled: false }, testimonials: [] }); }); return () => { current = false; }; }, []);
  if (!content?.settings?.enabled || !content.testimonials?.length) return null;
  const { settings, testimonials } = content;
  const gap = { compact: "0.875rem", standard: "1.25rem", relaxed: "1.75rem" }[settings.spacing] || "1.25rem";
  const minHeight = { compact: "15rem", standard: "18rem", large: "22rem" }[settings.card_size] || "18rem";
  // These settings are deliberately used only from the tablet breakpoint up.
  // Mobile always renders a single readable card with a next-card preview.
  const visibleCards = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 4) : fallback;
  };
  const desktopCards = visibleCards(settings.desktop_visible_count, 3);
  const tabletCards = visibleCards(settings.tablet_visible_count, 2);
  const dragStart = (event) => { if (event.pointerType !== "mouse") return; dragRef.current = { x: event.clientX, scroll: railRef.current?.scrollLeft || 0 }; railRef.current?.setPointerCapture(event.pointerId); };
  const dragMove = (event) => { if (!dragRef.current || !railRef.current) return; railRef.current.scrollLeft = dragRef.current.scroll - (event.clientX - dragRef.current.x); };
  const stopDrag = () => { dragRef.current = null; };
  return <section data-showroom-section className={`${showcasePosition ? "relative z-10 -mt-8 sm:-mt-12" : "border-t border-stone-900/70"} overflow-hidden bg-[#120d1b] px-4 py-16 sm:px-6 sm:py-20 lg:px-8`}><div className="mx-auto max-w-[1440px]"><div className="mb-11 text-center"><div className="flex items-center justify-center gap-4"><span className="h-px w-10 bg-gradient-to-r from-transparent to-[#d4af37]/65" /><p className="text-[10px] font-bold uppercase tracking-[0.45em] text-[#d4af37]">Customer Stories</p><span className="h-px w-10 bg-gradient-to-l from-transparent to-[#d4af37]/65" /></div><h2 className="mt-4 font-serif text-3xl leading-tight text-[#fffaf0] sm:text-5xl">{settings.heading}</h2>{settings.subheading ? <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-400">{settings.subheading}</p> : null}</div>
    <div ref={railRef} onPointerDown={dragStart} onPointerMove={dragMove} onPointerUp={stopDrag} onPointerCancel={stopDrag} className="testimonial-rail -mx-4 flex cursor-grab snap-x snap-mandatory overflow-x-auto px-4 pb-4 active:cursor-grabbing sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" style={{ "--testimonial-gap": gap, "--testimonial-min-height": minHeight, "--desktop-cards": desktopCards, "--tablet-cards": tabletCards }}>
      {testimonials.map((item) => <TestimonialCard key={item.id} item={item} className="testimonial-card snap-start" />)}
    </div></div><style jsx global>{`.testimonial-rail { gap: var(--testimonial-gap); scrollbar-width: thin; scrollbar-color: #6f542b transparent; touch-action: pan-x; scroll-behavior: smooth; } .testimonial-rail > .testimonial-card { min-height: var(--testimonial-min-height); flex: 0 0 85vw; width: 85vw; max-width: 360px; min-width: min(85vw, 280px); scroll-snap-align: start; } @media (min-width: 640px) { .testimonial-rail > .testimonial-card { width: auto; max-width: none; min-width: 0; flex-basis: min(21rem, calc((100% - (var(--testimonial-gap) * (var(--tablet-cards) - 1))) / var(--tablet-cards))); } } @media (min-width: 1024px) { .testimonial-rail > .testimonial-card { flex-basis: min(25rem, calc((100% - (var(--testimonial-gap) * (var(--desktop-cards) - 1))) / var(--desktop-cards))); } } @media (prefers-reduced-motion: reduce) { .testimonial-rail { scroll-behavior: auto; } }`}</style></section>;
}
