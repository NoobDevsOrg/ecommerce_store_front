/**
 * Public API helper for fetching products without authentication
 * Used for product listing and detail pages (no auth required)
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
  || (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "");

export class PublicApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "PublicApiError";
    this.status = status;
    this.payload = payload;
  }
}

function extractMessage(payload, fallback) {
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
  return payload?.message || fallback;
}

/**
 * Generic fetch wrapper for public endpoints
 */
async function publicFetch(endpoint, options = {}) {
  if (!BASE_URL) {
    throw new PublicApiError("The catalogue is temporarily unavailable.", 503);
  }
  const { timeoutMs, ...fetchOptions } = options;
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      // A server route must fail closed rather than consume a Vercel function
      // while an upstream catalogue request is stalled.
      ...(timeoutMs ? { signal: AbortSignal.timeout(timeoutMs) } : {}),
      ...fetchOptions,
    });

    const contentType = response.headers.get("content-type") || "";
    let data = null;
    if (contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      throw new PublicApiError(extractMessage(data, "API request failed"), response.status, data);
    }

    return data || {};
  } catch (error) {
    if (error instanceof PublicApiError) {
      throw error;
    }
    throw new PublicApiError(error.message || "Failed to fetch data", 500);
  }
}

/**
 * Fetch all published products with pagination
 * GET /products/public/products?page=1&limit=20
 */
export async function getPublicProducts(page = 1, limit = 20, search = "", options = {}) {
  const params = new URLSearchParams({
    page,
    limit,
    ...(search && { search }),
  });

  const response = await publicFetch(`/products/public/products?${params}`, options);
  return response.data;
}

/**
 * Fetch the category facets from the same public catalogue authority used by
 * the listing. This is intentionally server-safe so the initial /products
 * HTML describes the live catalogue rather than a client-side empty state.
 */
export async function getPublicProductFilters() {
  const response = await publicFetch("/products/public/products/filters");
  return response.data;
}

/**
 * Fetch single product by ID
 * GET /products/public/products/:productId
 */
export async function getPublicProductById(productId) {
  const response = await publicFetch(`/products/public/products/${productId}`);
  return response.data;
}

/**
 * Fetch the canonical tenant-scoped product resource by the database slug.
 */
export async function getPublicProductBySlug(slug) {
  const response = await publicFetch(`/products/public/products/slug/${encodeURIComponent(slug)}`);
  return response.data;
}
