import { categoryDescendantIds, isIndexablePublicCategory } from "./categoryUrl.js";
import { isIndexablePublishedProduct } from "./seoFoundation.mjs";

export function publicCollectionCategories(categories = [], products = []) {
  const publicProducts = products.filter(isIndexablePublishedProduct);
  return categories
    .filter(isIndexablePublicCategory)
    .filter((category) => {
      const categoryIds = new Set(categoryDescendantIds(categories, category.id));
      return publicProducts.some((product) => categoryIds.has(product.category_id));
    });
}

export function collectionProducts(category, categories = [], products = []) {
  const categoryIds = new Set(categoryDescendantIds(categories, category?.id));
  return products.filter((product) => isIndexablePublishedProduct(product) && categoryIds.has(product.category_id));
}
