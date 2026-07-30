// "use client";

// import { useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { getPublicProducts } from "../../lib/publicApi";
// import ProductCard from "../product/ProductCard";
// import { useGsapReveal } from "../../app/hooks/useGsapAnimations";
// import { api } from "../../lib/api";

// if (typeof window !== "undefined") {
//   gsap.registerPlugin(ScrollTrigger);
// }
// const getProductImage = (product) => {
//   if (!product?.image_urls?.length) return "/placeholder-jewelry.jpg";
//   console.log("getProductImage, products", product)
//   // 1. Best Seller image
//   const bestSell = product.image_urls.find(
//     (img) => img.is_best_sell && img.is_primary
//   );
//   if (bestSell?.url) return bestSell.url;

//   // 2. Featured image
//   const featured = product.image_urls.find(
//     (img) => img.is_featured
//   );
//   if (featured?.url) return featured.url;

//   // 3. Fallback
//   return product.image_urls[0]?.url || "/placeholder-jewelry.jpg";
// };
// // ── Individual Track Card ──────────────────────────────────────────────
// function TrackCard({ product }) {
//   const [hovered, setHovered] = useState(false);
//   // console.log("TrackCardproduct", product);
//   const imageUrl = getProductImage(product);
//   return (
//     <div
//       className="relative flex-shrink-0 w-[260px] md:w-[300px] group cursor-pointer"
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//     >
//       {/* Card shell */}
//       <div
//         className={`relative overflow-hidden rounded-sm border transition-all duration-700 ${hovered
//           ? "border-[#b48a3c]/60 shadow-[0_0_40px_rgba(180,138,60,0.18)]"
//           : "border-stone-800/40"
//           }`}
//       >
//         {/* Image */}
//         <div className="relative h-[320px] md:h-[360px] overflow-hidden bg-[#0f0d18]">
//           <div
//             className={`absolute inset-0 transition-transform duration-700 ease-out ${hovered ? "scale-110" : "scale-100"
//               }`}
//           >
//             <Image
//               src={getProductImage(product)}
//               alt={product.name}
//               fill
//               className="object-cover"
//               sizes="300px"
//               unoptimized
//             />

//           </div>

//           {/* Gold gradient on hover */}
//           <div
//             className={`absolute inset-0 bg-gradient-to-t from-[#0f0a1a]/90 via-[#0f0a1a]/20 to-transparent transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-60"
//               }`}
//           />

//           {/* Best Seller badge */}
//           {product.is_featured && (
//             <div className="absolute top-3 left-3 z-20">
//               <span className="inline-block bg-[#b48a3c] text-[#0f0a1a] text-[7px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-sm">
//                 Best Seller
//               </span>
//             </div>
//           )}

//           {/* Quick View Overlay */}
//           <div
//             className={`absolute inset-x-0 bottom-0 z-20 flex flex-col items-center pb-6 transition-all duration-500 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
//               }`}
//           >
//             <Link
//               href={`/products/${product.slug}`}
//               className="px-7 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] uppercase tracking-[0.4em] font-bold hover:bg-[#b48a3c] hover:border-[#b48a3c] hover:text-[#0f0a1a] transition-all duration-300 rounded-sm"
//               onClick={(e) => e.stopPropagation()}
//             >
//               Quick View
//             </Link>
//           </div>
//         </div>

//         {/* Product Info */}
//         <div className="p-5 bg-[#0c0a15]">
//           <p className="text-[9px] uppercase tracking-[0.4em] text-[#b48a3c] font-bold mb-2">
//             {product.category || "Temple Jewellery"}
//           </p>
//           <h3 className="text-white font-serif text-base leading-snug line-clamp-2 mb-3">
//             {product.name}
//           </h3>
//           <div className="flex items-center justify-between">
//             <span className="text-[#d4af37] font-semibold text-sm">
//               ₹{Number(product.price).toLocaleString("en-IN")}
//             </span>
//             <div className="flex gap-0.5">
//               {[...Array(5)].map((_, i) => (
//                 <svg key={i} className="w-2.5 h-2.5 text-[#b48a3c]" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                 </svg>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Main Component ─────────────────────────────────────────────────────
// export default function TopSelling() {
//   const [topProducts, setTopProducts] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isPaused, setIsPaused] = useState(false);

//   const sectionRef = useRef(null);
//   const trackRef = useRef(null);
//   const tweenRef = useRef(null);
//   const headerRef = useGsapReveal({ y: 24, duration: 1.1 });

//   useEffect(() => {
//     const fetchTopProducts = async () => {
//       try {
//         const params = new URLSearchParams();
//         params.append("page", String(1));
//         params.append("limit", String(20));
//         params.append("is_best_sell", "true");
//         const data = await api.get(`/products/public/products?${params.toString()}`);
//         console.log("asasas data", data.products);
//         const products = data?.data?.products || [];
//         console.log("asasas products", products);
//         const top = products.filter((p) => p.is_featured);
//         setTopProducts(top.slice(0, 8)); // More products for marquee
//       } catch (err) {
//         console.error("Failed to fetch top products:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchTopProducts();
//   }, []);

//   // GSAP infinite marquee
//   useEffect(() => {
//     if (!trackRef.current || topProducts.length < 2) return;

//     const track = trackRef.current;
//     const cardWidth = 300 + 32; // card width + gap
//     const totalWidth = cardWidth * topProducts.length;

//     // Set initial position
//     gsap.set(track, { x: 0 });

//     tweenRef.current = gsap.to(track, {
//       x: -totalWidth,
//       duration: topProducts.length * 4.5,
//       ease: "none",
//       repeat: -1,
//       modifiers: {
//         x: gsap.utils.unitize((x) => parseFloat(x) % totalWidth),
//       },
//     });

//     return () => {
//       if (tweenRef.current) tweenRef.current.kill();
//     };
//   }, [topProducts]);

//   // Pause/resume on hover
//   useEffect(() => {
//     if (!tweenRef.current) return;
//     isPaused ? tweenRef.current.pause() : tweenRef.current.resume();
//   }, [isPaused]);

//   // Section entrance animation
//   useEffect(() => {
//     if (!sectionRef.current || isLoading) return;
//     const ctx = gsap.context(() => {
//       gsap.fromTo(
//         sectionRef.current,
//         { opacity: 0 },
//         {
//           opacity: 1,
//           duration: 1,
//           scrollTrigger: {
//             trigger: sectionRef.current,
//             start: "top 80%",
//             once: true,
//           },
//         }
//       );
//     }, sectionRef);
//     return () => ctx.revert();
//   }, [isLoading]);

//   if (isLoading) {
//     return (
//       <section className="py-2 bg-[#0a0712] border-y border-stone-900/50">
//         <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
//           {/* Skeleton */}
//           <div className="flex gap-8 overflow-hidden">
//             {[...Array(4)].map((_, i) => (
//               <div key={i} className="flex-shrink-0 w-[280px]">
//                 <div className="h-[340px] bg-stone-900/50 rounded-sm animate-pulse" />
//                 <div className="mt-4 h-4 bg-stone-900/50 rounded animate-pulse" />
//                 <div className="mt-2 h-3 bg-stone-900/30 rounded animate-pulse w-2/3" />
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (!topProducts.length) return null;

//   // Duplicate for seamless loop
//   const displayProducts =
//     topProducts.length > 1
//       ? [...topProducts, ...topProducts]
//       : topProducts;

//   return (
//     <section
//       ref={sectionRef}
//       className="py-24 bg-[#0a0712] border-y border-stone-900/50 overflow-hidden opacity-0"
//     >
//       {/* Header */}
//       <div
//         ref={headerRef}
//         className="max-w-[1440px] mx-auto px-6 lg:px-12 mb-16"
//       >
//         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
//           <div className="max-w-xl">
//             <div className="flex items-center gap-3 mb-3">
//               <div className="w-6 h-[1px] bg-[#b48a3c]" />
//               <span className="text-[9px] uppercase tracking-[0.5em] text-[#b48a3c] font-bold">
//                 Most Coveted
//               </span>
//             </div>
//             <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight">
//               Top Selling{" "}
//               <em className="not-italic text-stone-500 font-light">Collections</em>
//             </h2>
//             <p className="text-stone-500 text-sm mt-4 font-light leading-relaxed max-w-sm">
//               Pieces that have captured the hearts of our patrons — the pinnacle
//               of our artistic heritage.
//             </p>
//           </div>

//           <Link
//             href="/products?featured=true"
//             className="self-start md:self-auto flex items-center gap-2 text-[#b48a3c] text-[10px] uppercase tracking-[0.4em] font-bold hover:text-[#d4af37] transition-colors duration-300 group"
//           >
//             View All
//             <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
//           </Link>
//         </div>
//       </div>

//       {/* ── Marquee Track ── */}
//       <div
//         className="relative"
//         onMouseEnter={() => setIsPaused(true)}
//         onMouseLeave={() => setIsPaused(false)}
//         onTouchStart={() => setIsPaused(true)}
//         onTouchEnd={() => setIsPaused(false)}
//       >
//         {/* Left fade */}
//         <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[#0a0712] to-transparent z-20 pointer-events-none" />
//         {/* Right fade */}
//         <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[#0a0712] to-transparent z-20 pointer-events-none" />

//         {/* Track */}
//         <div
//           ref={trackRef}
//           className="flex gap-8 pl-8 will-change-transform"
//           style={{ width: "max-content" }}
//         >
//           {displayProducts.map((product, idx) => (
//             <TrackCard key={`${product.id}-${idx}`} product={product} />
//           ))}
//         </div>
//       </div>

//       {/* Pause hint */}
//       <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mt-8 flex items-center gap-2">
//         <div
//           className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isPaused ? "bg-[#b48a3c]" : "bg-stone-700"
//             }`}
//         />
//         <span className="text-[8px] uppercase tracking-[0.4em] text-stone-600 font-bold">
//           {isPaused ? "Paused" : "Hover to pause"}
//         </span>
//       </div>
//     </section>
//   );
// }

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapReveal } from "../../app/hooks/useGsapAnimations";
import { api } from "../../lib/api";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// A user must move more than this many px before it counts as a drag (not a tap/click)
const DRAG_THRESHOLD = 8;
// Autoplay speed, in px / second (kept as *speed* not duration, so it never depends
// on guessed card widths — this is what actually makes the motion feel smooth &
// consistent no matter what width the cards render at on a given screen)
const SPEED_DESKTOP = 50;
const SPEED_MOBILE = 36;

const getProductImage = (product) => {
  if (!product?.image_urls?.length) return "/placeholder-jewelry.jpg";
  const bestSell = product.image_urls.find((img) => img.is_best_sell && img.is_primary);
  if (bestSell?.url) return bestSell.url;
  const featured = product.image_urls.find((img) => img.is_featured);
  if (featured?.url) return featured.url;
  return product.image_urls[0]?.url || "/placeholder-jewelry.jpg";
};

// ── Individual Track Card ──────────────────────────────────────────────
function TrackCard({ product, getIsDrag }) {
  const [hovered, setHovered] = useState(false);

  const handleClick = (e) => {
    // Block navigation only if this interaction was a real drag, not a tap/click
    if (getIsDrag()) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      onClick={handleClick}
      draggable={false}
      className="relative flex-shrink-0 block"
      style={{ width: "clamp(180px, 55vw, 300px)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`relative overflow-hidden rounded-sm border transition-all duration-700 ${
          hovered
            ? "border-[#b48a3c]/60 shadow-[0_0_40px_rgba(180,138,60,0.18)]"
            : "border-stone-800/40"
        }`}
      >
        {/* Image */}
        <div
          className="relative overflow-hidden bg-[#0f0d18]"
          style={{ height: "clamp(240px, 60vw, 360px)" }}
        >
          <div
            className={`absolute inset-0 transition-transform duration-700 ease-out ${
              hovered ? "scale-110" : "scale-100"
            }`}
          >
            <Image
              src={getProductImage(product)}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 55vw, 300px"
              unoptimized
              draggable={false}
            />
          </div>

          <div
            className={`absolute inset-0 bg-gradient-to-t from-[#0f0a1a]/90 via-[#0f0a1a]/20 to-transparent transition-opacity duration-500 ${
              hovered ? "opacity-100" : "opacity-60"
            }`}
          />

          {product.is_featured && (
            <div className="absolute top-3 left-3 z-20">
              <span className="inline-block bg-[#b48a3c] text-[#0f0a1a] text-[7px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-sm">
                Best Seller
              </span>
            </div>
          )}

          <div
            className={`absolute inset-x-0 bottom-0 z-20 hidden md:flex flex-col items-center pb-6 transition-all duration-500 ${
              hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="px-7 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] uppercase tracking-[0.4em] font-bold hover:bg-[#b48a3c] hover:border-[#b48a3c] hover:text-[#0f0a1a] transition-all duration-300 rounded-sm">
              Quick View
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 md:p-5 bg-[#0c0a15]">
          <p className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] text-[#b48a3c] font-bold mb-1 md:mb-2">
            {product.category || "Temple Jewellery"}
          </p>
          <h3 className="text-white font-serif text-xs md:text-base leading-snug line-clamp-2 mb-2 md:mb-3">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-[#d4af37] font-semibold text-xs md:text-sm">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-2 h-2 md:w-2.5 md:h-2.5 text-[#b48a3c]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Gold Scrollbar ─────────────────────────────────────────────────────
// Purely a "controller" — it reads/writes progress (0..1) through the callbacks
// it's given, and has no idea how the marquee itself is implemented.
function GoldScrollbar({ getProgress, setProgress, onInteractStart, onInteractEnd }) {
  const barRef = useRef(null);
  const thumbRef = useRef(null);
  const rafRef = useRef(null);
  const drag = useRef({ active: false, startClient: 0, startLeft: 0 });

  const syncThumb = useCallback(() => {
    const bar = barRef.current;
    const thumb = thumbRef.current;
    if (bar && thumb) {
      const progress = getProgress();
      const maxLeft = bar.offsetWidth - thumb.offsetWidth;
      thumb.style.transform = `translateX(${progress * maxLeft}px)`;
    }
    rafRef.current = requestAnimationFrame(syncThumb);
  }, [getProgress]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(syncThumb);
    return () => cancelAnimationFrame(rafRef.current);
  }, [syncThumb]);

  const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

  const onThumbStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onInteractStart();
    const bar = barRef.current;
    const thumb = thumbRef.current;
    if (!bar || !thumb) return;
    const maxLeft = bar.offsetWidth - thumb.offsetWidth;
    const currentLeft = getProgress() * maxLeft;
    drag.current = { active: true, startClient: getClientX(e), startLeft: currentLeft };
  };

  const onThumbMove = (e) => {
    if (!drag.current.active) return;
    if (e.cancelable) e.preventDefault();
    const bar = barRef.current;
    const thumb = thumbRef.current;
    if (!bar || !thumb) return;
    const maxLeft = bar.offsetWidth - thumb.offsetWidth;
    const delta = getClientX(e) - drag.current.startClient;
    const newLeft = Math.max(0, Math.min(maxLeft, drag.current.startLeft + delta));
    setProgress(newLeft / maxLeft);
  };

  const onThumbEnd = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    onInteractEnd();
  };

  const onBarTap = (e) => {
    if (drag.current.active) return;
    const bar = barRef.current;
    const thumb = thumbRef.current;
    if (!bar || !thumb) return;
    const rect = bar.getBoundingClientRect();
    const tapX = getClientX(e) - rect.left;
    const maxLeft = bar.offsetWidth - thumb.offsetWidth;
    const progress = Math.max(0, Math.min(1, (tapX - thumb.offsetWidth / 2) / maxLeft));
    onInteractStart();
    setProgress(progress);
    onInteractEnd();
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mt-6">
      <div className="flex items-center gap-3 mb-3">
        <svg
          className="w-3 h-3 text-stone-600 flex-shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[8px] uppercase tracking-[0.4em] text-stone-600 font-bold">
          Drag to explore
        </span>
      </div>

      <div
        ref={barRef}
        onMouseDown={onBarTap}
        onTouchStart={onBarTap}
        className="relative h-[6px] bg-stone-800/60 rounded-full cursor-pointer touch-none select-none"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-stone-700/30 to-transparent" />
        <div
          ref={thumbRef}
          onMouseDown={onThumbStart}
          onTouchStart={onThumbStart}
          onMouseMove={onThumbMove}
          onTouchMove={onThumbMove}
          onMouseUp={onThumbEnd}
          onTouchEnd={onThumbEnd}
          onMouseLeave={onThumbEnd}
          className="absolute top-1/2 -translate-y-1/2 left-0 w-16 h-[10px] rounded-full cursor-grab active:cursor-grabbing touch-none select-none
            bg-gradient-to-r from-[#b48a3c] via-[#d4af37] to-[#b48a3c]
            shadow-[0_0_10px_rgba(212,175,55,0.55)]
            hover:shadow-[0_0_18px_rgba(212,175,55,0.75)]
            transition-shadow duration-300"
          style={{ transform: "translateX(0)" }}
        />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export default function TopSelling() {
  const [topProducts, setTopProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const headerRef = useGsapReveal({ y: 24, duration: 1.1 });

  // ── Marquee engine state (all refs — zero re-renders per frame) ──
  const posRef = useRef(0); // current translateX, kept in the range (-S, 0]
  const singleWidthRef = useRef(0); // px width of ONE set of products (measured from real DOM)
  const hoveredRef = useRef(false); // true while pointer is over the track (pause)
  const interactingRef = useRef(false); // true while user is dragging track or scrollbar (pause)
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Drag state for the track itself
  const drag = useRef({ active: false, startClient: 0, startPos: 0, totalMoved: 0 });
  const getIsDrag = useCallback(() => drag.current.totalMoved > DRAG_THRESHOLD, []);

  // ── Fetch products ──
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const params = new URLSearchParams();
        params.append("page", "1");
        params.append("limit", "20");
        params.append("is_best_sell", "true");
        const data = await api.get(`/products/public/products?${params.toString()}`);
        const products = data?.data?.products || [];
        const top = products.filter((p) => p.is_featured);
        setTopProducts(top.slice(0, 8));
      } catch (err) {
        console.error("Failed to fetch top products:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopProducts();
  }, []);

  // ── Measure the real rendered width of one set of cards ──
  // This is what makes the motion smooth: instead of guessing a card width in JS
  // (which can drift from the actual clamp()-based responsive width and cause
  // jitter/snapping), we measure the DOM directly.
  const measure = useCallback(() => {
    if (!trackRef.current) return;
    singleWidthRef.current = trackRef.current.scrollWidth / 2;
  }, []);

  useEffect(() => {
    if (!topProducts.length) return;
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, [topProducts, measure]);

  // Keep posRef inside (-S, 0]. Because the track is two identical sets of
  // products back to back, wrapping at this boundary is visually seamless.
  const wrap = (pos) => {
    const S = singleWidthRef.current;
    if (!S) return pos;
    let p = pos;
    while (p <= -S) p += S;
    while (p > 0) p -= S;
    return p;
  };

  const applyTransform = () => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${posRef.current}px,0,0)`;
    }
  };

  // ── Autoplay loop (requestAnimationFrame — frame-accurate, no easing snaps) ──
  useEffect(() => {
    if (!topProducts.length) return;

    const speed = () =>
      typeof window !== "undefined" && window.innerWidth < 768 ? SPEED_MOBILE : SPEED_DESKTOP;

    const tick = (t) => {
      if (lastTimeRef.current == null) lastTimeRef.current = t;
      // clamp dt so tab-switching / long pauses don't cause a big visible jump
      const dt = Math.min((t - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = t;

      if (!hoveredRef.current && !interactingRef.current && singleWidthRef.current) {
        posRef.current = wrap(posRef.current - speed() * dt);
        applyTransform();
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [topProducts]);

  // ── Section entrance ──
  useEffect(() => {
    if (!sectionRef.current || isLoading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [isLoading]);

  // ── Hover-to-pause (requirement: hovering a product stops the carousel) ──
  const onTrackEnter = () => {
    hoveredRef.current = true;
  };
  const onTrackLeave = () => {
    hoveredRef.current = false;
    // if the pointer leaves mid-drag, end the drag cleanly too
    if (drag.current.active) onDragEnd();
  };

  // ── Drag-to-scroll on the track itself ──
  const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

  const onDragStart = (e) => {
    interactingRef.current = true;
    drag.current = {
      active: true,
      startClient: getClientX(e),
      startPos: posRef.current,
      totalMoved: 0,
    };
  };

  const onDragMove = (e) => {
    if (!drag.current.active) return;
    if (e.cancelable) e.preventDefault();
    const delta = getClientX(e) - drag.current.startClient;
    drag.current.totalMoved = Math.max(drag.current.totalMoved, Math.abs(delta));
    posRef.current = wrap(drag.current.startPos + delta);
    applyTransform();
  };

  const onDragEnd = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    interactingRef.current = false;
    // totalMoved is intentionally left alone here — the click handler on the
    // card fires right after and needs to read it to decide drag vs tap.
  };

  // ── Scrollbar <-> marquee bridge ──
  const getProgress = useCallback(() => {
    const S = singleWidthRef.current;
    if (!S) return 0;
    return (-posRef.current) / S;
  }, []);

  const setProgress = useCallback((p) => {
    const S = singleWidthRef.current;
    if (!S) return;
    posRef.current = wrap(-(p * S));
    applyTransform();
  }, []);

  const onScrollbarInteractStart = useCallback(() => {
    interactingRef.current = true;
  }, []);
  const onScrollbarInteractEnd = useCallback(() => {
    interactingRef.current = false;
  }, []);

  if (isLoading) {
    return (
      <section className="py-2 bg-[#0a0712] border-y border-stone-900/50">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0" style={{ width: "clamp(180px, 55vw, 300px)" }}>
                <div
                  className="bg-stone-900/50 rounded-sm animate-pulse"
                  style={{ height: "clamp(240px, 60vw, 360px)" }}
                />
                <div className="mt-4 h-4 bg-stone-900/50 rounded animate-pulse" />
                <div className="mt-2 h-3 bg-stone-900/30 rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!topProducts.length) return null;

  const displayProducts = [...topProducts, ...topProducts];

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-[#0a0712] border-y border-stone-900/50 overflow-hidden opacity-0"
    >
      {/* Header */}
      <div ref={headerRef} className="max-w-[1440px] mx-auto px-6 lg:px-12 mb-10 md:mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-[1px] bg-[#b48a3c]" />
              <span className="text-[9px] uppercase tracking-[0.5em] text-[#b48a3c] font-bold">
                Most Coveted
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight">
              Top Selling <em className="not-italic text-stone-500 font-light">Collections</em>
            </h2>
            <p className="text-stone-500 text-sm mt-4 font-light leading-relaxed max-w-sm">
              Pieces that have captured the hearts of our patrons — the pinnacle of our artistic
              heritage.
            </p>
          </div>
          <Link
            href="/products?featured=true"
            className="self-start md:self-auto flex items-center gap-2 text-[#b48a3c] text-[10px] uppercase tracking-[0.4em] font-bold hover:text-[#d4af37] transition-colors duration-300 group"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>
      </div>

      {/* ── Marquee Track ── */}
      <div
        className="relative touch-none select-none"
        onMouseEnter={onTrackEnter}
        onMouseLeave={onTrackLeave}
        onMouseDown={onDragStart}
        onMouseMove={onDragMove}
        onMouseUp={onDragEnd}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
        onTouchCancel={onDragEnd}
        style={{ cursor: "grab" }}
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-[#0a0712] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-[#0a0712] to-transparent z-20 pointer-events-none" />

        <div
          ref={trackRef}
          className="flex gap-8 pl-6 md:pl-8 will-change-transform"
          style={{ width: "max-content" }}
        >
          {displayProducts.map((product, idx) => (
            <TrackCard key={`${product.id}-${idx}`} product={product} getIsDrag={getIsDrag} />
          ))}
        </div>
      </div>

      {/* ── Gold Scrollbar ── */}
      <GoldScrollbar
        getProgress={getProgress}
        setProgress={setProgress}
        onInteractStart={onScrollbarInteractStart}
        onInteractEnd={onScrollbarInteractEnd}
      />
    </section>
  );
}