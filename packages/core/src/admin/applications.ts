import { prisma } from "@herrglow/db";
import type { ApplicationStatus } from "@herrglow/db";
import { syncPages } from "../seo/pages";

export async function applicationCounts() {
  const g = await prisma.proApplication.groupBy({ by: ["status"], _count: true });
  return Object.fromEntries(g.map((x) => [x.status, x._count])) as Partial<Record<ApplicationStatus, number>>;
}

export const listApplications = (status?: ApplicationStatus) =>
  prisma.proApplication.findMany({ where: status ? { status } : {}, orderBy: { createdAt: "desc" }, take: 200 });

export const getApplication = (id: string) => prisma.proApplication.findUnique({ where: { id } });

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export type ApproveResult = { ok: true; proId: string } | { ok: false; error: string };

/**
 * Approving creates a Pro that stays INACTIVE until an admin completes the profile (bio, services, coverage) and activates it.
 * Contact data goes to ProPrivate only. The applicant photo is registered in the media library so it counts as a real photo.
 */
export async function approveApplication(id: string, adminEmail: string): Promise<ApproveResult> {
  const a = await prisma.proApplication.findUnique({ where: { id } });
  if (!a) return { ok: false, error: "Application not found" };
  if (a.status !== "NEW") return { ok: false, error: `Already ${a.status.toLowerCase()}` };

  const base = slugify(a.name) || "artist";
  let slug = base, n = 2;
  while (await prisma.pro.findUnique({ where: { slug } })) slug = `${base}-${n++}`;
  const cats = a.categories.length ? await prisma.category.findMany({ where: { slug: { in: a.categories } }, select: { name: true } }) : [];

  const pro = await prisma.$transaction(async (tx) => {
    if (a.photoKey) {
      await tx.media.upsert({ where: { key: a.photoKey }, update: {}, create: { key: a.photoKey, alt: `${a.name}, profile photo`, mime: "image/*", size: 0, uploadedBy: adminEmail } });
    }
    const pro = await tx.pro.create({
      data: {
        slug, name: a.name, status: "INACTIVE", providerType: "BOTH", photo: a.photoKey, experienceYears: a.experienceYears,
        specialization: [...cats.map((c) => c.name), a.servicesText].filter(Boolean).join(", ").slice(0, 200) || null,
        private: { create: { phone: a.phone, email: a.email, serviceAreasText: a.city, latitude: a.latitude, longitude: a.longitude, travelRadius: a.travelRadius } },
      },
    });
    await tx.proApplication.update({ where: { id }, data: { status: "APPROVED", proId: pro.id, handledBy: adminEmail } });
    return pro;
  });
  await syncPages();
  return { ok: true, proId: pro.id };
}

export async function rejectApplication(id: string, reason: string, adminEmail: string) {
  await prisma.proApplication.update({ where: { id }, data: { status: "REJECTED", rejectReason: reason.trim().slice(0, 500) || null, handledBy: adminEmail } });
}
