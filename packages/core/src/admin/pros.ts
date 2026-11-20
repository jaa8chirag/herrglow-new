import { prisma } from "@herrglow/db";
import type { ProStatus, ProviderType } from "@herrglow/db";
import { sanitizeRichHtml } from "./html";
import { mediaKeySet } from "./media";
import { proNoindexReason } from "../seo/pros";
import { syncPages } from "../seo/pages";

export interface ProFilter { q?: string; status?: ProStatus; needsCoverage?: boolean; needsPhoto?: boolean; page?: number }
const PAGE = 40;

const whereOf = (f: ProFilter, keys: string[] = []) => ({
  ...(f.needsPhoto ? { status: "ACTIVE" as const, OR: [{ photo: null }, { photo: { notIn: keys } }] } : {}),
  ...(f.status ? { status: f.status } : {}),
  ...(f.needsCoverage ? { status: "ACTIVE" as const, coverage: { none: {} } } : {}),
  ...(f.q ? { name: { contains: f.q, mode: "insensitive" as const } } : {}),
});

export async function listProsAdmin(f: ProFilter) {
  const page = Math.max(1, f.page ?? 1);
  const keyList = [...(await mediaKeySet())];
  const [rows, total, keys, needsPhotoCount] = await Promise.all([
    prisma.pro.findMany({
      where: whereOf(f, keyList), orderBy: { name: "asc" }, skip: (page - 1) * PAGE, take: PAGE,
      select: { id: true, name: true, slug: true, providerType: true, status: true, photo: true, bio: true, _count: { select: { services: true, coverage: true } }, coverage: { select: { area: { select: { city: { select: { isActive: true } } } } } } },
    }),
    prisma.pro.count({ where: whereOf(f, keyList) }),
    mediaKeySet(),
    prisma.pro.count({ where: whereOf({ needsPhoto: true }, keyList) }),
  ]);
  return {
    total, page, needsPhotoCount, pages: Math.max(1, Math.ceil(total / PAGE)),
    items: rows.map((p) => ({
      id: p.id, name: p.name, slug: p.slug, providerType: p.providerType, status: p.status,
      services: p._count.services, coverage: p._count.coverage,
      activeCityCoverage: p.coverage.filter((c) => c.area.city.isActive).length,
      /** active artist with zero coverage anywhere: cannot appear on any page */
      needsCoverage: p.status === "ACTIVE" && p._count.coverage === 0,
      noindexReason: proNoindexReason(p, keys),
      hasPhoto: !!p.photo && keys.has(p.photo),
    })),
  };
}

export async function needsCoverageCount() {
  return prisma.pro.count({ where: { status: "ACTIVE", coverage: { none: {} } } });
}

export async function getProAdmin(id: string) {
  const [pro, categories, cities, keys] = await Promise.all([
    prisma.pro.findUnique({ where: { id }, include: { private: true, services: { select: { serviceId: true } }, coverage: { select: { areaId: true, area: { select: { citySlug: true } } } } } }),
    prisma.category.findMany({ orderBy: { sort: "asc" }, include: { services: { where: { status: "ACTIVE", mergedIntoId: null }, orderBy: { title: "asc" }, select: { id: true, title: true } } } }),
    prisma.city.findMany({ where: { areas: { some: {} } }, orderBy: [{ isActive: "desc" }, { name: "asc" }], select: { slug: true, name: true, isActive: true } }),
    mediaKeySet(),
  ]);
  if (!pro) return null;
  return { pro, categories, cities, noindexReason: proNoindexReason(pro, keys), mediaKeys: keys };
}

export async function areasOfCity(citySlug: string) {
  return prisma.area.findMany({ where: { citySlug, status: "ACTIVE" }, orderBy: { name: "asc" }, select: { id: true, name: true, zone: true } });
}

export interface ProProfileInput {
  name: string; providerType: ProviderType; status: ProStatus; specialization?: string; experienceYears?: number | null;
  bio?: string; basePrice?: number | null; seoTitle?: string; seoDescription?: string;
}
export async function saveProProfile(id: string, i: ProProfileInput) {
  await prisma.pro.update({
    where: { id },
    data: {
      name: i.name.trim(), providerType: i.providerType, status: i.status, specialization: i.specialization?.trim() || null,
      experienceYears: i.experienceYears ?? null, bio: i.bio ? sanitizeRichHtml(i.bio) : null, basePrice: i.basePrice ?? null,
      seoTitle: i.seoTitle?.trim() || null, seoDescription: i.seoDescription?.trim() || null,
    },
  });
  return syncPages();
}

/** Private contact data: stored for admin/ops only, never selected by public queries. */
export async function savePrivate(proId: string, i: { phone?: string; email?: string; addressLine?: string; pincode?: string }) {
  const data = { phone: i.phone?.trim() || null, email: i.email?.trim() || null, addressLine: i.addressLine?.trim() || null, pincode: i.pincode?.trim() || null };
  await prisma.proPrivate.upsert({ where: { proId }, update: data, create: { proId, ...data } });
}

export async function setProServices(proId: string, serviceIds: string[]) {
  const valid = await prisma.service.findMany({ where: { id: { in: serviceIds }, status: "ACTIVE", mergedIntoId: null }, select: { id: true } });
  const existing = await prisma.proService.findMany({ where: { proId } });
  const keepPrice = new Map(existing.map((e) => [e.serviceId, e.price]));
  await prisma.$transaction([
    prisma.proService.deleteMany({ where: { proId } }),
    prisma.proService.createMany({ data: valid.map((s) => ({ proId, serviceId: s.id, price: keepPrice.get(s.id) ?? null })) }),
  ]);
  return syncPages();
}

/** Replaces this artist's coverage inside ONE city (other cities untouched). */
export async function setProCoverageForCity(proId: string, citySlug: string, areaIds: string[]) {
  const cityAreas = await prisma.area.findMany({ where: { citySlug }, select: { id: true } });
  const allowed = new Set(cityAreas.map((a) => a.id));
  const chosen = areaIds.filter((a) => allowed.has(a));
  const existing = await prisma.proCoverage.findMany({ where: { proId, areaId: { in: [...allowed] } } });
  const keep = new Map(existing.map((e) => [e.areaId, e]));
  await prisma.$transaction([
    prisma.proCoverage.deleteMany({ where: { proId, areaId: { in: [...allowed] } } }),
    prisma.proCoverage.createMany({ data: chosen.map((areaId) => ({ proId, areaId, price: keep.get(areaId)?.price ?? null, priceLabel: keep.get(areaId)?.priceLabel ?? null })) }),
  ]);
  return syncPages();
}

export async function setProPhoto(proId: string, key: string | null) {
  await prisma.pro.update({ where: { id: proId }, data: { photo: key } });
  return syncPages();
}

type PortfolioItem = { path: string; alt: string };
const portfolioOf = (v: unknown): PortfolioItem[] => (Array.isArray(v) ? (v as PortfolioItem[]).filter((x) => x && typeof x.path === "string") : []);

export async function addPortfolioItem(proId: string, item: PortfolioItem) {
  const pro = await prisma.pro.findUnique({ where: { id: proId }, select: { portfolio: true } });
  await prisma.pro.update({ where: { id: proId }, data: { portfolio: [...portfolioOf(pro?.portfolio), item] } });
}
export async function removePortfolioItem(proId: string, path: string) {
  const pro = await prisma.pro.findUnique({ where: { id: proId }, select: { portfolio: true } });
  await prisma.pro.update({ where: { id: proId }, data: { portfolio: portfolioOf(pro?.portfolio).filter((p) => p.path !== path) } });
}
