import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@herrglow/db";
import { decideLegacy, normalizePath, type LegacyContext } from "@herrglow/core/src/seo/legacy";
import { CANONICAL_HOST, SITE_URL } from "@/lib/site";

/**
 * Edge-of-app guard (Next 16 "proxy", Node runtime):
 *  1. Host guard: www → canonical (308). Any other non-canonical host in production is served with X-Robots-Tag: noindex.
 *  2. Legacy + redirect rules (see core/seo/legacy.ts): same-URL pass-through for pages that exist,
 *     301 for merged services and old artist URLs, 410 for everything else from the old site.
 */
const TTL_MS = 60_000;
let cache: { at: number; ctx: LegacyContext } | null = null;

async function context(force = false): Promise<LegacyContext> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) return cache.ctx;
  const [rows, pages, pros] = await Promise.all([
    prisma.redirect.findMany(),
    prisma.page.findMany({ select: { url: true } }),
    prisma.pro.findMany({ where: { legacySlug: { not: null } }, select: { legacySlug: true, slug: true } }),
  ]);
  const proPages = new Set((await prisma.page.findMany({ where: { type: "PRO" }, select: { url: true } })).map((p) => p.url));
  const ctx: LegacyContext = {
    redirects: new Map(rows.map((r) => [normalizePath(r.fromPath), { to: r.toPath, code: r.code }])),
    pageUrls: new Set(pages.map((p) => p.url)),
    // only artists that have a page on the new site get a 301; others are 410
    proByLegacySlug: new Map(pros.filter((p) => proPages.has(`/artists/${p.slug}`)).map((p) => [p.legacySlug!.toLowerCase(), `/artists/${p.slug}`])),
    blogsRedirect: process.env.LEGACY_BLOGS_REDIRECT === "true",
  };
  cache = { at: Date.now(), ctx };
  return ctx;
}

const noindex = (res: NextResponse) => (res.headers.set("X-Robots-Tag", "noindex, nofollow"), res);

export async function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const { pathname, search } = req.nextUrl;
  const prod = process.env.NODE_ENV === "production";
  const offHost = prod && host !== CANONICAL_HOST && !host.startsWith("localhost");

  if (offHost && host === `www.${CANONICAL_HOST}`) return NextResponse.redirect(`${SITE_URL}${pathname}${search}`, 308);

  if (!pathname.startsWith("/admin")) {
    try {
      let d = decideLegacy(pathname, await context());
      // Never serve a (sticky) 410 from stale data: a page may have just been published. Re-check the DB once
      // (at most every 5 s) before answering gone.
      if (d.kind === "gone" && cache && Date.now() - cache.at > 5_000) d = decideLegacy(pathname, await context(true));
      if (d.kind === "redirect") return NextResponse.redirect(new URL(d.to + search, req.nextUrl.origin), d.code);
      if (d.kind === "gone") return noindex(new NextResponse("Gone", { status: 410 }));
    } catch {
      // never take the site down because the rules lookup failed
    }
  }

  const res = NextResponse.next();
  return offHost ? noindex(res) : res;
}

export const config = {
  // skip Next internals, API routes and static assets
  matcher: ["/((?!_next/|api/|.*\.(?:png|jpe?g|webp|avif|svg|ico|gif|css|js|map|woff2?|txt|xml|json)$).*)"],
};
