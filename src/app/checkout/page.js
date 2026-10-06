"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCustomerAuth } from "../../components/hooks/useCustomerAuth";
import { api } from "../../lib/api";
import { buildCheckoutAddressDraft, canResumeFinalizedCheckout, clearCheckoutResumeToken, getCheckoutResumeToken, isIdentityFinalizedCheckoutSession, mapCheckoutValidationErrors, setCheckoutResumeToken, setCheckoutSessionContext } from "../../lib/checkoutSession";
import { clearCart, getCart, getCartRevision } from "../../store/cartStore";
import FormattedAddressBlock from "../../components/address/FormattedAddressBlock";
import { callingCodeForCountry, COUNTRY_OPTIONS, validateAddressContact } from "../../lib/addressContact";
const STEPS = ["Delivery", "Verify email", "Review & pay"];
const PENDING_PAYMENT_KEY = "sagunthala_pending_payment";
const CHECKOUT_CALLING_CODE_KEY = "sagunthala_checkout_calling_code";
const CHECKOUT_OTP_RESEND_KEY = "sagunthala_checkout_otp_resend_at";
const emptyAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "IN"
};
const key = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}${Math.random()}`;
const money = amount => `₹${Number(amount || 0).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`;
const savedAddress = value => ({
  fullName: value?.fullName || "",
  phone: value?.phone || "",
  addressLine1: value?.addressLine1 || "",
  addressLine2: value?.addressLine2 || "",
  landmark: value?.landmark || "",
  city: value?.city || "",
  state: value?.state || "",
  pincode: value?.pincode || "",
  country: value?.country || "IN"
});
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
function Input({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  required = true,
  disabled = false,
  error,
  autoComplete,
  inputMode
}) {
  return <div><label htmlFor={id} className="mb-1.5 block text-sm font-medium text-stone-200">{label}</label><input id={id} type={type} inputMode={inputMode || (type === "tel" ? "tel" : id.includes("pincode") ? "numeric" : undefined)} autoComplete={autoComplete} value={value} required={required} disabled={disabled} onChange={event => onChange(event.target.value)} onBlur={onBlur} aria-invalid={error ? "true" : undefined} aria-describedby={error ? `${id}-error` : undefined} className={`w-full rounded-xl border bg-[#120f1d] px-3 py-3 text-sm text-white outline-none focus:border-[#d4af37] disabled:opacity-60 ${error ? "border-rose-500" : "border-stone-700"}`} />{error ? <p id={`${id}-error`} className="mt-1 text-xs text-rose-300">{error}</p> : null}</div>;
}
function OrderSummary({
  items,
  prepared
}) {
  const subtotal = prepared?.subtotal ?? items.reduce((sum, item) => sum + Number(item.lineSubtotal || 0), 0);
  return <div className="rounded-2xl border border-stone-800 bg-[#161022] p-5"><h2 className="font-serif text-xl text-white">Order summary</h2><div className="mt-3 divide-y divide-stone-800">{items.map(item => <div key={item.productId} className="flex gap-3 py-3 text-sm"><div className="h-12 w-12 overflow-hidden rounded-lg bg-stone-800">{item.product?.primaryImageUrl || item.imageUrl ? <img src={item.product?.primaryImageUrl || item.imageUrl} alt="" className="h-full w-full object-cover" /> : null}</div><div className="min-w-0 flex-1"><p className="truncate text-white">{item.product?.name || item.productName}</p><p className="text-xs text-stone-500">Qty {item.quantity}</p></div><span>{money(item.lineSubtotal)}</span></div>)}</div><div className="mt-4 space-y-2 text-sm"><p className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></p><p className="flex justify-between"><span>GST (3%)</span><span>{prepared ? money(prepared.gstAmount) : "Calculated securely"}</span></p><p className="flex justify-between"><span>Delivery</span><span>{prepared ? money(prepared.shippingAmount) : "From delivery address"}</span></p><p className="flex justify-between border-t border-stone-700 pt-3 text-base font-bold text-white"><span>Total</span><span>{prepared ? money(prepared.totalAmount) : money(subtotal)}</span></p></div></div>;
}
function CheckoutView({
  validItems,
  prepared,
  selected,
  draft,
  callingCode,
  setCallingCode,
  step,
  busy,
  hasValidCart,
  fieldErrors,
  error,
  setError,
  customer,
  isIdentityFinalized,
  code,
  update,
  updateAddress,
  validateField,
  delivery,
  verify,
  setCode,
  sendCode,
  setStep,
  prepare,
  pay,
  resendSeconds,
  resendingCode
}) {
  const total = prepared ? money(prepared.totalAmount) : money(validItems.reduce((sum, item) => sum + Number(item.lineSubtotal || 0), 0));
  return <main className="min-h-screen bg-[#0f0a1a] px-4 py-8 text-stone-200 sm:px-6"><section className="mx-auto max-w-6xl"><header className="flex items-center justify-between border-b border-stone-800 pb-5"><Link href="/" className="font-serif text-xl text-[#edca65]">Sagunthala</Link><Link href="/cart" className="text-sm text-stone-400 hover:text-white">← Back to bag</Link></header><ol className="mt-6 flex gap-3 text-xs uppercase tracking-wider">{STEPS.map((label, index) => <li key={label} className={index <= step ? "text-[#edca65]" : "text-stone-600"}>{index + 1}. {label}</li>)}</ol>{error ? <p className="mt-5 rounded-xl border border-rose-800 bg-rose-950/30 p-3 text-sm text-rose-100" role="alert">{error}</p> : null}<details className="mt-5 rounded-xl border border-stone-800 bg-[#161022] p-4 lg:hidden"><summary className="flex cursor-pointer justify-between font-semibold text-white">Order total <span>{total}</span></summary><div className="mt-4"><OrderSummary items={validItems} prepared={prepared} /></div></details><div className="mt-7 grid gap-7 lg:grid-cols-[1.2fr_.8fr]"><div className="space-y-5">{step === 0 ? <form onSubmit={delivery} className="rounded-2xl border border-stone-800 bg-[#161022] p-5 sm:p-7" noValidate><h1 className="font-serif text-3xl text-white">Delivery</h1><p className="mt-1 text-sm text-stone-400">Your details are used only to deliver this order.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><Input id="checkout-fullName" label="Full name" value={draft.fullName} onChange={value => update("fullName", value)} onBlur={() => validateField("fullName")} autoComplete="name" error={fieldErrors.fullName} /><div className="grid grid-cols-[6rem_1fr] gap-2"><label className="text-sm text-stone-200">Code<select value={callingCode} onChange={event => setCallingCode(event.target.value)} aria-label="Phone calling code" className="mt-1 w-full rounded-xl border border-stone-700 bg-[#120f1d] px-2 py-3 text-sm text-white"><option value="+91">+91</option><option value="+1">+1</option><option value="+44">+44</option><option value="+971">+971</option></select></label><Input id="checkout-phone" label="Mobile number" type="tel" value={draft.phone} onChange={value => update("phone", value)} onBlur={() => validateField("phone")} autoComplete="tel" error={fieldErrors.phone} /></div></div><div className="mt-4"><Input id="checkout-email" label="Email address" type="email" value={draft.email} onChange={value => update("email", value)} onBlur={() => validateField("email")} autoComplete="email" disabled={Boolean(customer)} error={fieldErrors.email} /></div><div className="mt-5 grid gap-4 border-t border-stone-800 pt-5"><Input id="checkout-addressLine1" label="Address line 1" value={draft.address.addressLine1} onChange={value => updateAddress("addressLine1", value)} onBlur={() => validateField("address.addressLine1")} autoComplete="address-line1" error={fieldErrors["address.addressLine1"]} /><div className="grid gap-4 sm:grid-cols-2"><Input id="checkout-addressLine2" label="Apartment, suite, etc. (optional)" value={draft.address.addressLine2} onChange={value => updateAddress("addressLine2", value)} autoComplete="address-line2" required={false} /><Input id="checkout-landmark" label="Landmark (optional)" value={draft.address.landmark} onChange={value => updateAddress("landmark", value)} required={false} /></div><div className="grid gap-4 sm:grid-cols-2"><Input id="checkout-city" label="City" value={draft.address.city} onChange={value => updateAddress("city", value)} onBlur={() => validateField("address.city")} autoComplete="address-level2" error={fieldErrors["address.city"]} /><Input id="checkout-state" label="State / region" value={draft.address.state} onChange={value => updateAddress("state", value)} onBlur={() => validateField("address.state")} autoComplete="address-level1" error={fieldErrors["address.state"]} /></div><div className="grid gap-4 sm:grid-cols-2"><Input id="checkout-pincode" label={draft.address.country === "IN" ? "PIN code" : "Postal code"} value={draft.address.pincode} onChange={value => updateAddress("pincode", value)} onBlur={() => validateField("address.pincode")} autoComplete="postal-code" error={fieldErrors["address.pincode"]} /><label className="text-sm text-stone-200">Country<select value={draft.address.country} onChange={event => {
                    updateAddress("country", event.target.value);
                    setCallingCode(callingCodeForCountry(event.target.value));
                  }} autoComplete="country" className="mt-1 w-full rounded-xl border border-stone-700 bg-[#120f1d] px-3 py-3 text-sm text-white">{COUNTRY_OPTIONS.map(country => <option key={country.code} value={country.code}>{country.name}</option>)}</select></label></div><p className="text-xs text-stone-500">Delivery is calculated securely from this address.</p></div><button disabled={busy || !hasValidCart} className="mt-7 w-full rounded-xl bg-[#d4af37] px-5 py-3 font-bold text-[#0f0a1a] disabled:opacity-50">{busy ? "Saving…" : "Continue to review"}</button></form> : <section className="rounded-2xl border border-stone-800 bg-[#161022] p-5"><div className="flex justify-between gap-4"><div><p className="font-semibold text-white">Delivery details saved</p><FormattedAddressBlock address={{
                  ...draft.address,
                  fullName: draft.fullName,
                  phone: draft.phone
                }} showPhone={false} showName={false} className="mt-1" /></div>{!isIdentityFinalized ? <button type="button" onClick={() => setStep(0)} className="text-sm text-[#edca65]">Edit</button> : null}</div></section>}{step === 1 ? <form onSubmit={verify} className="rounded-2xl border border-stone-800 bg-[#161022] p-5 sm:p-7"><h2 className="font-serif text-2xl text-white">Verify your email</h2><p className="mt-2 text-sm leading-6 text-stone-400">We sent a six-digit code to your email. This protects your order and lets us securely continue checkout.</p><div className="mt-5"><Input id="checkout-code" label="Verification code" value={code} onChange={setCode} inputMode="numeric" autoComplete="one-time-code" error={fieldErrors.code} /></div><button disabled={busy} className="mt-6 w-full rounded-xl bg-[#d4af37] px-5 py-3 font-bold text-[#0f0a1a] disabled:opacity-50">{busy ? "Verifying…" : "Verify email and continue"}</button><button type="button" disabled={busy || resendingCode || resendSeconds > 0} onClick={() => sendCode().catch(requestError => setError(requestError?.message || "We couldn\'t resend the code."))} className="mt-4 w-full text-sm text-[#edca65] disabled:text-stone-600" aria-live="polite">{resendingCode ? "Sending…" : resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}</button></form> : null}{step === 2 ? <section className="rounded-2xl border border-stone-800 bg-[#161022] p-5 sm:p-7"><div className="flex justify-between"><div><h2 className="font-serif text-2xl text-white">Review & pay</h2><p className="mt-1 text-sm text-stone-400">Final pricing is confirmed securely before payment.</p></div></div>{selected ? <FormattedAddressBlock address={selected} className="mt-5 rounded-xl border border-stone-800 p-4" /> : null}{prepared ? <button type="button" disabled={busy} onClick={pay} className="mt-6 w-full rounded-xl bg-[#d4af37] px-5 py-3 font-bold text-[#0f0a1a]">Pay {money(prepared.totalAmount)} securely</button> : <button type="button" disabled={busy || !selected || !hasValidCart} onClick={prepare} className="mt-6 w-full rounded-xl bg-[#d4af37] px-5 py-3 font-bold text-[#0f0a1a] disabled:opacity-50">{busy ? "Confirming total…" : "Continue to secure payment"}</button>}</section> : null}</div><aside className="hidden h-fit lg:sticky lg:top-6 lg:block"><OrderSummary items={validItems} prepared={prepared} /></aside></div></section></main>;
}
export default function CheckoutPage() {
  const router = useRouter();
  const {
    customer,
    isLoading: authLoading,
    establishSession,
    refreshProfile
  } = useCustomerAuth();
  const [cart, setCart] = useState([]);
  const [validation, setValidation] = useState({
    items: [],
    invalidItems: []
  });
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [draft, setDraft] = useState({
    email: "",
    fullName: "",
    phone: "",
    address: emptyAddress
  });
  const [callingCode, setCallingCode] = useState("+91");
  const [step, setStep] = useState(0);
  const [sessionState, setSessionState] = useState("");
  const [code, setCode] = useState("");
  const [resendAt, setResendAt] = useState(null);
  const [resendNow, setResendNow] = useState(Date.now());
  const [resendingCode, setResendingCode] = useState(false);
  const [prepared, setPrepared] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const token = useRef("");
  const startKey = useRef(key());
  const prepareKey = useRef(key());
  const initialized = useRef(false);
  const sessionStateRef = useRef("");
  const sessionStart = useRef(null);
  const sessionMutation = useRef(false);
  const resendInFlight = useRef(false);
  useEffect(() => {
    const stored = window.sessionStorage.getItem(CHECKOUT_CALLING_CODE_KEY);
    if (["+91", "+1", "+44", "+971"].includes(stored || "")) setCallingCode(stored);
    const resend = Date.parse(window.sessionStorage.getItem(CHECKOUT_OTP_RESEND_KEY) || "");
    if (Number.isFinite(resend) && resend > Date.now()) setResendAt(new Date(resend).toISOString());
  }, []);
  useEffect(() => {
    window.sessionStorage.setItem(CHECKOUT_CALLING_CODE_KEY, callingCode);
  }, [callingCode]);
  useEffect(() => {
    const timestamp = Date.parse(resendAt || "");
    if (Number.isFinite(timestamp) && timestamp > Date.now()) window.sessionStorage.setItem(CHECKOUT_OTP_RESEND_KEY, new Date(timestamp).toISOString());else window.sessionStorage.removeItem(CHECKOUT_OTP_RESEND_KEY);
  }, [resendAt]);
  useEffect(() => {
    if (!resendAt || new Date(resendAt).getTime() <= Date.now()) return undefined;
    const timer = window.setInterval(() => setResendNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [resendAt]);
  const validItems = validation.items || [];
  const hasValidCart = cart.length > 0 && !(validation.invalidItems || []).length && validItems.length === cart.length;
  const update = (name, value) => {
    setFieldErrors(old => {
      const next = {
        ...old
      };
      delete next[name];
      return next;
    });
    setDraft(old => ({
      ...old,
      [name]: value
    }));
  };
  const updateAddress = (name, value) => {
    setFieldErrors(old => {
      const next = {
        ...old
      };
      delete next[`address.${name}`];
      return next;
    });
    setDraft(old => ({
      ...old,
      address: {
        ...old.address,
        [name]: value
      }
    }));
  };
  const validateField = field => {
    const details = validateAddressContact({
      fullName: draft.fullName,
      email: draft.email,
      phone: draft.phone,
      address: draft.address,
      callingCode
    }).errors;
    const message = details[field];
    if (message) setFieldErrors(old => ({
      ...old,
      [field]: message
    }));
  };
  const validateDelivery = () => {
    const result = validateAddressContact({
      fullName: draft.fullName,
      email: draft.email,
      phone: draft.phone,
      address: draft.address,
      callingCode
    });
    if (Object.keys(result.errors).length) {
      setFieldErrors(result.errors);
      const first = Object.keys(result.errors)[0];
      requestAnimationFrame(() => document.getElementById(`checkout-${first.replace("address.", "")}`)?.focus());
      return null;
    }
    return result;
  };
  const setLifecycle = useCallback(state => {
    const nextState = state || "";
    sessionStateRef.current = nextState;
    setSessionState(nextState);
  }, []);
  const hydrate = useCallback(session => {
    if (!session) return;
    setLifecycle(session.state);
    setValidation(session.cartValidation || {
      items: [],
      invalidItems: []
    });
    setDraft(old => ({
      email: session.email || old.email,
      fullName: session.contact?.fullName || old.fullName,
      phone: session.contact?.phone || old.phone,
      address: session.address || old.address
    }));
    setStep(session.state === "IDENTITY_VERIFIED" ? 2 : 0);
  }, [setLifecycle]);
  const startOrResume = useCallback(async (items, {
    forceFresh = false
  } = {}) => {
    if (sessionStart.current) return sessionStart.current;
    const operation = (async () => {
      const startFresh = async () => {
        clearCheckoutResumeToken();
        token.current = "";
        startKey.current = key();
        const response = await api.checkout.sessions.start(items, startKey.current);
        token.current = response?.data?.resumeToken || "";
        if (!token.current) throw new Error("Checkout session unavailable");
        setCheckoutResumeToken(token.current);
        setCheckoutSessionContext({
          items,
          state: response.data?.state,
          cartRevision: getCartRevision()
        });
        hydrate(response.data);
        return response.data;
      };
      const resume = getCheckoutResumeToken();
      if (resume && !forceFresh) {
        try {
          const response = await api.checkout.sessions.resume(resume);
          const session = response?.data;
          if (!isIdentityFinalizedCheckoutSession(session) || canResumeFinalizedCheckout(session, items, getCartRevision())) {
            token.current = resume;
            setCheckoutSessionContext({
              items,
              state: session?.state,
              cartRevision: getCartRevision()
            });
            hydrate(session);
            return session;
          }
          return startFresh();
        } catch (requestError) {
          clearCheckoutResumeToken();
          if (![401, 404, 409].includes(requestError?.status)) throw requestError;
        }
      }
      return startFresh();
    })();
    sessionStart.current = operation;
    try {
      return await operation;
    } finally {
      if (sessionStart.current === operation) sessionStart.current = null;
    }
  }, [hydrate]);
  const reconcilePendingPayment = useCallback(async () => {
    if (!customer || typeof window === "undefined") return false;
    let pending;
    try {
      pending = JSON.parse(window.sessionStorage.getItem(PENDING_PAYMENT_KEY) || "null");
    } catch {
      pending = null;
    }
    if (!pending?.orderReference) return false;
    try {
      const response = await api.payments.razorpay.status(pending.orderReference);
      const paymentStatus = response?.data?.paymentStatus || pending.paymentStatus;
      setPrepared({
        ...pending,
        paymentStatus
      });
      if (paymentStatus !== "PAID") return false;
      clearCheckoutResumeToken();
      clearCart();
      window.sessionStorage.removeItem(PENDING_PAYMENT_KEY);
      router.replace(`/account/orders/${encodeURIComponent(pending.orderReference)}?payment=confirmed`);
      return true;
    } catch {
      window.sessionStorage.removeItem(PENDING_PAYMENT_KEY);
      return false;
    }
  }, [customer, router]);
  const load = useCallback(async () => {
    if (await reconcilePendingPayment()) return;
    const items = getCart();
    setCart(items);
    if (!items.length) return;
    try {
      const [session, cartResponse] = await Promise.all([startOrResume(items), api.cart.validate(items)]);
      setValidation(cartResponse?.data || session?.cartValidation || {
        items: [],
        invalidItems: []
      });
      if (!customer && session?.state === "IDENTITY_REQUIRED") setStep(1);
      if (customer) {
        const [profileResponse, addressResponse] = await Promise.all([api.customerAuth.me(), api.addresses.list()]);
        const profile = profileResponse?.data || customer;
        const saved = addressResponse?.data || [];
        const selected = saved.find(address => address.isDefault) || saved[0];
        setAddresses(saved);
        setAddressId(selected?.id || "");
        setDraft(old => ({
          email: profile.email || old.email,
          fullName: profile.fullName || old.fullName,
          phone: profile.phone || old.phone,
          address: selected ? savedAddress(selected) : old.address
        }));
      }
    } catch (requestError) {
      setError(requestError?.message || "We could not start checkout.");
    }
  }, [customer, reconcilePendingPayment, startOrResume]);
  useEffect(() => {
    if (!authLoading && !initialized.current) {
      initialized.current = true;
      load();
    }
  }, [authLoading, load]);
  useEffect(() => {
    if (initialized.current && !authLoading) load();
  }, [customer, authLoading, load]);
  const sendCode = async () => {
    if (resendInFlight.current) return;
    resendInFlight.current = true;
    setResendingCode(true);
    try {
      const response = await api.checkout.sessions.identity.email.send(token.current);
      setResendAt(response?.data?.resendAvailableAt || null);
    } finally {
      resendInFlight.current = false;
      setResendingCode(false);
    }
  };
  const resumeFinalizedSession = async () => {
    if (!token.current) return false;
    const resumed = (await api.checkout.sessions.resume(token.current))?.data;
    if (!isIdentityFinalizedCheckoutSession(resumed)) return false;
    setCheckoutSessionContext({
      items: cart,
      state: resumed.state,
      cartRevision: getCartRevision()
    });
    hydrate(resumed);
    return true;
  };
  const delivery = async event => {
    event.preventDefault();
    if (sessionStateRef.current === "IDENTITY_VERIFIED") {
      setStep(2);
      return;
    }
    if (busy || sessionMutation.current || !hasValidCart) return;
    const local = validateDelivery();
    if (!local) return;
    const nextDraft = {
      ...draft,
      phone: local.normalizedPhone,
      address: {
        ...draft.address,
        phone: local.normalizedPhone
      }
    };
    sessionMutation.current = true;
    setBusy(true);
    setError("");
    setFieldErrors({});
    try {
      if (await resumeFinalizedSession()) return;
      const response = await api.checkout.sessions.updateDraft(token.current, {
        email: nextDraft.email,
        fullName: nextDraft.fullName,
        phone: nextDraft.phone,
        address: buildCheckoutAddressDraft(nextDraft),
        items: cart
      });
      setDraft(nextDraft);
      hydrate(response?.data);
      if (customer) {
        const identity = (await api.checkout.sessions.identity.current(token.current))?.data;
        const finalizedState = identity?.session?.state || "IDENTITY_VERIFIED";
        setLifecycle(finalizedState);
        setCheckoutSessionContext({
          items: cart,
          state: finalizedState,
          cartRevision: getCartRevision()
        });
        establishSession(identity.authentication);
        await refreshProfile();
        setAddressId(identity.addressId);
        setAddresses((await api.addresses.list())?.data || []);
        setStep(2);
      } else {
        await sendCode();
        setStep(1);
      }
    } catch (requestError) {
      if (requestError?.status === 409) {
        try {
          if (await resumeFinalizedSession()) return;
        } catch {
          clearCheckoutResumeToken();
          await startOrResume(cart, {
            forceFresh: true
          });
          return;
        }
      }
      setFieldErrors(mapCheckoutValidationErrors(requestError));
      setError(requestError?.status === 400 ? "Please correct the highlighted delivery details." : requestError?.message || "We could not save delivery details.");
    } finally {
      sessionMutation.current = false;
      setBusy(false);
    }
  };
  const verify = async event => {
    event.preventDefault();
    if (sessionStateRef.current === "IDENTITY_VERIFIED") {
      setStep(2);
      return;
    }
    if (busy || sessionMutation.current) return;
    sessionMutation.current = true;
    setBusy(true);
    setError("");
    try {
      const response = (await api.checkout.sessions.identity.email.verify(token.current, code))?.data;
      const finalizedState = response?.session?.state || "IDENTITY_VERIFIED";
      setLifecycle(finalizedState);
      setCheckoutSessionContext({
        items: cart,
        state: finalizedState,
        cartRevision: getCartRevision()
      });
      establishSession(response.authentication);
      await refreshProfile();
      setAddressId(response.addressId);
      setAddresses((await api.addresses.list())?.data || []);
      setCode("");
      setResendAt(null);
      setStep(2);
    } catch (requestError) {
      setFieldErrors(mapCheckoutValidationErrors(requestError));
      setError(requestError?.message || "We could not verify that code.");
    } finally {
      sessionMutation.current = false;
      setBusy(false);
    }
  };
  const prepare = async () => {
    if (busy || !addressId || !hasValidCart) return;
    setBusy(true);
    setError("");
    try {
      const summary = (await api.checkout.prepare({
        items: cart,
        addressId,
        idempotencyKey: prepareKey.current
      }))?.data;
      setPrepared(summary);
      window.sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify({
        ...summary,
        paymentStatus: summary?.paymentStatus || "PENDING"
      }));
    } catch (requestError) {
      setError(requestError?.message || "We could not confirm your total.");
    } finally {
      setBusy(false);
    }
  };
  const pay = async () => {
    if (!prepared?.orderReference || busy) return;
    setBusy(true);
    setError("");
    try {
      const [orderResponse, Razorpay] = await Promise.all([api.payments.razorpay.createOrder(prepared.orderReference), loadRazorpay()]);
      const payment = orderResponse?.data;
      if (!payment?.keyId || !payment?.razorpayOrderId) throw new Error("Payment unavailable");
      const checkout = new Razorpay({
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: "Sagunthala Dance Jewellery",
        description: `Order ${payment.orderReference}`,
        order_id: payment.razorpayOrderId,
        prefill: payment.prefill,
        theme: {
          color: "#b48a3c"
        },
        modal: {
          ondismiss: () => setBusy(false)
        },
        handler: async result => {
          try {
            const verified = await api.payments.razorpay.verify({
              orderReference: payment.orderReference,
              razorpayOrderId: result.razorpay_order_id,
              razorpayPaymentId: result.razorpay_payment_id,
              razorpaySignature: result.razorpay_signature
            });
            if (verified?.data?.paymentStatus === "PAID") {
              clearCheckoutResumeToken();
              clearCart();
              window.sessionStorage.removeItem(PENDING_PAYMENT_KEY);
              router.replace(`/account/orders/${encodeURIComponent(payment.orderReference)}?payment=confirmed`);
              return;
            }
            setError("Your payment is being verified. Your order remains safely pending.");
          } catch {
            setError("Your payment is being verified. Your order remains safely pending.");
          } finally {
            setBusy(false);
          }
        }
      });
      checkout.on("payment.failed", () => {
        setError("Payment failed. Your order remains pending and can be retried safely.");
        setBusy(false);
      });
      checkout.open();
    } catch (requestError) {
      setError(requestError?.message || "We couldn't start payment. Your order remains pending.");
      setBusy(false);
    }
  };
  const selected = addresses.find(address => address.id === addressId);
  const isIdentityFinalized = sessionState === "IDENTITY_VERIFIED";
  if (authLoading) return <main className="min-h-screen bg-[#0f0a1a] p-8 text-stone-200">Loading checkout…</main>;
  return <CheckoutView validItems={validItems} prepared={prepared} selected={selected} draft={draft} callingCode={callingCode} setCallingCode={setCallingCode} step={step} busy={busy} hasValidCart={hasValidCart} fieldErrors={fieldErrors} error={error} setError={setError} customer={customer} isIdentityFinalized={isIdentityFinalized} code={code} resendAt={resendAt} update={update} updateAddress={updateAddress} validateField={validateField} delivery={delivery} verify={verify} setCode={setCode} sendCode={sendCode} setStep={setStep} prepare={prepare} pay={pay} resendSeconds={Math.max(0, Math.ceil((Date.parse(resendAt || "") - resendNow) / 1000))} resendingCode={resendingCode} />;
  return <main className="min-h-screen bg-[#0f0a1a] px-4 py-8 text-stone-200 sm:px-6"><section className="mx-auto max-w-6xl"><header className="flex items-center justify-between border-b border-stone-800 pb-5"><Link href="/" className="font-serif text-xl text-[#edca65]">Sagunthala</Link><Link href="/cart" className="text-sm text-stone-400 hover:text-white">← Back to bag</Link></header><ol className="mt-6 flex gap-3 text-xs uppercase tracking-wider">{STEPS.map((label, index) => <li key={label} className={index <= step ? "text-[#edca65]" : "text-stone-600"}>{index + 1}. {label}</li>)}</ol>{error ? <p className="mt-5 rounded-xl border border-rose-800 bg-rose-950/30 p-3 text-sm text-rose-100" role="alert">{error}</p> : null}<details className="mt-5 rounded-xl border border-stone-800 bg-[#161022] p-4 lg:hidden"><summary className="flex cursor-pointer justify-between font-semibold text-white">Order total <span>{prepared ? money(prepared.totalAmount) : money(validItems.reduce((sum, item) => sum + Number(item.lineSubtotal || 0), 0))}</span></summary><div className="mt-4"><OrderSummary items={validItems} prepared={prepared} /></div></details><div className="mt-7 grid gap-7 lg:grid-cols-[1.2fr_.8fr]"><div className="space-y-5">{step === 0 ? <form onSubmit={delivery} className="rounded-2xl border border-stone-800 bg-[#161022] p-5 sm:p-7"><h1 className="font-serif text-3xl text-white">Delivery</h1><p className="mt-1 text-sm text-stone-400">Your details are used only to deliver this order.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><Input id="checkout-name" label="Full name" value={draft.fullName} onChange={value => update("fullName", value)} error={fieldErrors.fullName} /><Input id="checkout-phone" label="Mobile number" type="tel" value={draft.phone} onChange={value => update("phone", value)} error={fieldErrors.phone} /></div><div className="mt-4"><Input id="checkout-email" label="Email address" type="email" value={draft.email} onChange={value => update("email", value)} disabled={Boolean(customer)} error={fieldErrors.email} /></div><div className="mt-5 grid gap-4 border-t border-stone-800 pt-5"><Input id="checkout-line1" label="Address line 1" value={draft.address.addressLine1} onChange={value => updateAddress("addressLine1", value)} error={fieldErrors["address.addressLine1"]} /><div className="grid gap-4 sm:grid-cols-2"><Input id="checkout-line2" label="Apartment, suite, etc. (optional)" value={draft.address.addressLine2} onChange={value => updateAddress("addressLine2", value)} required={false} /><Input id="checkout-landmark" label="Landmark (optional)" value={draft.address.landmark} onChange={value => updateAddress("landmark", value)} required={false} /></div><div className="grid gap-4 sm:grid-cols-2"><Input id="checkout-city" label="City" value={draft.address.city} onChange={value => updateAddress("city", value)} error={fieldErrors["address.city"]} /><Input id="checkout-state" label="State" value={draft.address.state} onChange={value => updateAddress("state", value)} error={fieldErrors["address.state"]} /></div><Input id="checkout-pincode" label="PIN code" value={draft.address.pincode} onChange={value => updateAddress("pincode", value)} error={fieldErrors["address.pincode"]} /><p className="text-xs text-stone-500">Delivering within India</p></div><button disabled={busy || !hasValidCart} className="mt-7 w-full rounded-xl bg-[#d4af37] px-5 py-3 font-bold text-[#0f0a1a] disabled:opacity-50">{busy ? "Saving…" : "Continue to review"}</button></form> : <section className="rounded-2xl border border-stone-800 bg-[#161022] p-5"><div className="flex justify-between"><p><span className="font-semibold text-white">Delivery details saved</span><span className="mt-1 block text-sm text-stone-400">{draft.fullName} · {draft.address.city}, {draft.address.state} {draft.address.pincode}</span></p>{!isIdentityFinalized ? <button type="button" onClick={() => setStep(0)} className="text-sm text-[#edca65]">Edit</button> : null}</div></section>}{step === 1 ? <form onSubmit={verify} className="rounded-2xl border border-stone-800 bg-[#161022] p-5 sm:p-7"><h2 className="font-serif text-2xl text-white">Verify your email</h2><p className="mt-2 text-sm leading-6 text-stone-400">We sent a six-digit code to your email. This protects your order and lets us securely continue checkout.</p><div className="mt-5"><Input id="checkout-code" label="Verification code" value={code} onChange={setCode} error={fieldErrors.code} /></div><button disabled={busy} className="mt-6 w-full rounded-xl bg-[#d4af37] px-5 py-3 font-bold text-[#0f0a1a] disabled:opacity-50">{busy ? "Verifying…" : "Verify email and continue"}</button><button type="button" disabled={busy || resendSeconds > 0} onClick={() => sendCode().catch(requestError => setError(requestError?.message || "We couldn't resend the code."))} className="mt-4 w-full text-sm text-[#edca65] disabled:text-stone-600" aria-live="polite">{resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend code"}</button></form> : null}{step === 2 ? <section className="rounded-2xl border border-stone-800 bg-[#161022] p-5 sm:p-7"><div className="flex justify-between"><div><h2 className="font-serif text-2xl text-white">Review & pay</h2><p className="mt-1 text-sm text-stone-400">Final pricing is confirmed securely before payment.</p></div>{!isIdentityFinalized ? <button type="button" onClick={() => setStep(0)} className="text-sm text-[#edca65]">Edit</button> : null}</div>{selected ? <p className="mt-5 rounded-xl border border-stone-800 p-4 text-sm">{selected.fullName} · {selected.addressLine1}, {selected.city}, {selected.state} {selected.pincode}</p> : null}{prepared ? <button type="button" disabled={busy} onClick={pay} className="mt-6 w-full rounded-xl bg-[#d4af37] px-5 py-3 font-bold text-[#0f0a1a]">Pay {money(prepared.totalAmount)} securely</button> : <button type="button" disabled={busy || !addressId || !hasValidCart} onClick={prepare} className="mt-6 w-full rounded-xl bg-[#d4af37] px-5 py-3 font-bold text-[#0f0a1a] disabled:opacity-50">{busy ? "Confirming total…" : "Continue to secure payment"}</button>}</section> : null}</div><aside className="hidden h-fit lg:sticky lg:top-6 lg:block"><OrderSummary items={validItems} prepared={prepared} /></aside></div></section></main>;
}
