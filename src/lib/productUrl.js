/**
 * Builds the public product route from the API's canonical database slug.
 *
 * Deliberately never derives a slug from a display name: name formatting is
 * mutable, whereas PRODUCTS.slug is the public navigation contract.
 */
export function productHref(product) {
  const slug = typeof product?.slug === "string" ? product.slug.trim() : "";
  return slug ? `/products/${encodeURIComponent(slug)}` : "/products";
}
