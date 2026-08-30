"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function Toast({ message, show, onClose, product }) {
  const toastImage = product?.thumbnail_url || product?.images?.[0]?.url || "/placeholder.png";

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show && !product) return null;

  return (
    <div
      className={`fixed top-6 right-4 md:top-24 md:right-8 z-[300] w-[calc(100%-2rem)] max-w-[360px] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        show 
          ? "opacity-100 translate-x-0 scale-100" 
          : "opacity-0 translate-x-12 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-[#1a1425] border border-[#b48a3c]/30 shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-lg overflow-hidden backdrop-blur-xl">
        
        {/* Luxury Gold Progress Bar */}
        <div className="h-[2px] bg-stone-900 w-full relative">
          <div 
            className={`h-full bg-gradient-to-r from-[#b48a3c] to-[#d4af37] transition-all duration-[4000ms] linear ${show ? "w-full" : "w-0"}`}
          />
        </div>

        <div className="p-5 flex gap-5 items-center">
          {/* Product Thumbnail with Gold Border */}
          <div className="relative h-20 w-16 shrink-0 rounded-md overflow-hidden bg-[#0f0a1a] border border-stone-800">
            {toastImage ? (
              <img
                src={toastImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-stone-900 animate-pulse" />
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-[0.4em] text-[#b48a3c] font-black mb-1.5">
              Added to Treasury
            </p>
            <h4 className="text-sm font-serif text-white truncate pr-4 leading-tight">
              {product?.name || "Handcrafted Piece"}
            </h4>
            <div className="flex items-center gap-2 mt-2">
               <span className="text-[11px] text-[#d4af37] font-serif italic tracking-wider">
                 ₹{product?.price?.toLocaleString("en-IN")}
               </span>
               <span className="h-3 w-[1px] bg-stone-800"></span>
               <span className="text-[9px] text-stone-500 uppercase tracking-widest font-bold">Qty: 1</span>
            </div>
          </div>

          {/* Minimalist Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 text-stone-600 hover:text-white hover:bg-white/5 rounded-full transition-all self-start"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* View Bag CTA Footer */}
        <div className="bg-black/40 px-6 py-4 border-t border-stone-800/50 flex justify-between items-center group/footer">
          <span className="text-[9px] text-stone-500 font-bold uppercase tracking-[0.2em]">
            Continue Discovering?
          </span>
          <a 
            href="/cart" 
            className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.25em] transition-all flex items-center gap-2 group-hover/footer:gap-3"
          >
            View Bag
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </a>
        </div>
      </div>
      
      {/* Subtle Glow Effect */}
      <div className="absolute -inset-1 bg-[#b48a3c]/5 blur-2xl -z-10 rounded-full"></div>
    </div>
  );
}