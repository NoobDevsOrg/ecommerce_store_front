"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../../components/layout/AdminLayout";
import { api } from "../../../../lib/api";
import { formatAdminDateTime } from "../../../../lib/adminDate";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function AdminPaymentDetail() {
  const { paymentReference } = useParams();
  const [payment, setPayment] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    if (!paymentReference) return;
    try { const response = await api.adminPayments.getByReference(paymentReference); setPayment(response.data); setError(""); }
    catch (cause) { setError(cause.message || "Unable to load payment."); }
  }, [paymentReference]);
  useEffect(() => { void load(); }, [load]);

  const act = async (action) => {
    if (!payment || saving) return;
    if ((action === "MANUAL_RESOLUTION" || action === "ESCALATE") && note.trim().length < 2) { setError("Add a short operational note before continuing."); return; }
    setSaving(true); setError("");
    try { await api.adminPayments.resolveReconciliation(payment.paymentReference, { action, note: note.trim() || undefined }); setNote(""); await load(); }
    catch (cause) { setError(cause.message || "Unable to update reconciliation."); }
    finally { setSaving(false); }
  };
  const startReview = async () => {
    if (!payment || saving) return;
    setSaving(true); setError("");
    try { await api.adminPayments.startReconciliationReview(payment.paymentReference); await load(); }
    catch (cause) { setError(cause.message || "Unable to start review."); }
    finally { setSaving(false); }
  };

  return <AdminLayout><main className="space-y-6">
    <Link href="/admin/payments" className="text-sm text-[#d4af37]">← Payments</Link>
    {!payment && !error ? <p className="text-stone-400">Loading payment…</p> : null}
    {error ? <p role="alert" className="text-rose-300">{error}</p> : null}
    {payment ? <>
      <section className="rounded-xl border border-stone-800 bg-[#0c0816] p-6"><h1 className="text-2xl font-bold text-white">Payment review</h1><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-stone-500">Payment</dt><dd className="mt-1 text-white">{payment.paymentReference}</dd></div><div><dt className="text-stone-500">Status</dt><dd className="mt-1 text-white">{payment.paymentStatus}</dd></div><div><dt className="text-stone-500">Order</dt><dd className="mt-1"><Link className="text-[#d4af37]" href={`/admin/orders/${encodeURIComponent(payment.orderReference)}`}>{payment.orderReference}</Link></dd></div><div><dt className="text-stone-500">Customer</dt><dd className="mt-1 text-white">{payment.customer.fullName || payment.customer.email}</dd></div><div><dt className="text-stone-500">Expected payment</dt><dd className="mt-1 text-white">{money(payment.amount)}</dd></div><div><dt className="text-stone-500">Received</dt><dd className="mt-1 text-white">{payment.paidAt ? money(payment.amount) : "Awaiting confirmation"}</dd></div><div><dt className="text-stone-500">Created</dt><dd className="mt-1 text-white">{formatAdminDateTime(payment.createdAt)}</dd></div><div><dt className="text-stone-500">Paid</dt><dd className="mt-1 text-white">{formatAdminDateTime(payment.paidAt)}</dd></div></dl></section>
      {payment.reconciliation ? <section className="rounded-xl border border-amber-500/40 bg-[#161022] p-6"><h2 className="text-xl font-semibold text-white">Payment needs review</h2><p className="mt-2 text-sm text-stone-300">{payment.reconciliation.reasonMessage}</p><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-stone-500">Case status</dt><dd className="mt-1 text-white">{payment.reconciliation.status}</dd></div><div><dt className="text-stone-500">Resolution</dt><dd className="mt-1 text-white">{payment.reconciliation.resolutionType || "Not resolved"}</dd></div></dl>{payment.reconciliation.resolutionNote ? <p className="mt-4 rounded border border-stone-700 bg-[#0c0816] p-3 text-sm text-stone-300">{payment.reconciliation.resolutionNote}</p> : null}{payment.reconciliation.status !== "RESOLVED" ? <div className="mt-5 space-y-3"><label className="block text-sm text-stone-200">Operational note <span className="text-stone-500">(required to record a manual resolution or escalation)</span><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} className="mt-1 min-h-24 w-full rounded border border-stone-700 bg-[#0c0816] p-3 text-white" /></label><div className="flex flex-wrap gap-3"><button type="button" onClick={startReview} disabled={saving} className="rounded border border-[#d4af37] px-4 py-2 text-sm font-semibold text-[#d4af37] disabled:opacity-50">Start Review</button>{payment.reconciliation.reasonCode === "INSUFFICIENT_STOCK" ? <button type="button" onClick={() => act("RESOLVE_AFTER_RESTOCK")} disabled={saving} className="rounded bg-[#d4af37] px-4 py-2 text-sm font-bold text-[#0f0a1a] disabled:opacity-50">Resolve After Restock</button> : null}<button type="button" onClick={() => act("MANUAL_RESOLUTION")} disabled={saving} className="rounded border border-stone-600 px-4 py-2 text-sm text-white disabled:opacity-50">Record Manual Resolution</button><button type="button" onClick={() => act("ESCALATE")} disabled={saving} className="rounded border border-rose-400/70 px-4 py-2 text-sm text-rose-200 disabled:opacity-50">Escalate</button></div><p className="text-xs text-stone-500">Only “Resolve After Restock” can confirm the payment and release fulfillment, after inventory is rechecked.</p></div> : <p className="mt-5 text-sm text-stone-400">This case is resolved. Payment status remains authoritative.</p>}</section> : null}
    </> : null}
  </main></AdminLayout>;
}
