import { prisma } from "@herrglow/db";
import { z } from "zod";
import { newMediaKey, putObject, sniffMime } from "../media/storage";

export const MAX_APPLICATION_PHOTO = 5 * 1024 * 1024;

export const applicationInput = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().transform((v) => v.replace(/[\s()-]/g, "").replace(/^(\+?91|0)/, "")).pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")),
  email: z.string().trim().email("Enter a valid email").max(120).optional().or(z.literal("")).transform((v) => v || undefined),
  city: z.string().trim().min(2, "Please tell us your city").max(80),
  categories: z.array(z.string().max(40)).max(10).default([]),
  servicesText: z.string().trim().max(500).optional().transform((v) => v || undefined),
  experienceYears: z.string().trim().optional().transform((v) => (v ? Number(v) : undefined)).refine((n) => n === undefined || (Number.isInteger(n) && n >= 0 && n <= 60), "Enter whole years (0 to 60)"),
  portfolioUrl: z.string().trim().max(300).optional().transform((v) => v || undefined).refine((v) => !v || /^https?:\/\/\S+\.\S+/.test(v), "Enter a full link starting with https://"),
  message: z.string().trim().max(1000).optional().transform((v) => v || undefined),
  website: z.string().optional(), // honeypot
});
export type ApplicationInput = z.input<typeof applicationInput>;
export type ApplicationResult = { ok: true } | { ok: false; errors: Record<string, string> };

/** Stores a public application. The photo (optional, ≤ 5 MB, verified by magic bytes) is kept under applications/ until approved. */
export async function createApplication(raw: ApplicationInput, photo: { body: Buffer; filename: string } | null, localRoot: string): Promise<ApplicationResult> {
  const parsed = applicationInput.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0] ?? "form")] ??= i.message;
    return { ok: false, errors };
  }
  const d = parsed.data;
  if (d.website) return { ok: true }; // bot: pretend success, store nothing

  let photoKey: string | undefined;
  if (photo && photo.body.length > 0) {
    if (photo.body.length > MAX_APPLICATION_PHOTO) return { ok: false, errors: { photo: "Photo must be under 5 MB" } };
    const mime = sniffMime(photo.body);
    if (!mime) return { ok: false, errors: { photo: "Photo must be a JPEG, PNG, WebP or AVIF image" } };
    photoKey = newMediaKey(photo.filename, mime, "applications");
    await putObject(photoKey, photo.body, mime, localRoot);
  }
  // one open application per phone per day
  const dup = await prisma.proApplication.findFirst({ where: { phone: d.phone, status: "NEW", createdAt: { gt: new Date(Date.now() - 86_400_000) } } });
  if (dup) return { ok: true };
  const app = await prisma.proApplication.create({
    data: { name: d.name, phone: d.phone, email: d.email, city: d.city, categories: d.categories, servicesText: d.servicesText, experienceYears: d.experienceYears, portfolioUrl: d.portfolioUrl, message: d.message, photoKey },
  });
  await enqueueSafe("new-application", app.id);
  return { ok: true };
}

// late-bound so applications.ts does not hard-depend on the queue module (avoids a cycle and keeps tests light)
async function enqueueSafe(kind: "new-application", id: string) {
  try { const q = await import("../notify/queue"); await q.enqueue(kind, id); } catch { /* the worker sweep picks it up */ }
}
