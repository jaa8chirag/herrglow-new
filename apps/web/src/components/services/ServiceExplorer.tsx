"use client";

import { Clock, Search, SearchX, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Card, cn } from "@herrglow/ui";
import { Photo } from "@/components/Photo";

export interface ExplorerItem {
  slug: string;
  title: string;
  short: string | null;
  category: string;
  categorySlug: string;
  image: string | null;
  alt: string;
  price: number | null;
  offerPrice: number | null;
  from: boolean;
  duration: string | null;
  popular: boolean;
  isPackage: boolean;
}

/**
 * Category chips + search over every service catalog item.
 * Displays Service Name, Category, Starting Price in INR (₹), and a prominent "Book Now" button.
 */
export function ServiceExplorer({
  items,
  categories,
}: {
  items: ExplorerItem[];
  categories: { slug: string; name: string }[];
}) {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter(
      (i) =>
        (cat === "all" || i.categorySlug === cat) &&
        (!needle ||
          `${i.title} ${i.category} ${i.short ?? ""}`.toLowerCase().includes(needle))
    );
  }, [items, cat, q]);

  // Group shown items by category for structured layout
  const categoriesWithItems = useMemo(() => {
    if (cat !== "all") {
      const selected = categories.find((c) => c.slug === cat);
      return selected ? [{ ...selected, items: shown }] : [];
    }
    // "all" view: group by category in catalog sort order
    return categories
      .map((c) => ({
        ...c,
        items: shown.filter((i) => i.categorySlug === c.slug),
      }))
      .filter((g) => g.items.length > 0);
  }, [categories, shown, cat]);

  return (
    <div className="space-y-8">
      {/* Sticky Filter Bar */}
      <div className="sticky top-20 z-30 -mx-5 border-b border-line bg-ivory/95 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8 shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-col gap-3.5 lg:flex-row lg:items-center">
          <label className="relative lg:w-80">
            <span className="sr-only">Search salon services</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Search by service or treatment name..."
              className="min-h-11 w-full rounded-full border border-line bg-white pl-11 pr-4 text-sm focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-600/20 shadow-xs"
            />
          </label>

          {/* Category Tabs */}
          <div
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
            role="tablist"
            aria-label="Filter by category"
          >
            <button
              type="button"
              role="tab"
              aria-selected={cat === "all"}
              onClick={() => setCat("all")}
              className={cn(
                "min-h-10 shrink-0 rounded-full border px-4 text-xs sm:text-sm font-medium transition",
                cat === "all"
                  ? "border-plum-800 bg-plum-800 text-ivory shadow-xs"
                  : "border-line bg-white text-plum-900 hover:bg-blush-100"
              )}
            >
              All Categories ({items.length})
            </button>
            {categories.map((c) => {
              const count = items.filter((i) => i.categorySlug === c.slug).length;
              return (
                <button
                  key={c.slug}
                  type="button"
                  role="tab"
                  aria-selected={cat === c.slug}
                  onClick={() => setCat(c.slug)}
                  className={cn(
                    "min-h-10 shrink-0 rounded-full border px-4 text-xs sm:text-sm font-medium transition whitespace-nowrap",
                    cat === c.slug
                      ? "border-plum-800 bg-plum-800 text-ivory shadow-xs"
                      : "border-line bg-white text-plum-900 hover:bg-blush-100"
                  )}
                >
                  {c.name} {count > 0 ? `(${count})` : ""}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-ink-soft lg:ml-auto whitespace-nowrap font-medium" aria-live="polite">
            Showing {shown.length} services
          </p>
        </div>
      </div>

      {/* Structured Category Sections */}
      {categoriesWithItems.map((group) => (
        <section key={group.slug} className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-plum-950">
                {group.name}
              </h2>
              <p className="text-xs text-ink-soft">
                Doorstep verified salon & makeup treatments · Transparent INR pricing
              </p>
            </div>
            <span className="rounded-full bg-blush-100 px-3 py-1 text-xs font-semibold text-plum-800">
              {group.items.length} {group.items.length === 1 ? "Service" : "Services"}
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.items.map((s) => {
              const formattedPrice =
                s.price != null ? `₹${s.price.toLocaleString("en-IN")}` : "Custom Quote";

              return (
                <Card
                  key={s.slug}
                  className="group flex h-full flex-col overflow-hidden border border-line bg-white shadow-soft transition-all duration-300 hover:border-rose-300 hover:shadow-lift"
                >
                  {/* Image area */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-deep">
                    <Link href={`/services/${s.slug}`} className="block h-full w-full">
                      <Photo
                        src={s.image}
                        alt={s.alt}
                        kind={s.categorySlug}
                        seedKey={s.slug}
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </Link>
                    {s.popular && (
                      <Badge tone="gold" className="absolute left-3 top-3 shadow-soft">
                        Most Booked
                      </Badge>
                    )}
                    {s.isPackage && (
                      <Badge tone="plum" className="absolute right-3 top-3 shadow-soft">
                        Combo Package
                      </Badge>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Category */}
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="inline-block rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-rose-700">
                        {s.category}
                      </span>
                      {s.duration && (
                        <span className="flex items-center gap-1 text-[11px] text-ink-soft font-medium">
                          <Clock className="size-3" />
                          <span>{s.duration}</span>
                        </span>
                      )}
                    </div>

                    {/* Service Name */}
                    <Link
                      href={`/services/${s.slug}`}
                      className="group-hover:text-rose-700 transition"
                    >
                      <h3 className="font-serif text-base font-bold text-plum-950 line-clamp-2">
                        {s.title}
                      </h3>
                    </Link>

                    {/* Short Description */}
                    {s.short && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                        {s.short}
                      </p>
                    )}

                    {/* Pricing & Book Now Action */}
                    <div className="mt-auto pt-4 border-t border-line/60 flex items-center justify-between gap-2">
                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                          Starting from
                        </span>
                        <span className="font-serif text-lg font-bold text-plum-950">
                          {formattedPrice}
                        </span>
                      </div>

                      <Link
                        href={`/contact?service=${s.slug}#book`}
                        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-plum-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-soft transition hover:bg-rose-700 active:scale-95"
                      >
                        <span>Book Now</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      {/* Empty State */}
      {shown.length === 0 && (
        <div className="mx-auto mt-16 max-w-md text-center py-12">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-blush-100 text-plum-700/60">
            <SearchX className="size-9" strokeWidth={1.2} />
          </span>
          <h3 className="mt-5 font-serif text-xl font-bold text-plum-950">
            No services match your search
          </h3>
          <p className="mt-2 text-sm text-ink-soft">
            Try a different keyword or select another service category tab.
          </p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCat("all");
            }}
            className="mt-5 rounded-full border border-line bg-white px-5 py-2.5 text-xs font-semibold text-plum-900 shadow-soft hover:bg-blush-100 transition"
          >
            Clear Filters & View All
          </button>
        </div>
      )}
    </div>
  );
}
