const distinctItems = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.productId || `${item.name || "Product"}|${item.imageUrl || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export function TableProductThumbnail({ src, alt = "" }) {
  return <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-stone-800 bg-[#161022] text-xs text-stone-500 sm:h-11 sm:w-11">
    {src ? <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" /> : <span aria-hidden="true">—</span>}
  </span>;
}

export function TableProductImageStack({ items = [] }) {
  const products = distinctItems(items);
  const visibleProducts = products.slice(0, 2);
  const remaining = products.length - visibleProducts.length;

  if (!products.length) return <TableProductThumbnail />;

  return <span className="flex shrink-0 items-center -space-x-2" aria-label={`${products.length} ordered product${products.length === 1 ? "" : "s"}`}>
    {visibleProducts.map((item, index) => <span key={item.productId || `${item.name}-${index}`} className="relative first:z-10">
      <TableProductThumbnail src={item.imageUrl} alt="" />
    </span>)}
    {remaining > 0 ? <span className="relative z-20 -ml-1 inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#161022] px-1 text-xs font-semibold text-[#d4af37]">+{remaining}</span> : null}
  </span>;
}
