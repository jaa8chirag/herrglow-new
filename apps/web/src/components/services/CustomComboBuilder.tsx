"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Clock,
  Gift,
  HelpCircle,
  Plus,
  RefreshCw,
  Scissors,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wallet,
  Zap,
} from "lucide-react";
import { Badge, Card, buttonStyles, cn } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";

export interface ComboItem {
  id: string;
  slug: string;
  title: string;
  category: "face" | "waxing" | "facial" | "hands-feet" | "hair";
  categoryLabel: string;
  price: number;
  duration: string;
  isAddon?: boolean;
}

const POPULAR_COMBO_SERVICES: ComboItem[] = [
  // Face & Grooming
  { id: "eb-thread", slug: "eyebrow-threading", title: "Eyebrow Threading", category: "face", categoryLabel: "Face & Grooming", price: 49, duration: "10 min", isAddon: true },
  { id: "ul-thread", slug: "upper-lip-threading", title: "Upper Lip Threading / Wax", category: "face", categoryLabel: "Face & Grooming", price: 49, duration: "5 min", isAddon: true },
  { id: "fh-thread", slug: "forehead-threading", title: "Forehead Threading", category: "face", categoryLabel: "Face & Grooming", price: 39, duration: "5 min", isAddon: true },
  { id: "chin-wax", slug: "chin-wax", title: "Chin Wax (Peel-Off)", category: "face", categoryLabel: "Face & Grooming", price: 49, duration: "5 min", isAddon: true },
  { id: "ff-thread", slug: "full-face-threading", title: "Full Face Threading", category: "face", categoryLabel: "Face & Grooming", price: 179, duration: "25 min" },
  { id: "ff-wax", slug: "full-face-wax", title: "Full Face Wax (Peel-Off)", category: "face", categoryLabel: "Face & Grooming", price: 279, duration: "30 min" },

  // Waxing (Honey Regular & Rica Liposoluble)
  { id: "ua-wax", slug: "underarms-waxing", title: "Underarms Waxing", category: "waxing", categoryLabel: "Waxing", price: 99, duration: "10 min", isAddon: true },
  { id: "ua-wax-rica", slug: "underarms-waxing", title: "Rica Underarms Waxing", category: "waxing", categoryLabel: "Waxing", price: 149, duration: "10 min", isAddon: true },
  { id: "fa-wax", slug: "full-arms-waxing", title: "Full Arms Waxing (Honey)", category: "waxing", categoryLabel: "Waxing", price: 299, duration: "25 min" },
  { id: "fa-wax-rica", slug: "full-arms-waxing", title: "Full Arms Waxing (Rica White Chocolate)", category: "waxing", categoryLabel: "Waxing", price: 449, duration: "25 min" },
  { id: "fl-wax", slug: "full-legs-waxing", title: "Full Legs Waxing (Honey)", category: "waxing", categoryLabel: "Waxing", price: 399, duration: "35 min" },
  { id: "fl-wax-rica", slug: "full-legs-waxing", title: "Full Legs Waxing (Rica White Chocolate)", category: "waxing", categoryLabel: "Waxing", price: 599, duration: "35 min" },
  { id: "hl-wax", slug: "half-legs-waxing", title: "Half Legs Waxing", category: "waxing", categoryLabel: "Waxing", price: 249, duration: "20 min" },
  { id: "fb-wax", slug: "full-body-waxing", title: "Full Body Waxing Combo", category: "waxing", categoryLabel: "Waxing", price: 1199, duration: "75 min" },
  { id: "fb-wax-rica", slug: "full-body-waxing", title: "Rica Liposoluble Full Body Wax", category: "waxing", categoryLabel: "Waxing", price: 1899, duration: "75 min" },
  { id: "detan-face", slug: "face-neck-detan", title: "Face & Neck Herbal De-Tan Pack", category: "waxing", categoryLabel: "Waxing", price: 299, duration: "20 min" },

  // Facials & Cleanup
  { id: "fruit-clean", slug: "fruit-cleanup", title: "Fruit Glow Face Cleanup", category: "facial", categoryLabel: "Facials & Cleanup", price: 399, duration: "35 min" },
  { id: "antitan-clean", slug: "anti-tan-cleanup", title: "Anti-Tan Brightening Cleanup", category: "facial", categoryLabel: "Facials & Cleanup", price: 449, duration: "40 min" },
  { id: "kumkumadi-fac", slug: "kumkumadi-ubtan-facial", title: "Kumkumadi Herbal Ubtan Facial", category: "facial", categoryLabel: "Facials & Cleanup", price: 799, duration: "50 min" },
  { id: "korean-fac", slug: "korean-glass-skin-facial", title: "Korean Glass Skin Facial", category: "facial", categoryLabel: "Facials & Cleanup", price: 1299, duration: "60 min" },
  { id: "o3-fac", slug: "o3-facial", title: "O3+ Radiance Bridal Glow Facial", category: "facial", categoryLabel: "Facials & Cleanup", price: 1499, duration: "60 min" },

  // Hands & Feet
  { id: "cfp-hands", slug: "cut-file-polish-hands", title: "Cut, File & Polish - Hands", category: "hands-feet", categoryLabel: "Hands & Feet", price: 199, duration: "15 min" },
  { id: "cfp-feet", slug: "cut-file-polish-feet", title: "Cut, File & Polish - Feet", category: "hands-feet", categoryLabel: "Hands & Feet", price: 249, duration: "20 min" },
  { id: "spa-mani", slug: "classic-manicure", title: "Classic Spa Manicure", category: "hands-feet", categoryLabel: "Hands & Feet", price: 499, duration: "40 min" },
  { id: "spa-pedi", slug: "classic-pedicure", title: "Classic Spa Pedicure", category: "hands-feet", categoryLabel: "Hands & Feet", price: 599, duration: "45 min" },
  { id: "hf-massage", slug: "foot-massage", title: "Relaxing Hand & Foot Massage", category: "hands-feet", categoryLabel: "Hands & Feet", price: 299, duration: "20 min" },

  // Hair & Styling
  { id: "hair-trim", slug: "hair-trim", title: "Hair Trim & Split Ends Cut", category: "hair", categoryLabel: "Hair & Styling", price: 299, duration: "25 min" },
  { id: "saree-drap", slug: "saree-draping", title: "Saree / Dupatta Draping", category: "hair", categoryLabel: "Hair & Styling", price: 499, duration: "25 min" },
  { id: "hair-style", slug: "hair-styling", title: "Party Hair Styling (Curls / Waves)", category: "hair", categoryLabel: "Hair & Styling", price: 799, duration: "45 min" },
];

const MINIMUM_ORDER_VALUE = 499;
const BUNDLE_DISCOUNT_THRESHOLD = 999;
const BUNDLE_DISCOUNT_PERCENT = 0.1; // 10% off for carts >= 999

export function CustomComboBuilder({
  cities = [],
}: {
  cities?: { slug: string; name: string }[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(["eb-thread", "fruit-clean"]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showBookingForm, setShowBookingForm] = useState(false);

  const selectedItems = useMemo(
    () => POPULAR_COMBO_SERVICES.filter((s) => selectedIds.includes(s.id)),
    [selectedIds]
  );

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price, 0),
    [selectedItems]
  );

  const discount = useMemo(() => {
    if (subtotal >= BUNDLE_DISCOUNT_THRESHOLD) {
      return Math.round(subtotal * BUNDLE_DISCOUNT_PERCENT);
    }
    return 0;
  }, [subtotal]);

  const finalAmount = Math.max(0, subtotal - discount);
  const isThresholdMet = subtotal >= MINIMUM_ORDER_VALUE;
  const remainingForThreshold = Math.max(0, MINIMUM_ORDER_VALUE - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / MINIMUM_ORDER_VALUE) * 100));

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredServices = useMemo(() => {
    if (activeCategory === "all") return POPULAR_COMBO_SERVICES;
    return POPULAR_COMBO_SERVICES.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  const customComboTitle = useMemo(() => {
    if (!selectedItems.length) return "Custom Salon Combo";
    if (selectedItems.length === 1) return `Custom Combo: ${selectedItems[0]?.title}`;
    return `Custom Combo (${selectedItems.length} Services: ${selectedItems.map((s) => s.title).join(", ")})`;
  }, [selectedItems]);

  const handleProceedToBook = () => {
    setShowBookingForm(true);
    const formEl = document.getElementById("custom-combo-book");
    formEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-10">
      {/* ───────── Hero Value Proposition ───────── */}
      <div className="rounded-3xl border border-gold-400/40 bg-gradient-to-br from-plum-950 via-plum-900 to-plum-950 p-6 sm:p-10 text-ivory shadow-lift text-center relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gold-400/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-20 -bottom-20 size-64 rounded-full bg-rose-600/20 blur-3xl" />

        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/40 bg-white/10 px-4 py-1 text-xs font-semibold text-gold-300 backdrop-blur-md">
          <Sparkles className="size-3.5" /> 100% Flexible Doorstep Pampering
        </span>
        <h1 className="mt-4 font-serif text-3xl sm:text-5xl font-normal text-ivory leading-tight">
          Make Your Own Custom Combo
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-blush-100/90 leading-relaxed">
          Pick any combination of eyebrow threading, waxing, facial cleanups, or mani-pedi treatments.
          Reach <strong>₹499</strong> to unlock <strong>100% Free Doorstep Visit</strong>, plus get an extra <strong>10% OFF</strong> on combos ₹999+.
        </p>

        {/* 3 Guarantees Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-gold-200">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
            <ShieldCheck className="size-3.5 text-emerald-400" /> 100% Female Verified Beauticians
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
            <Sparkles className="size-3.5 text-gold-400" /> Professional &amp; Hygienic Setup
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
            <Wallet className="size-3.5 text-emerald-400" /> Only 10% Advance Deposit
          </span>
        </div>
      </div>

      {/* ───────── 2-Column Interactive Layout ───────── */}
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] items-start">
        {/* Left Column: Category Filter & Services Grid */}
        <div className="space-y-6">
          {/* Bestseller Monthly Package Shortcut Banner */}
          <div className="rounded-2xl border border-gold-400/60 bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 p-4 text-ivory shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 rounded-md bg-gold-400/20 border border-gold-400/40 px-2 py-0.5 text-[10px] font-bold text-gold-300">
                <Sparkles className="size-3 text-gold-400" /> Bestseller Pre-Built Combo
              </span>
              <h4 className="font-serif text-sm font-bold text-white">
                Monthly Grooming Essentials Package @ ₹999
              </h4>
              <p className="text-[11px] text-blush-100/80 leading-snug">
                Full Arms + Full Legs + Underarms Waxing, Eyebrow &amp; Upper Lip Threading + Fruit Glow Cleanup.
              </p>
            </div>
            <Link
              href="/services/waxing/monthly-grooming-essentials-package"
              className={cn(buttonStyles({ variant: "shimmer", size: "sm" }), "shrink-0 text-xs font-bold w-full sm:w-auto")}
            >
              Book Package @ ₹999 →
            </Link>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pb-2">
            {[
              { id: "all", label: "All Services" },
              { id: "face", label: "Face & Threading" },
              { id: "waxing", label: "Waxing" },
              { id: "facial", label: "Facials & Cleanup" },
              { id: "hands-feet", label: "Hands & Feet" },
              { id: "hair", label: "Hair & Styling" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer",
                  activeCategory === tab.id
                    ? "bg-plum-900 text-white shadow-soft"
                    : "border border-line bg-white text-plum-900 hover:bg-blush-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredServices.map((svc) => {
              const isSelected = selectedIds.includes(svc.id);
              return (
                <div
                  key={svc.id}
                  onClick={() => toggleItem(svc.id)}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-2xl border p-4 transition cursor-pointer select-none",
                    isSelected
                      ? "border-plum-800 bg-blush-50/90 shadow-soft ring-2 ring-plum-700/20"
                      : "border-line bg-white hover:border-plum-300 hover:bg-blush-50/40"
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">
                        {svc.categoryLabel}
                      </span>
                      {svc.isAddon && (
                        <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[9px] font-bold">
                          Add-on Item
                        </span>
                      )}
                    </div>
                    <h4 className="mt-1 font-serif text-sm font-bold text-plum-950 group-hover:text-rose-800 transition">
                      {svc.title}
                    </h4>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-soft">
                      <Clock className="size-3" />
                      <span>{svc.duration}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
                    <span className="font-bold text-base text-plum-950">
                      ₹{svc.price.toLocaleString("en-IN")}
                    </span>

                    <button
                      type="button"
                      aria-label={isSelected ? `Remove ${svc.title}` : `Add ${svc.title}`}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition",
                        isSelected
                          ? "bg-plum-900 text-white shadow-xs"
                          : "border border-plum-700/30 bg-white text-plum-900 group-hover:bg-plum-900 group-hover:text-white"
                      )}
                    >
                      {isSelected ? (
                        <>
                          <Check className="size-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="size-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Sticky Live Custom Combo Basket */}
        <div className="lg:sticky lg:top-28 space-y-5">
          <div className="rounded-3xl border-2 border-gold-400/60 bg-white p-5 sm:p-6 shadow-lift space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-plum-950">Your Custom Basket</h3>
                <p className="text-xs text-ink-soft">
                  {selectedItems.length} service{selectedItems.length === 1 ? "" : "s"} selected
                </p>
              </div>

              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="size-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Minimum Order Value Progress Bar */}
            <div className="rounded-2xl border border-line bg-blush-50/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-plum-950">
                  {isThresholdMet ? "🎉 Minimum ₹499 Reached!" : "Minimum Booking Goal: ₹499"}
                </span>
                <span className="font-bold text-plum-900">
                  ₹{subtotal} / ₹{MINIMUM_ORDER_VALUE}
                </span>
              </div>

              {/* Bar track */}
              <div className="h-2.5 w-full rounded-full bg-stone-200 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    isThresholdMet ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-rose-500 to-amber-500"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Status Notice */}
              {isThresholdMet ? (
                <p className="text-[11px] font-medium text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                  <span>100% Free Doorstep Travel Unlocked across Delhi NCR!</span>
                </p>
              ) : (
                <p className="text-[11px] font-medium text-rose-800">
                  Add <strong>₹{remainingForThreshold}</strong> more to meet the ₹499 minimum doorstep visit.
                </p>
              )}
            </div>

            {/* 10% Bundle Discount Banner if >= 999 */}
            {subtotal >= BUNDLE_DISCOUNT_THRESHOLD && (
              <div className="rounded-2xl border border-gold-400/80 bg-gradient-to-r from-gold-50 via-white to-gold-50/80 p-3 text-xs text-gold-950 flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-xl bg-gold-400 text-plum-950 shrink-0 font-bold">
                  <Gift className="size-4" />
                </span>
                <div>
                  <p className="font-bold text-plum-950">10% Custom Bundle Discount Applied!</p>
                  <p className="text-[11px] text-ink-soft">
                    You saved ₹{discount.toLocaleString("en-IN")} on this visit.
                  </p>
                </div>
              </div>
            )}

            {/* Selected Items List */}
            {selectedItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-soft space-y-1">
                <Sparkles className="mx-auto size-8 text-gold-400/60" />
                <p className="font-semibold text-plum-950">Your custom combo is empty</p>
                <p>Click &quot;+ Add&quot; on any services on the left to start building.</p>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 divide-y divide-line/40">
                {selectedItems.map((item) => (
                  <div key={item.id} className="pt-2 flex items-center justify-between text-xs gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-plum-950 truncate">{item.title}</p>
                      <p className="text-[10px] text-ink-soft">{item.duration}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-plum-900">₹{item.price}</span>
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className="text-stone-400 hover:text-rose-700 p-0.5 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bill Summary */}
            {selectedItems.length > 0 && (
              <div className="border-t border-line pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-ink-soft">
                  <span>Selected Services Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>10% Combo Savings</span>
                    <span>-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-ink-soft">
                  <span>Doorstep Travel &amp; Hygienic Setup</span>
                  <span className="text-emerald-700 font-bold uppercase text-[10px]">FREE</span>
                </div>
                <div className="flex justify-between border-t border-line/80 pt-2 text-sm font-bold text-plum-950">
                  <span>Final Amount</span>
                  <span className="text-lg">₹{finalAmount.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-[11px] text-emerald-800 font-medium pt-1">
                  Only 10% Advance Deposit (₹{Math.round(finalAmount * 0.1).toLocaleString("en-IN")}) to lock your artist.
                </p>
              </div>
            )}

            {/* Book Now Button */}
            <button
              type="button"
              disabled={!isThresholdMet}
              onClick={handleProceedToBook}
              className={cn(
                buttonStyles({ variant: isThresholdMet ? "shimmer" : "outline", size: "lg" }),
                "w-full font-bold text-sm",
                !isThresholdMet && "opacity-60 cursor-not-allowed bg-stone-100 border-stone-300 text-stone-500"
              )}
            >
              {isThresholdMet
                ? `Book Custom Combo (₹${finalAmount.toLocaleString("en-IN")}) →`
                : `Add ₹${remainingForThreshold} More to Book`}
            </button>
          </div>

          {/* Pre-built Combos Shortcut Box */}
          <div className="rounded-2xl border border-line bg-blush-50/70 p-4 text-xs text-plum-950 space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-rose-800">
              <Zap className="size-3.5 text-gold-500 fill-gold-500" />
              Prefer a Pre-made Combo?
            </p>
            <p className="text-ink-soft">
              Check out our pre-packaged combos with top rated treatments already bundled:
            </p>
            <div className="flex flex-col gap-1.5 pt-1">
              <Link
                href="/services/face-hair-removal/full-face-grooming-glow-combo"
                className="font-medium text-rose-700 hover:underline flex items-center justify-between"
              >
                <span>Full Face Grooming &amp; Glow Combo</span>
                <span className="font-bold">₹499</span>
              </Link>
              <Link
                href="/services/waxing/express-wax-glow-combo"
                className="font-medium text-rose-700 hover:underline flex items-center justify-between"
              >
                <span>Express Wax &amp; Glow Essentials</span>
                <span className="font-bold">₹649</span>
              </Link>
              <Link
                href="/services/manicure-pedicure/head-to-toe-pamper-combo"
                className="font-medium text-rose-700 hover:underline flex items-center justify-between"
              >
                <span>Head-to-Toe Pamper &amp; Glow Combo</span>
                <span className="font-bold">₹899</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ───────── Embedded 4-Step Booking Form (when threshold met) ───────── */}
      {showBookingForm && isThresholdMet && (
        <div id="custom-combo-book" className="scroll-mt-24 pt-8 border-t border-line space-y-4">
          <div className="text-center max-w-xl mx-auto">
            <span className="rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 uppercase tracking-wide">
              Step 2: Confirm Appointment
            </span>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-plum-950">
              Finalize Your Custom Combo Booking
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ink-soft">
              Enter your address and preferred time slot. We will assign the nearest verified female beautician.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <BookingForm
              cities={cities}
              sourcePath="/custom-combo"
              service={{
                slug: "custom-combo",
                title: customComboTitle,
                variants: [{ name: "Custom Combo", price: finalAmount }],
                addons: selectedItems.map((s) => ({ name: s.title, price: s.price })),
              }}
              initialMessage={`Custom Combo Booking: ${selectedItems.map((s) => `${s.title} (₹${s.price})`).join(" + ")}. Final Total: ₹${finalAmount}.`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
