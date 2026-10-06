import Link from "next/link";

export default function ProductNotFound() {
  return <main className="min-h-screen bg-[#0f0a1a] px-6 py-24 text-stone-200"><section className="mx-auto max-w-xl rounded-2xl border border-[#b48a3c]/25 bg-[#17101b] p-8 text-center shadow-2xl shadow-black/30"><p className="text-xs font-bold uppercase tracking-[.28em] text-[#d4af37]">Sagunthala Dance Jewellers</p><h1 className="mt-4 font-serif text-4xl text-white">Product not found</h1><p className="mt-4 text-sm leading-6 text-stone-400">This jewellery item may no longer be available.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/products" className="rounded bg-[#d4af37] px-5 py-3 text-sm font-bold text-[#17101c] hover:bg-[#f0d984]">Browse products</Link><Link href="/" className="rounded border border-stone-600 px-5 py-3 text-sm font-semibold text-stone-200 hover:border-[#b48a3c]">Back to home</Link></div></section></main>;
}
