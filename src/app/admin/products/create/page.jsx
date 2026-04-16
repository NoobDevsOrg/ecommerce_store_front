"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductForm from "../../../../components/product/ProductForm";
import AdminToast from "../../../../components/ui/AdminToast";
import { api } from "../../../../lib/api";
import { getToken } from "../../../../lib/auth";

export default function CreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    }
  }, [router]);

  const handleCreate = async (formData) => {
    setError("");
    setIsSubmitting(true);
    try {
      await api.post("/products/admin/products", formData, { isFormData: true });
      setToast({ open: true, message: "Product created successfully", type: "success" });
      window.setTimeout(() => {
        router.push("/admin/products");
      }, 500);
    } catch (err) {
      const message = err?.message || "Failed to create product";
      setError(message);
      setToast({ open: true, message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <AdminToast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-amber-50/60 p-5 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/70 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">Product onboarding</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">Create Product</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Build a complete listing with pricing, inventory, media, and publishing controls in one polished flow.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          >
            Back to products
          </Link>
        </div>

        <div className="mt-4 grid gap-3 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-3">
          <p className="rounded-xl bg-slate-100/70 px-3 py-2 dark:bg-slate-900/60">1. Add identity details</p>
          <p className="rounded-xl bg-slate-100/70 px-3 py-2 dark:bg-slate-900/60">2. Configure pricing and stock</p>
          <p className="rounded-xl bg-slate-100/70 px-3 py-2 dark:bg-slate-900/60">3. Upload media and publish</p>
        </div>
      </div>

      <ProductForm
        mode="create"
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        submitLabel="Create Product"
        errorMessage={error}
      />
    </section>
  );
}