"use client";

import { useRef } from "react";
import { useGsapReveal, useGsapFadeUp, useGsapLineReveal } from "../../app/hooks/useGsapAnimations";

export default function BrandStatement() {
    const lineRef = useGsapLineReveal({ delay: 0.3 });
    const quoteRef = useGsapReveal({ y: 20, duration: 1.3, delay: 0.1 });
    const iconRef = useGsapReveal({ y: 10, duration: 1, delay: 0 });

    return (
        <section className="relative py-28 px-6 text-center bg-gradient-to-b from-[#0f0a1a] to-[#0a0712] overflow-hidden">
            {/* Decorative side lines */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 w-[1px] h-32 bg-gradient-to-b from-transparent via-[#b48a3c]/20 to-transparent hidden lg:block" />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-[1px] h-32 bg-gradient-to-b from-transparent via-[#b48a3c]/20 to-transparent hidden lg:block" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Gold star icon */}
                <div ref={iconRef} className="inline-block w-10 h-10 mb-10 opacity-0">
                    <svg viewBox="0 0 24 24" fill="none" className="text-[#b48a3c] w-full h-full opacity-70">
                        <path
                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>

                {/* Decorative top line */}
                <div
                    ref={lineRef}
                    className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[#b48a3c]/40 to-transparent mx-auto mb-10"
                    style={{ transformOrigin: "center" }}
                />

                {/* Quote */}
                <blockquote
                    ref={quoteRef}
                    className="text-xl md:text-3xl lg:text-4xl font-serif text-white leading-relaxed mb-10 opacity-0"
                >
                    "Every piece of jewellery tells a story of{" "}
                    <span className="text-[#b48a3c]">devotion</span>, crafted for the
                    modern woman who carries{" "}
                    <em className="italic text-[#d4af37]">tradition</em> in her heart."
                </blockquote>

                {/* Bottom line */}
                <div className="w-16 h-[1px] bg-[#b48a3c]/30 mx-auto" />

                {/* Attribution */}
                <p className="mt-6 text-[8px] uppercase tracking-[0.6em] text-stone-600 font-bold">
                    Sagunthala Heritage — Since Tradition
                </p>
            </div>
        </section>
    );
}