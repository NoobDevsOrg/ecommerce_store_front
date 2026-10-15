import Link from "next/link";
import { getAbsoluteSiteUrl } from "../../lib/siteUrl";

export function buildBreadcrumbJsonLd(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.href ? { item: getAbsoluteSiteUrl(item.href) } : {}),
    })),
  };
}

export default function Breadcrumbs({ items }) {
  const jsonLd = buildBreadcrumbJsonLd(items);

  return <>
    <nav aria-label="Breadcrumb" className="border-b border-stone-900/50 px-[clamp(1rem,2.5vw,2rem)] py-[clamp(0.75rem,1.5vw,1.5rem)]">
      <ol className="mx-auto flex w-full max-w-[min(1700px,96vw)] items-center gap-2 overflow-x-auto whitespace-nowrap text-sm">
        {items.map((item, index) => <li key={`${item.name}-${index}`} className="flex items-center gap-2">
          {index ? <span aria-hidden="true" className="text-stone-600">/</span> : null}
          {item.href && index < items.length - 1
            ? <Link href={item.href} className="text-stone-400 transition hover:text-stone-200">{item.name}</Link>
            : <span className={index === items.length - 1 ? "text-[#b48a3c]" : "text-stone-300"}>{item.name}</span>}
        </li>)}
      </ol>
    </nav>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
  </>;
}
