"use client";

import { useState } from "react";
import { Plus, Check, Clock, Sparkles } from "lucide-react";
import { Button, cn } from "@herrglow/ui";

interface AddonOption {
  id: string;
  name: string;
  price: number;
  duration: string;
  tag: string;
}

const BRIDAL_ADDONS: AddonOption[] = [
  { id: "draping", name: "Saree / Lehenga Draping & Ironing", price: 999, duration: "30 mins", tag: "Most Popular" },
  { id: "hairstyling", name: "Designer Hair Styling & Floral Setting", price: 1499, duration: "45 mins", tag: "Best Value" },
  { id: "guest-makeup", name: "Party Makeup for Mother / Sister", price: 2499, duration: "60 mins", tag: "Family Favorite" },
];

const SALON_ADDONS: AddonOption[] = [
  { id: "cleanup", name: "Express Clean-Up & Anti-Tan Pack", price: 799, duration: "30 mins", tag: "Instant Glow" },
  { id: "threading", name: "Eyebrow & Upper Lip Threading", price: 99, duration: "10 mins", tag: "Essential" },
  { id: "pedicure", name: "Hydrating Deluxe Pedicure", price: 799, duration: "45 mins", tag: "Relaxing" },
];

export function FrequentlyPaired({
  categorySlug,
  serviceTitle,
}: {
  categorySlug: string;
  serviceTitle: string;
}) {
  const isBridal = /bridal|makeup/i.test(categorySlug);
  const addons = isBridal ? BRIDAL_ADDONS : SALON_ADDONS;
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string, name: string) => {
    setSelected((prev) => {
      const active = !prev.includes(id);
      const next = active ? [...prev, id] : prev.filter((x) => x !== id);
      // Dispatch custom event to notify BookingForm
      window.dispatchEvent(new CustomEvent("hg-addon-toggle", { detail: { id, name, active } }));
      return next;
    });
  };

  const scrollToBook = () => {
    const el = document.getElementById("book");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const totalExtra = addons
    .filter((a) => selected.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  return (
      <section aria-labelledby="frequently-paired-heading" className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700">
              <Sparkles className="size-3.5 text-gold-500" />
              Frequently Booked Together
            </p>
              <h2 id="frequently-paired-heading" className="mt-1 !text-xl sm:!text-2xl font-serif text-plum-900">
                Combine in One Visit &amp; Save Time
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ink-soft">
                Get more done in a single session with {serviceTitle}. Your visiting professional will handle these back-to-back.
              </p>
          </div>
          {selected.length > 0 && (
            <div className="mt-3 sm:mt-0 flex items-center gap-3">
              <span className="text-sm font-semibold text-plum-900">
                +{selected.length} service{selected.length > 1 ? "s" : ""} (₹{totalExtra.toLocaleString("en-IN")})
              </span>
              <Button size="sm" variant="shimmer" onClick={scrollToBook}>
                Continue to Book
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {addons.map((a) => {
            const isSelected = selected.includes(a.id);
            return (
            <button
              type="button"
              key={a.id}
              onClick={() => toggle(a.id, a.name)}
              aria-pressed={isSelected}
              className={cn(
                "group relative flex w-full flex-col justify-between rounded-2xl border p-4.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600",
                isSelected
                  ? "border-plum-700 bg-blush-50/80 ring-2 ring-blush-200"
                  : "border-line bg-white hover:border-plum-300 hover:bg-blush-50/30"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-blush-100 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-plum-800">
                    {a.tag}
                  </span>
                  <div
                    className={cn(
                      "grid size-5 place-items-center rounded-full border text-xs transition",
                      isSelected ? "border-plum-700 bg-plum-700 text-white" : "border-line text-transparent"
                    )}
                  >
                    <Check className="size-3" />
                  </div>
                </div>

                <h3 className="mt-3 text-sm font-semibold text-plum-900">
                  {a.name}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-[0.75rem] text-ink-soft">
                  <Clock className="size-3 text-rose-600" />
                  {a.duration}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
                <span className="text-sm font-bold text-plum-900">
                  +₹{a.price.toLocaleString("en-IN")}
                </span>
                <span className={cn("text-xs font-medium", isSelected ? "text-plum-800" : "text-rose-700 group-hover:underline")}>
                  {isSelected ? "✓ Added" : "+ Add to Visit"}
                </span>
              </div>
      </button>
      );
        })}
    </div>
    </section >
  );
}
