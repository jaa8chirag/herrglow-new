import { prisma } from "@herrglow/db";
import type { ProviderType, Status } from "@herrglow/db";
import { sanitizeRichHtml, wordCount } from "./html";
import { faqsToText, textToFaqs } from "./review";
import { planPages } from "../seo/plan";
import { syncPages } from "../seo/pages";

const PAGE = 40;

/* ───────────── Services ───────────── */
export interface ServiceFilter { q?: string; categoryId?: string; status?: Status; page?: number }
const sWhere = (f: ServiceFilter) => ({
  mergedIntoId: null,
  ...(f.status ? { status: f.status } : {}),
  ...(f.categoryId ? { categoryId: f.categoryId } : {}),
  ...(f.q ? { title: { contains: f.q, mode: "insensitive" as const } } : {}),
});

export async function listServicesAdmin(f: ServiceFilter) {
  const page = Math.max(1, f.page ?? 1);
  const [rows, total, categories] = await Promise.all([
    prisma.service.findMany({
      where: sWhere(f), orderBy: [{ leadCount: "desc" }, { title: "asc" }], skip: (page - 1) * PAGE, take: PAGE,
      select: { id: true, title: true, slug: true, status: true, price: true, offerPrice: true, leadCount: true, description: true, category: { select: { name: true } }, _count: { select: { variants: true, addons: true } } },
    }),
    prisma.service.count({ where: sWhere(f) }),
    prisma.category.findMany({ orderBy: { sort: "asc" }, select: { id: true, name: true } }),
  ]);
  return { total, page, pages: Math.max(1, Math.ceil(total / PAGE)), categories, items: rows.map((r) => ({ ...r, words: wordCount(r.description), price: r.offerPrice ?? r.price })) };
}

export async function getServiceAdmin(id: string) {
  const [svc, categories] = await Promise.all([
    prisma.service.findUnique({ where: { id }, include: { variants: { orderBy: { sortOrder: "asc" } }, addons: { orderBy: { sortOrder: "asc" } } } }),
    prisma.category.findMany({ orderBy: { sort: "asc" }, select: { id: true, name: true } }),
  ]);
  return svc && { svc, categories };
}

export interface ServiceInput {
  title: string; slug: string; categoryId: string; status: Status; providerType: ProviderType;
  price?: number | null; offerPrice?: number | null; priceLabel?: string; duration?: string; featured?: boolean; sort?: number;
}
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Saving with a changed slug keeps the old URL alive: a 301 is created automatically. */
export async function saveService(id: string, i: ServiceInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const cur = await prisma.service.findUnique({ where: { id }, select: { slug: true } });
  if (!cur) return { ok: false, error: "Service not found" };
  const slug = slugify(i.slug);
  if (!slug) return { ok: false, error: "Slug is required" };
  if (slug !== cur.slug) {
    if (await prisma.service.findFirst({ where: { slug, id: { not: id } } })) return { ok: false, error: "Another service already uses that slug" };
    if (await prisma.page.findFirst({ where: { url: `/${slug}` } })) return { ok: false, error: "That slug collides with an existing top-level page" };
  }
  await prisma.$transaction(async (tx) => {
    await tx.service.update({
      where: { id },
      data: { title: i.title.trim(), slug, categoryId: i.categoryId, status: i.status, providerType: i.providerType, price: i.price ?? null, offerPrice: i.offerPrice ?? null, priceLabel: i.priceLabel?.trim() || null, duration: i.duration?.trim() || null, featured: !!i.featured, sort: i.sort ?? 0 },
    });
    if (slug !== cur.slug) {
      const row = { fromPath: `/services/${cur.slug}`, toPath: `/services/${slug}`, code: "MOVED_301" as const, note: "service slug changed in admin" };
      await tx.redirect.upsert({ where: { fromPath: row.fromPath }, update: row, create: row });
      await tx.redirect.deleteMany({ where: { fromPath: row.toPath } }); // never leave a redirect away from a live URL
    }
  });
  await syncPages();
  return { ok: true };
}

export interface VariantInput { name: string; price?: number | null; offerPrice?: number | null; duration?: string }
export async function saveVariants(serviceId: string, rows: VariantInput[]) {
  const clean = rows.filter((r) => r.name.trim());
  const existing = await prisma.serviceVariant.findMany({ where: { serviceId } });
  const link = new Map(existing.map((e) => [e.name.toLowerCase(), e.linkedServiceId]));
  await prisma.$transaction([
    prisma.serviceVariant.deleteMany({ where: { serviceId } }),
    prisma.serviceVariant.createMany({ data: clean.map((r, i) => ({ serviceId, name: r.name.trim(), price: r.price ?? null, offerPrice: r.offerPrice ?? null, duration: r.duration?.trim() || null, sortOrder: i, linkedServiceId: link.get(r.name.trim().toLowerCase()) ?? null })), skipDuplicates: true }),
  ]);
}
export async function saveAddons(serviceId: string, rows: { name: string; price?: number | null }[]) {
  const clean = rows.filter((r) => r.name.trim());
  await prisma.$transaction([
    prisma.serviceAddon.deleteMany({ where: { serviceId } }),
    prisma.serviceAddon.createMany({ data: clean.map((r, i) => ({ serviceId, name: r.name.trim(), price: r.price ?? null, sortOrder: i })), skipDuplicates: true }),
  ]);
}

/* ───────────── Cities ───────────── */
export async function listCitiesAdmin() {
  const [cities, cov, hubs] = await Promise.all([
    prisma.city.findMany({ orderBy: [{ isActive: "desc" }, { name: "asc" }], select: { slug: true, name: true, isActive: true, _count: { select: { areas: true } } } }),
    prisma.proCoverage.findMany({ where: { pro: { status: "ACTIVE" } }, select: { proId: true, area: { select: { citySlug: true } } } }),
    prisma.page.findMany({ where: { type: "CITY" }, select: { entityId: true } }),
  ]);
  const pros = new Map<string, Set<string>>();
  for (const c of cov) (pros.get(c.area.citySlug) ?? pros.set(c.area.citySlug, new Set()).get(c.area.citySlug)!).add(c.proId);
  const hubSet = new Set(hubs.map((h) => h.entityId));
  return cities.map((c) => ({ ...c, areas: c._count.areas, activePros: pros.get(c.slug)?.size ?? 0, hasHub: hubSet.has(c.slug) }));
}

/** What launching (or pausing) a city would produce, computed with the same planner the site uses. */
export async function cityLaunchPreview(slug: string) {
  const plan = await planPages({ treatAsActive: [slug] });
  return plan.cities.find((c) => c.slug === slug) ?? null;
}

export async function setCityActive(slug: string, active: boolean) {
  await prisma.city.update({ where: { slug }, data: { isActive: active } });
  return syncPages();
}

/* ───────────── Areas ───────────── */
export async function listAreasAdmin(citySlug: string, q?: string, page = 1) {
  const where = { citySlug, ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}) };
  const [rows, total, city, pages] = await Promise.all([
    prisma.area.findMany({ where, orderBy: { name: "asc" }, skip: (page - 1) * PAGE, take: PAGE, select: { id: true, name: true, slug: true, zone: true, status: true, leadCount: true, landmarks: true, _count: { select: { coverage: true, nearby: true } } } }),
    prisma.area.count({ where }),
    prisma.city.findUnique({ where: { slug: citySlug }, select: { name: true, slug: true, isActive: true } }),
    prisma.page.findMany({ where: { type: "AREA" }, select: { entityId: true } }),
  ]);
  const hasPage = new Set(pages.map((p) => p.entityId));
  return { city, total, pages: Math.max(1, Math.ceil(total / PAGE)), items: rows.map((a) => ({ ...a, hasPage: hasPage.has(a.slug), proCount: a._count.coverage, nearby: a._count.nearby })) };
}

export async function getAreaAdmin(id: string) {
  const a = await prisma.area.findUnique({ where: { id }, include: { city: { select: { name: true, slug: true } } } });
  return a && { ...a, faqsText: faqsToText(a.faqs) };
}

export interface AreaInput { name: string; status: Status; sector?: string; zone?: string; landmarks: string; content?: string; faqs?: string; seoTitle?: string; seoDescription?: string; showOnHome?: boolean }
export async function saveArea(id: string, i: AreaInput) {
  await prisma.area.update({
    where: { id },
    data: {
      name: i.name.trim(), status: i.status, sector: i.sector?.trim() || null, zone: i.zone?.trim() || null,
      landmarks: i.landmarks.split(/[,\n]/).map((x) => x.trim()).filter(Boolean),
      content: i.content ? sanitizeRichHtml(i.content) : null, faqs: textToFaqs(i.faqs ?? ""),
      seoTitle: i.seoTitle?.trim() || null, seoDescription: i.seoDescription?.trim() || null, showOnHome: !!i.showOnHome,
    },
  });
  return syncPages();
}
