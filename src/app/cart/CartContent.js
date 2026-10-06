"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import {
  MAX_CART_ITEM_QUANTITY,
  clearCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "../../store/cartStore";
import EnquiryModal from "../../components/product/ProductEnquiry";
import { productHref } from "../../lib/productUrl";

const emptyValidation = { items: [], invalidItems: [], subtotal: 0 };
const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export default function CartContent() {
  const [validation, setValidation] = useState(emptyValidation);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingProductId, setUpdatingProductId] = useState("");
  const [enquiryProducts, setEnquiryProducts] = useState([]);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const requestVersion = useRef(0);

  const loadCart = useCallback(async () => {
    const version = ++requestVersion.current;
    const cart = getCart();
    if (cart.length === 0) {
      setValidation(emptyValidation);
      setErrorMessage("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.cart.validate(cart);
      if (version !== requestVersion.current) return;
      setValidation(response?.data || emptyValidation);
      setErrorMessage("");
    } catch {
      if (version !== requestVersion.current) return;
      setValidation(emptyValidation);
      setErrorMessage("We could not refresh your bag. Please try again.");
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
    const syncCart = (event) => {
      if (!event || event.type !== "storage" || event.key === "cart") loadCart();
    };
    window.addEventListener("cartUpdated", syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      window.removeEventListener("cartUpdated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, [loadCart]);

  const updateQuantity = async (productId, quantity) => {
    if (updatingProductId) return;
    const result = updateCartQuantity(productId, quantity);
    if (!result.changed) return;
    setUpdatingProductId(productId);
    try {
      await loadCart();
    } finally {
      setUpdatingProductId("");
    }
  };

  const removeItem = (productId) => {
    removeFromCart(productId);
    setValidation((current) => ({
      ...current,
      items: current.items.filter((item) => item.productId !== productId),
      invalidItems: current.invalidItems.filter((item) => item.productId !== productId),
    }));
  };

  const validItems = validation.items || [];
  const invalidItems = validation.invalidItems || [];
  const storedCartIsEmpty = getCart().length === 0;

  const openEnquiry = () => {
    setEnquiryProducts(validItems.map((item) => ({ id: item.product.id, name: item.product.name, quantity: item.quantity })));
    setIsEnquiryOpen(true);
  };

  return (
    <div className="bg-[#0f0a1a] min-h-screen text-stone-200 py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="text-[10px] uppercase tracking-[0.5em] text-[#b48a3c] font-bold mb-4">Your Selection</span>
          <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight">Shopping <span className="italic text-[#d4af37]">Bag</span></h1>
          <div className="w-24 h-[1px] bg-stone-800 mt-6" />
        </div>

        {isLoading ? <p className="py-20 text-center text-stone-400" role="status">Refreshing your bag…</p> : null}
        {!isLoading && errorMessage ? (
          <div className="py-20 text-center border border-dashed border-stone-800 rounded-2xl"><p className="text-stone-300 mb-6">{errorMessage}</p><button type="button" onClick={loadCart} className="px-6 py-3 border border-[#b48a3c] text-[#d4af37] text-xs uppercase tracking-widest">Try again</button></div>
        ) : null}
        {!isLoading && !errorMessage && storedCartIsEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-stone-800 rounded-2xl"><p className="text-stone-500 font-serif italic text-xl mb-8">Your treasury is currently empty.</p><Link href="/products" className="px-10 py-4 bg-[#b48a3c] text-[#0f0a1a] text-[11px] uppercase tracking-[0.3em] font-black hover:bg-white transition-all duration-500 rounded-sm">Return to Boutique</Link></div>
        ) : null}
        {!isLoading && !errorMessage && !storedCartIsEmpty ? (
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 space-y-6">
              {invalidItems.map((item) => <div key={item.productId} className="flex items-center justify-between gap-4 border border-amber-900/60 bg-amber-950/20 p-5 rounded-xl" role="status"><p className="text-sm text-amber-200">{item.message}</p><button type="button" onClick={() => removeItem(item.productId)} className="shrink-0 text-[10px] uppercase tracking-widest text-amber-300 hover:text-white">Remove</button></div>)}
              {validItems.map((item) => {
                const disabled = updatingProductId === item.productId;
                return <div key={item.productId} className="group relative flex flex-col md:flex-row md:items-center gap-8 bg-[#1a1425]/40 backdrop-blur-sm border border-stone-800/50 p-6 rounded-xl">
                  <Link href={productHref(item.product)} aria-label={`View ${item.product.name}`} className="relative block w-32 h-40 md:w-40 md:h-48 overflow-hidden rounded-lg bg-[#0f0a1a] border border-stone-800">{item.product.primaryImageUrl ? <img src={item.product.primaryImageUrl} alt={item.product.name} className="w-full h-full object-cover" /> : null}</Link>
                  <div className="flex-1 space-y-4"><div>{item.product.categoryName ? <p className="text-[10px] uppercase tracking-widest text-[#b48a3c] mb-1">{item.product.categoryName}</p> : null}<h2 className="text-xl font-serif text-white tracking-wide"><Link href={productHref(item.product)} className="hover:text-[#d4af37]">{item.product.name}</Link></h2><p className="text-[#d4af37] font-serif text-xl tabular-nums mt-2">{formatCurrency(item.unitPrice)}</p><p className="text-xs text-stone-500 mt-1">{item.stockStatus === "OUT_OF_STOCK" ? "Availability will be confirmed at checkout." : "Stock is not reserved until checkout."}</p></div>
                    <div className="flex items-center justify-between gap-4 pt-2 md:justify-start md:gap-8"><div className="flex items-center rounded-full border border-stone-800 bg-black/20 px-1" aria-label={`Quantity for ${item.product.name}`}><button type="button" disabled={disabled || item.quantity <= 1} onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="h-11 w-11 disabled:opacity-40" aria-label="Decrease quantity">−</button><span className="min-w-11 px-2 text-center text-sm font-bold tabular-nums text-white">{item.quantity}</span><button type="button" disabled={disabled || item.quantity >= MAX_CART_ITEM_QUANTITY} onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="h-11 w-11 disabled:opacity-40" aria-label="Increase quantity">+</button></div><span className="text-sm text-stone-300 tabular-nums">{formatCurrency(item.lineSubtotal)}</span><button type="button" disabled={disabled} onClick={() => removeItem(item.productId)} className="min-h-11 text-xs uppercase tracking-widest text-stone-500 hover:text-red-400 disabled:opacity-40">Remove Piece</button></div>
                  </div>
                </div>;
              })}
            </div>
            <aside className="lg:col-span-4 lg:sticky lg:top-32"><div className="bg-[#1a1425] border border-stone-800 p-8 rounded-2xl shadow-2xl"><h2 className="text-[12px] uppercase tracking-[0.3em] font-bold text-white mb-8">Summary</h2><div className="flex justify-between border-b border-stone-800 pb-8 mb-8 text-sm text-stone-400"><span>Subtotal</span><span className="text-white tabular-nums">{formatCurrency(validation.subtotal)}</span></div><p className="text-xs text-stone-500 leading-relaxed mb-8">Taxes, delivery and final payment are confirmed during checkout.</p>{validItems.length > 0 ? <><Link href="/checkout" className="block w-full bg-[#d4af37] py-5 px-6 text-center text-[#0f0a1a] text-[12px] uppercase tracking-[0.2em] font-black">Proceed to Checkout</Link><button type="button" onClick={openEnquiry} className="mt-3 w-full border border-[#b48a3c] py-4 px-6 text-[#d4af37] text-[11px] uppercase tracking-[0.2em] font-black">Request an Enquiry</button></> : null}<button type="button" onClick={clearCart} className="w-full mt-4 py-3 text-[10px] uppercase tracking-widest text-stone-500 hover:text-white">Clear bag</button></div></aside>
          </div>
        ) : null}
      </div>
      <EnquiryModal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} products={enquiryProducts} onRemove={(id) => { removeItem(id); const next = enquiryProducts.filter((product) => product.id !== id); setEnquiryProducts(next); if (next.length === 0) setIsEnquiryOpen(false); }} onSuccess={() => { clearCart(); setIsEnquiryOpen(false); }} />
    </div>
  );
}
