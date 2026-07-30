"use client";

import { useState } from "react";

/**
 * RatingStars
 * - Read-only mode: pass `value` (0-5, can be fractional e.g. 4.8) for display.
 * - Interactive mode: pass `interactive` + `value` + `onChange` for a selector.
 *
 * Matches the site's gold (#b48a3c / #d4af37) accent used throughout the storefront.
 */
export default function RatingStars({
  value = 0,
  onChange,
  interactive = false,
  size = "md",
  className = "",
}) {
  const [hovered, setHovered] = useState(0);

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };
  const starSize = sizeClasses[size] || sizeClasses.md;

  const displayValue = interactive && hovered ? hovered : value;

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? "Select a rating" : `Rated ${value} out of 5`}
      onMouseLeave={() => interactive && setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = displayValue >= star;
        const halfFilled = !filled && displayValue >= star - 0.5;

        const StarButton = interactive ? "button" : "span";

        return (
          <StarButton
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange?.(star) : undefined}
            onMouseEnter={interactive ? () => setHovered(star) : undefined}
            aria-label={interactive ? `${star} star${star > 1 ? "s" : ""}` : undefined}
            aria-pressed={interactive ? value === star : undefined}
            className={interactive ? "cursor-pointer transition-transform hover:scale-110" : ""}
          >
            <svg
              viewBox="0 0 24 24"
              className={starSize}
              fill={filled ? "#d4af37" : halfFilled ? "url(#half-star-gradient)" : "none"}
              stroke={filled || halfFilled ? "#d4af37" : "#57534e"}
              strokeWidth="1.5"
            >
              {halfFilled && (
                <defs>
                  <linearGradient id="half-star-gradient">
                    <stop offset="50%" stopColor="#d4af37" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2.5l2.98 6.04 6.67.97-4.82 4.7 1.14 6.65L12 17.77l-5.97 3.09 1.14-6.65-4.82-4.7 6.67-.97L12 2.5z"
              />
            </svg>
          </StarButton>
        );
      })}
    </div>
  );
}