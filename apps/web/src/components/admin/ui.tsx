"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@herrglow/ui";

/* Small admin UI kit. Plain, dense, readable. */

export const inputCls = "w-full min-h-10 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-600/20";

export function SubmitButton({ children, variant = "primary", className }: { children: ReactNode; variant?: "primary" | "ghost" | "danger"; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition disabled:opacity-60",
        variant === "primary" && "bg-plum-700 text-ivory hover:bg-plum-800",
        variant === "ghost" && "border border-line bg-white text-plum-800 hover:bg-blush-100",
        variant === "danger" && "bg-rose-700 text-white hover:bg-rose-600",
        className,
      )}
    >
      {pending ? "Saving…" : children}
    </button>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("grid gap-1.5 text-sm font-medium text-plum-900", className)}>
      <span>{label}{hint && <span className="ml-2 font-normal text-ink-soft">{hint}</span>}</span>
      {children}
    </label>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "info" }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      tone === "neutral" && "bg-ivory-deep text-ink-soft", tone === "good" && "bg-emerald-100 text-emerald-800",
      tone === "warn" && "bg-amber-100 text-amber-800", tone === "bad" && "bg-rose-100 text-rose-700", tone === "info" && "bg-blush-100 text-plum-800")}>
      {children}
    </span>
  );
}
