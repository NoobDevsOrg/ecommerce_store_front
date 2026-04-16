import HeroSlider from "../components/home/HeroSlider";
import TopSelling from "../components/home/TopSelling";
import NewArrivals from "../components/home/NewArrivals";
import BrandStatement from "../components/home/Brandstatement";
import Testimonials from "../components/home/Testimonials";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-[#0f0a1a]">
      {/* 1. Impactful Entrance */}
      <HeroSlider />
      {/* 3. The Curated Vault */}
      <TopSelling />

      {/* 4. Fresh Unveilings */}
      <NewArrivals />

      {/* 5. Testimonials */}
      {/*<Testimonials />*/}

      {/* 6. Final Call to Action */}
      <FinalCta />
    </main>
  );
}

function FinalCta() {
  return (
    <section className="relative py-28 border-t border-stone-900/50 overflow-hidden">
      {/* Subtle gold orb */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(180,138,60,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="w-8 h-[1px] bg-[#b48a3c]/40 mb-8" />
        <p className="text-[9px] uppercase tracking-[0.6em] text-[#b48a3c] font-bold mb-6">
          Experience Sagunthala Excellence
        </p>
        <Link
          href="/products"
          className="group font-serif text-2xl md:text-3xl text-white hover:text-[#d4af37] transition-colors duration-500 flex items-center gap-3"
        >
          Browse the Complete Treasury
          <span className="text-[#b48a3c] group-hover:translate-x-2 transition-transform duration-400 inline-block">
            →
          </span>
        </Link>
        <div className="mt-10 flex items-center gap-6 text-stone-700">
          <span className="text-[8px] uppercase tracking-[0.4em]">Est. Heritage</span>
          <div className="w-1 h-1 rounded-full bg-stone-800" />
          <span className="text-[8px] uppercase tracking-[0.4em]">Handcrafted Gold</span>
          <div className="w-1 h-1 rounded-full bg-stone-800" />
          <span className="text-[8px] uppercase tracking-[0.4em]">Temple Artisans</span>
        </div>
      </div>
    </section>
  );
}