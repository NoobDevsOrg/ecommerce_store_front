"use client";

import { useState } from "react";
import { addToCart } from "../../store/cartStore";
import Toast from "../ui/Toast";

export default function ProductActions({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setShowToast(true);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this stunning piece from Sagunthala Jewellers: ${product.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Custom alert or mini toast could go here
      }
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  return (
    <div className="mt-12 space-y-8">
      {/* Interaction Row */}
      <div className="flex flex-col sm:flex-row items-stretch gap-5">
        
        {/* Luxury Quantity Selector */}
        <div className="flex items-center justify-between border border-stone-800 rounded-lg px-2 py-1 bg-[#1a1425] min-w-[150px]">
          <button
            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            className="w-12 h-12 flex items-center justify-center rounded-md hover:bg-stone-800 text-stone-400 transition-colors disabled:opacity-10"
            disabled={quantity <= 1}
          >
            <svg width="14" height="2" viewBox="0 0 12 2" fill="currentColor"><rect width="12" height="2" rx="1" /></svg>
          </button>

          <span className="text-sm font-bold text-white tabular-nums">{quantity}</span>

          <button
            onClick={() => quantity < 10 && setQuantity(quantity + 1)}
            className="w-12 h-12 flex items-center justify-center rounded-md hover:bg-stone-800 text-stone-400 transition-colors disabled:opacity-10"
            disabled={quantity >= 10}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor"><path d="M5 11V7H1V5H5V1H7V5H11V7H7V11H5Z" /></svg>
          </button>
        </div>

        {/* Primary CTA */}
        <button
          onClick={handleAddToCart}
          className="flex-1 relative group overflow-hidden bg-[#b48a3c] py-5 px-10 rounded-lg transition-all duration-500 active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#b48a3c] via-[#d4af37] to-[#b48a3c] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex items-center justify-center gap-4 text-[#0f0a1a] text-[12px] uppercase tracking-[0.3em] font-black">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
            Add To Collection
          </div>
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <button className="w-full py-5 bg-transparent border border-stone-800 text-stone-300 text-[10px] uppercase tracking-[0.25em] font-bold rounded-lg hover:border-[#b48a3c] hover:text-[#b48a3c] transition-all duration-500">
          Instant Checkout
        </button>

        <button
          onClick={handleShare}
          className="w-full py-5 bg-transparent border border-stone-800 text-stone-300 text-[10px] uppercase tracking-[0.25em] font-bold rounded-lg hover:border-white hover:text-white transition-all duration-500 flex items-center justify-center gap-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share Masterpiece
        </button>
      </div>

      <Toast product={product} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}