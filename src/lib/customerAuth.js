const CUSTOMER_TOKEN_KEY = "customer_access_token";
const CUSTOMER_REFRESH_TOKEN_KEY = "customer_refresh_token";
const CUSTOMER_TENANT_KEY = "customer_tenant_id";
const CUSTOMER_USER_KEY = "customer_user";
const CUSTOMER_AUTH_EVENT = "customerAuthUpdated";
const CHECKOUT_RESUME_TOKEN_KEY = "sagunthala_checkout_resume_token";
const CHECKOUT_SESSION_CONTEXT_KEY = "sagunthala_checkout_session_context";
const PENDING_PAYMENT_KEY = "sagunthala_pending_payment";
let customerSessionVersion = 0;

const isBrowser = () => typeof window !== "undefined";

function notify() {
  if (isBrowser()) {
    window.dispatchEvent(new Event(CUSTOMER_AUTH_EVENT));
  }
}

function invalidateCustomerSessionVersion() {
  customerSessionVersion += 1;
}

export function getCustomerSessionVersion() {
  return customerSessionVersion;
}

export function getCustomerToken() {
  return isBrowser() ? window.localStorage.getItem(CUSTOMER_TOKEN_KEY) || "" : "";
}

export function getCustomerRefreshToken() {
  return isBrowser() ? window.localStorage.getItem(CUSTOMER_REFRESH_TOKEN_KEY) || "" : "";
}

export function getCustomerTenantId() {
  return isBrowser() ? window.localStorage.getItem(CUSTOMER_TENANT_KEY) || "" : "";
}

export function getStoredCustomer() {
  if (!isBrowser()) return null;

  try {
    return JSON.parse(window.localStorage.getItem(CUSTOMER_USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function setCustomerSession({ accessToken, token, refreshToken, tenantId, user }) {
  if (!isBrowser()) return;

  invalidateCustomerSessionVersion();
  window.localStorage.setItem(CUSTOMER_TOKEN_KEY, accessToken || token || "");
  if (refreshToken) window.localStorage.setItem(CUSTOMER_REFRESH_TOKEN_KEY, refreshToken);
  if (tenantId) window.localStorage.setItem(CUSTOMER_TENANT_KEY, tenantId);
  if (user) window.localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));
  notify();
}

export function setStoredCustomer(user) {
  if (!isBrowser()) return;

  if (user) window.localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(CUSTOMER_USER_KEY);
  notify();
}

export function clearCustomerSession() {
  if (!isBrowser()) return;

  invalidateCustomerSessionVersion();
  window.localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  window.localStorage.removeItem(CUSTOMER_REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(CUSTOMER_TENANT_KEY);
  window.localStorage.removeItem(CUSTOMER_USER_KEY);
  notify();
}

// Checkout resume and pending-payment data is scoped to the browser tab, but can
// identify a customer's in-progress checkout. Clear it only on an explicit
// customer sign-out; the guest cart deliberately remains available.
export function clearCustomerLogoutState() {
  if (!isBrowser()) return;

  invalidateCustomerSessionVersion();
  window.localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  window.localStorage.removeItem(CUSTOMER_REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(CUSTOMER_TENANT_KEY);
  window.localStorage.removeItem(CUSTOMER_USER_KEY);
  window.sessionStorage.removeItem(CHECKOUT_RESUME_TOKEN_KEY);
  window.sessionStorage.removeItem(CHECKOUT_SESSION_CONTEXT_KEY);
  window.sessionStorage.removeItem(PENDING_PAYMENT_KEY);
  notify();
}

export { CUSTOMER_AUTH_EVENT };
