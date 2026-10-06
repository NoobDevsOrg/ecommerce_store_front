"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCustomerAuth } from "../../../../components/hooks/useCustomerAuth";
import CustomerOrderTimeline from "../../../../components/orders/CustomerOrderTimeline";
import DeliveredReviewPrompt from "../../../../components/orders/DeliveredReviewPrompt";
import OrderPurchaseActions from "../../../../components/orders/OrderPurchaseActions";
import PaymentSuccessCelebration from "../../../../components/orders/PaymentSuccessCelebration";
import { api } from "../../../../lib/api";
import { productHref } from "../../../../lib/productUrl";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function OrderDetail() {
  const router = useRouter();
  const { customer, isLoading: authLoading } = useCustomerAuth();
  const { orderReference } = useParams();
  const search = useSearchParams();
  const [order, setOrder] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !customer) router.replace("/");
  }, [authLoading, customer, router]);

  useEffect(() => {
    if (!customer || !orderReference) return undefined;
    let active = true;
    Promise.all([api.orders.mineByReference(orderReference), api.orders.related(orderReference)])
      .then(([detail, relatedProducts]) => {
        if (!active) return;
        setOrder(detail.data);
        setRelated(relatedProducts?.data || []);
      })
      .catch((cause) => { if (active) setError(cause.message || "Unable to load order."); });
    return () => { active = false; };
  }, [customer, orderReference]);

  if (authLoading || !customer) return <main className="min-h-screen bg-[#0f0a1a]" />;
  if (!order) return <main className="min-h-screen bg-[#0f0a1a] p-8 text-stone-300">{error || "Loading order…"}</main>;

  const trustedPaymentSuccess = search.get("payment") === "confirmed" && order.paymentStatus === "PAID";
  return <main className="min-h-screen bg-[#0f0a1a] px-4 py-20 text-stone-200 sm:px-6">
    <section className="mx-auto max-w-4xl">
      {trustedPaymentSuccess ? <><PaymentSuccessCelebration orderReference={order.orderNumber} /><div className="mb-6 flex flex-wrap gap-3"><Link href={`/account/orders/${encodeURIComponent(order.orderNumber)}`} className="rounded bg-[#d4af37] px-4 py-2 font-bold text-[#0f0a1a]">View your order</Link><Link href="/products" className="rounded border border-stone-600 px-4 py-2">Continue shopping</Link></div></> : null}
      <Link href="/account/orders" className="text-sm text-[#d4af37]">← My orders</Link>
      <section className="mt-5 rounded-xl border border-stone-800 bg-[#161022] p-6">
        <div className="flex flex-wrap justify-between gap-3"><h2 className="font-serif text-2xl text-white">{order.orderNumber}</h2><p>{order.paymentStatus} · {order.status}</p></div>
        <p className="mt-4 text-sm text-stone-300">{[order.deliveryAddress?.fullName, order.deliveryAddress?.addressLine1, order.deliveryAddress?.city, order.deliveryAddress?.state, order.deliveryAddress?.pincode].filter(Boolean).join(", ")}</p>
        <p className="mt-4 font-semibold">Total: {money(order.totalAmount)}</p>
      </section>
      <CustomerOrderTimeline order={order} />
      <DeliveredReviewPrompt status={order.status} orderReference={order.orderNumber} />
      <section className="mt-6 rounded-xl border border-stone-800 bg-[#161022] p-6">
        <h3 className="font-serif text-2xl text-white">Your items</h3>
        <div className="mt-5 space-y-4">{order.items.map((item) => <article key={item.id || item.productId} className="flex flex-col gap-4 border-t border-stone-800 pt-4 sm:flex-row"><div className="h-24 w-24 shrink-0 overflow-hidden rounded bg-[#0f0a1a]">{item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" /> : null}</div><div className="flex-1"><h4 className="font-semibold text-white">{item.productName}</h4><p className="mt-1 text-sm text-stone-400">Purchased quantity {item.quantity} · Historical price {money(item.unitPrice)}</p><p className="mt-1 text-sm text-stone-300">Line total {money(item.lineSubtotal)}</p><OrderPurchaseActions item={item} /></div></article>)}</div>
      </section>
      {related.length ? <section className="mt-6"><p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]">Complete the look</p><h3 className="mt-2 font-serif text-2xl text-white">You may also like</h3><div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{related.map((product) => <Link key={product.id} href={productHref(product)} className="overflow-hidden rounded-xl border border-stone-800 bg-[#161022] hover:border-[#b48a3c]"><div className="aspect-square bg-[#120f1d]">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : null}</div><div className="p-3"><p className="truncate text-sm text-white">{product.name}</p><p className="mt-1 text-sm text-[#d4af37]">{money(product.price)}</p></div></Link>)}</div></section> : null}
    </section>
  </main>;
}
