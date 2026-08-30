"use client";

import { useEffect } from "react";

export default function AdminToast({ open, type = "success", message, onClose }) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      onClose();
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-[220]">
      <div
        className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${
          type === "error"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
