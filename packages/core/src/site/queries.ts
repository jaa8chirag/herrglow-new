import { prisma } from "@herrglow/db";
import { MIN_PROS_FOR_SERVICE_CITY } from "../seo/thresholds";

/**
 * PUBLIC pro fields. `private` (phone, email, address, referral) is deliberately absent:
 * every public page and the public API must select pros through this constant.
 */
export const publicProSelect = {
  id: true, slug: true, name: true, providerType: true, photo: true, portfolio: true, experienceYears: true,
  specialization: true, bio: true, basePrice: true, seoTitle: true, seoDescription: true,
} as const;

export type Faq = { question: string; answer: string };
export const asFaqs = (v: unknown): Faq[] =>
  Array.isArray(v) ? v.filter((f): f is Faq => !!f && typeof (f as Faq).question === "string" && typeof (f as Faq).answer === "string") : [];

const liveService = { status: "ACTIVE", mergedIntoId: null } as const;

/** Page rows are the source of truth for "does this public URL exist". */
export async function findPage(url: string) {
  return prisma.page.findUnique({ where: { url } });
}

export async function getCategories() {
  const cats = await prisma.category.findMany({ orderBy: { sort: "asc" }, include: { _count: { select: { services: { where: liveService } } } } });
  return cats.filter((c) => c._count.services > 0);
}

export async function getCategoryPage(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      subcategories: {
        where: { status: "ACTIVE" },
        orderBy: { displayOrder: "asc" },
        include: {
          services: {
            where: { status: { in: ["ACTIVE", "COMING_SOON"] }, mergedIntoId: null },
            orderBy: [{ leadCount: "desc" }, { sort: "asc" }],
            include: { variants: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
      services: {
        where: { status: { in: ["ACTIVE", "COMING_SOON"] }, mergedIntoId: null },
        orderBy: [{ leadCount: "desc" }, { sort: "asc" }],
        include: { variants: { orderBy: { sortOrder: "asc" } }, subCategory: true },
      },
    },
  });
}

export async function getPopularServices(n = 6) {
  return prisma.service.findMany({ where: liveService, orderBy: [{ leadCount: "desc" }, { sort: "asc" }], take: n, include: { category: true } });
}

/** Cities that have a live hub page: the ONLY cities shown in nav/footer/"areas we serve". Falls back to all active cities if no city pages exist yet. */
export async function getLiveCities() {
  const pages = await prisma.page.findMany({ where: { type: "CITY", isIndexable: true }, select: { entityId: true } });
  const slugs = pages.map((p) => p.entityId!).filter(Boolean);
  if (slugs.length === 0) {
    return prisma.city.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { slug: true, name: true } });
  }
  return prisma.city.findMany({ where: { slug: { in: slugs }, isActive: true }, orderBy: { name: "asc" }, select: { slug: true, name: true } });
}

export async function getLiveAreas() {
  return prisma.area.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: { name: true, slug: true, citySlug: true },
  });
}

export async function getServicePage(slug: string, categorySlug?: string) {
  const svc = await prisma.service.findFirst({
    where: {
      slug,
      status: { in: ["ACTIVE", "COMING_SOON"] },
      mergedIntoId: null,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: {
      category: true,
      subCategory: true,
      variants: { orderBy: { sortOrder: "asc" } },
      addons: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!svc) return null;
  const [related, cityPages] = await Promise.all([
    prisma.service.findMany({ where: { categoryId: svc.categoryId, id: { not: svc.id }, status: "ACTIVE", mergedIntoId: null }, orderBy: { leadCount: "desc" }, take: 6 }),
    prisma.page.findMany({ where: { type: "SERVICE_CITY", isIndexable: true, entityId: { startsWith: `${slug}|` } }, select: { url: true, entityId: true } }),
  ]);
  const citySlugs = cityPages.map((p) => p.entityId!.split("|")[1]!);
  const cities = citySlugs.length ? await prisma.city.findMany({ where: { slug: { in: citySlugs } }, select: { slug: true, name: true } }) : [];
  const linkedIds = svc.variants.map((v) => v.linkedServiceId).filter((x): x is string => !!x);
  const linked = linkedIds.length ? await prisma.service.findMany({ where: { id: { in: linkedIds }, status: "ACTIVE", mergedIntoId: null }, select: { id: true, slug: true } }) : [];
  return { svc, related, serviceCities: cities, variantLinks: Object.fromEntries(linked.map((l) => [l.id, l.slug])) as Record<string, string> };
}

/** Pros active in a city (coverage in that city's areas). */
async function cityProIds(citySlug: string) {
  const cov = await prisma.proCoverage.findMany({ where: { area: { citySlug, status: "ACTIVE" }, pro: { status: "ACTIVE" } }, select: { proId: true } });
  return [...new Set(cov.map((c) => c.proId))];
}

export async function getCityHub(slug: string) {
  const city = await prisma.city.findFirst({ where: { slug, isActive: true }, include: { areas: { where: { status: "ACTIVE" }, orderBy: { name: "asc" }, select: { slug: true, name: true, zone: true } } } });
  if (!city) return null;
  const proIds = await cityProIds(slug);
  const [pros, areaPages, proPages, proSvc] = await Promise.all([
    prisma.pro.findMany({ where: { id: { in: proIds } }, select: publicProSelect, orderBy: { experienceYears: "desc" } }),
    prisma.page.findMany({ where: { type: "AREA", isIndexable: true, entityId: { in: (await prisma.area.findMany({ where: { citySlug: slug }, select: { slug: true } })).map((a) => a.slug) } }, select: { entityId: true } }),
    prisma.page.findMany({ where: { type: "PRO", isIndexable: true }, select: { entityId: true } }),
    prisma.proService.findMany({ where: { proId: { in: proIds } }, select: { serviceId: true } }),
  ]);
  const counts = new Map<string, number>();
  for (const p of proSvc) counts.set(p.serviceId, (counts.get(p.serviceId) ?? 0) + 1);
  const eligible = [...counts].filter(([, n]) => n >= MIN_PROS_FOR_SERVICE_CITY).map(([id]) => id);
  const services = await prisma.service.findMany({ where: { id: { in: eligible }, ...liveService }, orderBy: [{ leadCount: "desc" }, { sort: "asc" }], include: { category: true } });
  const cityPages = await prisma.page.findMany({ where: { type: "SERVICE_CITY", isIndexable: true, entityId: { endsWith: `|${slug}` } }, select: { entityId: true } });
  return {
    city,
    pros,
    services,
    areaPageSlugs: new Set(areaPages.map((a) => a.entityId!)),
    proPageSlugs: new Set(proPages.map((p) => p.entityId!)),
    serviceCityPageSlugs: new Set(cityPages.map((p) => p.entityId!.split("|")[0]!)),
  };
}

export async function getServiceCity(serviceSlug: string, citySlug: string) {
  const row = await prisma.serviceCity.findFirst({
    where: { contentStatus: "PUBLISHED", service: { slug: serviceSlug, ...liveService }, city: { slug: citySlug, isActive: true } },
    include: { service: { include: { category: true, variants: { orderBy: { sortOrder: "asc" } } } }, city: true },
  });
  if (!row) return null;
  const proIds = await cityProIds(citySlug);
  const offering = await prisma.proService.findMany({ where: { serviceId: row.serviceId, proId: { in: proIds } }, select: { proId: true } });
  const pros = await prisma.pro.findMany({ where: { id: { in: offering.map((o) => o.proId) } }, select: publicProSelect, orderBy: { experienceYears: "desc" } });
  const proPages = await prisma.page.findMany({ where: { type: "PRO", isIndexable: true }, select: { entityId: true } });
  return { row, pros, proPageSlugs: new Set(proPages.map((p) => p.entityId!)) };
}

export async function getAreaPage(slug: string) {
  const area = await prisma.area.findFirst({
    where: { slug, status: "ACTIVE", city: { isActive: true } },
    include: { city: true, nearby: { include: { nearby: { select: { slug: true, name: true } } } } },
  });
  if (!area) return null;
  const [cov, areaPages, proPages] = await Promise.all([
    prisma.proCoverage.findMany({ where: { areaId: area.id, pro: { status: "ACTIVE" } }, include: { pro: { select: publicProSelect } } }),
    prisma.page.findMany({ where: { type: "AREA", isIndexable: true }, select: { entityId: true } }),
    prisma.page.findMany({ where: { type: "PRO", isIndexable: true }, select: { entityId: true } }),
  ]);
  const proIds = cov.map((c) => c.proId);
  const svcRows = await prisma.proService.findMany({ where: { proId: { in: proIds } }, select: { serviceId: true } });
  const services = await prisma.service.findMany({ where: { id: { in: [...new Set(svcRows.map((s) => s.serviceId))] }, ...liveService }, orderBy: { leadCount: "desc" }, take: 8 });
  return {
    area,
    pros: cov.map((c) => c.pro),
    services,
    nearby: area.nearby.map((n) => n.nearby),
    areaPageSlugs: new Set(areaPages.map((a) => a.entityId!)),
    proPageSlugs: new Set(proPages.map((p) => p.entityId!)),
  };
}

export async function getProPage(slug: string) {
  const pro = await prisma.pro.findFirst({ where: { slug, status: "ACTIVE" }, select: { ...publicProSelect, services: { select: { service: { select: { slug: true, title: true, status: true, mergedIntoId: true, price: true, offerPrice: true } } } }, coverage: { select: { area: { select: { name: true, slug: true, city: { select: { slug: true, name: true, isActive: true } } } } } } } });
  if (!pro) return null;
  const services = pro.services.map((s) => s.service).filter((s) => s.status === "ACTIVE" && !s.mergedIntoId);
  const cities = new Map<string, { slug: string; name: string; areas: string[] }>();
  for (const c of pro.coverage) {
    if (!c.area.city.isActive) continue; // inactive cities never appear publicly
    const e = cities.get(c.area.city.slug) ?? { slug: c.area.city.slug, name: c.area.city.name, areas: [] };
    e.areas.push(c.area.name);
    cities.set(c.area.city.slug, e);
  }
  // only media that really exists in the library (and is deliverable) is shown; otherwise the UI renders a placeholder
  const wanted = [pro.photo, ...((Array.isArray(pro.portfolio) ? pro.portfolio : []) as { path?: string }[]).map((p) => p.path)].filter((x): x is string => !!x && !/^https?:\/\//.test(x));
  const have = (process.env.MEDIA_BASE ?? process.env.NEXT_PUBLIC_MEDIA_BASE ?? "").trim() && wanted.length ? new Set((await prisma.media.findMany({ where: { key: { in: wanted } }, select: { key: true } })).map((m) => m.key)) : new Set<string>();
  return { pro, services, cities: [...cities.values()], realMedia: have };
}

export async function getBlogs() {
  return prisma.blog.findMany({ where: { status: "ACTIVE" }, orderBy: { publishedAt: "desc" }, select: { slug: true, title: true, excerpt: true, image: true, imageAlt: true, publishedAt: true } });
}

export async function getBlog(slug: string) {
  return prisma.blog.findFirst({ where: { slug, status: "ACTIVE" } });
}

/** Contextual internal links for a blog: services whose title words appear in the post. */
export async function relatedServicesForText(text: string, n = 4) {
  const hay = text.toLowerCase();
  const services = await prisma.service.findMany({ where: liveService, select: { slug: true, title: true, leadCount: true } });
  const score = (t: string) => t.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 4 && w !== "makeup" && hay.includes(w)).length + (hay.includes(t.toLowerCase()) ? 3 : 0);
  return services.map((s) => ({ ...s, score: score(s.title) })).filter((s) => s.score > 0).sort((a, b) => b.score - a.score || b.leadCount - a.leadCount).slice(0, n);
}

export async function getRelatedBlogs(text: string, excludeSlug: string | null, n = 3) {
  const words = [...new Set(text.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 5))];
  const blogs = await prisma.blog.findMany({ where: { status: "ACTIVE", ...(excludeSlug ? { slug: { not: excludeSlug } } : {}) }, select: { slug: true, title: true } });
  return blogs.map((b) => ({ ...b, score: words.filter((w) => b.title.toLowerCase().includes(w)).length })).sort((a, b) => b.score - a.score).slice(0, n);
}

export async function getTestimonials(n = 5) {
  return prisma.testimonial.findMany({ where: { status: "ACTIVE" }, orderBy: { sort: "asc" }, take: n });
}

/** Mega-menu data: per category its top services (by enquiries). */
export async function getMegaMenu() {
  const pick = { slug: true, title: true, image: true, imageAlt: true, price: true, offerPrice: true } as const;
  const cats = await prisma.category.findMany({
    orderBy: { sort: "asc" },
    include: {
      services: {
        where: liveService,
        orderBy: [{ leadCount: "desc" }, { sort: "asc" }],
        take: 5,
        select: pick,
      },
    },
  });
  return {
    categories: cats
      .filter((c) => c.services.length > 0)
      .map((c) => ({ slug: c.slug, name: c.name, services: c.services })),
    bridal: [],
  };
}

/** Extra data for the home page: honest stats (counts of real things), artists, packages, gallery, city cards. */
export async function getHomeExtras() {
  const liveCityRows = await getLiveCities();
  const citySlugs = liveCityRows.map((c) => c.slug);
  const [cov, services, packages, gallery, areaCoverage, tAgg] = await Promise.all([
    prisma.proCoverage.findMany({ where: { pro: { status: "ACTIVE" }, area: { citySlug: { in: citySlugs }, status: "ACTIVE" } }, select: { proId: true, areaId: true, area: { select: { citySlug: true } } } }),
    prisma.service.count({ where: liveService }),
    prisma.service.findMany({ where: { ...liveService, isPackage: true }, orderBy: [{ leadCount: "desc" }, { sort: "asc" }], select: { id: true, slug: true, title: true, shortDescription: true, price: true, offerPrice: true, duration: true, image: true, imageAlt: true, features: true, leadCount: true, variants: { select: { price: true, offerPrice: true } } } }),
    prisma.galleryItem.findMany({ where: { status: "ACTIVE", mediaType: "IMAGE", mediaPath: { not: null } }, orderBy: { sort: "asc" }, select: { id: true, title: true, mediaPath: true, alt: true, category: true } }),
    prisma.area.count({ where: { citySlug: { in: citySlugs }, status: "ACTIVE", coverage: { some: { pro: { status: "ACTIVE" } } } } }),
    prisma.testimonial.aggregate({ where: { status: "ACTIVE" }, _avg: { rating: true }, _count: true }),
  ]);
  const proIds = [...new Set(cov.map((c) => c.proId))];
  const cityOfPro = new Map<string, string>();
  for (const c of cov) if (!cityOfPro.has(c.proId)) cityOfPro.set(c.proId, c.area.citySlug);
  const pros = await prisma.pro.findMany({ where: { id: { in: proIds } }, select: { ...publicProSelect }, orderBy: [{ experienceYears: "desc" }] });
  const proPages = await prisma.page.findMany({ where: { type: "PRO" }, select: { entityId: true } });
  const cityName = new Map(liveCityRows.map((c) => [c.slug, c.name]));
  const perCity = citySlugs.map((slug) => ({
    slug, name: cityName.get(slug)!,
    artists: new Set(cov.filter((c) => c.area.citySlug === slug).map((c) => c.proId)).size,
    areas: new Set(cov.filter((c) => c.area.citySlug === slug).map((c) => c.areaId)).size,
  }));
  return {
    stats: { artists: proIds.length, services, areas: areaCoverage, cities: citySlugs.length },
    pros: pros.map((p) => ({ ...p, city: cityName.get(cityOfPro.get(p.id) ?? "") ?? null })),
    proPageSlugs: new Set(proPages.map((p) => p.entityId!)),
    packages, gallery, perCity,
    reviews: { avg: tAgg._avg.rating ? Math.round(tAgg._avg.rating * 10) / 10 : null, count: tAgg._count },
  };
}

/* ───────── UI-5: services explorer, packages, service extras ───────── */

/** Every live service, lightweight, for the /services explorer (client-side filter). */
export async function getAllServicesForExplorer() {
  return prisma.service.findMany({
    where: liveService,
    orderBy: [{ category: { sort: "asc" } }, { sort: "asc" }, { leadCount: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
      price: true,
      offerPrice: true,
      priceLabel: true,
      duration: true,
      image: true,
      imageAlt: true,
      leadCount: true,
      isPackage: true,
      category: { select: { slug: true, name: true, sort: true } },
      variants: { select: { name: true, price: true, offerPrice: true } },
    },
  });
}

export async function getPackagesData() {
  const [rows, services] = await Promise.all([
    prisma.package.findMany({ where: { status: "ACTIVE" }, include: { services: { include: { service: { select: { slug: true, title: true } } } } } }),
    prisma.service.findMany({ where: { ...liveService, isPackage: true }, orderBy: [{ leadCount: "desc" }, { sort: "asc" }], include: { category: { select: { name: true, slug: true } }, variants: { orderBy: { sortOrder: "asc" } } } }),
  ]);
  return { packages: rows, services };
}

export async function getPackagePage(slug: string) {
  return prisma.package.findFirst({ where: { slug, status: "ACTIVE" }, include: { services: { include: { service: { select: { slug: true, title: true, shortDescription: true, price: true, offerPrice: true, image: true, imageAlt: true } } } } } });
}

/** Artists offering a service in the live cities (public fields only). */
export async function getServiceArtists(serviceId: string, n = 8) {
  const live = await prisma.city.findMany({ where: { isActive: true }, select: { slug: true, name: true } });
  const slugs = live.map((c) => c.slug);
  const offering = await prisma.proService.findMany({ where: { serviceId, pro: { status: "ACTIVE" } }, select: { proId: true } });
  const ids = offering.map((o) => o.proId);
  const cov = await prisma.proCoverage.findMany({ where: { proId: { in: ids }, area: { citySlug: { in: slugs }, status: "ACTIVE" } }, select: { proId: true, area: { select: { citySlug: true } } } });
  const city = new Map<string, string>();
  for (const c of cov) if (!city.has(c.proId)) city.set(c.proId, live.find((l) => l.slug === c.area.citySlug)?.name ?? "");
  const pros = await prisma.pro.findMany({ where: { id: { in: [...city.keys()] } }, select: publicProSelect, orderBy: { experienceYears: "desc" }, take: n });
  const pages = await prisma.page.findMany({ where: { type: "PRO" }, select: { entityId: true } });
  const linked = new Set(pages.map((p) => p.entityId!));
  return pros.map((p) => ({ ...p, city: city.get(p.id) ?? null, linked: linked.has(p.slug) }));
}

/** Reviews for a service (matched by the service name on the review), falling back to the latest ones. */
export async function getReviewsFor(title: string, n = 6) {
  const words = title.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 4 && w !== "makeup");
  const all = await prisma.testimonial.findMany({ where: { status: "ACTIVE" }, orderBy: { sort: "asc" } });
  const matched = all.filter((t) => words.some((w) => (t.serviceName ?? "").toLowerCase().includes(w)));
  return { items: (matched.length ? matched : all).slice(0, n), matched: matched.length > 0 };
}

export async function getCategoryExtras(categoryId: string) {
  const pk = await prisma.service.findMany({ where: { ...liveService, isPackage: true, categoryId }, take: 3, select: { slug: true, title: true, price: true, offerPrice: true, image: true, imageAlt: true, shortDescription: true, categoryId: true } });
  return { packages: pk };
}
