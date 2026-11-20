import { prisma } from "@herrglow/db";
import { MIN_PROS_FOR_CITY_HUB, MIN_PROS_FOR_SERVICE_CITY } from "./thresholds";
import { proIsIndexable } from "./pros";

/** Area-page gate: (≥2 active pros cover it OR ≥1 lead came from it) AND has landmarks AND ≥1 nearby area. */
export const MIN_PROS_FOR_AREA = 2;

export interface CityPlan {
  city: string;
  slug: string;
  activePros: number;
  cityHub: boolean;
  /** service×city pairs meeting the pro threshold (≥ MIN_PROS_FOR_SERVICE_CITY active pros in the city offering the service) */
  serviceCityEligible: number;
  serviceCityDrafts: number;
  serviceCityPublished: number;
  areasTotal: number;
  areaPages: number;
  /** areas listed as text under "Areas we serve" only */
  areaTextOnly: number;
  /** artist pages that exist (active pro covering this city) */
  artistPages: number;
  /** …of which pass the quality gate (real photo + ≥50 words bio) and are indexable */
  artistIndexable: number;
  // concrete lists (used by Page sync / sitemaps)
  areaSlugs: string[];
  /** published service×city pages */
  publishedServiceCities: { serviceSlug: string; updatedAt: Date }[];
  proSlugs: string[];
  proIndexableSlugs: string[];
}

export interface SitePlan {
  cities: CityPlan[];
  servicePages: number;
  blogs: number;
  categories: number;
  inactiveCities: string[];
}

/** Decides which pages deserve to exist. Only ACTIVE cities generate anything. Shared by preview, sitemap and Page sync. */
export async function planPages(): Promise<SitePlan> {
  const allCities = await prisma.city.findMany({
    include: {
      areas: {
        where: { status: "ACTIVE" },
        include: { coverage: { include: { pro: { select: { id: true, status: true } } } }, _count: { select: { nearby: true } } },
      },
      services: true,
    },
    orderBy: { name: "asc" },
  });
  const activeServiceRows = await prisma.service.findMany({ where: { status: "ACTIVE", mergedIntoId: null }, select: { id: true, slug: true } });
  const activeServices = new Set(activeServiceRows.map((s) => s.id));
  const serviceSlug = new Map(activeServiceRows.map((s) => [s.id, s.slug]));
  const proServices = await prisma.proService.findMany({ where: { pro: { status: "ACTIVE" } }, select: { proId: true, serviceId: true } });
  const servicesByPro = new Map<string, Set<string>>();
  for (const ps of proServices) {
    if (!activeServices.has(ps.serviceId)) continue;
    (servicesByPro.get(ps.proId) ?? servicesByPro.set(ps.proId, new Set()).get(ps.proId)!).add(ps.serviceId);
  }
  const pros = await prisma.pro.findMany({ where: { status: "ACTIVE" }, select: { id: true, slug: true, photo: true, bio: true } });
  const mediaKeys = new Set((await prisma.media.findMany({ select: { key: true } })).map((m) => m.key));
  const proInfo = new Map(pros.map((p) => [p.id, { slug: p.slug, ok: proIsIndexable(p, mediaKeys) }]));

  const cities: CityPlan[] = [];
  for (const c of allCities.filter((x) => x.isActive)) {
    const cityPros = new Set<string>();
    for (const a of c.areas) for (const cov of a.coverage) if (cov.pro.status === "ACTIVE") cityPros.add(cov.proId);
    const cityHub = cityPros.size >= MIN_PROS_FOR_CITY_HUB;

    // eligibility is computed from pro data, not from ServiceCity availability rows
    const counts = new Map<string, number>();
    for (const p of cityPros) for (const sid of servicesByPro.get(p) ?? []) counts.set(sid, (counts.get(sid) ?? 0) + 1);
    const eligible = new Set([...counts].filter(([, n]) => n >= MIN_PROS_FOR_SERVICE_CITY).map(([sid]) => sid));
    const rows = c.services.filter((r) => eligible.has(r.serviceId) && !!r.localContent);
    const drafts = rows.filter((r) => r.contentStatus === "DRAFT").length;
    const publishedRows = rows.filter((r) => r.contentStatus === "PUBLISHED");

    const areas = c.areas.filter((a) => {
      const activePros = a.coverage.filter((cv) => cv.pro.status === "ACTIVE").length;
      // an area whose slug equals the city slug is the city hub itself, never a separate page
      return a.slug !== c.slug && (activePros >= MIN_PROS_FOR_AREA || a.leadCount >= 1) && a.landmarks.length >= 1 && a._count.nearby >= 1;
    });
    const proSlugs = [...cityPros].filter((p) => proInfo.has(p)).map((p) => proInfo.get(p)!.slug);
    const proIndexableSlugs = [...cityPros].filter((p) => proInfo.get(p)?.ok).map((p) => proInfo.get(p)!.slug);

    cities.push({
      city: c.name, slug: c.slug, activePros: cityPros.size, cityHub,
      serviceCityEligible: cityHub ? eligible.size : 0,
      serviceCityDrafts: cityHub ? drafts : 0, serviceCityPublished: cityHub ? publishedRows.length : 0,
      areasTotal: c.areas.length, areaPages: cityHub ? areas.length : 0, areaTextOnly: cityHub ? c.areas.length - areas.length : c.areas.length,
      artistPages: cityHub ? proSlugs.length : 0, artistIndexable: cityHub ? proIndexableSlugs.length : 0,
      areaSlugs: cityHub ? areas.map((a) => a.slug) : [],
      publishedServiceCities: cityHub ? publishedRows.map((r) => ({ serviceSlug: serviceSlug.get(r.serviceId)!, updatedAt: r.generatedAt ?? new Date() })) : [],
      proSlugs: cityHub ? proSlugs : [], proIndexableSlugs: cityHub ? proIndexableSlugs : [],
    });
  }
  const [blogs, categories] = await Promise.all([
    prisma.blog.count({ where: { status: "ACTIVE" } }),
    prisma.category.count({ where: { services: { some: { status: "ACTIVE", mergedIntoId: null } } } }),
  ]);
  return { cities, servicePages: activeServices.size, blogs, categories, inactiveCities: allCities.filter((x) => !x.isActive).map((x) => x.name) };
}
