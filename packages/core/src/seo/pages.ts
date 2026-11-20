import { prisma } from "@herrglow/db";
import type { PageType } from "@herrglow/db";
import { planPages } from "./plan";
import { urls } from "./urls";

const words = (html: string | null | undefined) => (html ? html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length : 0);
const score = (checks: boolean[]) => Math.round((checks.filter(Boolean).length / checks.length) * 100);

interface Desired { url: string; type: PageType; entityId?: string; isIndexable: boolean; inSitemap: boolean; qualityScore: number; lastmod: Date }

/** Computes every public page that should exist, with its indexing flags. Pure read; see syncPages to persist. */
export async function desiredPages(): Promise<Desired[]> {
  const now = new Date();
  const out: Desired[] = [];
  const add = (d: Omit<Desired, "lastmod"> & { lastmod?: Date }) => out.push({ lastmod: now, ...d });

  add({ url: urls.home(), type: "HOME", isIndexable: true, inSitemap: true, qualityScore: 100 });
  for (const [url, inSitemap] of [[urls.about(), true], [urls.contact(), true], [urls.blogIndex(), true], [urls.services(), true], [urls.join(), true], [urls.privacy(), false], [urls.terms(), false]] as const)
    add({ url, type: "STATIC", isIndexable: true, inSitemap, qualityScore: 100 });

  const services = await prisma.service.findMany({ where: { status: "ACTIVE", mergedIntoId: null }, include: { category: true } });
  const catSlugs = new Set<string>();
  for (const s of services) {
    catSlugs.add(s.category.slug);
    const q = score([words(s.description) >= 80, !!s.faqs, !!s.image && !!s.imageAlt, s.price != null || s.offerPrice != null, !!s.seoTitle, !!s.seoDescription]);
    add({ url: urls.service(s.slug), type: "SERVICE", entityId: s.id, isIndexable: words(s.description) >= 80, inSitemap: words(s.description) >= 80, qualityScore: q, lastmod: s.updatedAt });
  }
  for (const c of catSlugs) add({ url: urls.category(c), type: "CATEGORY", isIndexable: true, inSitemap: true, qualityScore: 100 });

  const blogs = await prisma.blog.findMany({ where: { status: "ACTIVE" } });
  for (const b of blogs) {
    const w = words(b.content);
    // thin posts stay reachable but are noindex and out of the sitemap until rewritten
    add({ url: urls.blog(b.slug), type: "BLOG", entityId: b.id, isIndexable: w >= 350, inSitemap: w >= 350, qualityScore: Math.min(100, Math.round((w / 900) * 100)), lastmod: b.updatedAt });
  }

  const plan = await planPages();
  for (const c of plan.cities) {
    if (!c.cityHub) continue;
    add({ url: urls.cityHub(c.slug), type: "CITY", entityId: c.slug, isIndexable: true, inSitemap: true, qualityScore: 80 });
    for (const a of c.areaSlugs) add({ url: urls.area(a), type: "AREA", entityId: a, isIndexable: true, inSitemap: true, qualityScore: 70 });
    for (const sc of c.publishedServiceCities)
      add({ url: urls.serviceCity(sc.serviceSlug, c.slug), type: "SERVICE_CITY", entityId: `${sc.serviceSlug}|${c.slug}`, isIndexable: true, inSitemap: true, qualityScore: 80, lastmod: sc.updatedAt });
  }
  const proSlugs = new Set(plan.cities.flatMap((c) => c.proSlugs));
  const proIndexable = new Set(plan.cities.flatMap((c) => c.proIndexableSlugs));
  // placeholder artists (no real photo or thin bio) exist but are noindex + out of the sitemap until media/bio is added
  for (const s of proSlugs) add({ url: urls.pro(s), type: "PRO", entityId: s, isIndexable: proIndexable.has(s), inSitemap: proIndexable.has(s), qualityScore: proIndexable.has(s) ? 75 : 30 });
  return out;
}

/** Persists desired pages. Pages that no longer qualify are DELETED, so the URL stops resolving (404, or 410 for legacy URLs). */
export async function syncPages() {
  const desired = await desiredPages();
  const urlsSet = new Set(desired.map((d) => d.url));
  const manual = new Set((await prisma.page.findMany({ where: { manualNoindex: true }, select: { url: true } })).map((p) => p.url));
  for (const d0 of desired) {
    const d = manual.has(d0.url) ? { ...d0, isIndexable: false, inSitemap: false } : d0; // admin override wins
    await prisma.page.upsert({
      where: { url: d.url },
      update: { type: d.type, entityId: d.entityId, isIndexable: d.isIndexable, inSitemap: d.inSitemap, qualityScore: d.qualityScore, lastmod: d.lastmod },
      create: d,
    });
  }
  const stale = await prisma.page.deleteMany({ where: { url: { notIn: [...urlsSet] } } });
  return { upserted: desired.length, removed: stale.count };
}
