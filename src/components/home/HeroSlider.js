"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";

const slides = [
  {
    id: 1,
    image: "/banners/hero1.jpg",
    label: "Heritage Artisans",
    title: ["Timeless Temple", "Collections"],
    subtitle: "Divine craftsmanship passed down through generations.",
  },
  {
    id: 2,
    image: "/banners/hero2.jpg",
    label: "The Bridal Vault",
    title: ["The Auspicious", "Ensemble"],
    subtitle: "Celebrate your sacred union with hand-carved gold.",
  },
  {
    id: 3,
    image: "/banners/hero3.jpg",
    label: "Eternal Brilliance",
    title: ["Diamond", "Masterpieces"],
    subtitle: "Luxury redefined through the lens of tradition.",
  },
];

const SLIDE_DURATION = 6000;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const textRefs = useRef([]);
  const progressRef = useRef(null);
  const progressTweenRef = useRef(null);
  const intervalRef = useRef(null);
  const imageRefs = useRef([]);

  // Initial entrance animation
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: "power2.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  // Text stagger animation on slide change
  useEffect(() => {
    const el = textRefs.current[current];
    if (!el) return;
    const children = el.querySelectorAll("[data-animate]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        children,
        { opacity: 0, y: 28, willChange: "transform, opacity" },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.13,
          ease: "power3.out",
          delay: 0.2,
        }
      );
    });
    return () => ctx.revert();
  }, [current]);

  // Subtle parallax on image
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const xPercent = (e.clientX / innerWidth - 0.5) * 8;
      const yPercent = (e.clientY / innerHeight - 0.5) * 5;
      const img = imageRefs.current[current];
      if (img) {
        gsap.to(img, {
          x: xPercent,
          y: yPercent,
          duration: 1.8,
          ease: "power1.out",
        });
      }
    };

    // Only on desktop
    if (window.matchMedia("(hover: hover)").matches) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [current]);

  const startProgressBar = useCallback(() => {
    if (progressTweenRef.current) progressTweenRef.current.kill();
    setProgress(0);
    const obj = { val: 0 };
    progressTweenRef.current = gsap.to(obj, {
      val: 100,
      duration: SLIDE_DURATION / 1000,
      ease: "none",
      onUpdate: () => setProgress(obj.val),
    });
  }, []);

  const goTo = useCallback(
    (idx) => {
      if (isTransitioning || idx === current) return;
      setIsTransitioning(true);
      setCurrent(idx);
      startProgressBar();
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [current, isTransitioning, startProgressBar]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    startProgressBar();
    intervalRef.current = setInterval(next, SLIDE_DURATION);
    return () => {
      clearInterval(intervalRef.current);
      if (progressTweenRef.current) progressTweenRef.current.kill();
    };
  }, [next, startProgressBar]);

  return (
    <section
      ref={containerRef}
      className="relative h-[90vh] md:h-screen w-full overflow-hidden bg-[#0f0a1a] opacity-0"
      aria-label="Hero carousel"
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          aria-hidden={index !== current}
        >
          {/* Image with parallax target */}
          <div
            ref={(el) => (imageRefs.current[index] = el)}
            className="absolute inset-[-4%] will-change-transform"
          >
            <Image
              src={slide.image}
              alt={slide.title.join(" ")}
              fill
              priority={index === 0}
              className={`object-cover transition-transform duration-[2000ms] ease-out ${index === current ? "scale-110" : "scale-100"
                }`}
              sizes="100vw"
            />
          </div>

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0a1a]/85 via-[#0f0a1a]/30 to-[#0f0a1a]/60 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a1a]/70 via-transparent to-transparent z-10" />

          {/* Grain texture overlay */}
          <div
            className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Text Content */}
          <div className="absolute inset-0 z-20 flex flex-col items-start justify-center px-8 md:px-20 lg:px-32 max-w-5xl">
            <div
              ref={(el) => (textRefs.current[index] = el)}
              className="flex flex-col gap-0"
            >
              {/* Label */}
              <div
                data-animate
                className="flex items-center gap-3 mb-7 opacity-0"
              >
                <div className="w-8 h-[1px] bg-[#b48a3c]" />
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.7em] text-[#d4af37] font-bold">
                  {slide.label}
                </span>
              </div>

              {/* Title lines */}
              {slide.title.map((line, i) => (
                <h1
                  key={i}
                  data-animate
                  className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[1.0] tracking-[-0.02em] opacity-0"
                >
                  {i === 1 ? (
                    <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#b48a3c]">
                      {line}
                    </em>
                  ) : (
                    line
                  )}
                </h1>
              ))}

              {/* Subtitle */}
              <p
                data-animate
                className="text-stone-300/80 text-sm md:text-base max-w-sm font-light leading-relaxed mt-6 italic opacity-0"
              >
                "{slide.subtitle}"
              </p>

              {/* CTAs */}
              <div
                data-animate
                className="flex flex-col sm:flex-row gap-4 mt-10 opacity-0"
              >
                <Link
                  href="/products"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#b48a3c] text-[#0f0a1a] text-[10px] uppercase tracking-[0.35em] font-black hover:bg-[#d4af37] transition-all duration-400 rounded-sm overflow-hidden"
                >
                  <span className="relative z-10">Explore Collection</span>
                  <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
                <Link
                  href="/heritage"
                  className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white/80 text-[10px] uppercase tracking-[0.35em] font-bold hover:border-[#b48a3c]/50 hover:text-white backdrop-blur-sm transition-all duration-400 rounded-sm"
                >
                  Our Story
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ── Premium Slide Navigation ── */}
      <div className="absolute bottom-10 left-8 md:left-20 lg:left-32 z-30 flex items-center gap-8">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className="group relative flex flex-col gap-2 pt-6"
            aria-label={`Go to slide ${idx + 1}`}
          >
            {/* Slide number */}
            <span
              className={`text-[9px] font-bold tracking-tighter transition-colors duration-500 ${idx === current ? "text-[#d4af37]" : "text-white/20 group-hover:text-white/40"
                }`}
            >
              0{idx + 1}
            </span>
            {/* Track */}
            <div className="relative w-14 h-[1.5px] bg-white/15 overflow-hidden">
              {idx === current && (
                <div
                  className="absolute inset-y-0 left-0 bg-[#b48a3c] origin-left"
                  style={{ width: `${progress}%` }}
                />
              )}
              {idx !== current && (
                <div className="absolute inset-0 bg-transparent group-hover:bg-white/25 transition-colors duration-300" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* ── Scroll Indicator ── */}
      <div className="absolute bottom-8 right-10 z-30 hidden lg:flex flex-col items-center gap-3">
        <span
          className="text-[8px] uppercase tracking-[0.5em] text-white/30 font-bold"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
        <div className="relative w-[1px] h-16 bg-white/10 overflow-hidden">
          <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-[#b48a3c] to-transparent animate-[slideDown_1.6s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* ── Touch/Swipe Hint (mobile) ── */}
      <div className="absolute bottom-12 right-6 z-30 flex lg:hidden items-center gap-1.5">
        <span className="text-[8px] uppercase tracking-[0.4em] text-white/25">Swipe</span>
        <span className="text-white/25 text-sm">→</span>
      </div>

      {/* Global scroll-down animation */}
      <style jsx>{`
        @keyframes slideDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </section>
  );
}