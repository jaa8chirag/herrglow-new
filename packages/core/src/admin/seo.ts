import { prisma } from "@herrglow/db";
import type { PageType } from "@herrglow/db";
import { wordCount } from "./html";
import { mediaKeySet } from "./media";
import { planPages } from "../seo/plan";
import { syncPages } from "../seo/pages";
import { proNoindexReason } from "../seo/pros";
import { THIN_BLOG_WORDS, THIN_SERVICE_WORDS } from "./review";
import { normalizePath } from "../seo/legacy";

const PAGE = 50;
export const siteIndexingEnabled = () => process.env.ALLOW_INDEXING === "true";

export interface PageFilter {
  type?: PageType;
  state?: "indexable" | "noindex";
  q?: string;
  page?: number;
}

/** Why a page is (not) indexable, in words. */
export interface PageRow {
  url: string;
  type: PageType;
  isIndexable: boolean;
  inSitemap: boolean;
  manualNoindex: boolean;
  qualityScore: number;
  lastmod: Date;
  reason: string;
}

export async function listPagesAdmin(f: PageFilter) {
  const page = Math.max(1, f.page ?? 1);
  const where = {
    ...(f.type ? { type: f.type } : {}),
    ...(f.state === "indexable"
      ? { isIndexable: true }
      : f.state === "noindex"
        ? { isIndexable: false }
        : {}),
    ...(f.q ? { url: { contains: f.q, mode: "insensitive" as const } } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: [{ isIndexable: "asc" }, { url: "asc" }],
      skip: (page - 1) * PAGE,
      take: PAGE,
    }),
    prisma.page.count({ where }),
  ]);

  // gather what's needed to explain noindex rows
  const noindex = rows.filter((r) => !r.isIndexable);
  const [services, blogs, pros, keys] = await Promise.all([
    prisma.service.findMany({
      where: {
        id: {
          in: noindex
            .filter((r) => r.type === "SERVICE")
            .map((r) => r.entityId!)
            .filter(Boolean),
        },
      },
      select: { id: true, description: true },
    }),
    prisma.blog.findMany({
      where: {
        id: {
          in: noindex
            .filter((r) => r.type === "BLOG")
            .map((r) => r.entityId!)
            .filter(Boolean),
        },
      },
      select: { id: true, content: true },
    }),
    prisma.pro.findMany({
      where: {
        slug: {
          in: noindex
            .filter((r) => r.type === "PRO")
            .map((r) => r.entityId!)
            .filter(Boolean),
        },
      },
      select: { slug: true, photo: true, bio: true },
    }),
    mediaKeySet(),
  ]);
  const sMap = new Map(services.map((s) => [s.id, wordCount(s.description)]));
  const bMap = new Map(blogs.map((b) => [b.id, wordCount(b.content)]));
  const pMap = new Map(pros.map((p) => [p.slug, proNoindexReason(p, keys)]));

  const reason = (r: (typeof rows)[number]): string => {
    if (r.manualNoindex) return "Manually set to noindex by an admin";
    if (r.isIndexable)
      return r.inSitemap ? "Indexable, in sitemap" : "Indexable, not in sitemap (legal page)";
    if (r.type === "SERVICE")
      return `Thin description (${sMap.get(r.entityId ?? "") ?? 0}/${THIN_SERVICE_WORDS} words). Fix in the review queue`;
    if (r.type === "BLOG")
      return `Thin post (${bMap.get(r.entityId ?? "") ?? 0}/${THIN_BLOG_WORDS} words). Rewrite in the review queue`;
    if (r.type === "PRO")
      return `Placeholder artist page: ${pMap.get(r.entityId ?? "") ?? "does not meet the quality gate"}`;
    return "Does not meet the quality gate";
  };
  return {
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE)),
    items: rows.map((r): PageRow => ({
      url: r.url,
      type: r.type,
      isIndexable: r.isIndexable,
      inSitemap: r.inSitemap,
      manualNoindex: r.manualNoindex,
      qualityScore: r.qualityScore,
      lastmod: r.lastmod,
      reason: reason(r),
    })),
  };
}

export async function seoSummary() {
  const [byType, plan] = await Promise.all([
    prisma.page.groupBy({ by: ["type"], _count: true }),
    planPages(),
  ]);
  const [indexable, inSitemap, manual] = await Promise.all([
    prisma.page.count({ where: { isIndexable: true } }),
    prisma.page.count({ where: { isIndexable: true, inSitemap: true } }),
    prisma.page.count({ where: { manualNoindex: true } }),
  ]);
  const total = byType.reduce((a, b) => a + b._count, 0);
  return {
    total,
    indexable,
    noindex: total - indexable,
    inSitemap,
    manual,
    byType: Object.fromEntries(byType.map((b) => [b.type, b._count])),
    siteIndexing: siteIndexingEnabled(),
    notCreated: {
      areaTextOnly: plan.cities.reduce((a, c) => a + c.areaTextOnly, 0),
      serviceCityDrafts: plan.cities.reduce((a, c) => a + c.serviceCityDrafts, 0),
      inactiveCities: plan.inactiveCities.length,
    },
  };
}

/** Manual override: keep a page out of the index regardless of quality. Survives re-syncs. */
export async function setManualNoindex(url: string, on: boolean) {
  await prisma.page.update({ where: { url }, data: { manualNoindex: on } });
  return syncPages();
}

/* ───────────── Redirect manager ───────────── */
export async function listRedirects(q?: string) {
  return prisma.redirect.findMany({
    where: q
      ? {
          OR: [
            { fromPath: { contains: q, mode: "insensitive" } },
            { toPath: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { fromPath: "asc" },
    take: 500,
  });
}

export type RedirectResult = { ok: true; warning?: string } | { ok: false; error: string };

export async function saveRedirect(i: {
  fromPath: string;
  toPath?: string;
  code: "MOVED_301" | "GONE_410";
  note?: string;
}): Promise<RedirectResult> {
  const raw = i.fromPath.trim();
  if (!raw.startsWith("/") || /[?#\s]/.test(raw))
    return {
      ok: false,
      error: "From path must start with / and contain no query string, fragment or spaces.",
    };
  const fromPath = normalizePath(raw);
  if (fromPath === "/") return { ok: false, error: "The home page cannot be redirected." };
  if (await prisma.page.findUnique({ where: { url: fromPath } }))
    return {
      ok: false,
      error:
        "That URL is a live page. A redirect would shadow it. Remove or change the page first.",
    };

  if (i.code === "GONE_410") {
    await prisma.redirect.upsert({
      where: { fromPath },
      update: { toPath: null, code: "GONE_410", note: i.note || null },
      create: { fromPath, toPath: null, code: "GONE_410", note: i.note || null },
    });
    return { ok: true };
  }
  const to = (i.toPath ?? "").trim();
  if (!to.startsWith("/") || /\s/.test(to))
    return { ok: false, error: "Target must be an internal path starting with /." };
  const toPath = normalizePath(to);
  if (toPath === fromPath) return { ok: false, error: "A URL cannot redirect to itself." };
  if (await prisma.redirect.findUnique({ where: { fromPath: toPath } }))
    return {
      ok: false,
      error: "The target is itself redirected: that creates a chain. Point at the final URL.",
    };
  const loop = await prisma.redirect.findFirst({
    where: { fromPath: { in: [toPath] }, toPath: fromPath },
  });
  if (loop) return { ok: false, error: "That would create a redirect loop." };
  await prisma.redirect.upsert({
    where: { fromPath },
    update: { toPath, code: "MOVED_301", note: i.note || null },
    create: { fromPath, toPath, code: "MOVED_301", note: i.note || null },
  });
  const live = await prisma.page.findUnique({ where: { url: toPath } });
  return {
    ok: true,
    warning: live ? undefined : "Saved, but the target is not a live page right now (it may 404).",
  };
}

export async function deleteRedirect(fromPath: string) {
  await prisma.redirect.delete({ where: { fromPath } });
}

export { syncPages };
