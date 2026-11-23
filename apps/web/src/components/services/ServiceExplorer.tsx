"use client";

import {
  Clock,
  Search,
  SearchX,
  Sparkles,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Tag,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Card, cn } from "@herrglow/ui";
import { Photo } from "@/components/Photo";

export interface ExplorerVariant {
  name: string;
  price: number | null;
}

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
  variants?: ExplorerVariant[];
}

const SUB_CATEGORIES_BY_CAT: Record<string, { id: string; label: string; keywords: string[] }[]> = {
  waxing: [
    { id: "all", label: "All Waxing", keywords: [] },
    { id: "rica", label: "Rica Wax (Painless & Anti-Tan)", keywords: ["rica", "white chocolate", "aloe"] },
    { id: "honey", label: "Honey / Regular Wax", keywords: ["honey", "regular"] },
    { id: "combos", label: "Full Body & Combos", keywords: ["full body", "combo", "arms", "legs"] },
    { id: "bikini", label: "Bikini & Brazilian", keywords: ["bikini", "brazilian", "peel-off"] },
  ],
  "facial-and-skincare": [
    { id: "all", label: "All Skincare", keywords: [] },
    { id: "o3", label: "O3+ Brightening & Glow", keywords: ["o3", "power oxygen", "sea white"] },
    { id: "cleanups", label: "Express Cleanups", keywords: ["cleanup", "clean-up", "fruit", "instant"] },
    { id: "anti-tan", label: "Anti-Tan & Detox", keywords: ["tan", "sara oxy", "cheryl", "detox"] },
    { id: "derma", label: "Hydra & Luxury Derma", keywords: ["hydra", "derma", "gold", "lotus"] },
    { id: "threading", label: "Threading & Face Wax", keywords: ["threading", "eyebrow", "upper lip", "forehead"] },
  ],
  "hair-styling": [
    { id: "all", label: "All Hair Care", keywords: [] },
    { id: "blowdry", label: "Blow Dry & Waves", keywords: ["blow dry", "waves", "curls"] },
    { id: "buns", label: "Bridal & Floral Buns", keywords: ["bun", "hairdo", "floral", "braid"] },
    { id: "spa", label: "Nourishing Hair Spas", keywords: ["spa", "mythic", "biolage", "scalp"] },
    { id: "smoothing", label: "Keratin & Botox Smoothing", keywords: ["keratin", "botox", "smoothing", "treatment"] },
  ],
  "bridal-makeup": [
    { id: "all", label: "All Bridal Makeup", keywords: [] },
    { id: "hd", label: "HD Bridal Makeovers", keywords: ["hd", "mac", "signature"] },
    { id: "airbrush", label: "Airbrush Waterproof Bridal", keywords: ["airbrush", "temptu", "sweat-proof"] },
    { id: "packages", label: "Complete Wedding Packages", keywords: ["package", "complete", "bundle", "multi-function"] },
    { id: "regional", label: "Traditional & Regional", keywords: ["traditional", "punjabi", "muslim", "south indian", "bengali"] },
  ],
  "engagement-party-makeup": [
    { id: "all", label: "All Party Glam", keywords: [] },
    { id: "day", label: "Day & Subtle Glow", keywords: ["day", "subtle", "nude", "birthday"] },
    { id: "evening", label: "Evening & Cocktail HD", keywords: ["evening", "cocktail", "sangeet", "reception", "hd"] },
    { id: "engagement", label: "Engagement & Roka", keywords: ["engagement", "roka", "haldi", "mehndi"] },
    { id: "family", label: "Bridesmaid & Family Combos", keywords: ["family", "bridesmaid", "group", "guest"] },
  ],
  "nail-art": [
    { id: "all", label: "All Hand & Feet", keywords: [] },
    { id: "mani-pedi", label: "Deluxe Mani-Pedi", keywords: ["manicure", "pedicure", "mani-pedi", "combo"] },
    { id: "spa-pedi", label: "Aroma & Jelly Spas", keywords: ["aroma", "jelly", "crystal", "callus"] },
    { id: "extensions", label: "Gel Nail Extensions", keywords: ["gel", "extensions", "acrylic", "tips"] },
    { id: "art", label: "French Ombre & Custom Art", keywords: ["art", "ombre", "chrome", "3d"] },
  ],
  "draping-eye-mehndi": [
    { id: "all", label: "All Services", keywords: [] },
    { id: "draping", label: "Saree & Lehenga Draping", keywords: ["draping", "saree", "lehenga", "dupatta"] },
    { id: "mehndi", label: "Guest & Bridal Mehndi", keywords: ["mehndi", "mehendi", "henna"] },
    { id: "eye", label: "Eye Makeup & Lashes", keywords: ["eye", "lash", "lashes", "extension"] },
  ],
  "pre-bridal-packages": [
    { id: "all", label: "All Packages", keywords: [] },
    { id: "express", label: "1-Day Express Glow", keywords: ["haldi", "essential", "express", "silver"] },
    { id: "multi", label: "2-3 Day Complete Bridal Care", keywords: ["luxury", "complete", "ultra-radiance", "gold", "platinum"] },
  ],
};

const AREA_INFO: Record<string, { label: string; tag: string; discountPct: number; highlight: string }> = {
  all: {
    label: "All Delhi NCR",
    tag: "Delhi NCR Coverage",
    discountPct: 0,
    highlight: "Free doorstep artist arrival across Noida, Greater Noida, and Delhi with sanitized tools & setup.",
  },
  noida: {
    label: "Noida (Sectors 18, 50, 62, 76, 137)",
    tag: "Noida Verified Hub",
    discountPct: 0,
    highlight: "Verified senior beauticians available in 60-90 mins across Noida. Zero travel charges.",
  },
  "greater-noida": {
    label: "Greater Noida (Gaur City, Pari Chowk, Sec 1)",
    tag: "Society Special Rates (-5%)",
    discountPct: -5,
    highlight: "Special high-density residential society rates for Gaur City 1 & 2, Pari Chowk, and Greater Noida West.",
  },
  delhi: {
    label: "Delhi (South Delhi, Dwarka, Vasant Kunj)",
    tag: "Concierge Luxury Hub",
    discountPct: 5,
    highlight: "Premium bridal and luxury salon concierge across South Delhi, Vasant Kunj, Dwarka, and Rohini.",
  },
};

export function ServiceExplorer({
  items,
  categories,
  cities = [],
}: {
  items: ExplorerItem[];
  categories: { slug: string; name: string }[];
  cities?: { slug: string; name: string }[];
}) {
  const [cat, setCat] = useState("all");
  const [subCat, setSubCat] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [q, setQ] = useState("");

  // Sub-categories available for current category selection
  const availableSubCats = useMemo(() => {
    if (cat === "all") return [];
    return SUB_CATEGORIES_BY_CAT[cat] ?? [];
  }, [cat]);

  // When top category changes, reset sub-category
  const handleCatChange = (newCat: string) => {
    setCat(newCat);
    setSubCat("all");
  };

  const areaMeta = AREA_INFO[selectedArea] ?? AREA_INFO.all!;

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return items.filter((i) => {
      // 1. Top Category filter
      if (cat !== "all" && i.categorySlug !== cat) return false;

      // 2. Search query filter
      if (
        needle &&
        !`${i.title} ${i.category} ${i.short ?? ""} ${i.variants?.map((v) => v.name).join(" ") ?? ""}`
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }

      // 3. Sub-category filter
      if (subCat !== "all" && availableSubCats.length > 0) {
        const activeSub = availableSubCats.find((s) => s.id === subCat);
        if (activeSub && activeSub.keywords.length > 0) {
          const matchTarget = `${i.title} ${i.short ?? ""} ${i.variants?.map((v) => v.name).join(" ") ?? ""}`.toLowerCase();
          const matchesKeyword = activeSub.keywords.some((k) => matchTarget.includes(k.toLowerCase()));
          if (!matchesKeyword) return false;
        }
      }

      return true;
    });
  }, [items, cat, subCat, q, availableSubCats]);

  // Group shown items by category for structured layout
  const categoriesWithItems = useMemo(() => {
    if (cat !== "all") {
      const selected = categories.find((c) => c.slug === cat);
      return selected ? [{ ...selected, items: shown }] : [];
    }
    return categories
      .map((c) => ({
        ...c,
        items: shown.filter((i) => i.categorySlug === c.slug),
      }))
      .filter((g) => g.items.length > 0);
  }, [categories, shown, cat]);

  // Helper to adjust price per area
  const calculateAreaPrice = (basePrice: number | null): number | null => {
    if (!basePrice) return null;
    if (areaMeta.discountPct === 0) return basePrice;
    const adjusted = basePrice * (1 + areaMeta.discountPct / 100);
    return Math.round(adjusted / 10) * 10;
  };

  return (
    <div className="space-y-8">
      {/* Sticky Filter & Area Bar */}
      <div className="sticky top-20 z-30 -mx-5 border-b border-line bg-ivory/95 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8 shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-col gap-3.5">
          {/* Top Row: Search + Area Selector */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative lg:w-80">
              <span className="sr-only">Search salon services</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="search"
                placeholder="Search services (e.g., Rica Wax, O3+ Facial, HD Bridal)..."
                className="min-h-11 w-full rounded-full border border-line bg-white pl-11 pr-4 text-sm focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-600/20 shadow-xs"
              />
            </label>

            {/* Area Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-plum-900">
                <MapPin className="size-3.5 text-rose-600" />
                <span>Your Location:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "All Delhi NCR" },
                  { id: "noida", label: "Noida" },
                  { id: "greater-noida", label: "Greater Noida & Gaur City" },
                  { id: "delhi", label: "Delhi" },
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedArea(a.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition",
                      selectedArea === a.id
                        ? "bg-rose-700 text-white shadow-xs"
                        : "border border-line bg-white text-plum-900 hover:bg-blush-100"
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Area Guarantee Reassurance Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200/80 bg-rose-50/70 px-3.5 py-2 text-xs text-plum-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span>
                <strong>{areaMeta.tag}:</strong> {areaMeta.highlight}
              </span>
            </div>
            <span className="font-semibold text-rose-700">Zero Travel Surcharge</span>
          </div>

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
              onClick={() => handleCatChange("all")}
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
                  onClick={() => handleCatChange(c.slug)}
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

          {/* Sub-Category Chips (Active when a specific category is selected) */}
          {availableSubCats.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-line/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 mr-1 flex items-center gap-1">
                <Tag className="size-3" />
                <span>Sub-Categories:</span>
              </span>
              {availableSubCats.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSubCat(sub.id)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-medium transition",
                    subCat === sub.id
                      ? "bg-plum-900 text-gold-300 font-semibold shadow-xs"
                      : "bg-white text-plum-900 border border-line hover:bg-blush-100"
                  )}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
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
                Verified doorstep treatments for {areaMeta.label} · 100% authentic products
              </p>
            </div>
            <span className="rounded-full bg-blush-100 px-3 py-1 text-xs font-semibold text-plum-800">
              {group.items.length} {group.items.length === 1 ? "Service" : "Services"}
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.items.map((s) => {
              const effectivePrice = calculateAreaPrice(s.price);
              const formattedPrice =
                effectivePrice != null
                  ? `₹${effectivePrice.toLocaleString("en-IN")}`
                  : "Custom Quote";

              return (
                <Card
                  key={s.slug}
                  className="group flex h-full flex-col overflow-hidden border border-line bg-white shadow-soft transition-all duration-300 hover:border-rose-300 hover:shadow-lift"
                >
                  {/* Image area */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-deep">
                    <Link href={`/services/${s.categorySlug}/${s.slug}`} className="block h-full w-full">
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
                    {/* Category & Duration */}
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
                      href={`/services/${s.categorySlug}/${s.slug}`}
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

                    {/* Sub-Category Options Pills Preview */}
                    {s.variants && s.variants.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                          Available Options / Types:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {s.variants.slice(0, 3).map((v) => {
                            const optPrice = calculateAreaPrice(v.price);
                            return (
                              <span
                                key={v.name}
                                className="inline-flex items-center rounded-md bg-blush-50/90 px-2 py-0.5 text-[10px] text-plum-900 border border-line/60"
                              >
                                {v.name.split("(")[0]?.trim()}
                                {optPrice ? ` · ₹${optPrice.toLocaleString("en-IN")}` : ""}
                              </span>
                            );
                          })}
                          {s.variants.length > 3 && (
                            <span className="text-[10px] font-semibold text-rose-700 self-center pl-1">
                              +{s.variants.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pricing & Book Now Action */}
                    <div className="mt-auto pt-4 border-t border-line/60 flex items-center justify-between gap-2">
                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                          Starting in {selectedArea === "all" ? "NCR" : areaMeta.label.split(" ")[0]}
                        </span>
                        <span className="font-serif text-lg font-bold text-plum-950">
                          {formattedPrice}
                        </span>
                      </div>

                      <Link
                        href={`/services/${s.categorySlug}/${s.slug}#book`}
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
            Try a different keyword or clear your sub-category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setCat("all");
              setSubCat("all");
              setQ("");
            }}
            className="mt-4 rounded-full border border-plum-800 bg-plum-800 px-5 py-2 text-xs font-semibold text-ivory hover:bg-rose-700 transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
