"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getPublicProducts } from "../../lib/publicApi";
import ProductCard from "../product/ProductCard";
import { useGsapReveal } from "../../app/hooks/useGsapAnimations";
import { api } from "../../lib/api";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
} const getProductImage = (product) => {
  if (!product?.image_urls?.length) return "/placeholder-jewelry.jpg";
  // 2. Featured image
  const featured = product.image_urls.find(
    (img) => img.is_featured
  );
  if (featured?.url) return featured.url;

  // 3. Fallback
  return product.image_urls[0]?.url || "/placeholder-jewelry.jpg";
};

// ── Arrival Card ────────────────────────────────────────────────────────
function ArrivalCard({ product, index }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      className="group relative will-change-transform"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* "New" badge with shimmer */}
      <div className="absolute top-3 left-3 z-30">
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 bg-[#0f0a1a]/80 backdrop-blur-sm border border-[#b48a3c]/50 text-[#d4af37] text-[7px] font-black uppercase tracking-[0.3em] px-2.5 py-1.5 rounded-sm">
            <span
              className="w-1 h-1 rounded-full bg-[#d4af37] animate-pulse"
              style={{ animationDuration: "1.5s" }}
            />
            New
          </span>
          {/* Shimmer */}
          <div
            className="absolute inset-0 rounded-sm overflow-hidden pointer-events-none"
            aria-hidden
          >
            <div className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>

      {/* Card */}
      <div
        className={`relative overflow-hidden rounded-sm border transition-all duration-600 ${hovered
          ? "border-[#b48a3c]/40 shadow-[0_8px_48px_rgba(180,138,60,0.14),0_0_0_1px_rgba(180,138,60,0.08)]"
          : "border-stone-800/30"
          }`}
      >
        {/* Image */}
        <div className="relative overflow-hidden bg-[#0d0b16]" style={{ paddingBottom: "120%" }}>
          <div
            className={`absolute inset-0 transition-transform duration-800 ease-out ${hovered ? "scale-108" : "scale-100"
              }`}
          >
            <Image
              src={getProductImage(product)}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
              unoptimized
            />
          </div>

          {/* Gradient overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-[#0f0a1a]/80 via-[#0f0a1a]/10 to-transparent transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-50"
              }`}
          />

          {/* Hover action buttons */}
          <div
            className={`absolute inset-x-4 bottom-4 z-20 flex gap-2 transition-all duration-500 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
          >
            <Link
              href={`/products/${product.slug}`}
              className="flex-1 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[8px] uppercase tracking-[0.4em] font-bold text-center hover:bg-[#b48a3c] hover:border-[#b48a3c] hover:text-[#0f0a1a] transition-all duration-300 rounded-sm"
            >
              View
            </Link>
            <button
              className="px-3 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 rounded-sm"
              title="Add to Wishlist"
              aria-label="Add to wishlist"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-5 bg-[#0c0a15]">
          <p className="text-[8px] uppercase tracking-[0.45em] text-[#b48a3c] font-bold mb-1.5">
            {product.category || "Temple Jewellery"}
          </p>
          <h3 className="text-white font-serif text-sm md:text-base leading-snug line-clamp-2 mb-3">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-[#d4af37] font-semibold">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-stone-600 text-xs line-through">
                ₹{Number(product.original_price).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export default function NewArrivals() {
  const [newProducts, setNewProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const headerRef = useGsapReveal({ y: 24, duration: 1.1 });
  const lineRef = useRef(null);
  const ctaRef = useGsapReveal({ y: 20, duration: 0.9, start: "top 95%" });
  console.log("newProducts", newProducts);
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const data = await api.get("/products/public/products", {
          params: {
            page: 1,
            limit: 20,
            is_featured: true
          }
        });

        const products = data?.data?.products || [];

        setNewProducts(products.slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  // Grid stagger animation
  useEffect(() => {
    if (!gridRef.current || isLoading || !newProducts.length) return;
    const cards = gridRef.current.querySelectorAll("[data-card]");
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 50,
          scale: 0.97,
          willChange: "transform, opacity",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 78%",
            once: true,
          },
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, [isLoading, newProducts]);

  // Line reveal
  useEffect(() => {
    if (!lineRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0, transformOrigin: "center" },
        {
          scaleX: 1,
          duration: 1.5,
          ease: "power4.inOut",
          scrollTrigger: {
            trigger: lineRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  if (isLoading) {
    return (
      <section className="py-2 bg-[#0f0a1a]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div
                  className="bg-stone-900/40 rounded-sm animate-pulse"
                  style={{ paddingBottom: "120%" }}
                />
                <div className="mt-3 h-4 bg-stone-900/40 rounded animate-pulse" />
                <div className="mt-2 h-3 bg-stone-900/20 rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!newProducts.length) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-2 overflow-hidden bg-[#0f0a1a]"
    >
      {/* Ambient background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(180,138,60,0.06) 0%, transparent 65%)",
        }}
      />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col items-center mb-16 text-center">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#b48a3c]" />
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.6em] text-[#b48a3c] font-bold">
              Just Unveiled
            </span>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#b48a3c]" />
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-tight mb-6 leading-tight">
            New{" "}
            <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#b48a3c]">
              Arrivals
            </em>
          </h2>

          <div
            ref={lineRef}
            className="w-28 h-[1px] bg-gradient-to-r from-transparent via-[#b48a3c] to-transparent"
            style={{ transformOrigin: "center" }}
          />
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10"
        >
          {newProducts.map((product, idx) => (
            <div key={product.id} data-card className="opacity-0">
              <ArrivalCard product={product} index={idx} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="mt-20 text-center opacity-0">
          <div className="inline-flex flex-col items-center gap-4">
            <Link
              href="/products"
              className="group relative inline-flex items-center gap-3 px-12 py-4 border border-[#b48a3c]/30 text-[#b48a3c] text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#b48a3c] hover:text-[#0f0a1a] hover:border-[#b48a3c] transition-all duration-500 rounded-sm overflow-hidden"
            >
              <span>Discover The Full Collection</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              {/* Shimmer */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </Link>
            <span className="text-[8px] uppercase tracking-[0.4em] text-stone-700 font-bold">
              {newProducts.length}+ New Pieces
            </span>
          </div>
        </div>
      </div>

      {/* Shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .scale-108 { transform: scale(1.08); }
      `}</style>
    </section>
  );
}