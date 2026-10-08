const ordered = (categories) => [...categories].sort((left, right) => (
  Number(left.sort_order || left.sortOrder || 0) - Number(right.sort_order || right.sortOrder || 0)
  || String(left.name || "").localeCompare(String(right.name || ""))
));

export const categoryTree = (categories = []) => {
  const nodes = new Map(categories.map((category) => [category.id, { ...category, children: [] }]));
  const roots = [];

  nodes.forEach((node) => {
    const parent = node.parent_id || node.parentId;
    if (parent && parent !== node.id && nodes.has(parent)) nodes.get(parent).children.push(node);
    else roots.push(node);
  });

  const sortNodes = (nodesToSort) => ordered(nodesToSort).map((node) => ({ ...node, children: sortNodes(node.children) }));
  return sortNodes(roots);
};

export const selectedCategoryIds = (categories = [], categoryId = "") => {
  if (!categoryId) return [];
  const childrenByParent = new Map();
  categories.forEach((category) => {
    const parent = category.parent_id || category.parentId;
    if (!parent) return;
    const children = childrenByParent.get(parent) || [];
    children.push(category.id);
    childrenByParent.set(parent, children);
  });

  const ids = new Set();
  const visit = (id) => {
    if (!id || ids.has(id)) return;
    ids.add(id);
    (childrenByParent.get(id) || []).forEach(visit);
  };
  visit(categoryId);
  return [...ids];
};

function CategoryNode({ category, selectedCategoryId, onSelect, depth = 0 }) {
  const selected = selectedCategoryId === category.id;
  return <li>
    <button
      type="button"
      onClick={() => onSelect(category)}
      className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition ${selected ? "bg-[#b48a3c]/15 font-semibold text-[#f0d984] ring-1 ring-inset ring-[#d4af37]/35" : "text-stone-300 hover:bg-white/5 hover:text-white"}`}
      style={{ paddingLeft: `${12 + depth * 16}px` }}
      aria-current={selected ? "true" : undefined}
    >
      <span className="min-w-0 truncate">{category.name}</span>
    </button>
    {category.children.length ? <ul className="space-y-0.5" aria-label={`${category.name} subcategories`}>
      {category.children.map((child) => <CategoryNode key={child.id} category={child} selectedCategoryId={selectedCategoryId} onSelect={onSelect} depth={depth + 1} />)}
    </ul> : null}
  </li>;
}

export default function CategoryHierarchy({ categories, selectedCategoryId, onSelect, unavailable = false }) {
  const tree = categoryTree(categories);

  return <nav aria-label="Product categories">
    <button
      type="button"
      onClick={() => onSelect(null)}
      className={`mb-2 flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition ${!selectedCategoryId ? "bg-[#b48a3c]/15 font-semibold text-[#f0d984] ring-1 ring-inset ring-[#d4af37]/35" : "text-stone-300 hover:bg-white/5 hover:text-white"}`}
      aria-current={!selectedCategoryId ? "true" : undefined}
    >
      All Products
    </button>
    {tree.length ? <ul className="space-y-0.5">{tree.map((category) => <CategoryNode key={category.id} category={category} selectedCategoryId={selectedCategoryId} onSelect={onSelect} />)}</ul> : <p className="px-3 py-2 text-sm text-stone-500">{unavailable ? "Categories are temporarily unavailable." : "No categories available"}</p>}
  </nav>;
}
