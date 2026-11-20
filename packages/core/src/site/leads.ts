import { prisma } from "@herrglow/db";
import { z } from "zod";
import { enqueueNewLead } from "../notify/queue";

export const OUT_OF_AREA = "out_of_area";

export const leadInput = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().transform((v) => v.replace(/[\s()-]/g, "").replace(/^(\+?91|0)/, "")).pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")),
  email: z.string().trim().email().max(120).optional().or(z.literal("")).transform((v) => v || undefined),
  /** city slug of an ACTIVE city, or "other" */
  city: z.string().trim().min(1, "Please choose your city"),
  area: z.string().trim().max(120).optional().transform((v) => v || undefined),
  serviceSlug: z.string().trim().max(120).optional().transform((v) => v || undefined),
  variant: z.string().trim().max(80).optional().transform((v) => v || undefined),
  addons: z.array(z.string().max(80)).max(10).optional(),
  proSlug: z.string().trim().max(120).optional().transform((v) => v || undefined),
  slot: z.string().trim().max(40).optional().transform((v) => v || undefined),
  eventDate: z.string().trim().optional().transform((v) => (v ? new Date(v) : undefined)).refine((d) => !d || !Number.isNaN(d.getTime()), "Invalid date"),
  message: z.string().trim().max(1000).optional().transform((v) => v || undefined),
  sourceUrl: z.string().trim().max(300).optional(),
  /** honeypot: real users leave it empty */
  website: z.string().optional(),
});
export type LeadInput = z.input<typeof leadInput>;

export type LeadResult = { ok: true; outOfArea: boolean; ref: string } | { ok: false; errors: Record<string, string> };

/** Saves a lead. Customers outside the active cities are still saved, tagged "out_of_area", so demand is visible. */
export async function createLead(raw: LeadInput): Promise<LeadResult> {
  const parsed = leadInput.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0] ?? "form")] ??= i.message;
    return { ok: false, errors };
  }
  const d = parsed.data;
  if (d.website) return { ok: true, outOfArea: false, ref: "OK" }; // bot: pretend success, store nothing

  const city = d.city === "other" ? null : await prisma.city.findFirst({ where: { slug: d.city, isActive: true }, select: { slug: true, name: true } });
  const outOfArea = !city;
  const area = city && d.area
    ? await prisma.area.findFirst({ where: { citySlug: city.slug, name: { equals: d.area, mode: "insensitive" } }, select: { id: true } })
    : null;
  const service = d.serviceSlug ? await prisma.service.findFirst({ where: { slug: d.serviceSlug }, select: { id: true } }) : null;
  const pro = d.proSlug ? await prisma.pro.findFirst({ where: { slug: d.proSlug, status: "ACTIVE" }, select: { id: true } }) : null;

  const customer = await prisma.customer.upsert({ where: { phone: d.phone }, update: { name: d.name, email: d.email }, create: { phone: d.phone, name: d.name, email: d.email } });
  const ref = "HG" + Date.now().toString(36).toUpperCase().slice(-6);
  const lead = await prisma.lead.create({
    data: {
      bookingRef: ref, customerId: customer.id, name: d.name, phone: d.phone, email: d.email,
      locationText: [d.area, city?.name ?? "Outside service area"].filter(Boolean).join(", "),
      areaId: area?.id, eventDate: d.eventDate, timeSlot: d.slot, message: d.message, source: "website", sourceUrl: d.sourceUrl, proId: pro?.id,
      tags: outOfArea ? [OUT_OF_AREA] : [],
      meta: { variant: d.variant, addons: d.addons, citySlug: d.city },
      ...(service ? { services: { create: [{ serviceId: service.id }] } } : {}),
    },
  });
  // owner alert + customer confirmation go through the worker queue (retries). Never fails the request.
  await enqueueNewLead(lead.id);
  return { ok: true, outOfArea, ref };
}
