import { prisma } from "@herrglow/db";
import { z } from "zod";
import { enqueueNewLead } from "../notify/queue";

export const OUT_OF_AREA = "out_of_area";

export const leadInput = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s()-]/g, "").replace(/^(\+?91|0)/, ""))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")),
  email: z.string().trim().email().max(120).optional().or(z.literal("")).transform((v) => v || undefined),
  /** city slug of an ACTIVE city, or "other" */
  city: z.string().trim().min(1, "Please choose your city"),
  area: z.string().trim().max(120).optional().transform((v) => v || undefined),
  address: z.string().trim().max(250).optional().transform((v) => v || undefined),
  serviceSlug: z.string().trim().max(120).optional().transform((v) => v || undefined),
  packageSlug: z.string().trim().max(120).optional().transform((v) => v || undefined),
  variant: z.string().trim().max(80).optional().transform((v) => v || undefined),
  addons: z.array(z.string().max(80)).max(10).optional().default([]),
  proSlug: z.string().trim().max(120).optional().transform((v) => v || undefined),
  slot: z.string().trim().max(60).optional().transform((v) => v || undefined),
  eventDate: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined))
    .refine((d) => !d || !Number.isNaN(d.getTime()), "Invalid date"),
  guestCount: z.coerce.number().int().min(1).max(20).optional(),
  message: z.string().trim().max(1000).optional().transform((v) => v || undefined),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  sourceUrl: z.string().trim().max(300).optional(),
  /** honeypot: real users leave it empty */
  website: z.string().optional(),
});
export type LeadInput = z.input<typeof leadInput>;

export type LeadResult =
  | {
      ok: true;
      outOfArea: boolean;
      ref: string;
      bookingId: string;
      leadId: string;
      amount: number | null;
      finalAmount: number | null;
    }
  | { ok: false; errors: Record<string, string> };

/**
 * Generates an intuitive, collision-free 6-digit booking ID formatted as HG-XXXXXX.
 * (e.g. HG-849201). Checked against the database for uniqueness.
 */
export async function generateBookingRef(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const candidate = `HG-${code}`;
    const exists = await prisma.lead.findUnique({ where: { bookingRef: candidate } });
    if (!exists) return candidate;
  }
  return `HG-${Date.now().toString().slice(-6)}`;
}

/**
 * Saves a booking lead, calculates pricing, sets up relations, and dispatches background notifications.
 */
export async function createLead(raw: LeadInput): Promise<LeadResult> {
  const parsed = leadInput.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0] ?? "form")] ??= i.message;
    return { ok: false, errors };
  }
  const d = parsed.data;

  // Bot detection: pretend success, store nothing
  if (d.website) {
    return {
      ok: true,
      outOfArea: false,
      ref: "HG-BOT000",
      bookingId: "HG-BOT000",
      leadId: "bot",
      amount: null,
      finalAmount: null,
    };
  }

  // City and Area lookup
  const city = d.city === "other" ? null : await prisma.city.findFirst({ where: { slug: d.city, isActive: true }, select: { slug: true, name: true } });
  const outOfArea = !city;
  const area = city && d.area
    ? await prisma.area.findFirst({ where: { citySlug: city.slug, name: { equals: d.area, mode: "insensitive" } }, select: { id: true } })
    : null;

  // Check if target is a Package (either passed via packageSlug or serviceSlug matching a Package)
  const targetPackageSlug = d.packageSlug || d.serviceSlug;
  const pkg = targetPackageSlug
    ? await prisma.package.findFirst({ where: { slug: targetPackageSlug, status: "ACTIVE" } })
    : null;

  // Check if target is an individual Service (only if not already a package)
  const service = d.serviceSlug && !pkg
    ? await prisma.service.findFirst({
        where: { slug: d.serviceSlug },
        include: { variants: true, addons: true },
      })
    : null;

  // Check Professional (if explicitly requested)
  const pro = d.proSlug
    ? await prisma.pro.findFirst({ where: { slug: d.proSlug, status: "ACTIVE" }, select: { id: true, name: true } })
    : null;

  // Calculate base & final pricing
  let basePrice = 0;
  let finalPrice = 0;

  if (pkg) {
    basePrice = Number(pkg.price ?? pkg.offerPrice ?? 0);
    finalPrice = Number(pkg.offerPrice ?? pkg.price ?? 0);
  } else if (service) {
    if (d.variant) {
      const matchVariant = service.variants.find((v) => v.name.toLowerCase() === d.variant?.toLowerCase());
      if (matchVariant) {
        basePrice = Number(matchVariant.price ?? matchVariant.offerPrice ?? service.price ?? 0);
        finalPrice = Number(matchVariant.offerPrice ?? matchVariant.price ?? service.offerPrice ?? 0);
      } else {
        basePrice = Number(service.price ?? service.offerPrice ?? 0);
        finalPrice = Number(service.offerPrice ?? service.price ?? 0);
      }
    } else {
      basePrice = Number(service.price ?? service.offerPrice ?? 0);
      finalPrice = Number(service.offerPrice ?? service.price ?? 0);
    }

    // Add selected add-ons pricing
    if (d.addons && d.addons.length > 0) {
      for (const addonName of d.addons) {
        const matchAddon = service.addons.find((a) => a.name.toLowerCase() === addonName.toLowerCase());
        if (matchAddon && matchAddon.price) {
          const addonCost = Number(matchAddon.price);
          basePrice += addonCost;
          finalPrice += addonCost;
        }
      }
    }
  }

  // Adjust for group bookings on individual services
  const guests = d.guestCount ?? 1;
  if (guests > 1 && !pkg && finalPrice > 0) {
    basePrice = basePrice * guests;
    finalPrice = finalPrice * guests;
  }

  const discount = Math.max(0, basePrice - finalPrice);

  // Upsert customer record
  const customer = await prisma.customer.upsert({
    where: { phone: d.phone },
    update: { name: d.name, email: d.email },
    create: { phone: d.phone, name: d.name, email: d.email },
  });

  // Generate unique booking reference
  const ref = await generateBookingRef();

  // Create lead record
  const locationParts = [d.address, d.area, city?.name ?? (outOfArea ? "Outside service area" : "")].filter(Boolean);
  const locationText = locationParts.length > 0 ? locationParts.join(", ") : null;

  const lead = await prisma.lead.create({
    data: {
      bookingRef: ref,
      customerId: customer.id,
      name: d.name,
      phone: d.phone,
      email: d.email,
      locationText,
      address: d.address,
      latitude: d.latitude,
      longitude: d.longitude,
      areaId: area?.id,
      packageId: pkg?.id,
      eventDate: d.eventDate,
      timeSlot: d.slot,
      guestCount: guests,
      message: d.message,
      source: "website",
      sourceUrl: d.sourceUrl,
      proId: pro?.id,
      tags: outOfArea ? [OUT_OF_AREA] : [],
      amount: basePrice > 0 ? basePrice : null,
      finalAmount: finalPrice > 0 ? finalPrice : null,
      discount: discount > 0 ? discount : null,
      status: "NEW",
      paymentStatus: "pending",
      meta: {
        variant: d.variant,
        addons: d.addons,
        citySlug: d.city,
        packageName: pkg?.title,
        serviceName: service?.title,
        pricing: {
          basePrice: basePrice > 0 ? basePrice : null,
          finalPrice: finalPrice > 0 ? finalPrice : null,
          discount: discount > 0 ? discount : null,
          currency: "INR",
        },
      },
      ...(service ? { services: { create: [{ serviceId: service.id }] } } : {}),
    },
  });

  // Update popularity metrics asynchronously
  if (service) {
    await prisma.service.update({
      where: { id: service.id },
      data: { leadCount: { increment: 1 } },
    }).catch((e) => console.warn(`[createLead] could not increment service leadCount: ${(e as Error).message}`));
  }
  if (area) {
    await prisma.area.update({
      where: { id: area.id },
      data: { leadCount: { increment: 1 } },
    }).catch((e) => console.warn(`[createLead] could not increment area leadCount: ${(e as Error).message}`));
  }

  // Dispatch background notification jobs (retried via BullMQ worker)
  await enqueueNewLead(lead.id);

  return {
    ok: true,
    outOfArea,
    ref,
    bookingId: ref,
    leadId: lead.id,
    amount: basePrice > 0 ? basePrice : null,
    finalAmount: finalPrice > 0 ? finalPrice : null,
  };
}

/**
 * Fetches booking details by booking reference (for customer status check).
 */
export async function getBookingByRef(bookingRef: string) {
  const clean = bookingRef.trim().toUpperCase();
  return prisma.lead.findUnique({
    where: { bookingRef: clean },
    select: {
      bookingRef: true,
      name: true,
      phone: true,
      locationText: true,
      eventDate: true,
      timeSlot: true,
      status: true,
      paymentStatus: true,
      finalAmount: true,
      createdAt: true,
      package: { select: { title: true, slug: true, duration: true } },
      services: { select: { service: { select: { title: true, slug: true, duration: true } } } },
      pro: { select: { name: true, photo: true, specialization: true } },
    },
  });
}
