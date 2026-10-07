// Session storage keeps this opaque, checkout-only bearer secret out of URLs
// and limits it to one browser tab. Like any browser-readable value it remains
// exposed to an XSS compromise; it is never treated as customer authentication.
const CHECKOUT_RESUME_TOKEN_KEY = "sagunthala_checkout_resume_token";
const CHECKOUT_SESSION_CONTEXT_KEY = "sagunthala_checkout_session_context";
const CHECKOUT_PAYMENT_IDEMPOTENCY_KEY = "sagunthala_checkout_payment_idempotency_key";
const IDENTITY_VERIFIED = "IDENTITY_VERIFIED";

const isBrowser = () => typeof window !== "undefined";

// The checkout form collects contact/recipient data once. The API deliberately
// keeps contact and address snapshots separate, so copy those trusted form
// values into the required address recipient fields at the request boundary.
export function buildCheckoutAddressDraft({ fullName, phone, address }) {
  return {
    fullName,
    phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    landmark: address.landmark,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country,
  };
}

export function mapCheckoutValidationErrors(error) {
  const details = error?.payload?.error?.details;
  if (!Array.isArray(details)) return {};

  return details.reduce((errors, detail) => {
    if (!detail?.field || !detail?.message) return errors;
    const backendField = String(detail.field).replace(/^body\./, "");
    // The recipient and contact inputs are intentionally the same UI fields.
    const field = backendField === "contact.email"
      ? "email"
      : backendField === "contact.fullName"
        ? "fullName"
        : backendField === "contact.phone"
          ? "phone"
          : backendField === "address.fullName"
      ? "fullName"
      : backendField === "address.phone"
        ? "phone"
        : backendField;
    errors[field] = detail.message;
    return errors;
  }, {});
}

export function getCheckoutResumeToken() {
  return isBrowser() ? window.sessionStorage.getItem(CHECKOUT_RESUME_TOKEN_KEY) || "" : "";
}

export function setCheckoutResumeToken(token) {
  if (!isBrowser() || !token) return;
  window.sessionStorage.setItem(CHECKOUT_RESUME_TOKEN_KEY, token);
}

export function clearCheckoutResumeToken() {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(CHECKOUT_RESUME_TOKEN_KEY);
  window.sessionStorage.removeItem(CHECKOUT_SESSION_CONTEXT_KEY);
  window.sessionStorage.removeItem(CHECKOUT_PAYMENT_IDEMPOTENCY_KEY);
}

// Keep the payment-preparation identity for the lifetime of one resumable
// checkout. A refresh therefore resumes the same pending order, while a fresh
// checkout starts with a fresh identity and can contain a different cart.
export function getCheckoutPaymentIdempotencyKey() {
  if (!isBrowser()) return "";
  const existing = window.sessionStorage.getItem(CHECKOUT_PAYMENT_IDEMPOTENCY_KEY);
  if (existing && /^[A-Za-z0-9_-]{8,128}$/.test(existing)) return existing;
  const generated = globalThis.crypto?.randomUUID?.() || `checkout_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem(CHECKOUT_PAYMENT_IDEMPOTENCY_KEY, generated);
  return generated;
}

const normalizedItems = (items) => (Array.isArray(items) ? items : [])
  .map((item) => ({ productId: String(item?.productId || "").trim(), quantity: Number(item?.quantity) }))
  .filter((item) => item.productId && Number.isInteger(item.quantity) && item.quantity > 0)
  .sort((left, right) => left.productId.localeCompare(right.productId));

export function sameCheckoutItems(left, right) {
  const first = normalizedItems(left);
  const second = normalizedItems(right);
  return first.length === second.length && first.every((item, index) => (
    item.productId === second[index].productId && item.quantity === second[index].quantity
  ));
}

export function isIdentityFinalizedCheckoutSession(session) {
  return session?.state === IDENTITY_VERIFIED;
}

export function getCheckoutSessionContext() {
  if (!isBrowser()) return null;
  try {
    const context = JSON.parse(window.sessionStorage.getItem(CHECKOUT_SESSION_CONTEXT_KEY) || "null");
    return context && typeof context === "object" ? context : null;
  } catch {
    return null;
  }
}

const normalizeCartRevision = (value) => {
  const revision = Number(value);
  return Number.isSafeInteger(revision) && revision >= 0 ? revision : 0;
};

export function setCheckoutSessionContext({ items, state, cartRevision = 0 }) {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(CHECKOUT_SESSION_CONTEXT_KEY, JSON.stringify({
    items: normalizedItems(items), state: state || "", cartRevision: normalizeCartRevision(cartRevision),
  }));
}

export function canResumeFinalizedCheckout(session, items, cartRevision = 0) {
  const context = getCheckoutSessionContext();
  return isIdentityFinalizedCheckoutSession(session)
    && context?.state === IDENTITY_VERIFIED
    && normalizeCartRevision(context.cartRevision) === normalizeCartRevision(cartRevision)
    && sameCheckoutItems(context.items, items)
    && sameCheckoutItems(session.cart, items);
}

export { CHECKOUT_RESUME_TOKEN_KEY, CHECKOUT_SESSION_CONTEXT_KEY, CHECKOUT_PAYMENT_IDEMPOTENCY_KEY, IDENTITY_VERIFIED };
