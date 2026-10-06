"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../../components/layout/AdminLayout";
import { api } from "../../../../lib/api";
import { expectedDeliveryMinimum, localIsoDate, validateExpectedDeliveryDate } from "../../../../lib/expectedDeliveryDate";
import AdminOrderItemPreview from "../../../../components/admin/AdminOrderItemPreview";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const fieldName = (field) => String(field || "").replace(/^body\./, "");

export default function AdminOrderDetail() {
  const { orderReference } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ courierName: "", trackingNumber: "", trackingUrl: "", expectedDeliveryDate: "" });

  const load = useCallback(() => api.orders.admin.getByReference(orderReference)
    .then((response) => {
      setOrder(response.data);
      setForm((current) => ({
        ...current,
        courierName: response.data.fulfillment?.courierName || "",
        trackingNumber: response.data.fulfillment?.trackingNumber || "",
        trackingUrl: response.data.fulfillment?.trackingUrl || "",
        expectedDeliveryDate: response.data.fulfillment?.expectedDeliveryDate ? String(response.data.fulfillment.expectedDeliveryDate).slice(0, 10) : "",
      }));
    })
    .catch((requestError) => setError(requestError.message || "Unable to load order.")), [orderReference]);

  useEffect(() => {
    if (orderReference) void load();
  }, [orderReference, load]);

  const next = order?.status === "CONFIRMED" ? "PROCESSING" : order?.status === "PROCESSING" ? "SHIPPED" : order?.status === "SHIPPED" ? "DELIVERED" : null;
  const today = localIsoDate();
  const expectedDeliveryMin = expectedDeliveryMinimum({ today, dispatchedAt: order?.fulfillment?.dispatchedAt });

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!next || saving) return;
    const payload = { toStatus: next };

    if (next === "SHIPPED") {
      const courierName = form.courierName.trim();
      const trackingNumber = form.trackingNumber.trim();
      const errors = {};
      if (!courierName) errors.courierName = "Courier name is required when marking an order as shipped.";
      if (!trackingNumber) errors.trackingNumber = "Tracking number is required when marking an order as shipped.";
      const expectedDeliveryError = validateExpectedDeliveryDate({ expectedDeliveryDate: form.expectedDeliveryDate, today, dispatchedAt: order.fulfillment?.dispatchedAt });
      if (expectedDeliveryError) errors.expectedDeliveryDate = expectedDeliveryError;
      if (Object.keys(errors).length) {
        setFieldErrors(errors);
        setError(errors.expectedDeliveryDate && Object.keys(errors).length === 1 ? "" : "Some shipping details need your attention.");
        return;
      }
      payload.courierName = courierName;
      payload.trackingNumber = trackingNumber;
      if (form.trackingUrl.trim()) payload.trackingUrl = form.trackingUrl.trim();
      if (form.expectedDeliveryDate) payload.expectedDeliveryDate = form.expectedDeliveryDate;
    }

    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      await api.orders.admin.updateFulfillment(orderReference, payload);
      await load();
    } catch (requestError) {
      const errors = {};
      (requestError?.payload?.error?.details || []).forEach((detail) => {
        if (detail?.field) errors[fieldName(detail.field)] = detail.message;
      });
      setFieldErrors(errors);
      setError(Object.keys(errors).length ? "" : requestError.message || "Fulfillment could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  if (!order && !error) return <AdminLayout><p className="text-stone-400">Loading order…</p></AdminLayout>;
  if (!order) return <AdminLayout><p className="text-rose-300">{error}</p></AdminLayout>;

  return <AdminLayout>
    <main className="space-y-6">
      <Link href="/admin/orders" className="text-sm text-[#d4af37]">← Orders</Link>
      <section className="rounded-xl border border-stone-800 bg-[#0c0816] p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div><h1 className="text-2xl font-bold text-white">{order.orderReference}</h1><p className="mt-1 text-stone-400">{order.customer.fullName} · {order.customer.email}</p></div>
          <p className="text-white">{money(order.totalAmount)} · {order.paymentStatus}</p>
        </div>
        <p className="mt-5 text-sm text-stone-300">{[order.deliveryAddress?.fullName, order.deliveryAddress?.addressLine1, order.deliveryAddress?.city, order.deliveryAddress?.state, order.deliveryAddress?.pincode].filter(Boolean).join(", ")}</p>
      </section>

      {next ? <form onSubmit={submit} className="rounded-xl border border-stone-800 bg-[#161022] p-6" noValidate>
        <h2 className="text-xl font-semibold text-white">Mark {next}</h2>
        {next === "SHIPPED" ? <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm text-stone-200">Courier name
            <input value={form.courierName} onChange={update("courierName")} className="mt-1 w-full rounded border border-stone-700 bg-[#0c0816] p-3 text-white" />
            {fieldErrors.courierName ? <span className="mt-1 block text-xs text-rose-300">{fieldErrors.courierName}</span> : null}
          </label>
          <label className="text-sm text-stone-200">Tracking number
            <input value={form.trackingNumber} onChange={update("trackingNumber")} className="mt-1 w-full rounded border border-stone-700 bg-[#0c0816] p-3 text-white" />
            {fieldErrors.trackingNumber ? <span className="mt-1 block text-xs text-rose-300">{fieldErrors.trackingNumber}</span> : null}
          </label>
          <label className="text-sm text-stone-200">Tracking URL <span className="text-stone-500">(optional)</span>
            <input value={form.trackingUrl} onChange={update("trackingUrl")} className="mt-1 w-full rounded border border-stone-700 bg-[#0c0816] p-3 text-white" />
            {fieldErrors.trackingUrl ? <span className="mt-1 block text-xs text-rose-300">{fieldErrors.trackingUrl}</span> : null}
          </label>
          <label className="text-sm text-stone-200">Expected delivery <span className="text-stone-500">(optional)</span>
            <input type="date" value={form.expectedDeliveryDate} min={expectedDeliveryMin} onChange={update("expectedDeliveryDate")} className="mt-1 w-full rounded border border-stone-700 bg-[#0c0816] p-3 text-white" />
            {fieldErrors.expectedDeliveryDate ? <span className="mt-1 block text-xs text-rose-300">{fieldErrors.expectedDeliveryDate}</span> : null}
          </label>
        </div> : <p className="mt-3 text-sm text-stone-400">No shipment information is required for this status.</p>}
        <button disabled={saving} className="mt-5 rounded bg-[#d4af37] px-4 py-2 font-bold text-[#0f0a1a]">{saving ? "Saving…" : `Mark ${next}`}</button>
        {error ? <p className="mt-3 text-rose-300" role="alert">{error}</p> : null}
      </form> : <p className="text-emerald-300">Delivered</p>}

      <section className="rounded-xl border border-stone-800 bg-[#161022] p-6">
        <h2 className="text-xl font-semibold text-white">Items</h2>
        <div className="mt-4 space-y-3">{(order.items || []).map((item) => <div key={item.id || item.productId} className="flex items-center justify-between gap-4 border-t border-stone-800 pt-3 text-sm"><AdminOrderItemPreview item={item} /><p className="shrink-0 text-white">{money(item.lineSubtotal)}</p></div>)}</div>
      </section>

      {order.payment?.reconciliation ? <section className="rounded-xl border border-amber-500/40 bg-[#161022] p-6">
        <h2 className="text-xl font-semibold text-white">Payment needs review</h2>
        <p className="mt-2 text-sm text-stone-300">{order.payment.reconciliation.reasonMessage}</p>
        <p className="mt-3 text-sm text-stone-400">Case status: {order.payment.reconciliation.status}</p>
        <Link href={`/admin/payments/${encodeURIComponent(order.payment.reference)}`} className="mt-4 inline-block rounded border border-[#d4af37] px-4 py-2 text-sm font-semibold text-[#d4af37]">Open payment review</Link>
      </section> : null}

      <section className="rounded-xl border border-stone-800 bg-[#161022] p-6">
        <h2 className="text-xl font-semibold text-white">Timeline</h2>
        <div className="mt-4 space-y-3">{(order.statusHistory || []).map((entry) => <div key={entry.id || `${entry.toStatus}-${entry.createdAt}`} className="border-t border-stone-800 pt-3 text-sm"><p className="font-medium text-stone-200">{entry.toStatus}</p>{entry.createdAt ? <p className="mt-1 text-stone-500">{new Date(entry.createdAt).toLocaleString("en-IN")}</p> : null}</div>)}</div>
      </section>
    </main>
  </AdminLayout>;
}
