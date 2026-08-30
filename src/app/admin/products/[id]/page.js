"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "../../../../components/layout/AdminLayout";
import ProductForm from "../../../../components/product/ProductForm";
import AdminToast from "../../../../components/ui/AdminToast";
import { api } from "../../../../lib/api";
import { getToken } from "../../../../lib/auth";

function EditProductContent() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });

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
    <div className="bg-[#0c0816] text-white min-h-screen">
      <div className="space-y-6">
      <AdminToast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      <div className="overflow-hidden rounded-lg border border-stone-800 bg-[#0c0816] p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Update Product</h1>
            <p className="mt-2 max-w-2xl text-sm text-white">
              Edit pricing, inventory, visuals, and publishing settings.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="rounded-lg border border-stone-800 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Back to products
          </Link>
        </div>

        {product?.name ? (
          <p className="mt-4 text-xs text-stone-400">
            Editing: <span className="font-semibold text-white">{product.name}</span>
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-4 rounded-lg border border-stone-800 bg-[#0c0816] p-6 shadow-sm">
          <div className="h-6 w-44 animate-pulse rounded-lg bg-stone-800" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="h-24 animate-pulse rounded-lg bg-stone-700" />
            <div className="h-24 animate-pulse rounded-lg bg-stone-700" />
          </div>
          <p className="text-sm text-white">Loading product details...</p>
        </div>
      ) : !product ? (
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-8 text-sm text-red-400 shadow-sm">
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
    </div>
    </div>
  );
}

export default function EditProductPage() {
  return (
    <AdminLayout>
      <EditProductContent />
    </AdminLayout>
  );
}
