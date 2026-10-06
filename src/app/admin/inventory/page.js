"use client";

import { useCallback, useEffect, useState } from "react";
import { TableProductThumbnail } from "../../../components/admin/TableProductImages";
import AdminLayout from "../../../components/layout/AdminLayout";
import { api } from "../../../lib/api";
import { formatAdminDateTime } from "../../../lib/adminDate";

const movementLabel = (movement) => movement?.transactionType?.replaceAll("_", " ") || "—";

export default function AdminInventoryPage() {
  const [data, setData] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [adjustment, setAdjustment] = useState({ quantityDelta: "", reason: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const response = await api.inventory.list({ page, limit: 20, search }); setData(response.data); } catch (cause) { setError(cause.message || "Unable to load inventory."); }
  }, [page, search]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!selected) { setHistory([]); return; }
    api.inventory.history(selected.id, { page: 1, limit: 50 }).then((response) => setHistory(response.data.movements || [])).catch((cause) => setError(cause.message || "Unable to load stock history."));
  }, [selected]);

  const submitSearch = (event) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); };
  const submitAdjustment = async (event) => {
    event.preventDefault();
    const quantityDelta = Number(adjustment.quantityDelta);
    if (!Number.isInteger(quantityDelta) || quantityDelta === 0) return setError("Enter a non-zero whole-number adjustment.");
    if (!adjustment.reason.trim()) return setError("A stock-adjustment reason is required.");
    setSaving(true); setError("");
    try {
      const updated = await api.inventory.adjust(selected.id, { quantityDelta, reason: adjustment.reason.trim() });
      setSelected((current) => current ? { ...current, availableStock: updated.data.availableStock } : current);
      setAdjustment({ quantityDelta: "", reason: "" });
      await load();
      const response = await api.inventory.history(selected.id, { page: 1, limit: 50 }); setHistory(response.data.movements || []);
    } catch (cause) { setError(cause.message || "Unable to update stock."); } finally { setSaving(false); }
  };
  const pagination = data?.pagination;

  return <AdminLayout><main className="space-y-6">
    <div><h1 className="text-3xl font-bold text-white">Inventory</h1><p className="mt-2 text-stone-400">Stock changes are recorded as an immutable movement history.</p></div>
    <form onSubmit={submitSearch} className="flex gap-3"><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search product, SKU or reference" className="min-w-0 flex-1 rounded border border-stone-700 bg-[#120f1d] p-3 text-white" /><button className="rounded bg-[#b48a3c] px-5 py-3 text-sm font-semibold text-[#120d19]">Search</button></form>
    {error ? <p role="alert" className="text-rose-300">{error}</p> : null}
    <section className="overflow-x-auto rounded-xl border border-stone-800 bg-[#0c0816]">{!data ? <p className="p-8 text-stone-400">Loading inventory…</p> : <><table className="min-w-full text-left text-sm"><thead className="bg-[#161022] text-stone-400"><tr><th className="p-4">Product</th><th className="p-4">SKU</th><th className="p-4">Available stock</th><th className="p-4">Purchasable</th><th className="p-4">Last movement</th><th className="p-4">Updated At</th><th className="p-4"><span className="sr-only">Open stock history</span></th></tr></thead><tbody>{data.products.map((product) => <tr key={product.id} className="border-t border-stone-800"><td className="p-4 text-white"><div className="flex min-w-0 items-center gap-2.5"><TableProductThumbnail src={product.imageUrl} alt="" /><span className="max-w-[15rem] truncate sm:max-w-xs">{product.name}</span></div></td><td className="p-4 text-stone-400">{product.sku || "—"}</td><td className="p-4 text-white">{product.availableStock}</td><td className="p-4">{product.isPurchasable ? "Yes" : "No"}</td><td className="p-4 text-stone-400">{product.lastMovement ? <>{movementLabel(product.lastMovement)} {product.lastMovement.quantityDelta > 0 ? "+" : ""}{product.lastMovement.quantityDelta}<br /><span className="text-xs">{formatAdminDateTime(product.lastMovement.createdAt)}</span></> : "—"}</td><td className="p-4 text-stone-400">{formatAdminDateTime(product.updatedAt)}</td><td className="p-4"><button type="button" onClick={() => { setSelected(product); setAdjustment({ quantityDelta: "", reason: "" }); }} className="text-[#d4af37]">History / adjust</button></td></tr>)}</tbody></table><div className="flex items-center justify-between border-t border-stone-800 p-4 text-sm text-stone-400"><span>{pagination?.total || 0} product{pagination?.total === 1 ? "" : "s"}</span><div className="flex gap-2"><button type="button" disabled={!pagination?.hasPrevious} onClick={() => setPage((value) => value - 1)} className="rounded border border-stone-700 px-3 py-1 disabled:opacity-40">Previous</button><button type="button" disabled={!pagination?.hasNext} onClick={() => setPage((value) => value + 1)} className="rounded border border-stone-700 px-3 py-1 disabled:opacity-40">Next</button></div></div></>}</section>
    {selected ? <section className="grid gap-6 rounded-xl border border-stone-800 bg-[#0c0816] p-6 lg:grid-cols-2"><div><h2 className="text-xl font-semibold text-white">{selected.name}</h2><p className="mt-1 text-stone-400">Current stock: <span className="font-semibold text-white">{selected.availableStock}</span></p><form onSubmit={submitAdjustment} className="mt-5 space-y-3"><label className="block text-sm text-stone-300">Adjustment<input type="number" step="1" value={adjustment.quantityDelta} onChange={(event) => setAdjustment((current) => ({ ...current, quantityDelta: event.target.value }))} placeholder="+10 or -1" className="mt-1 block w-full rounded border border-stone-700 bg-[#120f1d] p-3 text-white" /></label><label className="block text-sm text-stone-300">Reason<input value={adjustment.reason} onChange={(event) => setAdjustment((current) => ({ ...current, reason: event.target.value }))} placeholder="New stock received" className="mt-1 block w-full rounded border border-stone-700 bg-[#120f1d] p-3 text-white" /></label><button disabled={saving} className="rounded bg-[#b48a3c] px-5 py-3 text-sm font-semibold text-[#120d19] disabled:opacity-50">{saving ? "Updating…" : "Update stock"}</button></form></div><div><h3 className="text-lg font-semibold text-white">Stock history</h3><ol className="mt-4 space-y-3">{history.length ? history.map((movement) => <li key={movement.id} className="border-l border-stone-700 pl-4 text-sm"><p className="font-medium text-white">{movementLabel(movement)} <span className={movement.quantityDelta > 0 ? "text-emerald-300" : "text-rose-300"}>{movement.quantityDelta > 0 ? "+" : ""}{movement.quantityDelta}</span></p><p className="text-stone-400">{movement.reason}{movement.orderReference ? ` · Order ${movement.orderReference}` : ""}</p><p className="text-xs text-stone-500">{formatAdminDateTime(movement.createdAt)}</p></li>) : <li className="text-sm text-stone-500">No stock movements yet.</li>}</ol></div></section> : null}
  </main></AdminLayout>;
}
