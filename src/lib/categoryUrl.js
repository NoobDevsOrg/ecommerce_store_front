const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAMPLE_SLUG = /(?:^|-)(?:abc|demo|test)(?:-|$)/i;

export function isIndexablePublicCategory(category) {
  if (!category || typeof category.slug !== "string") return false;
  const slug = category.slug.trim();
  const active = category.is_active === true || category.isActive === true;

  // Categories do not have a soft-delete column in the current schema;
  // `is_active` is the public availability boundary.
  return active && SAFE_SLUG.test(slug) && !SAMPLE_SLUG.test(slug);
}

export function collectionHref(category) {
  return isIndexablePublicCategory(category)
    ? `/collections/${encodeURIComponent(category.slug.trim())}`
    : null;
}

export function categoryDescendantIds(categories = [], categoryId = "") {
  if (!categoryId) return [];
  const children = new Map();
  categories.forEach((category) => {
    const parentId = category.parent_id || category.parentId;
    if (!parentId) return;
    children.set(parentId, [...(children.get(parentId) || []), category.id]);
  });

  const ids = new Set();
  const visit = (id) => {
    if (!id || ids.has(id)) return;
    ids.add(id);
    (children.get(id) || []).forEach(visit);
  };
  visit(categoryId);
  return [...ids];
}

export function categoryAncestors(categories = [], categoryId = "") {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const ancestors = [];
  const visited = new Set([categoryId]);
  let current = byId.get(categoryId);

  while (current) {
    const parentId = current.parent_id || current.parentId;
    if (!parentId || visited.has(parentId)) break;
    const parent = byId.get(parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    visited.add(parentId);
    current = parent;
  }

  return ancestors;
}

export function directChildCategories(categories = [], categoryId = "") {
  return categories.filter((category) => (category.parent_id || category.parentId) === categoryId);
}
