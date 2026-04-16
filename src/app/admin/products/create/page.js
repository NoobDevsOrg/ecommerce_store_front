"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "../../../../components/layout/AdminLayout";
import ProductForm from "../../../../components/product/ProductForm";
import AdminToast from "../../../../components/ui/AdminToast";
import { api } from "../../../../lib/api";
import { getToken } from "../../../../lib/auth";

function CreateProductContent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login");
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
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Create Product</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-400">
              Add a new product with pricing, inventory, media, and publishing information.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="rounded-lg border border-stone-800 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Back to products
          </Link>
        </div>
      </div>

      <ProductForm
        mode="create"
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        submitLabel="Create Product"
        errorMessage={error}
      />
    </div>
  );
}

export default function CreateProductPage() {
  return (
    <AdminLayout>
      <CreateProductContent />
    </AdminLayout>
  );
}
