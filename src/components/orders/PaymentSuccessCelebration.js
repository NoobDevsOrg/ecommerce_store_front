"use client";

import { useEffect, useState } from "react";

const celebrationKey = (reference) => `sagunthala_payment_celebrated_${reference}`;

export default function PaymentSuccessCelebration({ orderReference }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (!orderReference || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const key = celebrationKey(orderReference);
    if (window.sessionStorage.getItem(key)) return undefined;
    window.sessionStorage.setItem(key, "1");
    let stopTimer;
    const startTimer = window.setTimeout(() => { setAnimate(true); stopTimer = window.setTimeout(() => setAnimate(false), 900); }, 0);
    return () => { window.clearTimeout(startTimer); window.clearTimeout(stopTimer); };
  }, [orderReference]);
  return <section className="relative mb-6 overflow-hidden rounded-2xl border border-[#d4af37] bg-[#2d220f] p-6" role="status" aria-live="polite"><div className="relative z-10"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4af37] text-xl font-bold text-[#0f0a1a]" aria-hidden="true">✓</span><div><h1 className="font-serif text-3xl text-white">Payment successful</h1><p className="mt-1 text-stone-200">Your order is confirmed</p></div></div><p className="mt-5 text-sm text-stone-300">Order reference: <span className="font-semibold text-white">{orderReference}</span></p></div>{animate ? <div className="payment-confetti" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map((piece) => <span key={piece} style={{ left: `${12 + piece * 15}%`, animationDelay: `${piece * 65}ms` }} />)}</div> : null}</section>;
}
