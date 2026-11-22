"use client";

import { Check, Clock, MessageCircle, ShieldCheck, Sparkles, Wallet, X } from "lucide-react";
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
      {/* desktop */}
      <div className="hidden rounded-[1.75rem] border border-line bg-white p-6 shadow-lift lg:block">
        <h2 className="mb-4 !text-xl">Book {title}</h2>
        {body}
        <button type="button" onClick={toForm} className={cn(buttonStyles({ variant: "shimmer", size: "lg" }), "mt-6 w-full")}>Book this service</button>
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
          <p className="flex items-center gap-2 font-medium text-emerald-800"><ShieldCheck className="size-4 shrink-0 text-emerald-600" />100% Female Background-Verified Artist</p>
          <p className="flex items-center gap-2 text-ink-soft"><Sparkles className="size-4 shrink-0 text-gold-500" />Single-use sealed disposable kit included</p>
          <p className="flex items-center gap-2 font-medium text-plum-900"><Wallet className="size-4 shrink-0 text-emerald-600" />10% Advance to reserve slot · 90% after service</p>
          <p className="flex items-center gap-2 text-ink-soft"><Check className="size-4 shrink-0 text-emerald-600" />100% instant refund if artist does not reach you</p>
          <p className="flex items-center gap-2 text-ink-soft"><Check className="size-4 shrink-0 text-emerald-600" />No hidden travel or setup fees</p>
        </div>
      </div>

      {/* mobile: bar + bottom sheet */}
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <div className="fixed inset-x-0 bottom-[5.25rem] z-20 px-4 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="mx-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 text-left shadow-lift backdrop-blur-xl">
            <span><span className="block text-xs text-ink-soft">{options.length > 1 ? `${sel || "Options"}` : "Price"}</span><Price price={shownPrice.price} offerPrice={shownPrice.offer} /></span>
            <span className="rounded-full bg-blush-100 px-4 py-2 text-sm font-medium text-plum-800">{options.length > 1 ? "Choose option" : "Details"}</span>
          </button>
        </div>
        <DrawerShell title={`Options for ${title}`} direction="bottom">
          <div className="overflow-y-auto p-5 pb-7">
            <div className="mb-4 flex items-start justify-between gap-3"><h2 className="!text-xl">{title}</h2><Drawer.Close asChild><button type="button" aria-label="Close" className="grid size-10 place-items-center rounded-full border border-line"><X className="size-4" /></button></Drawer.Close></div>
            {body}
            <div className="mt-4 space-y-1.5 rounded-2xl border border-blush-200/60 bg-blush-50/80 p-3 text-xs text-plum-900">
              <p className="flex items-center gap-2 font-medium text-emerald-800"><ShieldCheck className="size-4 shrink-0 text-emerald-600" />100% Female Verified Artist · Single-Use Kit</p>
              <p className="flex items-center gap-2 font-medium text-plum-900"><Wallet className="size-4 shrink-0 text-emerald-600" />10% Advance · 90% After Service · 100% Refund Guarantee</p>
            </div>
            <button type="button" onClick={() => { setOpen(false); setTimeout(toForm, 350); }} className={cn(buttonStyles({ variant: "shimmer", size: "lg" }), "mt-5 w-full")}>Continue to booking</button>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100"
              >
                <MessageCircle className="size-4 text-emerald-600" />
                Ask on WhatsApp
              </a>
            )}
          </div>
        </DrawerShell>
      </Drawer.Root>
    </>
  );
}
