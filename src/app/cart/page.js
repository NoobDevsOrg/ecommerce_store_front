"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    getCart,
    removeFromCart,
    updateCartQuantity
} from "../../store/cartStore";
import { getPublicProductById } from "../../lib/publicApi";

export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);

    const loadCart = async () => {
        const cart = getCart();

        try {
            const detailed = await Promise.all(
                cart.map(async (item) => {
                    const product = await getPublicProductById(item.id);
                    return product ? { ...product, quantity: item.quantity } : null;
                })
            );
            setCartItems(detailed.filter(Boolean));
        } catch (err) {
            console.error("Failed to load cart items:", err);
            setCartItems([]);
        }
    };

    useEffect(() => {
        loadCart();
        window.addEventListener("cartUpdated", loadCart);
        return () => window.removeEventListener("cartUpdated", loadCart);
    }, []);

    const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className="bg-[#0f0a1a] min-h-screen text-stone-200 py-16 md:py-24">
            <div className="max-w-[1280px] mx-auto px-6 md:px-10">
                
                {/* Header Section */}
                <div className="flex flex-col items-center mb-16 text-center">
                    <span className="text-[10px] uppercase tracking-[0.5em] text-[#b48a3c] font-bold mb-4">
                        Your Selection
                    </span>
                    <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight">
                        Shopping <span className="italic text-[#d4af37]">Bag</span>
                    </h1>
                    <div className="w-24 h-[1px] bg-stone-800 mt-6" />
                </div>

                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-stone-800 rounded-2xl">
                        <p className="text-stone-500 font-serif italic text-xl mb-8">Your treasury is currently empty.</p>
                        <Link 
                            href="/products"
                            className="px-10 py-4 bg-[#b48a3c] text-[#0f0a1a] text-[11px] uppercase tracking-[0.3em] font-black hover:bg-white transition-all duration-500 rounded-sm"
                        >
                            Return to Boutique
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                        
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 space-y-6">
                            {cartItems.map(item => (
                                <div
                                    key={item.id}
                                    className="group relative flex flex-col md:flex-row md:items-center gap-8 bg-[#1a1425]/40 backdrop-blur-sm border border-stone-800/50 p-6 rounded-xl transition-all duration-500 hover:border-[#b48a3c]/30"
                                >
                                    <div className="relative w-32 h-40 md:w-40 md:h-48 overflow-hidden rounded-lg bg-[#0f0a1a] border border-stone-800">
                                        <img
                                            src={item.images[0]}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-[#b48a3c] mb-1">{item.category}</p>
                                            <h3 className="text-xl font-serif text-white tracking-wide">{item.name}</h3>
                                            <p className="text-stone-500 text-xs mt-1 italic">{item.material}</p>
                                        </div>

                                        <p className="text-[#d4af37] font-serif text-xl tabular-nums">
                                            ₹{item.price.toLocaleString("en-IN")}
                                        </p>

                                        <div className="flex items-center justify-between md:justify-start gap-8 pt-2">
                                            <div className="flex items-center border border-stone-800 bg-black/20 rounded-full px-2 py-1">
                                                <button
                                                    onClick={() =>
                                                        item.quantity > 1 &&
                                                        updateCartQuantity(item.id, item.quantity - 1)
                                                    }
                                                    className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor"><rect width="10" height="2" rx="1" /></svg>
                                                </button>

                                                <span className="px-4 text-xs font-bold text-white tabular-nums min-w-[40px] text-center">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        item.quantity < 10 &&
                                                        updateCartQuantity(item.id, item.quantity + 1)
                                                    }
                                                    className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
                                                    aria-label="Increase quantity"
                                                >
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M4 9V6H1V4H4V1H6V4H9V6H6V9H4Z" /></svg>
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-[10px] uppercase tracking-widest text-stone-500 hover:text-red-400 border-b border-transparent hover:border-red-400 transition-all pb-0.5"
                                            >
                                                Remove Piece
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary Sidebar */}
                        <aside className="lg:col-span-4 lg:sticky lg:top-32">
                            <div className="bg-[#1a1425] border border-stone-800 p-8 rounded-2xl shadow-2xl">
                                <h2 className="text-[12px] uppercase tracking-[0.3em] font-bold text-white mb-8">Summary</h2>
                                
                                <div className="space-y-4 border-b border-stone-800 pb-8 mb-8 text-sm text-stone-400">
                                    <div className="flex justify-between tracking-wide">
                                        <span>Subtotal</span>
                                        <span className="text-white">₹{total.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="flex justify-between tracking-wide">
                                        <span>Luxury Shipping</span>
                                        <span className="text-green-500 uppercase text-[10px] font-bold">Complimentary</span>
                                    </div>
                                    <div className="flex justify-between tracking-wide">
                                        <span>Insurance</span>
                                        <span className="text-white italic">Included</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mb-10">
                                    <span className="text-[11px] uppercase tracking-widest text-stone-500 font-bold mb-1">Total Amount</span>
                                    <span className="text-3xl font-serif text-[#d4af37] tabular-nums">
                                        ₹{total.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                <button className="w-full relative group overflow-hidden bg-[#b48a3c] py-5 px-10 rounded-sm transition-all duration-500 active:scale-[0.98]">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#b48a3c] via-[#d4af37] to-[#b48a3c] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <span className="relative z-10 text-[#0f0a1a] text-[12px] uppercase tracking-[0.3em] font-black">
                                        Secure Checkout
                                    </span>
                                </button>

                                <div className="mt-8 flex flex-col items-center gap-4">
                                    <p className="text-[9px] uppercase tracking-[0.2em] text-stone-600 flex items-center gap-2">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                        100% Secure Insured Payments
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}