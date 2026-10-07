"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../lib/api";
import { clearCheckoutResumeToken } from "../../lib/checkoutSession";

const PENDING_PAYMENT_KEY = "sagunthala_pending_payment";

let razorpayPromise;
const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (razorpayPromise) return razorpayPromise;
  razorpayPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => window.Razorpay ? resolve(window.Razorpay) : reject(new Error("Payment unavailable"));
    script.onerror = () => reject(new Error("Payment unavailable"));
    document.head.appendChild(script);
  });
  return razorpayPromise;
};

// This component deliberately sends only the order reference. The payment API
// locks the customer-owned order and derives amount/currency from its DB row.
export default function CompletePaymentButton({ orderReference, label = "Complete payment", className = "", onError }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const report = (text) => {
    setMessage(text);
    onError?.(text);
  };

  const completePayment = async () => {
    if (!orderReference || busy) return;
    setBusy(true);
    setMessage("");
    try {
      window.sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify({ orderReference, paymentStatus: "PENDING" }));
      const [orderResponse, Razorpay] = await Promise.all([api.payments.razorpay.createOrder(orderReference), loadRazorpay()]);
      const payment = orderResponse?.data;
      if (!payment?.keyId || !payment?.razorpayOrderId || payment.orderReference !== orderReference) throw new Error("Payment unavailable");
      const checkout = new Razorpay({
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: "Sagunthala Dance Jewellery",
        description: `Order ${payment.orderReference}`,
        order_id: payment.razorpayOrderId,
        prefill: payment.prefill,
        theme: { color: "#b48a3c" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (result) => {
          try {
            const verified = await api.payments.razorpay.verify({
              orderReference: payment.orderReference,
              razorpayOrderId: result.razorpay_order_id,
              razorpayPaymentId: result.razorpay_payment_id,
              razorpaySignature: result.razorpay_signature,
            });
            if (verified?.data?.paymentStatus === "PAID") {
              clearCheckoutResumeToken();
              window.sessionStorage.removeItem(PENDING_PAYMENT_KEY);
              router.replace(`/account/orders/${encodeURIComponent(payment.orderReference)}?payment=confirmed`);
              return;
            }
            report("Your payment is being verified. Your order remains safely pending.");
          } catch {
            report("Your payment is being verified. Your order remains safely pending.");
          } finally {
            setBusy(false);
          }
        },
      });
      checkout.on("payment.failed", () => {
        report("Payment failed. Your order remains pending and can be retried safely.");
        setBusy(false);
      });
      checkout.open();
    } catch (error) {
      report(error?.message || "We couldn't start payment. Your order remains pending.");
      setBusy(false);
    }
  };

  return <div className="contents"><button type="button" disabled={busy} onClick={completePayment} className={className}>{busy ? "Opening payment…" : label}</button>{message ? <p className="basis-full text-xs text-rose-300" role="alert">{message}</p> : null}</div>;
}
