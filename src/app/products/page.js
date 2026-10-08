import ProductsListingClient from "./ProductsListingClient";
import { getPublicProductFilters, getPublicProducts } from "../../lib/publicApi";
import { isIndexablePublishedProduct } from "../../lib/seoFoundation.mjs";

export const dynamic = "force-dynamic";

/**
 * The catalogue is rendered from the public API on the server. The client
 * component retains filtering and pagination after hydration, but crawlers
 * and non-JS visitors now receive the real first page and category facets.
 */
export default async function ProductsPage() {
  try {
    const [catalogue, filters] = await Promise.all([
      getPublicProducts(1, 12),
      getPublicProductFilters(),
    ]);

    const products = Array.isArray(catalogue?.products)
      ? catalogue.products.filter(isIndexablePublishedProduct)
      : [];
    const categories = Array.isArray(filters?.categories) ? filters.categories : [];
    const priceBounds = Array.isArray(filters?.priceRange) && filters.priceRange.length === 2
      ? filters.priceRange
      : [0, 1000000];

    return <ProductsListingClient
      initialProducts={products}
      initialPagination={catalogue?.pagination || null}
      initialCategories={categories}
      initialPriceBounds={priceBounds}
    />;
  } catch {
    // Do not claim that a failed authority lookup means that the catalogue is
    // empty. The client receives an explicit unavailable state instead.
    return <ProductsListingClient
      initialError="The catalogue is temporarily unavailable."
    />;
  }
}
