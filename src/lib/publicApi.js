/**
 * Public API helper for fetching products without authentication
 * Used for product listing and detail pages (no auth required)
 */

// const BASE_URL =  "http://localhost:5000";
const BASE_URL = "https://ecommerce-api-rgf0.onrender.com";;

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
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
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
export async function getPublicProducts(page = 1, limit = 20, search = "") {
  const params = new URLSearchParams({
    page,
    limit,
    ...(search && { search }),
  });

  const response = await publicFetch(`/products/public/products?${params}`);
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
 * Helper to get product by slug (fetches all and filters locally)
 * Useful for URL routing with slugs
 */
export async function getPublicProductBySlug(slug) {
  const data = await getPublicProducts(1, 100); // Fetch larger limit to find slug
  const product = data.products.find((p) => p.slug === slug);

  if (!product) {
    throw new PublicApiError("Product not found", 404);
  }

  return product;
}
