"use server";

import { headers } from "next/headers";
import { createLead } from "@herrglow/core";

export type FormState =
  | { status: "idle" }
  | { status: "error"; errors: Record<string, string> }
  | { status: "done"; outOfArea: boolean; ref: string; bookingId: string; finalAmount?: number | null };

// In-memory rate limit: 5 submissions / 10 min / IP
const hits = new Map<string, number[]>();
  function limited(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
    recent.push(now);
    hits.set(ip, recent);
    return recent.length > 5;
  }

  export async function submitLead(_prev: FormState, fd: FormData): Promise<FormState> {
    try {
      const h = await headers();
      const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
      if (limited(ip)) {
        return {
          status: "error",
          errors: { form: "Too many booking requests. Please wait a few minutes or message us directly on WhatsApp." },
        };
      }

      const get = (k: string) => (fd.get(k) as string | null) ?? undefined;
      const res = await createLead({
        name: get("name") ?? "",
        phone: get("phone") ?? "",
        email: get("email"),
        city: get("city") ?? "",
        area: get("area"),
        address: get("address"),
        serviceSlug: get("serviceSlug"),
        packageSlug: get("packageSlug"),
        variant: get("variant"),
        addons: fd.getAll("addons").map(String),
        proSlug: get("proSlug"),
        eventDate: get("eventDate"),
        slot: get("slot"),
        guestCount: get("guestCount") ? Number(get("guestCount")) : undefined,
        message: get("message"),
        sourceUrl: get("sourceUrl"),
        website: get("website"),
      });

      if (!res.ok) {
        return { status: "error", errors: res.errors };
      }
      return {
        status: "done",
        outOfArea: res.outOfArea,
        ref: res.ref,
        bookingId: res.bookingId,
        finalAmount: res.finalAmount,
      };
    } catch (error) {
      // Graceful error handling: log detailed trace on server, return compassionate microcopy to user
      console.error("Unhandled error in submitLead Server Action:", error);
      return {
        status: "error",
        errors: {
          form: "We are temporarily having trouble saving your request. Please message us on WhatsApp or try again shortly.",
        },
      };
    }
  }
