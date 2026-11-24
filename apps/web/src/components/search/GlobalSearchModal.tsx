"use client";

import {
  ArrowRight,
  BookOpen,
  Clock,
  CornerDownLeft,
  Flame,
  Layers,
  MessageCircle,
  Package,
  Search,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { buttonStyles, cn } from "@herrglow/ui";

interface SearchService {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  price: number | null;
  offerPrice: number | null;
  duration: string | null;
  image: string | null;
  imageAlt: string | null;
  category: { slug: string; name: string };
}

interface SearchPackage {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  price: number;
  offerPrice: number | null;
  duration: string | null;
  image: string | null;
}

interface SearchBlog {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image: string | null;
}

interface SearchResults {
  services: SearchService[];
  packages: SearchPackage[];
  blogs: SearchBlog[];
  totalCount: number;
}

const TRENDING_SEARCHES = [
  { label: "HD Bridal Makeup", query: "HD Bridal Makeup", emoji: "👰" },
  { label: "Party Makeup & Hair", query: "Party Makeup", emoji: "✨" },
  { label: "Rica Waxing", query: "Rica Wax", emoji: "🌿" },
  { label: "O3+ Glow Facial", query: "O3+ Facial", emoji: "🌸" },
  { label: "Gel Nail Extensions", query: "Gel Nail Extensions", emoji: "💅" },
  { label: "Complete Bridal Package", query: "Complete Bridal Package", emoji: "👑" },
  { label: "Saree & Lehenga Draping", query: "Draping", emoji: "🥻" },
];

const CATEGORY_SHORTCUTS = [
  { name: "Bridal & Party Makeup", slug: "makeup", icon: Sparkles },
  { name: "Salon at Home & Waxing", slug: "salon-at-home", icon: Tag },
  { name: "Facials & Skincare", slug: "facial-skincare", icon: Flame },
  { name: "Hair Treatments & Spa", slug: "hair", icon: Layers },
  { name: "Nails & Extensions", slug: "nails", icon: Sparkles },
];

export function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flatten active items for keyboard navigation
  const allItems = [
    ...(results?.services.map((s) => ({
      type: "service",
      href: `/services/${s.category.slug}/${s.slug}`,
    })) || []),
    ...(results?.packages.map((p) => ({ type: "package", href: `/packages/${p.slug}` })) || []),
    ...(results?.blogs.map((b) => ({ type: "blog", href: `/blog/${b.slug}` })) || []),
  ];

  // Auto-focus input when opened & lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults(null);
      setSelectedIndex(-1);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via custom event or caller
          const btn = document.querySelector<HTMLButtonElement>("[data-search-trigger]");
          btn?.click();
        }
      }
      if (isOpen && e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query execution
  const executeSearch = useCallback((searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data: SearchResults = await res.json();
          setResults(data);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error("Search fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }, 180);
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    executeSearch(val);
  };

  const handleChipClick = (term: string) => {
    setQuery(term);
    executeSearch(term);
    inputRef.current?.focus();
  };

  const handleItemClick = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleViewAll = () => {
    onClose();
    if (query.trim()) {
      router.push(`/services?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/services");
    }
  };

  // Keyboard navigation inside modal (ArrowDown, ArrowUp, Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && allItems[selectedIndex]) {
        handleItemClick(allItems[selectedIndex].href);
      } else {
        handleViewAll();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search HerrGlow luxury salon and bridal services"
      className="fixed inset-0 z-[70] flex items-start justify-center p-3 sm:p-6 md:p-10"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-plum-950/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl border border-line bg-ivory shadow-lift animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Top Search Input Bar */}
        <div className="relative flex items-center border-b border-line bg-white/90 px-4 py-3 sm:px-5 sm:py-4">
          <Search className="size-5 shrink-0 text-rose-600 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search treatments, makeup, waxing, facials, packages..."
            className="w-full bg-transparent text-base sm:text-lg text-plum-950 placeholder:text-ink-soft focus:outline-none"
          />
          {loading && (
            <div className="size-4 shrink-0 rounded-full border-2 border-rose-600 border-t-transparent animate-spin mr-2" />
          )}
          {query && (
            <button
              type="button"
              onClick={() => handleQueryChange("")}
              className="grid size-7 place-items-center rounded-full text-ink-soft hover:bg-blush-100 hover:text-plum-900 transition mr-1"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-xl border border-line bg-blush-50 text-xs font-semibold text-plum-900 hover:bg-blush-100 transition shrink-0 ml-1"
            aria-label="Close modal"
          >
            ESC
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Default State: When Query is empty */}
          {!query.trim() && (
            <div className="space-y-6">
              {/* Trending Searches */}
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 mb-3">
                  <Flame className="size-3.5" /> Popular &amp; Trending
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((t) => (
                    <button
                      key={t.query}
                      type="button"
                      onClick={() => handleChipClick(t.query)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-plum-900 shadow-2xs hover:border-plum-400 hover:bg-blush-50 active:scale-95 transition"
                    >
                      <span>{t.emoji}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Category Shortcuts */}
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 mb-3">
                  <Layers className="size-3.5" /> Browse by Category
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORY_SHORTCUTS.map((c) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => handleItemClick(`/services/${c.slug}`)}
                        className="flex items-center justify-between rounded-xl border border-line/70 bg-white/70 p-3 text-left hover:border-plum-400 hover:bg-white hover:shadow-xs transition group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="grid size-8 place-items-center rounded-lg bg-blush-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition">
                            <Icon className="size-4" />
                          </div>
                          <span className="text-sm font-medium text-plum-900">{c.name}</span>
                        </div>
                        <ArrowRight className="size-4 text-ink-soft opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition text-rose-600" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Results State: When query produces results */}
          {results && results.totalCount > 0 && (
            <div className="space-y-6">
              {/* Services Results */}
              {results.services.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-700 px-1">
                    Services ({results.services.length})
                  </p>
                  <div className="space-y-1.5">
                    {results.services.map((s, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleItemClick(`/services/${s.category.slug}/${s.slug}`)}
                          className={cn(
                            "w-full flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition group",
                            isSelected
                              ? "border-plum-600 bg-blush-100/90 shadow-xs"
                              : "border-line bg-white hover:border-plum-300 hover:bg-blush-50"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {s.image ? (
                              <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-blush-100">
                                <Image
                                  src={s.image}
                                  alt={s.imageAlt || s.title}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-blush-100 text-rose-700">
                                <Sparkles className="size-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-rose-700 line-clamp-1">
                                {s.category.name}
                              </span>
                              <h4 className="text-sm font-bold text-plum-950 truncate group-hover:text-rose-700 transition">
                                {s.title}
                              </h4>
                              {s.duration && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-ink-soft">
                                  <Clock className="size-3" /> {s.duration}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            {s.price && (
                              <div className="text-right">
                                <span className="text-sm font-bold text-plum-950">
                                  ₹{(s.offerPrice ?? s.price).toLocaleString("en-IN")}
                                </span>
                                {s.offerPrice && Number(s.price) > Number(s.offerPrice) && (
                                  <s className="block text-[10px] text-ink-soft">
                                    ₹{Number(s.price).toLocaleString("en-IN")}
                                  </s>
                                )}
                              </div>
                            )}
                            <span
                              className={cn(
                                buttonStyles({ variant: "outline", size: "sm" }),
                                "hidden sm:inline-flex h-8 px-2.5 text-xs text-rose-700 border-rose-300 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 transition"
                              )}
                            >
                              Book <ArrowRight className="size-3 ml-1" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Packages Results */}
              {results.packages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-700 px-1">
                    Combos &amp; Packages ({results.packages.length})
                  </p>
                  <div className="space-y-1.5">
                    {results.packages.map((p, pIdx) => {
                      const overallIdx = results.services.length + pIdx;
                      const isSelected = selectedIndex === overallIdx;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleItemClick(`/packages/${p.slug}`)}
                          className={cn(
                            "w-full flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition group",
                            isSelected
                              ? "border-plum-600 bg-blush-100/90 shadow-xs"
                              : "border-line bg-white hover:border-plum-300 hover:bg-blush-50"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-gold-100 text-gold-800">
                              <Package className="size-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gold-700">
                                High-Savings Bundle
                              </span>
                              <h4 className="text-sm font-bold text-plum-950 truncate group-hover:text-rose-700 transition">
                                {p.title}
                              </h4>
                              {p.duration && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-ink-soft">
                                  <Clock className="size-3" /> {p.duration}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <div className="text-right">
                              <span className="text-sm font-bold text-plum-950">
                                ₹{(p.offerPrice ?? p.price).toLocaleString("en-IN")}
                              </span>
                              {p.offerPrice && Number(p.price) > Number(p.offerPrice) && (
                                <s className="block text-[10px] text-ink-soft">
                                  ₹{Number(p.price).toLocaleString("en-IN")}
                                </s>
                              )}
                            </div>
                            <span
                              className={cn(
                                buttonStyles({ variant: "outline", size: "sm" }),
                                "hidden sm:inline-flex h-8 px-2.5 text-xs text-plum-800 border-plum-300 group-hover:bg-plum-800 group-hover:text-white transition"
                              )}
                            >
                              Explore <ArrowRight className="size-3 ml-1" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Blogs Results */}
              {results.blogs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-700 px-1">
                    Beauty Guides &amp; Blogs ({results.blogs.length})
                  </p>
                  <div className="space-y-1.5">
                    {results.blogs.map((b, bIdx) => {
                      const overallIdx = results.services.length + results.packages.length + bIdx;
                      const isSelected = selectedIndex === overallIdx;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleItemClick(`/blog/${b.slug}`)}
                          className={cn(
                            "w-full flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition group",
                            isSelected
                              ? "border-plum-600 bg-blush-100/90 shadow-xs"
                              : "border-line bg-white hover:border-plum-300 hover:bg-blush-50"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                              <BookOpen className="size-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                                Expert Guide
                              </span>
                              <h4 className="text-sm font-bold text-plum-950 truncate group-hover:text-rose-700 transition">
                                {b.title}
                              </h4>
                              {b.excerpt && (
                                <p className="text-[11px] text-ink-soft truncate">{b.excerpt}</p>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="size-4 text-ink-soft group-hover:text-rose-600 group-hover:translate-x-0.5 transition shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State: Query typed but 0 results */}
          {query.trim() && results && results.totalCount === 0 && !loading && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-blush-100 text-rose-700">
                <Search className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-plum-950">
                  No matches found for &ldquo;{query}&rdquo;
                </h3>
                <p className="text-xs text-ink-soft max-w-sm mx-auto">
                  Try checking your spelling or search for popular terms like <em>Rica Wax</em>,{" "}
                  <em>Bridal Makeup</em>, <em>O3+ Facial</em>, or <em>Nail Art</em>.
                </p>
              </div>

              {/* Direct Help / WhatsApp CTA */}
              <div className="pt-2">
                <a
                  href="https://wa.me/919319260069?text=Hi%20HerrGlow%2C%20I%20am%20looking%20for%20a%20service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonStyles({ variant: "shimmer", size: "sm" }),
                    "inline-flex items-center gap-2 text-xs"
                  )}
                >
                  <MessageCircle className="size-4" /> Ask our Beauty Advisor on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky Bar */}
        <div className="border-t border-line bg-white px-4 py-3 sm:px-5 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="rounded border border-line bg-blush-50 px-1.5 py-0.5 font-semibold text-plum-900">
                ↑↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="rounded border border-line bg-blush-50 px-1.5 py-0.5 font-semibold text-plum-900">
                <CornerDownLeft className="size-2.5 inline" />
              </kbd>
              <span>to select</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-line bg-blush-50 px-1.5 py-0.5 font-semibold text-plum-900">
                ESC
              </kbd>
              <span>to close</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleViewAll}
            className="font-medium text-rose-700 hover:text-rose-800 transition inline-flex items-center gap-1"
          >
            <span>View all in Services Explorer</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
