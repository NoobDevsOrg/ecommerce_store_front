"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import RatingStars from "./RatingStars";

function formatReviewDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-sm bg-stone-800/60" />
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-sm border border-stone-800/60 bg-[#120f1d] p-5 space-y-3">
            <div className="h-4 w-32 rounded-sm bg-stone-800/60" />
            <div className="h-3 w-full rounded-sm bg-stone-800/40" />
            <div className="h-3 w-2/3 rounded-sm bg-stone-800/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyReviews() {
  return (
    <div className="rounded-sm border border-stone-800/60 bg-[#120f1d] px-6 py-10 text-center">
      <p className="text-stone-400 text-sm">No reviews yet</p>
      <p className="text-stone-600 text-xs mt-1">Be the first to share your experience with this piece.</p>
    </div>
  );
}

function RatingSummary({ averageRating, totalReviews }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <RatingStars value={averageRating} size="lg" />
      <div>
        <p className="text-white text-lg font-medium tabular-nums">
          {averageRating ? averageRating.toFixed(1) : "0.0"}{" "}
          <span className="text-stone-500 text-sm font-normal">
            ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
          </span>
        </p>
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="rounded-sm border border-stone-800/60 bg-[#120f1d] p-5">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <span className="text-sm font-medium text-stone-200">{review.customerName || "Verified Customer"}</span>
        <span className="text-xs text-stone-500">{formatReviewDate(review.reviewedAt)}</span>
      </div>
      <RatingStars value={review.rating} size="sm" className="mb-3" />
      <p className="text-sm text-stone-400 leading-relaxed whitespace-pre-wrap break-words">
        {review.review}
      </p>
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const [state, setState] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;

    setState({ loading: true, error: "", data: null });

    api.products.reviews
      .listByProduct(productId)
      .then((res) => {
        if (cancelled) return;
        setState({ loading: false, error: "", data: res?.data || res });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ loading: false, error: err?.message || "Failed to load reviews", data: null });
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const { loading, error, data } = state;
  const reviews = data?.reviews || [];
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt)
  );

  return (
    <section className="border-t border-stone-900/50 px-[clamp(1rem,2.5vw,2rem)] py-[clamp(2rem,5vw,5rem)]">
      <div className="mx-auto w-full max-w-[min(1700px,96vw)]">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-8 md:mb-10">
          Customer <span className="text-stone-500 font-light italic">Reviews</span>
        </h2>

        {loading ? (
          <ReviewsSkeleton />
        ) : error ? (
          <p className="text-stone-500 text-sm">Unable to load reviews right now.</p>
        ) : reviews.length === 0 ? (
          <EmptyReviews />
        ) : (
          <>
            <RatingSummary averageRating={data?.averageRating || 0} totalReviews={data?.totalReviews || 0} />
            <div className="space-y-4 max-w-3xl">
              {sortedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}