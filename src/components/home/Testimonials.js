"use client";

import { useRef } from "react";
import { useGsapReveal, useGsapFadeUp } from "../../app/hooks/useGsapAnimations";

const testimonials = [
    {
        name: "Ananya S.",
        location: "Chennai",
        review: "Stunning craftsmanship and thoughtful service. Every item feels divine — like wearing a piece of history.",
        rating: 5,
    },
    {
        name: "Karthik R.",
        location: "Bangalore",
        review: "Fast delivery, premium quality, and perfect for our wedding celebrations. The bridal set was breathtaking.",
        rating: 5,
    },
    {
        name: "Meena V.",
        location: "Coimbatore",
        review: "The heritage collection gave me nostalgic joy and modern confidence. I wore it on my daughter's naming ceremony.",
        rating: 5,
    },
];

function StarRating({ count = 5 }) {
    return (
        <div className="flex gap-1 mb-5">
            {[...Array(count)].map((_, i) => (
                <svg key={i} className="w-3 h-3 text-[#b48a3c]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

export default function Testimonials() {
    const headerRef = useGsapReveal({ y: 24, duration: 1.1 });
    const gridRef = useGsapFadeUp({
        stagger: 0.14,
        duration: 0.9,
        y: 36,
        start: "top 80%",
        childSelector: "[data-card]",
    });

    return (
        <section className="py-28 px-6 bg-[#0a0712] border-t border-stone-900/50 relative overflow-hidden">
            {/* Background texture */}
            <div
                className="absolute inset-0 opacity-[0.015] pointer-events-none"
                style={{
                    backgroundImage: `repeating-linear-gradient(
            45deg,
            #b48a3c 0px,
            #b48a3c 1px,
            transparent 1px,
            transparent 60px
          )`,
                }}
            />

            <div className="max-w-[1440px] mx-auto relative z-10">
                {/* Header */}
                <div ref={headerRef} className="text-center mb-16 opacity-0">
                    <div className="flex items-center justify-center gap-4 mb-5">
                        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#b48a3c]/40" />
                        <span className="text-[9px] uppercase tracking-[0.6em] text-[#b48a3c] font-bold">
                            Patron Voices
                        </span>
                        <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#b48a3c]/40" />
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white tracking-tight mb-4">
                        What Our Patrons Say
                    </h2>
                    <p className="max-w-md mx-auto text-stone-500 text-sm leading-relaxed font-light">
                        Stories of devotion and trust that shape every piece we craft.
                    </p>
                </div>

                {/* Cards grid */}
                <div
                    ref={gridRef}
                    className="grid grid-cols-1 md:grid-cols-3 gap-5"
                >
                    {testimonials.map((item, idx) => (
                        <div
                            key={item.name}
                            data-card
                            className="group relative rounded-sm border border-stone-800/60 p-7 bg-[#0d0b16] hover:border-[#b48a3c]/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(180,138,60,0.06)] flex flex-col"
                        >
                            {/* Large quote mark */}
                            <div
                                className="absolute top-5 right-6 text-[80px] font-serif text-[#b48a3c]/05 leading-none pointer-events-none select-none"
                                aria-hidden
                            >
                                "
                            </div>

                            <StarRating count={item.rating} />

                            <p className="text-stone-300/80 leading-relaxed text-sm mb-6 flex-1 italic">
                                "{item.review}"
                            </p>

                            <div className="flex items-center gap-3 pt-5 border-t border-stone-800/50">
                                {/* Avatar placeholder */}
                                <div className="w-8 h-8 rounded-full bg-[#b48a3c]/15 border border-[#b48a3c]/20 flex items-center justify-center">
                                    <span className="text-[#b48a3c] text-[10px] font-black">
                                        {item.name[0]}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#b48a3c]">
                                        {item.name}
                                    </p>
                                    <p className="text-[8px] uppercase tracking-[0.25em] text-stone-600 mt-0.5">
                                        {item.location}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust badges */}
                <div className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-12">
                    {[
                        { label: "Certified Gold", icon: "✦" },
                        { label: "Handcrafted", icon: "✦" },
                        { label: "Temple Artisans", icon: "✦" },
                        { label: "100% Authentic", icon: "✦" },
                    ].map((badge) => (
                        <div key={badge.label} className="flex items-center gap-2 text-stone-600">
                            <span className="text-[#b48a3c]/40 text-[10px]">{badge.icon}</span>
                            <span className="text-[8px] uppercase tracking-[0.5em] font-bold">{badge.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}