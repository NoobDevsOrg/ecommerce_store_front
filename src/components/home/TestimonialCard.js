const initials = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "SJ";

export function TestimonialAvatar({ item, previewUrl, className = "h-12 w-12" }) {
  const imageUrl = previewUrl || item.image_url;
  if (imageUrl) return <img src={imageUrl} alt={`${item.customer_name || "Customer"} avatar`} loading="lazy" className={`${className} rounded-full border border-[#d4af37]/35 bg-[#161022]`} style={{ objectFit: item.image_fit || "cover", objectPosition: `${item.image_position_x ?? 50}% ${item.image_position_y ?? 50}%` }} />;
  return <span aria-hidden="true" className={`grid ${className} place-items-center rounded-full border border-[#d4af37]/35 bg-[#b48a3c]/10 text-xs font-bold text-[#f0d984]`}>{initials(item.customer_name)}</span>;
}

export default function TestimonialCard({ item, previewUrl, className = "", showSample = false }) {
  return <article className={`relative flex min-h-[17rem] flex-col overflow-hidden rounded-3xl border border-[#d4af37]/20 bg-[linear-gradient(145deg,rgba(47,31,58,0.92),rgba(15,11,24,0.96)_58%,rgba(25,19,34,0.98))] p-7 shadow-[0_18px_42px_rgba(0,0,0,0.32)] transition duration-500 hover:-translate-y-1 hover:border-[#e5c66e]/50 hover:shadow-[0_26px_56px_rgba(0,0,0,0.46)] motion-reduce:transform-none motion-reduce:transition-none ${className}`}>
    <span aria-hidden="true" className="absolute -right-1 top-0 select-none font-serif text-[8.5rem] leading-none text-[#d4af37]/[0.08]">“</span>
    <span aria-hidden="true" className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-[#f0d984]/55 to-transparent" />
    {item.rating ? <span aria-label={`${item.rating} out of 5 stars`} className="relative flex gap-1 text-xs tracking-[0.12em] text-[#e5c66e]">{Array.from({ length: item.rating }).map((_, index) => <span key={index}>★</span>)}</span> : <span className="relative h-3" />}
    <p className="relative mt-5 line-clamp-6 flex-1 break-normal whitespace-normal font-serif text-lg leading-8 text-[#f4eee7] [overflow-wrap:break-word]">{item.content || "Your customer story will appear here."}</p>
    <div className="relative mt-6 flex items-center gap-3 border-t border-[#d4af37]/15 pt-5"><TestimonialAvatar item={item} previewUrl={previewUrl} /><div className="min-w-0"><p className="break-normal whitespace-normal text-sm font-semibold text-white [overflow-wrap:break-word]">{item.customer_name || "Customer name"}</p>{item.customer_context ? <p className="mt-0.5 break-normal whitespace-normal text-xs text-stone-400 [overflow-wrap:break-word]">{item.customer_context}</p> : null}{showSample && item.is_sample ? <p className="mt-1 text-[10px] uppercase tracking-wider text-[#d4af37]/80">Sample / demo</p> : null}</div></div>
  </article>;
}
