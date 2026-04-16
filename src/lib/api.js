import { clearAuthSession, getRefreshToken, getTenantId, getToken, setAuthSession } from "./auth";

const API_BASE_URL = "https://ecommerce-api-rgf0.onrender.com";
// const API_BASE_URL =  "http://localhost:5000";

let refreshPromise = null;

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message || "Request failed");
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function buildHeaders({ headers = {}, isFormData = false, skipAuth = false, tenantId = "" }) {
  const nextHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (!isFormData && !(nextHeaders["Content-Type"] || nextHeaders["content-type"])) {
    nextHeaders["Content-Type"] = "application/json";
  }

  const resolvedTenantId = tenantId || getTenantId();
  if (resolvedTenantId) {
    nextHeaders["x-tenant-id"] = resolvedTenantId;
  }

  if (!skipAuth) {
    const token = getToken();
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

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  refreshPromise = (async () => {
    try {
      const response = await request("/auth/refresh", {
        method: "POST",
        body: { refreshToken },
        skipAuth: true,
        allowAutoRefresh: false,
      });

      const tokenData = response?.data || {};
      const accessToken = tokenData.accessToken || tokenData.token;
      const nextRefreshToken = tokenData.refreshToken || refreshToken;

      if (!accessToken) {
        return false;
      }

      setAuthSession({
        accessToken,
        refreshToken: nextRefreshToken,
        tenantId: tokenData.tenantId,
      });
      return true;
    } catch {
      clearAuthSession();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

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
  } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders({ headers, isFormData, skipAuth, tenantId }),
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 && !skipAuth && allowAutoRefresh) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request(path, { ...options, allowAutoRefresh: false });
      }
    }

    if (response.status === 401 && typeof window !== "undefined") {
      clearAuthSession();
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
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
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
    },
  },
  health: {
    check: () => request("/health", { method: "GET", skipAuth: true }),
  },
};