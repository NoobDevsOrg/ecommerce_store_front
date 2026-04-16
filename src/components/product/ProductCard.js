"use client";

import Link from "next/link";
import { addToCart } from "../../store/cartStore";

export default function ProductCard({ product }) {
  const cardImage = product.thumbnail_url || product.images?.[0]?.url || "/placeholder.png";

  return (
    <div className="group relative bg-[#1a1425]/40 backdrop-blur-sm border border-stone-800/50 rounded-sm overflow-hidden transition-all duration-700 hover:border-[#b48a3c]/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      
      {/* Product Image Wrapper */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden">
        {/* Subtle Overlay for consistent image feel */}
        <div className="absolute inset-0 bg-black/5 z-10 group-hover:bg-transparent transition-colors duration-500" />
        
        <img
          src={cardImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
        />

        {/* Floating Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#d4af37] bg-black/60 backdrop-blur-md px-3 py-1 border border-[#b48a3c]/30 rounded-full">
            {product.category}
          </span>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-6 flex flex-col items-center text-center">
        {/* Decorative divider */}
        <div className="w-8 h-[1px] bg-[#b48a3c]/30 mb-4 group-hover:w-16 transition-all duration-700" />

        <h3 className="font-serif text-lg text-stone-100 group-hover:text-[#d4af37] transition-colors duration-300 min-h-[56px] flex items-center">
          {product.name}
        </h3>

        <div className="mt-3 flex flex-col gap-1">
          <p className="text-[#b48a3c] font-medium tracking-widest text-sm tabular-nums">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-stone-500 uppercase tracking-widest">
            {product.material}
          </p>
        </div>

        {/* Luxury CTA - Slide up effect */}
        <div className="mt-6 w-full overflow-hidden">
          <button
            onClick={() => addToCart(product)}
            className="relative w-full group/btn overflow-hidden border border-[#b48a3c] bg-transparent py-3 transition-all duration-500"
          >
            {/* Background fill animation */}
            <div className="absolute inset-0 bg-[#b48a3c] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
            
            <span className="relative z-10 text-[11px] uppercase tracking-[0.25em] font-bold text-[#b48a3c] group-hover/btn:text-[#0f0a1a] transition-colors duration-300">
              Add to Collection
            </span>
          </button>
        </div>
      </div>

      {/* Bottom accent glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#b48a3c]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
    </div>
  );
}