"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addToCart } from "../../store/cartStore";
// NOTE: adjust this import if your axios instance lives at a different path —
// it mirrors the "../../store/cartStore" import above (root/lib/api).
import { api } from "../../lib/api";

const STAR_PATH =
  "M10 1.5l2.6 5.6 6.1.6-4.6 4.2 1.3 6-5.4-3-5.4 3 1.3-6-4.6-4.2 6.1-.6z";

function Star({ filled }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="w-full h-full"
      fill={filled ? "#d4af37" : "none"}
      stroke="#d4af37"
      strokeWidth="1"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

// Renders 5 stars with partial-fill support (e.g. 3.4 -> 3 full, 1 at 40%, 1 empty)
function StarRating({ rating = 0, size = 13 }) {
  const clamped = Math.min(5, Math.max(0, rating || 0));

  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {[0, 1, 2, 3, 4].map((i) => {
        const fillAmount = Math.min(1, Math.max(0, clamped - i));
        return (
          <span
            key={i}
            className="relative shrink-0"
            style={{ width: size, height: size }}
          >
            <Star filled={false} />
            <span
              className="absolute inset-0 top-0 left-0 overflow-hidden"
              style={{ width: `${fillAmount * 100}%` }}
            >
              <Star filled />
            </span>
          </span>
        );
      })}
    </div>
  );
}

function ReviewsModal({ product, onClose }) {
  const [reviewsData, setReviewsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadReviews = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.get(`/products/${product.id}/reviews`);
        if (!isActive) return;
        setReviewsData(response?.data?.data || null);
      } catch (err) {
        if (!isActive) return;
        setError(err?.message || "Failed to load reviews");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadReviews();

    // Lock background scroll and allow Escape to close while modal is open.
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      isActive = false;
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const averageRating = reviewsData?.averageRating ?? product.average_rating ?? 0;
  const totalReviews = reviewsData?.totalReviews ?? product.review_count ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Reviews for ${product.name}`}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] overflow-y-auto bg-[#150f22] border border-stone-800 rounded-t-2xl sm:rounded-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-stone-800/70 bg-[#150f22] px-5 py-4">
          <div className="min-w-0">
            <h3 className="font-serif text-base sm:text-lg text-stone-100 truncate">
              {product.name}
            </h3>
           <div className="mt-4">

    <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-white">
            {Number(averageRating).toFixed(1)}
        </span>

        <div>
            <StarRating
                rating={averageRating}
                size={16}
            />

            <p className="text-xs text-stone-500 mt-1">
                {totalReviews} Reviews
            </p>
        </div>
    </div>

    <div className="mt-5 space-y-2">

        {[5,4,3,2,1].map((star)=>{

            const count =
                reviewsData?.breakdown?.[star] || 0;

            const percentage =
                totalReviews
                    ? (count / totalReviews) * 100
                    : 0;

            return(

                <div
                    key={star}
                    className="flex items-center gap-3"
                >

                    <span className="text-xs text-stone-400 w-10">
                        {star} ★
                    </span>

                    <div className="flex-1 h-2 rounded-full bg-stone-800 overflow-hidden">

                        <div
                            className="h-full bg-[#d4af37] rounded-full transition-all duration-500"
                            style={{
                                width:`${percentage}%`
                            }}
                        />

                    </div>

                    <span className="text-xs text-stone-500 w-6 text-right">
                        {count}
                    </span>

                </div>

            );

        })}

    </div>

</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reviews"
            className="shrink-0 rounded-full p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5">
          {isLoading ? (
            <div className="space-y-4 py-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-3 w-20 rounded bg-stone-800" />
                  <div className="h-3 w-32 rounded bg-stone-800" />
                  <div className="h-3 w-full rounded bg-stone-800" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-red-400">{error}</p>
          ) : !reviewsData?.reviews?.length ? (
            <p className="py-8 text-center text-sm text-stone-400">
              No reviews yet.
            </p>
          ) : (
            
            reviewsData.reviews.map((review) => (
              
              <div
                key={review.id}
                className="border-b border-stone-800/50 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <StarRating rating={review.rating} size={12} />
                  <span className="text-[11px] text-stone-500 tabular-nums whitespace-nowrap">
                    {review.reviewedAt
                      ? new Date(review.reviewedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-stone-200">
                  {review.customerName || "Anonymous"}
                </p>
                {review.review ? (
                  <p className="mt-1 text-sm text-stone-400 leading-relaxed">
                    {review.review}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({ product }) {
  const cardImage = product.thumbnail_url || product.images?.[0]?.url || "/placeholder.png";
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  const averageRating = Number(product.average_rating || 0);
  const reviewCount = Number(product.review_count || 0);

  return (
    <>
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

          {/* Rating — click opens the reviews modal */}
          {reviewCount > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsReviewsOpen(true);
              }}
              aria-label={`See ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"} for ${product.name}`}
              className="mt-2 flex items-center gap-1.5 rounded-full px-1 py-0.5 -mx-1 text-stone-400 hover:text-[#d4af37] active:opacity-70 transition-colors"
            >
              <StarRating rating={averageRating} size={13} />
              <span className="text-[11px] tabular-nums">
                {averageRating.toFixed(1)}{" "}
                <span className="text-stone-500 underline-offset-2 hover:underline">
                  ({reviewCount})
                </span>
              </span>
            </button>
          ) : (
            <p className="mt-2 text-[10px] text-stone-600 uppercase tracking-widest">
              No reviews yet
            </p>
          )}

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

      {isReviewsOpen && (
        <ReviewsModal product={product} onClose={() => setIsReviewsOpen(false)} />
      )}
    </>
  );
}