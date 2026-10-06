"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { getPublicProductById } from "../../lib/publicApi";
import { addToCart } from "../../store/cartStore";

// Historical Order Item values remain display-only. This component obtains the
// currently public product and has Cart validate it before storing only its id
// and quantity in the browser cart.
export default function OrderPurchaseActions({ item, compact = false }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const addCurrentProduct = async (buyNow) => {
    if (busy || !item?.productId) return;
    setBusy(true);
    setMessage("");
    try {
      const current = await getPublicProductById(item.productId);
      if (!current?.isPurchasable) throw new Error("Currently unavailable");
      const validation = await api.cart.validate([{ productId: current.id, quantity: item.quantity }]);
      if (!validation?.data?.items?.some((entry) => entry.productId === current.id)) throw new Error("Currently unavailable");
      const result = addToCart(current, item.quantity);
      if (!result.changed) throw new Error("Currently unavailable");
      if (buyNow) router.push("/checkout");
      else setMessage("Added to your bag at the current price.");
    } catch (error) {
      setMessage(error?.message === "Currently unavailable" ? "Currently unavailable" : "Currently unavailable");
    } finally {
      setBusy(false);
    }
  };

  return <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "mt-3"}`}><button type="button" disabled={busy} onClick={() => addCurrentProduct(false)} className="rounded border border-[#b48a3c]/70 px-3 py-2 text-xs font-semibold text-[#d4af37] hover:bg-[#b48a3c] hover:text-[#0f0a1a] disabled:opacity-50">{busy ? "Checking…" : "Add to Cart"}</button><button type="button" disabled={busy} onClick={() => addCurrentProduct(true)} className="rounded bg-[#d4af37] px-3 py-2 text-xs font-bold text-[#0f0a1a] disabled:opacity-50">Buy Again</button>{message ? <span className="basis-full text-xs text-stone-400" role="status">{message}</span> : null}</div>;
}
