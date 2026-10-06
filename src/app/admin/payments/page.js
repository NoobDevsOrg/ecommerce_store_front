"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DateRangeFilter from "../../../components/admin/DateRangeFilter";
import { TableProductImageStack } from "../../../components/admin/TableProductImages";
import AdminLayout from "../../../components/layout/AdminLayout";
import { api } from "../../../lib/api";
import { formatAdminDateTime } from "../../../lib/adminDate";

const initialFilters = { search: "", status: "", from: "", to: "" };
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function AdminPaymentsPage() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let active = true;
    setError("");
    api.adminPayments.list({ page, limit: 20, ...applied })
      .then((response) => { if (active) setData(response.data); })
      .catch((cause) => { if (active) setError(cause.message || "Unable to load payments."); });
    return () => { active = false; };
  }, [page, applied]);

  const apply = () => {
    if (filters.from && filters.to && filters.to < filters.from) { setError("To date cannot be before from date."); return; }
    setError(""); setPage(1); setApplied({ ...filters, search: filters.search.trim() });
  };
  const clear = () => { setFilters(initialFilters); setApplied(initialFilters); setPage(1); setError(""); };
  const exportReport = async () => { setExporting(true); setError(""); try { await api.adminPayments.report(applied); } catch (cause) { setError(cause.message || "Unable to download the report."); } finally { setExporting(false); } };
  const pagination = data?.pagination;

  return <AdminLayout><main className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-bold text-white">Payments</h1><p className="mt-2 text-stone-400">Trusted payment reconciliation records.</p></div><button type="button" onClick={exportReport} disabled={exporting} className="rounded-lg border border-[#d4af37] px-4 py-2 text-sm font-semibold text-[#d4af37] disabled:opacity-50">{exporting ? "Preparing report…" : "Download Report"}</button></div>
    <div className="space-y-3 rounded-xl border border-stone-800 bg-[#0c0816] p-4"><div className="grid gap-3 md:grid-cols-2"><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Payment, order, customer or provider ID" className="rounded border border-stone-700 bg-[#120f1d] p-3 text-white" /><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="rounded border border-stone-700 bg-[#120f1d] p-3 text-white"><option value="">All payment statuses</option><option>CREATED</option><option>PAID</option><option>FAILED</option><option>REFUNDED</option><option>REQUIRES_RECONCILIATION</option></select></div><DateRangeFilter from={filters.from} to={filters.to} onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))} onApply={apply} onClear={clear} error={filters.from && filters.to && filters.to < filters.from ? "To date cannot be before from date." : ""} /></div>
    {error ? <p className="text-rose-300" role="alert">{error}</p> : null}
    <section className="overflow-x-auto rounded-xl border border-stone-800 bg-[#0c0816]">{!data ? <p className="p-8 text-stone-400">Loading payments…</p> : <><table className="min-w-full text-left text-sm"><thead className="bg-[#161022] text-stone-400"><tr><th className="p-4">Payment</th><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Provider</th><th className="p-4">Status</th><th className="p-4">Amount</th><th className="p-4">Created At</th><th className="p-4">Paid At</th></tr></thead><tbody>{data.payments.map((payment) => <tr key={payment.paymentReference} className="border-t border-stone-800"><td className="p-4"><Link href={`/admin/payments/${encodeURIComponent(payment.paymentReference)}`} className="text-[#d4af37]">{payment.paymentReference}</Link></td><td className="p-4"><div className="flex min-w-0 items-center gap-2.5"><TableProductImageStack items={payment.items} /><Link href={`/admin/orders/${encodeURIComponent(payment.orderReference)}`} className="truncate text-[#d4af37]">{payment.orderReference}</Link></div></td><td className="p-4"><Link href={`/admin/customers/${encodeURIComponent(payment.customer.id)}`} className="text-[#d4af37]">{payment.customer.fullName || payment.customer.email}</Link></td><td className="p-4">{payment.provider}<br /><span className="text-xs text-stone-500">{payment.providerPaymentId || payment.providerOrderId || "—"}</span></td><td className="p-4">{payment.paymentStatus}{payment.method ? ` · ${payment.method}` : ""}</td><td className="p-4">{money(payment.amount)}</td><td className="p-4">{formatAdminDateTime(payment.createdAt)}</td><td className="p-4">{formatAdminDateTime(payment.paidAt)}</td></tr>)}</tbody></table><div className="flex items-center justify-between border-t border-stone-800 px-4 py-3 text-sm text-stone-400"><span>{pagination?.total || 0} payment{pagination?.total === 1 ? "" : "s"}</span><div className="flex gap-2"><button type="button" disabled={!pagination?.hasPrevious} onClick={() => setPage((current) => current - 1)} className="rounded border border-stone-700 px-3 py-1.5 disabled:opacity-40">Previous</button><button type="button" disabled={!pagination?.hasNext} onClick={() => setPage((current) => current + 1)} className="rounded border border-stone-700 px-3 py-1.5 disabled:opacity-40">Next</button></div></div></>}</section>
  </main></AdminLayout>;
}
