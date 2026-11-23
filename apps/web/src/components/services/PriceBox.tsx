"use client";

import { Check, Clock, MessageCircle, ShieldCheck, Sparkles, Wallet, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Drawer, DrawerShell, Price, buttonStyles, cn } from "@herrglow/ui";
import { whatsappLink } from "@/lib/whatsapp";

export interface PriceOption { name: string; price: number | null; offerPrice: number | null; duration: string | null }

const pick = (name: string) => window.dispatchEvent(new CustomEvent("hg-variant", { detail: name }));
const toForm = () => {
  const el = document.getElementById("book");
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => el?.querySelector<HTMLElement>("button,input,select")?.focus({ preventScroll: true }), 600);
};

function Options({ options, selected, onSelect }: { options: PriceOption[]; selected: string; onSelect: (n: string) => void }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-medium text-plum-900">Choose an option</legend>
      {options.map((o) => (
        <label key={o.name} className={cn("flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-2 transition", selected === o.name ? "border-plum-700 bg-blush-50 ring-2 ring-blush-200" : "border-line bg-white hover:bg-blush-50/60")}>
          <span className="flex items-center gap-3"><input type="radio" name="price-option" checked={selected === o.name} onChange={() => onSelect(o.name)} className="size-4 accent-[var(--color-plum-700)]" /><span><span className="block font-medium text-plum-900">{o.name}</span>{o.duration && <span className="text-xs text-ink-soft">{o.duration}</span>}</span></span>
          <Price price={o.price} offerPrice={o.offerPrice} />
        </label>
      ))}
    </fieldset>
  );
}

/**
 * Price + options selector. Desktop: sticky card. Mobile: a bar above the dock opens a bottom sheet (vaul).
 * The chosen option is sent to the booking form ("hg-variant" event) so it arrives pre-selected.
 */
export function PriceBox({
  title,
  options,
  price,
  offerPrice,
  label,
  duration,
  whatsappNumber,
}: {
  title: string;
  options: PriceOption[];
  price: number | null;
  offerPrice: number | null;
  label?: string | null;
  duration?: string | null;
  whatsappNumber?: string | null;
}) {
  const [sel, setSel] = useState(options[0]?.name ?? "");
  const [open, setOpen] = useState(false);
  const cur = options.find((o) => o.name === sel);
  const shownPrice = cur ? { price: cur.price, offer: cur.offerPrice } : { price, offer: offerPrice };
  const choose = (n: string) => { setSel(n); pick(n); };

  const currentPrice = Number(shownPrice.offer ?? shownPrice.price ?? 0);
  const isAddonUnderThreshold = currentPrice > 0 && currentPrice < 499;

  const finalPriceStr = shownPrice.offer ? `₹${Math.round(shownPrice.offer).toLocaleString("en-IN")}` : shownPrice.price ? `₹${Math.round(shownPrice.price).toLocaleString("en-IN")}` : "";
  const wa = whatsappLink(
    whatsappNumber || "9319260069",
    `Hi HerrGlow! I'm interested in booking ${title}${sel ? ` (${sel})` : ""}${finalPriceStr ? ` for ${finalPriceStr}` : ""}. Could you please share artist availability and details?`
  );

  const body = (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">{options.length > 1 ? "Price for your option" : "Price"}</p>
        <Price price={shownPrice.price} offerPrice={shownPrice.offer} label={options.length > 1 ? undefined : label} className="mt-1 [&>span:nth-child(2)]:text-3xl" />
        {(cur?.duration ?? duration) && <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft"><Clock className="size-4" />{cur?.duration ?? duration}</p>}
      </div>
      {options.length > 0 && <Options options={options} selected={sel} onSelect={choose} />}
    </div>
  );

  return (
    <>
      {/* In-page Rate Card (Visible on desktop & mobile in content) */}
      <div className="rounded-[1.75rem] border border-line bg-white p-5 sm:p-6 shadow-lift">
        <h2 className="mb-4 !text-xl">Book {title}</h2>
        {body}

        {/* Add-on Minimum Order Notice */}
        {isAddonUnderThreshold && (
          <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Sparkles className="size-4 text-amber-600 shrink-0" />
              <span>Add-on Service · Min. Doorstep Visit ₹499</span>
            </div>
            <p className="text-[11px] text-amber-900/90 leading-relaxed">
              To support our travelling female beauticians, the minimum doorstep booking is ₹499. You can add this service with any waxing or facial, or build your own combo.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/custom-combo"
                className="inline-flex items-center gap-1 rounded-xl bg-amber-800 px-3 py-1.5 text-xs font-bold text-white shadow-soft hover:bg-amber-900 transition"
              >
                <span>Make Your Own Combo →</span>
              </Link>
              <Link
                href="/services/face-hair-removal/full-face-grooming-glow-combo"
                className="inline-flex items-center gap-1 rounded-xl border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100 transition"
              >
                <span>Full Face Combo @ ₹499</span>
              </Link>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={toForm}
          className={cn(buttonStyles({ variant: "shimmer", size: "lg" }), "mt-6 w-full")}
        >
          {isAddonUnderThreshold ? "Book with Add-ons (Min. ₹499)" : "Book this service"}
        </button>
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-900 shadow-soft transition hover:bg-emerald-100"
          >
            <MessageCircle className="size-4 text-emerald-600" />
            Chat with an Expert on WhatsApp
          </a>
        )}
        <div className="mt-5 space-y-2 rounded-2xl border border-blush-200/80 bg-blush-50/70 p-4 text-xs text-plum-900">
          <p className="flex items-center gap-2 font-medium text-emerald-800">
            <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
            100% Female Background-Verified Artist
          </p>
          <p className="flex items-center gap-2 text-ink-soft">
            <Sparkles className="size-4 shrink-0 text-gold-500" />
            Single-use sealed disposable kit included
          </p>
          <p className="flex items-center gap-2 font-medium text-plum-900">
            <Wallet className="size-4 shrink-0 text-emerald-600" />
            10% Advance to reserve slot · 90% after service
          </p>
          <p className="flex items-center gap-2 text-ink-soft">
            <Check className="size-4 shrink-0 text-emerald-600" />
            100% instant refund if artist does not reach you
          </p>
          <p className="flex items-center gap-2 text-ink-soft">
            <Check className="size-4 shrink-0 text-emerald-600" />
            No hidden travel or setup fees
          </p>
        </div>
      </div>

      {/* Mobile Unified Floating Bottom Action Dock (Clean, Single Cohesive Card, No Loose Badges) */}
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] lg:hidden">
          <div className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-gold-400/40 bg-ivory/95 shadow-lift backdrop-blur-xl">
            {/* Integrated Luxury Trust Banner */}
            <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 px-3 py-1 text-[10px] font-semibold tracking-wide text-gold-300">
              <ShieldCheck className="size-3 shrink-0 text-gold-400" />
              <span className="truncate">100% Female Verified · 10% Advance · 100% Refund Guarantee</span>
            </div>

            {/* Unified Action Dock */}
            <div className="flex items-center gap-2 p-2">
              {/* Price & Option selector: Tapping opens option picker sheet if variants exist */}
              <button
                type="button"
                onClick={() => (options.length > 1 ? setOpen(true) : toForm())}
                className="flex flex-1 min-w-0 flex-col text-left pl-2 cursor-pointer select-none"
              >
                <div className="flex items-center gap-1 text-[11px] font-medium text-rose-700 truncate">
                  <span className="truncate">{sel || title}</span>
                  {options.length > 1 && (
                    <span className="text-[10px] text-ink-soft shrink-0 underline decoration-rose-300">Change ▾</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Price price={shownPrice.price} offerPrice={shownPrice.offer} className="[&>span:nth-child(2)]:text-base font-bold text-plum-950" />
                  {isAddonUnderThreshold && (
                    <span className="text-[9px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-md shrink-0">
                      Add-on (Min. ₹499)
                    </span>
                  )}
                </div>
              </button>

              {/* Book Now Button */}
              <button
                type="button"
                onClick={toForm}
                className={cn(buttonStyles({ variant: "shimmer", size: "sm" }), "h-11 px-3.5 text-xs font-bold shrink-0")}
              >
                {isAddonUnderThreshold ? "Book (Min ₹499)" : "Book Now"}
              </button>

              {/* WhatsApp Direct Chat */}
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with Beauty Expert on WhatsApp"
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-soft transition hover:bg-[#1f8f4e] active:scale-95"
                >
                  <MessageCircle className="size-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Drawer for Variant Selection */}
        <DrawerShell title={`Select Option: ${title}`} direction="bottom">
          <div className="overflow-y-auto p-5 pb-7">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Customize Service</p>
                <h2 className="!text-xl font-serif text-plum-950 mt-0.5">{title}</h2>
              </div>
              <Drawer.Close asChild>
                <button
                  type="button"
                  aria-label="Close"
                  className="grid size-10 place-items-center rounded-full border border-line text-ink-soft hover:bg-blush-50"
                >
                  <X className="size-4" />
                </button>
              </Drawer.Close>
            </div>
            {options.length > 0 && <Options options={options} selected={sel} onSelect={choose} />}
            <div className="mt-4 space-y-1.5 rounded-2xl border border-blush-200/60 bg-blush-50/80 p-3 text-xs text-plum-900">
              <p className="flex items-center gap-2 font-medium text-emerald-800">
                <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
                100% Female Verified Artist · Single-Use Kit
              </p>
              <p className="flex items-center gap-2 font-medium text-plum-900">
                <Wallet className="size-4 shrink-0 text-emerald-600" />
                10% Advance · 90% After Service · 100% Refund Guarantee
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setTimeout(toForm, 350);
              }}
              className={cn(buttonStyles({ variant: "shimmer", size: "lg" }), "mt-5 w-full")}
            >
              Continue to Booking ({finalPriceStr})
            </button>
          </div>
        </DrawerShell>
      </Drawer.Root>
    </>
  );
}
