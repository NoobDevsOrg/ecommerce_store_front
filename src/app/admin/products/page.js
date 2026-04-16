"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import AdminLayout from "../../../components/layout/AdminLayout";
import ProductTable from "../../../components/product/ProductTable";
import AdminToast from "../../../components/ui/AdminToast";
import { api } from "../../../lib/api";
import { getToken } from "../../../lib/auth";

function ProductsContent() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });

  const sortOptions = [
    { value: "newest", label: "Sort: Newest" },
    { value: "oldest", label: "Sort: Oldest" },
    { value: "name_asc", label: "Name: A-Z" },
    { value: "name_desc", label: "Name: Z-A" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "stock_high", label: "Stock: High to Low" },
    { value: "stock_low", label: "Stock: Low to High" },
  ];

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 8,
      borderColor: state.isFocused ? "#b48a3c" : "#292524",
      backgroundColor: "#161022",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(180,138,60,0.25)" : "none",
      ":hover": { borderColor: "#b48a3c" },
    }),
    menu: (base) => ({ ...base, backgroundColor: "#161022", border: "1px solid #292524", zIndex: 1200 }),
    singleValue: (base) => ({ ...base, color: "#e7e5e4" }),
    placeholder: (base) => ({ ...base, color: "#a8a29e" }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? "#292524" : "#161022", color: "#e7e5e4" }),
    indicatorSeparator: (base) => ({ ...base, backgroundColor: "#44403c" }),
    dropdownIndicator: (base) => ({ ...base, color: "#a8a29e" }),
    menuPortal: (base) => ({ ...base, zIndex: 1300 }),
  };

  const hasAuth = useMemo(() => Boolean(getToken()), []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await api.get(`/products/admin/products?${params.toString()}`);
      const rows = response?.data?.data || [];
      console.log("API response", response);
      const pagination = response?.data?.pagination || {};

      setProducts(rows);
      setTotal(Number(pagination.total || 0));
    } catch (err) {
      setError(err?.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [limit, page, search]);

  useEffect(() => {
    if (!hasAuth) {
      router.replace("/admin/login");
      return;
    }
    fetchProducts();
  }, [fetchProducts, hasAuth, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) {
      return;
    }

    const previous = products;
    setProducts((prev) => prev.filter((product) => product.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));

    try {
      await api.delete(`/products/admin/products/${id}`);
      setToast({ open: true, message: "Product deleted", type: "success" });
    } catch (err) {
      setProducts(previous);
      setTotal((prev) => prev + 1);
      setToast({ open: true, message: err?.message || "Delete failed", type: "error" });
    }
  };

  const sortedProducts = useMemo(() => {
    const rows = [...products];
    switch (sortBy) {
      case "name_asc":
        return rows.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      case "name_desc":
        return rows.sort((a, b) => String(b.name || "").localeCompare(String(a.name || "")));
      case "price_low":
        return rows.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      case "price_high":
        return rows.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      case "stock_high":
        return rows.sort((a, b) => Number(b.stock_qty || 0) - Number(a.stock_qty || 0));
      case "stock_low":
        return rows.sort((a, b) => Number(a.stock_qty || 0) - Number(b.stock_qty || 0));
      case "oldest":
        return rows.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
      case "newest":
      default:
        return rows.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    }
  }, [products, sortBy]);

  const handleView = (id) => {
    router.push(`/admin/products/${id}/view`);
  };

  const updateProductFlag = async (id, key, checked) => {
    const previous = products;

    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              [key]: checked,
              ...(key === "is_top_selling" ? { isTopSelling: checked } : {}),
            }
          : product
      )
    );

    try {
      await api.put(`/products/admin/products/${id}`, { [key]: checked });
      setToast({ open: true, message: "Product updated", type: "success" });
    } catch (err) {
      setProducts(previous);
      setToast({ open: true, message: err?.message || "Update failed", type: "error" });
    }
  };

  return (
    <div className="space-y-8">
      <AdminToast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      <div className="space-y-6 rounded-3xl border border-stone-800 bg-[#0c0816] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Product Onboarding
            </h1>
            <p className="mt-2 text-sm text-stone-400">
              Manage your product catalog
            </p>
          </div>

          <Link
            href="/admin/products/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#b48a3c] to-[#d4af37] px-6 py-3 text-sm font-semibold text-[#0c0816] shadow-lg transition hover:shadow-xl hover:from-[#c79a44] hover:to-[#e0bc51] whitespace-nowrap"
          >
            + Create Product
          </Link>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <div className="relative flex-1">
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or slug..."
              className="w-full rounded-lg border border-stone-800 bg-[#161022] px-4 py-3 text-sm text-white placeholder-stone-500 shadow-sm transition focus:border-[#b48a3c] focus:outline-none focus:ring-2 focus:ring-[#b48a3c] focus:ring-offset-0"
            />
            <svg className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="min-w-[220px]">
            <Select
              value={sortOptions.find((option) => option.value === sortBy) || null}
              options={sortOptions}
              styles={selectStyles}
              menuPortalTarget={typeof window !== "undefined" ? document.body : null}
              onChange={(option) => setSortBy(option?.value || "newest")}
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-800 bg-red-900/20 px-4 py-4 text-sm text-red-400 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-stone-800 bg-[#0c0816] shadow-sm overflow-hidden">
        <ProductTable
          products={sortedProducts}
          page={page}
          limit={limit}
          total={total}
          isLoading={isLoading}
          onView={handleView}
          onEdit={(id) => router.push(`/admin/products/${id}`)}
          onDelete={handleDelete}
          onToggleFeatured={(id, checked) => updateProductFlag(id, "is_featured", checked)}
          onToggleTopSelling={(id, checked) => updateProductFlag(id, "is_top_selling", checked)}
          onPageChange={(nextPage) => setPage(Math.max(1, nextPage))}
        />
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <AdminLayout>
      <ProductsContent />
    </AdminLayout>
  );
}
