"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../../lib/api";
import RatingStars from "../../../components/product/RatingStars";

function CenteredShell({ children }) {
  return (
    <main className="bg-[#0f0a1a] min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">{children}</div>
    </main>
  );
}

function LoadingState() {
  return (
    <CenteredShell>
      <div className="animate-pulse space-y-4">
        <div className="h-40 w-full rounded-sm bg-stone-800/50" />
        <div className="h-5 w-2/3 rounded-sm bg-stone-800/50" />
        <div className="h-4 w-1/2 rounded-sm bg-stone-800/40" />
      </div>
    </CenteredShell>
  );
}

function MessageCard({ title, message, icon }) {
  return (
    <CenteredShell>
      <div className="rounded-sm border border-stone-800/60 bg-[#120f1d] p-10 text-center">
        {icon}
        <h1 className="text-xl font-serif text-white mb-2">{title}</h1>
        <p className="text-stone-400 text-sm leading-relaxed">{message}</p>
        <Link
          href="/"
          className="inline-block mt-8 px-6 py-3 border border-[#b48a3c]/30 text-[#b48a3c] font-bold uppercase tracking-[0.2em] text-xs rounded-sm hover:bg-[#b48a3c]/10 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </CenteredShell>
  );
}

export default function CustomerReviewPage() {
  const { inviteCode } = useParams();

  const [status, setStatus] = useState("loading"); // loading | expired | submitted | error | ready | success
  const [invitation, setInvitation] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!inviteCode) return;
    let cancelled = false;

    api.products.reviews
      .getInvitation(inviteCode)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data || res;
        setInvitation(data);

        if (data?.status === "submitted" || data?.status === "completed") {
          setStatus("submitted");
        } else if (data?.expiresAt && new Date(data.expiresAt) < new Date()) {
          setStatus("expired");
        } else {
          setStatus("ready");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.status === 410) {
          setStatus("expired");
        } else {
          setErrorMessage(err?.message || "We couldn't load this review invitation.");
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [inviteCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (rating < 1) {
      setFormError("Please select a star rating.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      await api.products.reviews.submit(inviteCode, { rating, review: reviewText.trim() });
      setStatus("success");
    } catch (err) {
      if (err?.status === 409) {
        setStatus("submitted");
      } else {
        setFormError(err?.message || "Failed to submit your review. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "error") {
    return (
      <MessageCard
        title="Something Went Wrong"
        message={errorMessage}
      />
    );
  }

  if (status === "expired") {
    return (
      <MessageCard
        title="This Link Has Expired"
        message="This review invitation is no longer active. Please reach out to us if you'd still like to share your feedback."
      />
    );
  }

  if (status === "submitted") {
    return (
      <MessageCard
        title="Already Submitted"
        message="Thank you. Your review has already been submitted."
      />
    );
  }

  if (status === "success") {
    return (
      <MessageCard
        title="Thank You"
        message="Thank you for your valuable feedback."
        icon={
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#b48a3c]/10 border border-[#b48a3c]/30">
            <svg className="w-6 h-6 text-[#b48a3c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        }
      />
    );
  }

  // status === "ready"
  const product = invitation?.product;

  return (
    <CenteredShell>
      <div className="rounded-sm border border-stone-800/60 bg-[#120f1d] p-8">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#b48a3c] font-bold mb-6 text-center">
          Share Your Experience
        </p>

        {product ? (
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-stone-800/60">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-[#0f0a1a] border border-stone-800/60">
              <img
                src={product.images[0].base_url || "/images/placeholder.png"}
                alt={product.name}
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.target.src = "/images/placeholder.png";
                }}
              />
            </div>
            <div>
              {invitation?.customer?.name && (
                <p className="text-stone-500 text-xs mb-1">Hi {invitation.customer.name},</p>
              )}
              <h1 className="text-lg font-serif text-white leading-snug">{product.name}</h1>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-stone-400 text-sm uppercase tracking-[0.2em] mb-3">Your Rating</p>
            <RatingStars value={rating} onChange={setRating} interactive size="lg" />
          </div>

          <div>
            <p className="text-stone-400 text-sm uppercase tracking-[0.2em] mb-3">Your Review</p>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Tell us what you thought about this piece..."
              className="w-full rounded-sm border border-stone-800 bg-[#0f0a1a] px-4 py-3 text-sm text-white placeholder-stone-600 focus:border-[#b48a3c] focus:outline-none focus:ring-1 focus:ring-[#b48a3c]/30 transition-colors resize-none"
            />
          </div>

          {formError ? (
            <p className="text-red-400 text-sm">{formError}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-[#b48a3c] text-[#0f0a1a] font-bold uppercase tracking-[0.2em] text-sm rounded-sm hover:bg-[#d4af37] active:bg-[#c49a45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </CenteredShell>
  );
}