"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "../../store/cartStore";
import Toast from "../ui/Toast";

export default function ProductActions({ product }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const availableQuantity = Math.max(0, Number(product?.stock_qty || 0));
  const maxQuantity = Math.min(10, availableQuantity || 10);
  const canPurchase = Boolean(product?.isPurchasable) && availableQuantity > 0;

  const handleAddToCart = () => {
    if (!canPurchase) return;
    addToCart(product, quantity);
    setShowToast(true);
  };

  const handleBuyNow = () => {
    if (!canPurchase) return;
    addToCart(product, quantity);
    router.push("/checkout");
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
    <div className="mt-10 space-y-6 rounded-2xl border border-stone-800/90 bg-[#120e1b]/90 p-4 shadow-[0_18px_42px_rgba(0,0,0,0.22)] sm:p-5">
      {/* Interaction Row */}
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:gap-5">
        
        <div className="min-w-[150px]">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-400">Quantity</p>
          <div className="flex min-h-14 items-center justify-between rounded-xl border border-stone-700/80 bg-[#1a1425] px-2 py-1 shadow-inner shadow-black/20">
            <button
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              aria-label="Decrease quantity"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-300 transition-colors hover:bg-stone-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              disabled={quantity <= 1}
            >
              <svg width="14" height="2" viewBox="0 0 12 2" fill="currentColor"><rect width="12" height="2" rx="1" /></svg>
            </button>

            <span className="min-w-10 text-center text-base font-bold text-white tabular-nums">{quantity}</span>

            <button
              onClick={() => quantity < maxQuantity && setQuantity(quantity + 1)}
              aria-label="Increase quantity"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-300 transition-colors hover:bg-stone-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              disabled={quantity >= maxQuantity}
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor"><path d="M5 11V7H1V5H5V1H7V5H11V7H7V11H5Z" /></svg>
            </button>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={handleAddToCart}
          disabled={!canPurchase}
          className="relative flex-1 overflow-hidden rounded-xl bg-[#b48a3c] px-6 py-5 shadow-[0_10px_24px_rgba(180,138,60,0.18)] transition-all duration-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#b48a3c] via-[#d4af37] to-[#b48a3c] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex items-center justify-center gap-4 text-[#0f0a1a] text-[12px] uppercase tracking-[0.3em] font-black">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
            {canPurchase ? "Add to Cart" : "Currently unavailable"}
          </div>
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-1 gap-3 border-t border-stone-800/80 pt-4 sm:grid-cols-2 sm:gap-4">
        <button type="button" onClick={handleBuyNow} disabled={!canPurchase} className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-700 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-stone-300 transition-all duration-500 hover:border-[#b48a3c] hover:text-[#b48a3c] disabled:cursor-not-allowed disabled:opacity-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m13 2-9 12h7l-1 8 10-13h-7z" /></svg>
          Buy Now
        </button>

        <button
          onClick={handleShare}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-700 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-stone-300 transition-all duration-500 hover:border-white hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </button>
      </div>

      <Toast product={product} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}
