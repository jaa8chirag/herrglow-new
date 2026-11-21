"use client";

import { useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@herrglow/ui";

interface LookItem {
  id: string;
  title: string;
  tone: "wheatish" | "dusky" | "fair";
  toneLabel: string;
  occasion: string;
  description: string;
  products: string;
  highlights: string[];
}

const LOOKS: LookItem[] = [
  {
    id: "look-1",
    title: "Royal Heritage Bridal Glam",
    tone: "wheatish",
    toneLabel: "Warm / Wheatish Skin",
    occasion: "Traditional Pheras & Wedding",
    description: "Sabyasachi-inspired warm golden lids with a timeless velvet red lip. Base calibrated for zero flashback under professional flash photography.",
    products: "MAC Studio Fix · Kryolan Derma · Huda Beauty Rose Quartz",
    highlights: ["Zero white cast / flashback", "16-hour sweat-proof", "Real skin texture visible"],
  },
  {
    id: "look-2",
    title: "Soft Dewy Pastel Radiance",
    tone: "dusky",
    toneLabel: "Dusky / Deep Skin",
    occasion: "Day Wedding & Anand Karaj",
    description: "Flawlessly matched deep golden undertones. Never grey or chalky. Emphasizes natural skin glow with warm bronze lids and glossy nude lips.",
    products: "NARS Sheer Glow · Charlotte Tilbury Filter · Fenty Beauty Gloss",
    highlights: ["No grey or ashy undertone", "Natural glass-skin hydration", "Featherweight feel"],
  },
  {
    id: "look-3",
    title: "Cocktail Smoky & Sculpted Glam",
    tone: "fair",
    toneLabel: "Fair / Golden Skin",
    occasion: "Sangeet, Cocktail & Reception",
    description: "Soft metallic bronze smoky eye paired with sculpted cheekbones and an overline nude pout. Built to last through long hours of dancing.",
    products: "Anastasia Beverly Hills · Dior Backstage · Too Faced Born This Way",
    highlights: ["Crease-proof eye makeup", "Transfer-resistant lipstick", "High-def contouring"],
  },
  {
    id: "look-4",
    title: "Fresh Haldi & Mehendi Glow",
    tone: "wheatish",
    toneLabel: "Warm / Wheatish Skin",
    occasion: "Haldi & Mehendi Ceremonies",
    description: "Breathable, lightweight tinted base with fresh coral-pink cheeks and waterproof defined lashes that withstand heat, humidity, and turmeric splashes.",
    products: "Rare Beauty Soft Pinch · Benefit Benetint · Bobbi Brown Long-Wear",
    highlights: ["Waterproof & humidity-proof", "Minimal effortless look", "Skin-breathable finish"],
  },
];

const TONE_FILTERS = [
  { id: "all", label: "All Complexions" },
  { id: "wheatish", label: "Warm / Wheatish" },
  { id: "dusky", label: "Dusky / Deep" },
  { id: "fair", label: "Fair / Porcelain" },
] as const;

type ToneFilterId = (typeof TONE_FILTERS)[number]["id"];

export function RealLooksGallery() {
  const [activeTone, setActiveTone] = useState<ToneFilterId>("all");

  const filtered = activeTone === "all" ? LOOKS : LOOKS.filter((l) => l.tone === activeTone);

  return (
      <section aria-labelledby="real-looks-heading" className="rounded-3xl border border-line bg-gradient-to-b from-white to-blush-50/40 p-6 sm:p-9 shadow-soft">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
              <Sparkles className="size-3.5 text-gold-500" />
              Real Indian Skin Tones
            </p>
              <h2 id="real-looks-heading" className="mt-1 !text-2xl sm:!text-3xl font-serif text-plum-900">
                Bridal &amp; Party Looks Designed for Your Complexion
              </h2>
              <p className="mt-2 text-sm text-ink-soft max-w-xl">
                No heavy blur filters. Our artists are trained to match Indian undertones so your makeup looks like your own radiant skin, never cakey or ashy.
              </p>
          </div>
        </div>

        {/* Complexion Filter Pills */}
          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by skin tone">
            {TONE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={activeTone === f.id}
                onClick={() => setActiveTone(f.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600",
                  activeTone === f.id
                    ? "border-plum-700 bg-plum-700 text-ivory shadow-soft"
                    : "border-line bg-white text-plum-900 hover:bg-blush-100"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

                {/* Looks Grid */}
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  {filtered.map((look) => (
                    <article
                      key={look.id}
                      className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 transition hover:border-plum-300 hover:shadow-soft"
                    >
                      <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="rounded-full bg-blush-100 px-3 py-1 text-xs font-semibold text-plum-800">
                                {look.occasion}
                              </span>
                                <span className="text-[0.75rem] font-medium text-rose-700">
                                  {look.toneLabel}
                                </span>
                            </div>

                              <h3 className="mt-3 text-lg font-serif font-semibold text-plum-900">
                                {look.title}
                              </h3>
                              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                                {look.description}
                              </p>

              {/* Highlights */ }
                                  < ul className = "mt-3.5 space-y-1.5 border-t border-line/60 pt-3 text-xs text-ink" >
                                  {
                                    look.highlights.map((h) => (
                                      <li key={h} className="flex items-center gap-2">
                                        <Check className="size-3.5 text-emerald-600 shrink-0" />
                                        <span>{h}</span>
                                      </li>
                                    ))
                                  }
                            </ul>
                        </div>

                          <div className="mt-4 border-t border-line/60 pt-3 text-[0.72rem] text-ink-soft">
                            <strong className="text-plum-900">Products used:</strong> {look.products}
                          </div>
                    </article>
                  ))}
                </div>
    </section>
          );
}
