"use client";

import { useCallback, useEffect, useState } from "react";
import RatingStars from "./RatingStars"; 
import { api } from "../../lib/api";

export default function ReviewsModal({
    product,
    onClose,
}) {
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);

            const response = await api.get(`/products/${product.id}/reviews`);
            const payload = response?.data?.data ?? response?.data ?? response;

            setReviews(payload?.reviews ?? []);
            setAverageRating(payload?.averageRating ?? 0);
            setReviewCount(payload?.totalReviews ?? 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [product.id]);

    useEffect(() => {
        void fetchReviews();

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [fetchReviews]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-stone-800 bg-[#0f0a1a]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}

                <div className="border-b border-stone-800 px-6 py-5 flex justify-between items-center">

                    <div>

                        <h2 className="text-xl font-semibold text-white">
                            Customer Reviews
                        </h2>

                        <p className="mt-1 text-sm text-stone-400">
                            {product.name}
                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-white text-2xl cursor-pointer"
                    >
                        ×
                    </button>

                </div>

                {/* SUMMARY */}

                <div className="border-b border-stone-800 px-6 py-5 flex items-center justify-between">

                    <div>

                        <div className="flex items-center gap-3">

                            <span className="text-4xl font-bold text-[#d4af37]">
                                {averageRating.toFixed(1)}
                            </span>

                            <RatingStars
                                value={averageRating}
                                size="md"
                            />

                        </div>

                        <p className="mt-2 text-sm text-stone-400">
                            {reviewCount} Reviews
                        </p>

                    </div>

                </div>

                {/* REVIEWS */}

                <div className="overflow-y-auto max-h-[55vh] px-6 py-5">

                    {loading ? (

                        <div className="space-y-6">

                            {[1,2,3].map((i)=>(
                                <div
                                    key={i}
                                    className="animate-pulse border-b border-stone-800 pb-5"
                                >
                                    <div className="h-4 w-40 rounded bg-stone-800 mb-3"/>
                                    <div className="h-3 w-28 rounded bg-stone-800 mb-3"/>
                                    <div className="h-3 w-full rounded bg-stone-800"/>
                                </div>
                            ))}

                        </div>

                    ) : reviews.length === 0 ? (

                        <div className="py-20 text-center">

                            <p className="text-stone-400">
                                No reviews available.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-6">

                            {reviews.map((review)=>(

                                <div
                                    key={review.id}
                                    className="border-b border-stone-800 pb-6 last:border-none"
                                >

                                    <div className="flex justify-between items-start">

                                        <div>

                                            <h4 className="font-medium text-white">
                                                {review.customerName}
                                            </h4>

                                            <div className="mt-1">

                                                <RatingStars
                                                    value={review.rating}
                                                    size="sm"
                                                />

                                            </div>

                                        </div>

                                        <span className="text-xs text-stone-500">

                                            {new Date(
                                                review.reviewedAt
                                            ).toLocaleDateString("en-IN",{
                                                day:"numeric",
                                                month:"short",
                                                year:"numeric"
                                            })}

                                        </span>

                                    </div>

                                    <p className="mt-3 text-sm leading-7 text-stone-300">
                                        {review.review}
                                    </p>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>
        </div>
    );
}
