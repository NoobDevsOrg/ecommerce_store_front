"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const emptyDraft = { rating: "", review: "" };

function ReviewImage({ item }) {
  return <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-[#0f0a1a]">{item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" /> : null}</div>;
}

export default function DeliveredReviewPrompt({ status, orderReference }) {
  const [items, setItems] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [busyItemId, setBusyItemId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "DELIVERED" || !orderReference) return undefined;
    let active = true;
    api.orders.reviewItems(orderReference)
      .then((response) => { if (active) setItems(response?.data?.items || []); })
      .catch((requestError) => { if (active) setError(requestError?.message || "We could not load your review options."); });
    return () => { active = false; };
  }, [orderReference, status]);

  if (status !== "DELIVERED") return null;

  const updateDraft = (itemId, field, value) => {
    setDrafts((current) => ({ ...current, [itemId]: { ...(current[itemId] || emptyDraft), [field]: value } }));
  };

  const submit = async (event, item) => {
    event.preventDefault();
    const draft = drafts[item.orderItemId] || emptyDraft;
    const rating = Number(draft.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Choose a rating from 1 to 5 stars.");
      return;
    }
    setBusyItemId(item.orderItemId);
    setError("");
    try {
      const response = await api.orders.submitItemReview(orderReference, item.orderItemId, { rating, review: draft.review });
      const submitted = response?.data;
      setItems((current) => current?.map((entry) => entry.orderItemId === item.orderItemId ? { ...entry, review: { id: submitted.reviewId, rating: submitted.rating, review: submitted.review, createdAt: submitted.createdAt } } : entry) || current);
    } catch (requestError) {
      setError(requestError?.message || "We could not submit your review.");
    } finally {
      setBusyItemId("");
    }
  };

  return <section id="review" className="mt-6 rounded-xl border border-[#b48a3c]/40 bg-[#21192f] p-6">
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4af37]">Your experience</p>
    <h3 className="mt-2 font-serif text-2xl text-white">We hope you love your jewellery</h3>
    <p className="mt-2 text-sm text-stone-300">Rate each delivered item once. Your review is submitted for approval.</p>
    {error ? <p className="mt-4 text-sm text-rose-300" role="alert">{error}</p> : null}
    {items === null && !error ? <p className="mt-4 text-sm text-stone-400">Loading your items…</p> : null}
    <div className="mt-5 space-y-4">
      {items?.map((item) => item.review ? <article key={item.orderItemId} className="rounded-lg border border-stone-700 bg-[#161022] p-4">
        <div className="flex items-center gap-3"><ReviewImage item={item} /><div><h4 className="font-semibold text-white">{item.productName}</h4><p className="mt-1 text-sm text-[#d4af37]">Review submitted · {"★".repeat(item.review.rating)}{"☆".repeat(5 - item.review.rating)}</p></div></div>
      </article> : <form key={item.orderItemId} onSubmit={(event) => submit(event, item)} className="rounded-lg border border-stone-700 bg-[#161022] p-4">
        <div className="flex items-center gap-3"><ReviewImage item={item} /><div><h4 className="font-semibold text-white">{item.productName}</h4><p className="mt-1 text-sm text-stone-400">Quantity {item.quantity}</p></div></div>
        <label className="mt-4 block text-sm text-stone-200">Rating<select required aria-label={`Rating for ${item.productName}`} value={(drafts[item.orderItemId] || emptyDraft).rating} onChange={(event) => updateDraft(item.orderItemId, "rating", event.target.value)} className="mt-1 block w-full rounded-lg border border-stone-700 bg-[#120f1d] px-3 py-2 text-white"><option value="">Choose a rating</option><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Okay</option><option value="2">2 — Not good</option><option value="1">1 — Poor</option></select></label>
        <label className="mt-3 block text-sm text-stone-200">Share your experience <span className="text-stone-500">(optional)</span><textarea value={(drafts[item.orderItemId] || emptyDraft).review} onChange={(event) => updateDraft(item.orderItemId, "review", event.target.value)} maxLength="3000" rows="3" className="mt-1 block w-full rounded-lg border border-stone-700 bg-[#120f1d] px-3 py-2 text-white" /></label>
        <button disabled={busyItemId === item.orderItemId} className="mt-4 rounded border border-[#d4af37] px-4 py-2 text-sm font-semibold text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0f0a1a] disabled:opacity-50">{busyItemId === item.orderItemId ? "Submitting…" : "Write a Review"}</button>
      </form>)}
    </div>
  </section>;
}
