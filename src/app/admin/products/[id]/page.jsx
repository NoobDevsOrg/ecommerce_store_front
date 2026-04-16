"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductForm from "../../../../components/product/ProductForm";
import AdminToast from "../../../../components/ui/AdminToast";
import { api } from "../../../../lib/api";
import { getToken } from "../../../../lib/auth";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    let isActive = true;

    const loadProduct = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get(`/products/admin/products/${id}`);
        console.log("API response update", response);
        if (!isActive) {
          return;
        }
        setProduct(response?.data || null);
      } catch (err) {
        if (!isActive) {
          return;
        }
        setError(err?.message || "Failed to load product");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isActive = false;
    };
  }, [id, router]);

  const refreshProduct = async () => {
    try {
      const response = await api.get(`/products/admin/products/${id}`);
      setProduct(response?.data || null);
    } catch (err) {
      console.error("Failed to refresh product", err);
    }
  };

  const handleUpdate = async (payload) => {
    setIsSubmitting(true);
    setError("");

    try {
      await api.put(`/products/admin/products/${id}`, payload);
      setToast({ open: true, message: "Product updated successfully", type: "success" });
      window.setTimeout(() => {
        router.push("/admin/products");
      }, 500);
    } catch (err) {
      const message = err?.message || "Failed to update product";
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

      <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-sky-50/50 p-5 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/70 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">Product onboarding</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">Update Product</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Refine pricing, inventory, visuals, and publishing settings with live validation and safe updates.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          >
            Back to products
          </Link>
        </div>

        {product?.name ? (
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Editing: <span className="font-semibold text-slate-700 dark:text-slate-200">{product.name}</span>
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
          <div className="h-6 w-44 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
          </div>
          <p className="text-sm text-slate-500">Loading product details...</p>
        </div>
      ) : !product ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700 shadow-sm dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300">
          {error || "Product not found"}
        </div>
      ) : (
        <ProductForm
          mode="edit"
          initialValues={product}
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
          submitLabel="Update Product"
          errorMessage={error}
          onImagesChanged={refreshProduct}
        />
      )}
    </section>
  );
}