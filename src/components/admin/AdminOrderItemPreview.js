"use client";

/** Renders only immutable ORDER_ITEMS snapshot data for Admin order views. */
export default function AdminOrderItemPreview({ item, compact = false }) {
  const imageUrl = item?.imageUrl || null;
  const name = item?.productName || "Product";
  const size = compact ? "h-10 w-10" : "h-14 w-14";

  return <div className="flex min-w-0 items-center gap-3">
    <div className={`shrink-0 overflow-hidden rounded-lg border border-stone-800 bg-[#0c0816] ${size}`}>
      {imageUrl ? <img src={imageUrl} alt={name} width={compact ? 40 : 56} height={compact ? 40 : 56} loading="lazy" className="h-full w-full object-cover" /> : <div aria-hidden="true" className="grid h-full w-full place-items-center text-xs text-stone-600">—</div>}
    </div>
    <div className="min-w-0"><p className="truncate font-medium text-stone-100">{name}</p><p className="mt-1 text-xs text-stone-500">Qty: {item?.quantity || 0} · Unit price: ₹{Number(item?.unitPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p></div>
  </div>;
}
