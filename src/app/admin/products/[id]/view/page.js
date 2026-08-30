"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "../../../../../components/layout/AdminLayout";
import ProductForm from "../../../../../components/product/ProductForm";
import { api } from "../../../../../lib/api";
import { getToken } from "../../../../../lib/auth";

function ProductViewContent() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }

    let isActive = true;

    const loadProduct = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get(`/products/admin/products/${id}`);
        if (!isActive) return;
        setProduct(response?.data || null);
      } catch (err) {
        if (!isActive) return;
        setError(err?.message || "Failed to load product");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadProduct();

    return () => {
      isActive = false;
    };
  }, [id, router]);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-stone-800 bg-[#0c0816] p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">View Product</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-400">
              Complete product details in read-only mode.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/products"
              className="rounded-lg border border-stone-800 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Back to products
            </Link>
            <Link
              href={`/admin/products/${id}`}
              className="rounded-lg bg-[#b48a3c] px-4 py-2 text-sm font-semibold text-[#0c0816] transition hover:bg-[#d4af37]"
            >
              Edit Product
            </Link>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 rounded-lg border border-stone-800 bg-[#0c0816] p-6 shadow-sm">
          <div className="h-6 w-44 animate-pulse rounded-lg bg-stone-800" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="h-24 animate-pulse rounded-lg bg-stone-700" />
            <div className="h-24 animate-pulse rounded-lg bg-stone-700" />
          </div>
          <p className="text-sm text-stone-300">Loading product details...</p>
        </div>
      ) : !product ? (
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-8 text-sm text-red-400 shadow-sm">
          {error || "Product not found"}
        </div>
      ) : (
        <ProductForm mode="edit" initialValues={product} readOnly isSubmitting={false} />
      )}
    </div>
  );
}

export default function AdminProductViewPage() {
  return (
    <AdminLayout>
      <ProductViewContent />
    </AdminLayout>
  );
}
