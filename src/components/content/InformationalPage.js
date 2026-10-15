import Breadcrumbs from "../seo/Breadcrumbs";

export function ContentSection({ title, children }) {
  return <section className="border-t border-stone-800/80 pt-7 first:border-t-0 first:pt-0">
    <h2 className="font-serif text-2xl text-white sm:text-3xl">{title}</h2>
    <div className="mt-4 space-y-4 text-sm leading-7 text-stone-300 sm:text-base">{children}</div>
  </section>;
}

export default function InformationalPage({ title, intro, children }) {
  return <main className="min-h-screen bg-[#0f0a1a] pb-16">
    <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: title }]} />
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4af37]">Sagunthala Dance Jewellery</p>
      <h1 className="mt-3 font-serif text-3xl leading-tight text-white sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">{intro}</p>
      <div className="mt-10 space-y-8">{children}</div>
    </article>
  </main>;
}
