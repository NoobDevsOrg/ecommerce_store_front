export const CART_STORAGE_KEY = "cart";
export const CART_REVISION_STORAGE_KEY = "cart_revision";
export const MAX_CART_ITEM_QUANTITY = 10;
export const MAX_CART_ITEMS = 100;

const ADD_THROTTLE_MS = 350;
let lastAdd = { productId: null, at: 0 };

function normalizeQuantity(value) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_CART_ITEM_QUANTITY ? quantity : null;
}

function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const quantitiesByProductId = new Map();
  value.forEach((item) => {
    // `id` permits a one-time migration from the prior browser format.
    const productId = typeof (item?.productId || item?.id) === "string" ? (item.productId || item.id).trim() : "";
    const quantity = normalizeQuantity(item?.quantity);
    if (!productId || !quantity) return;
    quantitiesByProductId.set(productId, Math.min(MAX_CART_ITEM_QUANTITY, (quantitiesByProductId.get(productId) || 0) + quantity));
  });
  return Array.from(quantitiesByProductId, ([productId, quantity]) => ({ productId, quantity })).slice(0, MAX_CART_ITEMS);
}

function readCart() {
  if (typeof window === "undefined") return [];
  try {
    return normalizeCart(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || "[]"));
  } catch {
    return [];
  }
}

export function getCart() {
  return readCart();
}

// A revision identifies a specific bag state within this browser. It lets a
// checkout resume only the in-progress bag it was created for, even when a
// later Buy Again happens to contain the same product and quantity.
export function getCartRevision() {
  if (typeof window === "undefined") return 0;
  const revision = Number(window.localStorage.getItem(CART_REVISION_STORAGE_KEY));
  return Number.isSafeInteger(revision) && revision >= 0 ? revision : 0;
}

export function saveCart(cart) {
  if (typeof window === "undefined") return [];
  const normalized = normalizeCart(cart);
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
  window.localStorage.setItem(CART_REVISION_STORAGE_KEY, String(getCartRevision() + 1));
  window.dispatchEvent(new Event("cartUpdated"));
  return normalized;
}

export function addToCart(product, quantity = 1) {
  // This is only a convenience gate; the Cart API always rechecks the product.
  if (!product?.id || product?.isPurchasable !== true) return { changed: false, reason: "NOT_PURCHASABLE" };
  const requestedQuantity = normalizeQuantity(quantity);
  if (!requestedQuantity) return { changed: false, reason: "INVALID_QUANTITY" };

  const now = Date.now();
  if (lastAdd.productId === product.id && now - lastAdd.at < ADD_THROTTLE_MS) return { changed: false, reason: "DUPLICATE_ACTION" };
  lastAdd = { productId: product.id, at: now };

  const cart = getCart();
  const existing = cart.find((item) => item.productId === product.id);
  if (existing) existing.quantity = Math.min(MAX_CART_ITEM_QUANTITY, existing.quantity + requestedQuantity);
  else if (cart.length < MAX_CART_ITEMS) cart.push({ productId: product.id, quantity: requestedQuantity });
  else return { changed: false, reason: "CART_LIMIT_REACHED" };
  saveCart(cart);
  return { changed: true };
}

export function removeFromCart(productId) {
  return saveCart(getCart().filter((item) => item.productId !== productId));
}

export function updateCartQuantity(productId, quantity) {
  const nextQuantity = normalizeQuantity(quantity);
  if (!nextQuantity) return { changed: false, reason: "INVALID_QUANTITY" };
  const cart = getCart();
  const existing = cart.find((item) => item.productId === productId);
  if (!existing) return { changed: false, reason: "NOT_FOUND" };
  existing.quantity = nextQuantity;
  saveCart(cart);
  return { changed: true };
}

export function clearCart() {
  return saveCart([]);
}
