"use client";

import { Clock, Search, SearchX } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Card, Price, cn } from "@herrglow/ui";
import { Photo } from "@/components/Photo";

export interface ExplorerItem {
  slug: string; title: string; short: string | null; category: string; categorySlug: string; image: string | null; alt: string;
  price: number | null; offerPrice: number | null; from: boolean; duration: string | null; popular: boolean; isPackage: boolean;
}

/**
 * Category chips + search over every service. All cards are in the server-rendered HTML (SEO); filtering only hides
 * them client-side. The filter bar is sticky so it stays reachable on mobile.
 */
export function ServiceExplorer({ items, categories }: { items: ExplorerItem[]; categories: { slug: string; name: string }[] }) {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => (cat === "all" || i.categorySlug === cat) && (!needle || `${i.title} ${i.category} ${i.short ?? ""}`.toLowerCase().includes(needle)));
  }, [items, cat, q]);
  const visible = new Set(shown.map((s) => s.slug));

  return (
    <div>
      <div className="sticky top-20 z-30 -mx-5 border-b border-line bg-ivory/90 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center">
          <label className="relative md:w-72">
            <span className="sr-only">Search services</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search services" className="min-h-11 w-full rounded-full border border-line bg-white pl-11 pr-4 text-sm focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-600/20" />
          </label>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Filter by category">
            {[{ slug: "all", name: "All" }, ...categories].map((c) => (
              <button key={c.slug} type="button" role="tab" aria-selected={cat === c.slug} onClick={() => setCat(c.slug)} className={cn("min-h-10 shrink-0 rounded-full border px-4 text-sm transition", cat === c.slug ? "border-plum-700 bg-plum-700 text-ivory" : "border-line bg-white text-plum-800 hover:bg-blush-100")}>{c.name}</button>
            ))}
          </div>
          <p className="text-sm text-ink-soft md:ml-auto" aria-live="polite">{shown.length} service{shown.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <Link key={s.slug} href={`/services/${s.slug}`} className={cn("group block", !visible.has(s.slug) && "hidden")}>
            <Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
              <div className="relative aspect-[4/3]">
                <Photo src={s.image} alt={s.alt} kind={s.categorySlug} seedKey={s.slug} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                {s.popular && <Badge tone="gold" className="absolute left-3 top-3 shadow-soft">Most booked</Badge>}
                {s.isPackage && <Badge tone="plum" className="absolute right-3 top-3">Package</Badge>}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">{s.category}</p>
                <h3 className="mt-1 group-hover:text-rose-700">{s.title}</h3>
                {s.short && <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{s.short}</p>}
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <Price price={s.price} offerPrice={s.offerPrice} label={s.from ? "From" : undefined} />
                  {s.duration && <span className="flex items-center gap-1 text-xs text-ink-soft"><Clock className="size-3.5" />{s.duration}</span>}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {shown.length === 0 && (
        <div className="mx-auto mt-16 max-w-md text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-blush-100 text-plum-700/60"><SearchX className="size-9" strokeWidth={1.2} /></span>
          <h3 className="mt-5">No services match</h3>
          <p className="mt-2 text-ink-soft">Try a different word, or clear the category filter.</p>
          <button type="button" onClick={() => { setQ(""); setCat("all"); }} className="mt-5 rounded-full border border-line bg-white px-5 py-2.5 text-sm text-plum-800 hover:bg-blush-100">Clear filters</button>
        </div>
      )}
    </div>
  );
}
