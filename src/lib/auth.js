const TOKEN_KEY = "admin_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";
const TENANT_KEY = "tenant_id";

const isBrowser = () => typeof window !== "undefined";

export function getToken() {
  if (!isBrowser()) {
    return "";
  }
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, token || "");
}

export function getRefreshToken() {
  if (!isBrowser()) {
    return "";
  }
  return window.localStorage.getItem(REFRESH_TOKEN_KEY) || "";
}

export function setRefreshToken(refreshToken) {
  if (!isBrowser()) {
    return;
  }

  if (!refreshToken) {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    return;
  }

  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getTenantId() {
  if (!isBrowser()) {
    return "";
  }
  return window.localStorage.getItem(TENANT_KEY) || "";
}

export function setTenantId(tenantId) {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(TENANT_KEY, tenantId || "");
}

export function setAuthSession({ token, accessToken, refreshToken, tenantId }) {
  setToken(accessToken || token);
  setRefreshToken(refreshToken);
  setTenantId(tenantId);
}

export function clearAuthSession() {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(TENANT_KEY);
}

export function logout({ redirect = true } = {}) {
  clearAuthSession();
  if (redirect && isBrowser()) {
    window.location.href = "/login";
  }
}