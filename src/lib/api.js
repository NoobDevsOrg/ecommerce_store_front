import { clearAuthSession, getRefreshToken, getTenantId, getToken, setAuthSession } from "./auth";
import {
  clearCustomerSession,
  getCustomerRefreshToken,
  getCustomerTenantId,
  getCustomerToken,
  setCustomerSession,
} from "./customerAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  || (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "");

const refreshPromises = new Map();

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message || "Request failed");
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function getScopeSession(authScope) {
  if (authScope === "customer") {
    return {
      token: getCustomerToken(),
      refreshToken: getCustomerRefreshToken(),
      tenantId: getCustomerTenantId(),
    };
  }

  return { token: getToken(), refreshToken: getRefreshToken(), tenantId: getTenantId() };
}

function clearScopeSession(authScope) {
  if (authScope === "customer") clearCustomerSession();
  else clearAuthSession();
}

function setScopeSession(authScope, session) {
  if (authScope === "customer") setCustomerSession(session);
  else setAuthSession(session);
}

function buildHeaders({ headers = {}, isFormData = false, skipAuth = false, tenantId = "", authScope = "admin" }) {
  const nextHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (!isFormData && !(nextHeaders["Content-Type"] || nextHeaders["content-type"])) {
    nextHeaders["Content-Type"] = "application/json";
  }

  const session = getScopeSession(authScope);
  const resolvedTenantId = tenantId || session.tenantId;
  if (resolvedTenantId) {
    nextHeaders["x-tenant-id"] = resolvedTenantId;
  }

  if (!skipAuth) {
    const token = session.token;
    if (token) {
      nextHeaders.Authorization = `Bearer ${token}`;
    }
  }

  return nextHeaders;
}

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  return null;
}

function getErrorMessage(payload, fallback = "Request failed") {
  if (!payload) {
    return fallback;
  }

  const details = payload?.error?.details;
  if (Array.isArray(details) && details.length > 0) {
    const first = details[0];
    if (typeof first === "string") {
      return first;
    }
    if (typeof first?.message === "string") {
      return first.message;
    }
  }

  if (typeof payload?.error?.message === "string") {
    return payload.error.message;
  }

  return payload?.message || fallback;
}

function getResponseData(payload) {
  return payload?.data;
}

async function refreshAccessToken(authScope = "admin") {
  if (refreshPromises.has(authScope)) {
    return refreshPromises.get(authScope);
  }

  const { refreshToken, tenantId } = getScopeSession(authScope);
  if (!refreshToken) {
    return false;
  }

  const refreshPromise = (async () => {
    try {
      const response = await request("/auth/refresh", {
        method: "POST",
        body: { refreshToken },
        skipAuth: true,
        allowAutoRefresh: false,
        authScope,
        tenantId,
      });

      const tokenData = response?.data || {};
      const accessToken = tokenData.accessToken || tokenData.token;
      const nextRefreshToken = tokenData.refreshToken || refreshToken;

      if (!accessToken) {
        return false;
      }

      setScopeSession(authScope, {
        accessToken,
        refreshToken: nextRefreshToken,
        tenantId: tokenData.tenantId || tenantId,
      });
      return true;
    } catch {
      clearScopeSession(authScope);
      return false;
    } finally {
      refreshPromises.delete(authScope);
    }
  })();

  refreshPromises.set(authScope, refreshPromise);
  return refreshPromise;
}

async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    headers,
    isFormData = false,
    skipAuth = false,
    tenantId = "",
    allowAutoRefresh = true,
    authScope = "admin",
  } = options;

  if (!API_BASE_URL) {
    throw new ApiError("The service is unavailable. Please try again later.", 503);
  }

  const resolvedBody = typeof body === "function" ? body() : body;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders({ headers, isFormData, skipAuth, tenantId, authScope }),
    body: isFormData ? resolvedBody : resolvedBody ? JSON.stringify(resolvedBody) : undefined,
    cache: "no-store",
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 && !skipAuth && allowAutoRefresh) {
      const refreshed = await refreshAccessToken(authScope);
      if (refreshed) {
        return request(path, { ...options, allowAutoRefresh: false });
      }
    }

    if (response.status === 401 && typeof window !== "undefined") {
      clearScopeSession(authScope);
      // if (window.location.pathname !== "/login") {
      //   window.location.href = "/login";
      // }
    }

    const message = getErrorMessage(payload, response.statusText || "Request failed");
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

function createQueryString(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    query.set(key, String(value));
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export const api = {
  download: async (path) => { const response = await fetch(`${API_BASE_URL}${path}`, { headers: buildHeaders({ headers: { Accept: "text/csv" } }), cache: "no-store" }); if (!response.ok) throw new ApiError(response.statusText || "Download failed", response.status); const blob = await response.blob(); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); const filename = response.headers.get("content-disposition")?.match(/filename="?([^";]+)"?/i)?.[1] || "report.csv"; anchor.href = url; anchor.download = filename.replace(/[^A-Za-z0-9._-]/g, "_"); document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url); },
  get: (path, options = {}) => {
    const { params, ...rest } = options || {};
    const query = params ? createQueryString(params) : "";
    return request(`${path}${query}`, { ...rest, method: "GET" });
  },
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
  data: {
    get: async (path, options) => getResponseData(await request(path, { ...options, method: "GET" })),
    post: async (path, body, options) => getResponseData(await request(path, { ...options, method: "POST", body })),
    put: async (path, body, options) => getResponseData(await request(path, { ...options, method: "PUT", body })),
    delete: async (path, options) => getResponseData(await request(path, { ...options, method: "DELETE" })),
  },
  auth: {
    login: (body) => request("/auth/login", { method: "POST", body, skipAuth: true }),
    refresh: (refreshToken) =>
      request("/auth/refresh", {
        method: "POST",
        body: { refreshToken },
        skipAuth: true,
        allowAutoRefresh: false,
      }),
    me: () => request("/auth/me", { method: "GET" }),
    logout: (refreshToken) => request("/auth/logout", { method: "POST", body: { refreshToken } }),
  },
  customerAuth: {
    register: (body) => request("/auth/register", { method: "POST", body, skipAuth: true, authScope: "customer" }),
    login: (body) => request("/auth/customer/login", { method: "POST", body, skipAuth: true, authScope: "customer" }),
    emailOtpSend: (email) => request("/auth/customer/email/send", { method: "POST", body: { email }, skipAuth: true, authScope: "customer" }),
    emailOtpVerify: (email, code) => request("/auth/customer/email/verify", { method: "POST", body: { email, code }, skipAuth: true, authScope: "customer" }),
    passwordForgot: (email) => request("/auth/customer/password/forgot", { method: "POST", body: { email }, skipAuth: true, authScope: "customer" }),
    passwordReset: (body) => request("/auth/customer/password/reset", { method: "POST", body, skipAuth: true, authScope: "customer" }),
    google: (idToken) => request("/auth/google", { method: "POST", body: { idToken }, skipAuth: true, authScope: "customer" }),
    googleConfiguration: () => request("/integrations/public/google", { method: "GET", skipAuth: true, authScope: "customer" }),
    me: () => request("/auth/customer/me", { method: "GET", authScope: "customer" }),
    updateProfile: (body) => request("/auth/customer/profile", { method: "PATCH", body, authScope: "customer" }),
    logout: () => request("/auth/logout", {
      method: "POST",
      // Resolve this again if an expired access token is refreshed before retrying logout.
      body: () => ({ refreshToken: getCustomerRefreshToken() }),
      authScope: "customer",
    }),
  },
  addresses: {
    list: () => request("/addresses", { method: "GET", authScope: "customer" }),
    create: (body) => request("/addresses", { method: "POST", body, authScope: "customer" }),
    update: (addressId, body) => request(`/addresses/${addressId}`, { method: "PATCH", body, authScope: "customer" }),
    remove: (addressId) => request(`/addresses/${addressId}`, { method: "DELETE", authScope: "customer" }),
    setDefault: (addressId) => request(`/addresses/${addressId}/default`, { method: "PUT", authScope: "customer" }),
  },
  cart: {
    validate: (items) => request("/cart/validate", {
      method: "POST",
      body: { items },
      skipAuth: true,
      authScope: "customer",
    }),
  },
  checkout: {
    prepare: (body) => request("/checkout/prepare", { method: "POST", body, authScope: "customer" }),
    sessions: {
      start: (items, idempotencyKey) => request("/checkout/sessions", { method: "POST", body: { items, idempotencyKey }, authScope: "customer" }),
      resume: (resumeToken) => request("/checkout/sessions/resume", { method: "GET", headers: { "x-checkout-resume-token": resumeToken }, authScope: "customer" }),
      updateDraft: (resumeToken, body) => request("/checkout/sessions/draft", { method: "PATCH", headers: { "x-checkout-resume-token": resumeToken }, body, authScope: "customer" }),
      identity: {
        password: (resumeToken, password) => request("/checkout/sessions/identity/password", { method: "POST", headers: { "x-checkout-resume-token": resumeToken }, body: { password }, authScope: "customer" }),
        current: (resumeToken) => request("/checkout/sessions/identity/current", { method: "POST", headers: { "x-checkout-resume-token": resumeToken }, body: {}, authScope: "customer" }),
        register: (resumeToken, password, confirmPassword) => request("/checkout/sessions/identity/register", { method: "POST", headers: { "x-checkout-resume-token": resumeToken }, body: { password, confirmPassword }, authScope: "customer" }),
        google: (resumeToken, idToken) => request("/checkout/sessions/identity/google", { method: "POST", headers: { "x-checkout-resume-token": resumeToken }, body: { idToken }, authScope: "customer" }),
        email: {
          send: (resumeToken) => request("/checkout/sessions/identity/email/send", { method: "POST", headers: { "x-checkout-resume-token": resumeToken }, body: {}, authScope: "customer" }),
          verify: (resumeToken, code) => request("/checkout/sessions/identity/email/verify", { method: "POST", headers: { "x-checkout-resume-token": resumeToken }, body: { code }, authScope: "customer" }),
        },
      },
    },
  },
  payments: {
    razorpay: {
      createOrder: (orderReference) => request("/payments/razorpay/orders", { method: "POST", body: { orderReference }, authScope: "customer" }),
      verify: (body) => request("/payments/razorpay/verify", { method: "POST", body, authScope: "customer" }),
      status: (orderReference) => request(`/payments/razorpay/orders/${encodeURIComponent(orderReference)}`, { method: "GET", authScope: "customer" }),
    },
  },
  orders: {
    mine: (params) => request(`/orders/me${createQueryString(params)}`, { method: "GET", authScope: "customer" }),
    mineByReference: (orderReference) => request(`/orders/me/${encodeURIComponent(orderReference)}`, { method: "GET", authScope: "customer" }),
    reviewItems: (orderReference) => request(`/orders/me/${encodeURIComponent(orderReference)}/review-items`, { method: "GET", authScope: "customer" }),
    submitItemReview: (orderReference, orderItemId, body) => request(`/orders/me/${encodeURIComponent(orderReference)}/items/${encodeURIComponent(orderItemId)}/reviews`, { method: "POST", body, authScope: "customer" }),
    related: (orderReference) => request(`/orders/me/${encodeURIComponent(orderReference)}/related`, { method: "GET", authScope: "customer" }),
    admin: {
      list: (params) => request(`/admin/orders${createQueryString(params)}`, { method: "GET" }),
      report: (params) => api.download(`/admin/orders/report${createQueryString(params)}`),
      getByReference: (orderReference) => request(`/admin/orders/${encodeURIComponent(orderReference)}`, { method: "GET" }),
      updateFulfillment: (orderReference, body) => request(`/admin/orders/${encodeURIComponent(orderReference)}/fulfillment`, { method: "PATCH", body }),
      retryNotifications: (orderReference) => request(`/admin/orders/${encodeURIComponent(orderReference)}/notifications/retry`, { method: "POST", body: {} }),
    },
  },
  notifications: {
    mine: (params) => request(`/notifications${createQueryString(params)}`, { method: "GET", authScope: "customer" }),
    read: (id) => request(`/notifications/${encodeURIComponent(id)}/read`, { method: "POST", body: {}, authScope: "customer" }),
    readAll: () => request("/notifications/read-all", { method: "POST", body: {}, authScope: "customer" }),
    admin: {
      list: (params) => request(`/admin/notifications${createQueryString(params)}`, { method: "GET" }),
      detail: (id) => request(`/admin/notifications/${encodeURIComponent(id)}`, { method: "GET" }),
      byEntity: (entityType, entityId) => request(`/admin/notifications/entity/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`, { method: "GET" }),
      read: (id) => request(`/admin/notifications/${encodeURIComponent(id)}/read`, { method: "POST", body: {} }),
      readAll: () => request("/admin/notifications/read-all", { method: "POST", body: {} }),
    },
  },
  adminPayments: {
    list: (params) => request(`/admin/payments${createQueryString(params)}`, { method: "GET" }),
    report: (params) => api.download(`/admin/payments/report${createQueryString(params)}`),
    getByReference: (paymentReference) => request(`/admin/payments/${encodeURIComponent(paymentReference)}`, { method: "GET" }),
    startReconciliationReview: (paymentReference) => request(`/admin/payments/${encodeURIComponent(paymentReference)}/reconciliation/review`, { method: "POST", body: {} }),
    resolveReconciliation: (paymentReference, body) => request(`/admin/payments/${encodeURIComponent(paymentReference)}/reconciliation/resolve`, { method: "POST", body }),
  },
  adminDashboard: { overview: (params) => request(`/admin/dashboard/overview${createQueryString(params)}`, { method: "GET" }) },
  observability: {
    audit: (params) => request(`/admin/audit-logs${createQueryString(params)}`, { method: "GET" }),
    auditDetail: (id) => request(`/admin/audit-logs/${encodeURIComponent(id)}`, { method: "GET" }),
    system: (params) => request(`/admin/system-logs${createQueryString(params)}`, { method: "GET" }),
  },
  observability: {
    audit: (params) => request(`/admin/audit-logs${createQueryString(params)}`, { method: "GET" }),
    auditDetail: (id) => request(`/admin/audit-logs/${encodeURIComponent(id)}`, { method: "GET" }),
    system: (params) => request(`/admin/system-logs${createQueryString(params)}`, { method: "GET" }),
  },
  inventory: {
    list: (params) => request(`/admin/inventory${createQueryString(params)}`, { method: "GET" }),
    history: (productId, params) => request(`/admin/inventory/${encodeURIComponent(productId)}/history${createQueryString(params)}`, { method: "GET" }),
    adjust: (productId, body) => request(`/admin/inventory/${encodeURIComponent(productId)}/adjustments`, { method: "POST", body }),
  },
  cart: {
    validate: (items) => request("/cart/validate", {
      method: "POST",
      body: { items },
      skipAuth: true,
      authScope: "customer",
    }),
  },
  integrations: {
    google: {
      get: () => request("/integrations/admin/google", { method: "GET" }),
      update: (body) => request("/integrations/admin/google", { method: "PUT", body }),
    },
    razorpay: {
      get: () => request("/integrations/admin/razorpay", { method: "GET" }),
      update: (body) => request("/integrations/admin/razorpay", { method: "PUT", body }),
    },
  },
  shipping: {
    admin: {
      getSettings: () => request("/admin/shipping/settings", { method: "GET" }),
      updateSettings: (body) => request("/admin/shipping/settings", { method: "PUT", body }),
      listZones: () => request("/admin/shipping/zones", { method: "GET" }),
      createZone: (body) => request("/admin/shipping/zones", { method: "POST", body }),
      updateZone: (zoneId, body) => request(`/admin/shipping/zones/${zoneId}`, { method: "PATCH", body }),
    },
  },
  shipping: {
    admin: {
      getSettings: () => request("/admin/shipping/settings", { method: "GET" }),
      updateSettings: (body) => request("/admin/shipping/settings", { method: "PUT", body }),
      createZone: (body) => request("/admin/shipping/zones", { method: "POST", body }),
      updateZone: (zoneId, body) => request(`/admin/shipping/zones/${zoneId}`, { method: "PATCH", body }),
    },
  },
  customers: {
    admin: {
      list: (params) => request(`/admin/customers${createQueryString(params)}`, { method: "GET" }),
      report: (params) => api.download(`/admin/customers/report${createQueryString(params)}`),
      getById: (customerId) => request(`/admin/customers/${customerId}`, { method: "GET" }),
      listOrders: (customerId, params) => request(`/admin/customers/${encodeURIComponent(customerId)}/orders${createQueryString(params)}`, { method: "GET" }),
    },
  },
  products: {
    admin: {
      create: (formData) => request("/products/admin/products", { method: "POST", body: formData, isFormData: true }),
      list: (params) => request(`/products/admin/products${createQueryString(params)}`, { method: "GET" }),
      getById: (productId) => request(`/products/admin/products/${productId}`, { method: "GET" }),
      update: (productId, payload) => request(`/products/admin/products/${productId}`, { method: "PUT", body: payload }),
      delete: (productId) => request(`/products/admin/products/${productId}`, { method: "DELETE" }),
      setPrimaryImage: (productId, primaryImageId) =>
        request(`/products/admin/products/${productId}/images`, {
          method: "PUT",
          body: { primary_image_id: primaryImageId || null },
        }),
      deleteImage: (productId, imageId) => request(`/products/admin/products/${productId}/images/${imageId}`, { method: "DELETE" }),
    },
    public: {
      list: (params) => request(`/products/public/products${createQueryString(params)}`, { method: "GET", skipAuth: true }),
      getById: (productId) => request(`/products/public/products/${productId}`, { method: "GET", skipAuth: true }),
      heroBanners: () => request("/products/public/hero-banners", { method: "GET", skipAuth: true }),
    },
    heroBanners: {
      list: () => request("/products/admin/hero-banners", { method: "GET" }),
      create: (formData) => request("/products/admin/hero-banners", { method: "POST", body: formData, isFormData: true }),
      update: (bannerId, formData) => request(`/products/admin/hero-banners/${bannerId}`, { method: "PUT", body: formData, isFormData: true }),
      remove: (bannerId) => request(`/products/admin/hero-banners/${bannerId}`, { method: "DELETE" }),
      publish: (bannerId, is_published) => request(`/products/admin/hero-banners/${bannerId}/publish`, { method: "PATCH", body: { is_published } }),
      reorder: (banner_type, ordered_ids) => request("/products/admin/hero-banners/reorder", { method: "PUT", body: { banner_type, ordered_ids } }),
    },
    testimonials: {
      public: () => request("/products/public/testimonials", { method: "GET", skipAuth: true }),
      list: () => request("/products/admin/testimonials", { method: "GET" }),
      create: (formData) => request("/products/admin/testimonials", { method: "POST", body: formData, isFormData: true }),
      update: (testimonialId, formData) => request(`/products/admin/testimonials/${testimonialId}`, { method: "PUT", body: formData, isFormData: true }),
      remove: (testimonialId) => request(`/products/admin/testimonials/${testimonialId}`, { method: "DELETE" }),
      setActive: (testimonialId, is_active) => request(`/products/admin/testimonials/${testimonialId}/active`, { method: "PATCH", body: { is_active } }),
      reorder: (ordered_ids) => request("/products/admin/testimonials/reorder", { method: "PUT", body: { ordered_ids } }),
      saveSettings: (settings) => request("/products/admin/testimonials/settings", { method: "PUT", body: settings }),
    },
    testimonials: {
      public: () => request("/products/public/testimonials", { method: "GET", skipAuth: true }),
      list: () => request("/products/admin/testimonials", { method: "GET" }),
      create: (formData) => request("/products/admin/testimonials", { method: "POST", body: formData, isFormData: true }),
      update: (testimonialId, formData) => request(`/products/admin/testimonials/${testimonialId}`, { method: "PUT", body: formData, isFormData: true }),
      remove: (testimonialId) => request(`/products/admin/testimonials/${testimonialId}`, { method: "DELETE" }),
      setActive: (testimonialId, is_active) => request(`/products/admin/testimonials/${testimonialId}/active`, { method: "PATCH", body: { is_active } }),
      reorder: (ordered_ids) => request("/products/admin/testimonials/reorder", { method: "PUT", body: { ordered_ids } }),
      saveSettings: (settings) => request("/products/admin/testimonials/settings", { method: "PUT", body: settings }),
    },
    reviews: {
      // API 1 — Admin: generate review invitations for a completed enquiry
      generateInvitations: (enquiryId) =>
        request(`/products/enquiries/${enquiryId}/review-invitations`, { method: "POST" }),
      // API 2 — Public: load an invitation by its code
      getInvitation: (inviteCode) =>
        request(`/products/reviews/${inviteCode}`, { method: "GET", skipAuth: true }),
      // API 3 — Public: submit a review against an invitation
      submit: (inviteCode, body) =>
        request(`/products/reviews/${inviteCode}`, { method: "POST", body, skipAuth: true }),
      // API 4 — Admin: approve a pending review
      approve: (reviewId) =>
        request(`/products/reviews/${reviewId}/approve`, { method: "PATCH" }),
      // API 5 — Public: reviews for a single product (used on the Product Details page)
      updateStatus: (id, data) =>
        request(`/products/reviews/${id}/status`, { method: "PATCH", body: data }),

      update: (id, data) =>
        request(`/products/reviews/${id}`, {
          method: "PATCH",
          body: data,
        }),

      listByProduct: (productId, params) =>
        request(`/products/${productId}/reviews${createQueryString(params)}`, { method: "GET", skipAuth: true }),
      // NOTE: no backend endpoint for this was in the spec — assumed to mirror the
      // admin products/enquiries list shape ({ data: [...], pagination }). Update the
      // path here if the real endpoint differs.
      adminList: (params) =>
        request(`/products/admin/reviews${createQueryString(params)}`, { method: "GET" }),
    },
  },
  health: {
    check: () => request("/health", { method: "GET", skipAuth: true }),
  },
};
