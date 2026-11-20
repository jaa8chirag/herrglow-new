import { cva, type VariantProps } from "class-variance-authority";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "./utils";

/* ───────── Button (shadcn-style: cva variants) ───────── */
export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 ease-out-soft disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] min-h-11",
  {
    variants: {
      variant: {
        primary: "bg-plum-700 text-ivory shadow-soft hover:bg-plum-800 hover:shadow-lift",
        /* the main CTA: shimmer sweep */
        shimmer: "btn-shimmer bg-plum-700 text-ivory shadow-lift hover:bg-plum-800",
        gold: "bg-gold-400 text-plum-900 shadow-soft hover:bg-gold-300",
        light: "bg-ivory text-plum-800 shadow-soft hover:bg-white",
        accent: "bg-rose-600 text-white shadow-soft hover:bg-rose-700",
        outline: "border border-plum-700/30 bg-transparent text-plum-800 hover:bg-blush-100",
        ghost: "bg-transparent text-plum-800 hover:bg-blush-100",
        whatsapp: "bg-[#1f8f4e] text-white hover:bg-[#187a41]",
      },
      size: { sm: "px-4 text-sm", md: "px-6 text-[0.95rem]", lg: "px-8 text-base min-h-12" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
export type ButtonVariants = VariantProps<typeof buttonStyles>;

export function Button({ variant, size, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & ButtonVariants) {
  return <button className={cn(buttonStyles({ variant, size }), className)} {...p} />;
}
export function ButtonLink({ variant, size, className, ...p }: AnchorHTMLAttributes<HTMLAnchorElement> & ButtonVariants) {
  return <a className={cn(buttonStyles({ variant, size }), className)} {...p} />;
}

/* ───────── Layout ───────── */
export function Container({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)} {...p} />;
}

export function Section({ className, tone = "plain", ...p }: HTMLAttributes<HTMLElement> & { tone?: "plain" | "blush" | "deep" }) {
  return (
    <section
      className={cn(
        "py-14 sm:py-20",
        tone === "blush" && "bg-blush-50",
        tone === "deep" && "bg-plum-900 text-ivory [&_h2]:text-ivory [&_h3]:text-ivory [&_p]:text-blush-100",
        className,
      )}
      {...p}
    />
  );
}

export function SectionHeading({ eyebrow, title, intro, align = "left", as: Tag = "h2" }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; align?: "left" | "center"; as?: "h1" | "h2" }) {
  return (
    <div className={cn("mb-10 max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
          <span aria-hidden className="h-px w-8 bg-gold-400" />
          {eyebrow}
        </p>
      )}
      <Tag>{title}</Tag>
      {intro && <p className="mt-4 text-lg leading-relaxed text-ink-soft">{intro}</p>}
    </div>
  );
}

/* ───────── Card / Badge ───────── */
export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[var(--radius-card)] border border-line bg-white/90 text-ink shadow-soft transition-shadow duration-300 hover:shadow-lift [&_h1]:!text-plum-800 [&_h2]:!text-plum-800 [&_h3]:!text-plum-800 [&_p]:!text-ink-soft", className)} {...p} />;
}

export function Badge({ className, tone = "blush", ...p }: HTMLAttributes<HTMLSpanElement> & { tone?: "blush" | "gold" | "plum" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        tone === "blush" && "bg-blush-100 text-plum-800",
        tone === "gold" && "bg-gold-300/40 text-plum-900 ring-1 ring-gold-400/60",
        tone === "plum" && "bg-plum-800 text-ivory",
        className,
      )}
      {...p}
    />
  );
}

/** Price: strike-through list price + offer price. Renders nothing when there is no price. */
export function Price({ price, offerPrice, label, className }: { price?: number | null; offerPrice?: number | null; label?: string | null; className?: string }) {
  const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
  const now = offerPrice ?? price;
  if (now == null) return null;
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      {label && <span className="text-xs text-ink-soft">{label}</span>}
      <span className="text-lg font-semibold text-plum-800">{fmt(now)}</span>
      {offerPrice != null && price != null && price > offerPrice && <s className="text-sm text-ink-soft/70">{fmt(price)}</s>}
    </span>
  );
}
