"use client";

import { useEffect, useRef, useState } from "react";

export default function ProductTable({
  products,
  page,
  limit,
  total,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleTopSelling,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  const handleMoreToggle = (id, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setOpenMenu((prev) => {
      if (prev?.id === id) {
        return null;
      }
      return {
        id,
        top: rect.top - 8,
        left: rect.right,
      };
    });
  };

  useEffect(() => {
    const handleOutside = (event) => {
      if (openMenu && menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [openMenu]);

  return (
    <div className="overflow-visible rounded-lg border border-stone-800 bg-[#0c0816] shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-800">
          <thead className="bg-[#161022]">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-stone-400">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800 text-sm">
            {isLoading ? (
              <tr>
                <td className="px-4 py-8 text-center text-stone-400" colSpan={6}>
                  Loading products...
                </td>
              </tr>
            ) : !products.length ? (
              <tr>
                <td className="px-4 py-8 text-center text-stone-400" colSpan={6}>
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="group hover:bg-[#161022]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden rounded-lg border border-stone-700 bg-[#161022]">
                        {product.thumbnail_url || product.primary_image_url || product.primary_image_storage_path || product.images?.[0]?.url ? (
                          <img
                            src={product.thumbnail_url || product.primary_image_url || product.primary_image_storage_path || product.images?.[0]?.url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-stone-500">N/A</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{product.name}</p>
                        <p className="text-xs text-stone-400">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-300">₹{Number(product.price || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-stone-300">{product.stock_qty ?? 0}</td>
                  <td className="px-4 py-3 text-stone-300">{product.category_name || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.is_published
                          ? "bg-[#5cb43c]/20 text-[#5cb43c]"
                          : "bg-stone-800 text-stone-300"
                      }`}
                    >
                      {product.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(product.id)}
                        className="rounded-md border border-stone-700 px-3 py-1.5 text-xs font-medium text-stone-200 hover:bg-stone-800"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(product.id)}
                        className="rounded-md border border-stone-700 px-3 py-1.5 text-xs font-medium text-stone-200 hover:bg-stone-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product.id)}
                        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-800/20"
                      >
                        Delete
                      </button>

                      <div className="relative" ref={openMenu?.id === product.id ? menuRef : null}>
                        <button
                          type="button"
                          onClick={(event) => handleMoreToggle(product.id, event)}
                          className="rounded-md border border-stone-700 px-3 py-1.5 text-xs font-medium text-stone-200 hover:bg-stone-800"
                        >
                          More
                        </button>

                        {openMenu?.id === product.id ? (
                          <div
                            className="fixed z-[1200] w-48 rounded-xl border border-stone-700 bg-[#161022] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-sm"
                            style={{
                              top: `${openMenu.top}px`,
                              left: `${openMenu.left}px`,
                              transform: "translate(-100%, -100%)",
                            }}
                          >
                            
                            <label className="mb-2 flex items-center gap-2 text-xs text-stone-300">
                              <input
                                type="checkbox"
                                checked={Boolean(product.is_featured)}
                                onChange={(event) => onToggleFeatured(product.id, event.target.checked)}
                                className="h-3.5 w-3.5 rounded border-stone-600 bg-[#0c0816]"
                              />
                              Featured
                            </label>
                            <label className="flex items-center gap-2 text-xs text-stone-300">
                              <input
                                type="checkbox"
                                checked={Boolean(product.is_top_selling ?? product.isTopSelling)}
                                onChange={(event) => onToggleTopSelling(product.id, event.target.checked)}
                                className="h-3.5 w-3.5 rounded border-stone-600 bg-[#0c0816]"
                              />
                              Top Selling
                            </label>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-stone-800 px-4 py-3 text-sm">
        <p className="text-stone-400">
          Page {page} of {totalPages} · {total} items
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            className="rounded-lg border border-stone-700 px-3 py-1.5 text-stone-300 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="rounded-lg border border-stone-700 px-3 py-1.5 text-stone-300 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
