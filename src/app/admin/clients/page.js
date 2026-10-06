"use client";

import { useEffect, useState } from "react";
import DateRangeFilter from "../../../components/admin/DateRangeFilter";
import AdminLayout from "../../../components/layout/AdminLayout";
import { api } from "../../../lib/api";
import { formatAdminDateTime } from "../../../lib/adminDate";

const initialPagination = { page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrevious: false };
const initialFilters = { search: "", from: "", to: "" };

function AddressCard({ address }) {
  return <div className="rounded-lg border border-stone-800 bg-[#120f1d] p-4 text-sm text-stone-300"><div className="flex justify-between gap-3"><strong className="text-white">{address.fullName || "Saved address"}</strong>{address.isDefault ? <span className="text-xs text-[#d4af37]">Default</span> : null}</div><p className="mt-2">{[address.addressLine1, address.addressLine2, address.landmark, address.city, address.state, address.pincode, address.country].filter(Boolean).join(", ")}</p>{address.phone ? <p className="mt-1 text-stone-500">{address.phone}</p> : null}</div>;
}

export default function ClientDetailsPage() {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadCustomers() {
      setLoading(true); setError("");
      try {
        const response = await api.customers.admin.list({ page: pagination.page, limit: pagination.limit, ...applied });
        if (!active) return;
        setCustomers(response?.data?.customers || []);
        setPagination((current) => ({ ...current, ...(response?.data?.pagination || initialPagination) }));
      } catch (requestError) { if (active) setError(requestError?.message || "Unable to load customers."); } finally { if (active) setLoading(false); }
    }
    loadCustomers(); return () => { active = false; };
  }, [pagination.page, pagination.limit, applied]);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return undefined; }
    let active = true;
    async function loadDetail() {
      setDetailLoading(true); setDetailError("");
      try { const response = await api.customers.admin.getById(selectedId); if (active) setDetail(response?.data || null); } catch (requestError) { if (active) setDetailError(requestError?.message || "Unable to load customer details."); } finally { if (active) setDetailLoading(false); }
    }
    loadDetail(); return () => { active = false; };
  }, [selectedId]);

  const apply = () => {
    if (filters.from && filters.to && filters.to < filters.from) { setError("To date cannot be before from date."); return; }
    setError(""); setPagination((current) => ({ ...current, page: 1 })); setApplied({ ...filters, search: filters.search.trim() });
  };
  const clear = () => { setFilters(initialFilters); setApplied(initialFilters); setPagination((current) => ({ ...current, page: 1 })); setError(""); };
  const exportReport = async () => { setExporting(true); setError(""); try { await api.customers.admin.report(applied); } catch (requestError) { setError(requestError?.message || "Unable to download the report."); } finally { setExporting(false); } };

  return <AdminLayout><div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-bold text-white">Client Details</h1><p className="mt-2 text-stone-400">Registered customers and their saved contact details.</p></div><button type="button" onClick={exportReport} disabled={exporting} className="rounded-lg border border-[#d4af37] px-4 py-2 text-sm font-semibold text-[#d4af37] disabled:opacity-50">{exporting ? "Preparing report…" : "Download Report"}</button></div>
    <div className="space-y-3 rounded-xl border border-stone-800 bg-[#0c0816] p-4"><div className="flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="customer-search">Search customers</label><input id="customer-search" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search name, email or phone" className="min-w-0 flex-1 rounded-lg border border-stone-700 bg-[#120f1d] px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:border-[#d4af37] focus:outline-none" /></div><DateRangeFilter from={filters.from} to={filters.to} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onApply={apply} onClear={clear} error={filters.from && filters.to && filters.to < filters.from ? "To date cannot be before from date." : ""} /></div>
    {error ? <p className="text-rose-300" role="alert">{error}</p> : null}
    <section className="overflow-hidden rounded-xl border border-stone-800 bg-[#0c0816]">{loading ? <p className="p-8 text-center text-stone-400" role="status">Loading customers…</p> : null}{!loading && !error && customers.length === 0 ? <p className="p-12 text-center text-stone-400">No customers match these filters.</p> : null}{!loading && !error && customers.length > 0 ? <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-[#161022] text-xs uppercase tracking-wider text-stone-400"><tr><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Created At</th><th className="px-5 py-4">Addresses</th><th className="px-5 py-4">Status</th><th className="px-5 py-4"><span className="sr-only">View details</span></th></tr></thead><tbody className="divide-y divide-stone-800">{customers.map((customer) => <tr key={customer.id} className="text-stone-300"><td className="px-5 py-4 font-medium text-white">{customer.fullName || "Unnamed customer"}</td><td className="px-5 py-4"><div>{customer.email}</div>{customer.phone ? <div className="mt-1 text-stone-500">{customer.phone}</div> : null}</td><td className="px-5 py-4 text-stone-400">{formatAdminDateTime(customer.createdAt)}</td><td className="px-5 py-4">{customer.addressCount}</td><td className="px-5 py-4"><span className="rounded-full border border-stone-700 px-2 py-1 text-xs">{customer.status}</span></td><td className="px-5 py-4"><button type="button" onClick={() => setSelectedId(customer.id)} className="text-[#d4af37] hover:text-white">View details</button></td></tr>)}</tbody></table></div> : null}{!loading && !error ? <div className="flex items-center justify-between border-t border-stone-800 px-5 py-4 text-sm text-stone-400"><span>{pagination.total} customer{pagination.total === 1 ? "" : "s"}</span><div className="flex gap-2"><button type="button" disabled={!pagination.hasPrevious} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))} className="rounded border border-stone-700 px-3 py-1.5 disabled:opacity-40">Previous</button><button type="button" disabled={!pagination.hasNext} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))} className="rounded border border-stone-700 px-3 py-1.5 disabled:opacity-40">Next</button></div></div> : null}</section>
    {selectedId ? <section className="rounded-xl border border-stone-800 bg-[#0c0816] p-6" aria-live="polite"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold text-white">Customer profile</h2><p className="mt-1 text-sm text-stone-500">Orders and enquiries will appear here in later modules.</p></div><button type="button" onClick={() => setSelectedId("")} className="text-sm text-stone-400 hover:text-white">Close</button></div>{detailLoading ? <p className="py-8 text-stone-400">Loading profile…</p> : null}{detailError ? <p className="py-8 text-rose-300" role="alert">{detailError}</p> : null}{detail && !detailLoading ? <div className="mt-6 grid gap-6 lg:grid-cols-2"><div className="space-y-3 text-sm text-stone-300"><p><span className="text-stone-500">Name: </span>{detail.fullName || "Unnamed customer"}</p><p><span className="text-stone-500">Email: </span>{detail.email}</p><p><span className="text-stone-500">Phone: </span>{detail.phone || "—"}</p><p><span className="text-stone-500">Created At: </span>{formatAdminDateTime(detail.createdAt)}</p><p><span className="text-stone-500">Status: </span>{detail.status}</p><p><span className="text-stone-500">Sign-in method: </span>{detail.authMethod}</p></div><div><h3 className="mb-3 text-sm font-semibold text-white">Saved addresses</h3>{detail.addresses?.length ? <div className="space-y-3">{detail.addresses.map((address) => <AddressCard key={address.id} address={address} />)}</div> : <p className="text-sm text-stone-500">No saved addresses.</p>}</div></div> : null}</section> : null}
  </div></AdminLayout>;
}
