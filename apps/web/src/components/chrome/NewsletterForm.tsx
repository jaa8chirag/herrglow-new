"use client";

import { useActionState } from "react";
import { subscribeAction, type SubState } from "@/app/actions-subscribe";

export function NewsletterForm() {
  const [s, action, pending] = useActionState<SubState, FormData>(subscribeAction, { status: "idle" });
  if (s.status === "done") return <p className="rounded-2xl border border-gold-400/40 bg-white/5 px-5 py-4 text-ivory">Thank you. You are on the list.</p>;
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row" noValidate>
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="sr-only" htmlFor="nl-email">Email address</label>
      <input id="nl-email" name="email" type="email" required autoComplete="email" placeholder="Your email address" className="min-h-12 flex-1 rounded-full border border-white/20 bg-white/10 px-5 text-ivory placeholder:text-blush-200/70 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30" />
      <button disabled={pending} className="btn-shimmer min-h-12 rounded-full bg-gold-400 px-7 font-medium text-plum-900 transition hover:bg-gold-300 disabled:opacity-60">{pending ? "Sending…" : "Subscribe"}</button>
      {s.status === "error" && <p className="text-sm text-rose-300 sm:basis-full" role="alert">{s.error}</p>}
    </form>
  );
}
