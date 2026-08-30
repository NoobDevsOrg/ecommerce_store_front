// components/enquiries/NotificationBell.jsx
"use client";

import { useRouter } from "next/navigation";
import { useNewEnquiryCount } from "../hooks/useNewEnquiryCount";

export default function NotificationBell() {
    const router = useRouter();
    const { count } = useNewEnquiryCount();

    return (
        <button
            onClick={() => router.push("/admin/enquiries")}
            aria-label={`${count} new enquiries`}
            className="relative p-2 rounded-xl text-stone-400 hover:text-[#b48a3c] hover:bg-[#b48a3c]/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#b48a3c]/40"
        >
            {/* Bell SVG */}
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
            </svg>

            {/* Badge */}
            {count > 0 && (
                <span
                    className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#b48a3c] text-[#0f0a1a] text-[10px] font-bold leading-none animate-pulse"
                    aria-live="polite"
                >
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </button>
    );
}