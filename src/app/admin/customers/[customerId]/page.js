"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "../../../../components/layout/AdminLayout";
import { api } from "../../../../lib/api";

const emptyPagination = { page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrevious: false };
const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : "—");

function Metric({ label, value }) {
  return <div className="rounded-lg border border-stone-800 bg-[#120f1d] p-4"><p className="text-xs uppercase tracking-wide text-stone-500">{label}</p><p className="mt-2 text-lg font-semibold text-white">{value}</p></div>;
}

export default function AdminCustomerDetailPage() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [customerError, setCustomerError] = useState("");
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [ordersError, setOrdersError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return undefined;
    let active = true;
    async function loadCustomer() {
      setLoading(true);
      setCustomerError("");
      try {
        const response = await api.customers.admin.getById(customerId);
        if (active) setCustomer(response?.data || null);
      } catch (error) {
        if (active) setCustomerError(error?.message || "Unable to load customer.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadCustomer();
    return () => { active = false; };
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return undefined;
    let active = true;
    async function loadOrders() {
      setOrdersError("");
      try {
        const response = await api.customers.admin.listOrders(customerId, { page: pagination.page, limit: pagination.limit });
        if (!active) return;
        setOrders(response?.data?.orders || []);
        setPagination((current) => ({ ...current, ...(response?.data?.pagination || emptyPagination) }));
      } catch (error) {
        if (active) setOrdersError(error?.message || "Unable to load customer orders.");
      }
    }
    void loadOrders();
    return () => { active = false; };
  }, [customerId, pagination.page, pagination.limit]);

  return <AdminLayout><main className="space-y-6"><Link href="/admin/orders" className="text-sm text-[#d4af37] hover:text-white">← Back to Orders</Link>{loading ? <p className="text-stone-400" role="status">Loading customer…</p> : null}{customerError ? <p className="text-rose-300" role="alert">{customerError}</p> : null}{customer ? <><section className="rounded-xl border border-stone-800 bg-[#0c0816] p-6"><h1 className="text-2xl font-bold text-white">{customer.fullName || "Unnamed customer"}</h1><div className="mt-4 grid gap-3 text-sm text-stone-300 sm:grid-cols-2 lg:grid-cols-4"><p><span className="text-stone-500">Email: </span>{customer.email}</p><p><span className="text-stone-500">Phone: </span>{customer.phone || "—"}</p><p><span className="text-stone-500">Account status: </span>{customer.status}</p><p><span className="text-stone-500">Customer since: </span>{formatDate(customer.createdAt)}</p></div></section><section className="grid gap-3 sm:grid-cols-3"><Metric label="Orders" value={customer.orderCount} /><Metric label="Paid order value" value={money(customer.totalPaidOrderValue)} /><Metric label="Latest order" value={formatDate(customer.latestOrderDate)} /></section><section className="overflow-hidden rounded-xl border border-stone-800 bg-[#0c0816]"><div className="border-b border-stone-800 p-5"><h2 className="text-lg font-semibold text-white">Order history</h2><p className="mt-1 text-sm text-stone-500">All non-deleted orders for this customer.</p></div>{ordersError ? <p className="p-5 text-rose-300" role="alert">{ordersError}</p> : null}{!ordersError && orders.length === 0 ? <p className="p-8 text-stone-400">No orders yet.</p> : null}{orders.length ? <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-[#161022] text-stone-400"><tr><th className="p-4">Order</th><th className="p-4">Date</th><th className="p-4">Payment</th><th className="p-4">Fulfillment</th><th className="p-4">Total</th></tr></thead><tbody>{orders.map((order) => <tr key={order.orderReference} className="border-t border-stone-800 text-stone-300"><td className="p-4"><Link href={`/admin/orders/${encodeURIComponent(order.orderReference)}`} className="text-[#d4af37] underline-offset-4 hover:underline">{order.orderReference}</Link></td><td className="p-4">{formatDate(order.orderDate)}</td><td className="p-4">{order.paymentStatus}</td><td className="p-4">{order.status}</td><td className="p-4 text-white">{money(order.totalAmount)}</td></tr>)}</tbody></table></div> : null}<div className="flex items-center justify-between border-t border-stone-800 p-4 text-sm text-stone-400"><span>{pagination.total} order{pagination.total === 1 ? "" : "s"}</span><div className="flex gap-2"><button type="button" disabled={!pagination.hasPrevious} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))} className="rounded border border-stone-700 px-3 py-1.5 disabled:opacity-40">Previous</button><button type="button" disabled={!pagination.hasNext} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))} className="rounded border border-stone-700 px-3 py-1.5 disabled:opacity-40">Next</button></div></div></section></> : null}</main></AdminLayout>;
}
