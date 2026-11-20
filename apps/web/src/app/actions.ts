"use server";

import { headers } from "next/headers";
import { createLead } from "@herrglow/core";

export type FormState = { status: "idle" } | { status: "error"; errors: Record<string, string> } | { status: "done"; outOfArea: boolean; ref: string };

// Tiny in-memory rate limit (per server instance): 5 submissions / 10 min / IP. Replace with Redis when the worker lands.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export async function submitLead(_prev: FormState, fd: FormData): Promise<FormState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return { status: "error", errors: { form: "Too many requests. Please try again in a few minutes." } };

  const get = (k: string) => (fd.get(k) as string | null) ?? undefined;
  const res = await createLead({
    name: get("name") ?? "", phone: get("phone") ?? "", email: get("email"), city: get("city") ?? "", area: get("area"),
    serviceSlug: get("serviceSlug"), variant: get("variant"), addons: fd.getAll("addons").map(String), proSlug: get("proSlug"),
    eventDate: get("eventDate"), message: get("message"), sourceUrl: get("sourceUrl"), website: get("website"),
  });
  if (!res.ok) return { status: "error", errors: res.errors };
  return { status: "done", outOfArea: res.outOfArea, ref: res.ref };
}
