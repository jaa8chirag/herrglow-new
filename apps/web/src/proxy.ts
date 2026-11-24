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
    prisma.pro.findMany({
      where: { legacySlug: { not: null } },
      select: { legacySlug: true, slug: true },
    }),
  ]);
  const proPages = new Set(
    (await prisma.page.findMany({ where: { type: "PRO" }, select: { url: true } })).map(
      (p) => p.url
    )
  );
  const ctx: LegacyContext = {
    redirects: new Map(
      rows.map((r) => [normalizePath(r.fromPath), { to: r.toPath, code: r.code }])
    ),
    pageUrls: new Set(pages.map((p) => p.url)),
    // only artists that have a page on the new site get a 301; others are 410
    proByLegacySlug: new Map(
      pros
        .filter((p) => proPages.has(`/artists/${p.slug}`))
        .map((p) => [p.legacySlug!.toLowerCase(), `/artists/${p.slug}`])
    ),
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

  if (offHost && host === `www.${CANONICAL_HOST}`)
    return NextResponse.redirect(`${SITE_URL}${pathname}${search}`, 308);

  if (!pathname.startsWith("/admin")) {
    try {
      let d = decideLegacy(pathname, await context());
      // Never serve a (sticky) 410 from stale data: a page may have just been published. Re-check the DB once
      // (at most every 5 s) before answering gone.
      if (d.kind === "gone" && cache && Date.now() - cache.at > 5_000)
        d = decideLegacy(pathname, await context(true));
      if (d.kind === "redirect")
        return NextResponse.redirect(new URL(d.to + search, req.nextUrl.origin), d.code);
      if (d.kind === "gone") {
        const goneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Service Retired | HerrGlow Luxury Salon</title>
  <style>
    body { margin:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #FAF6F0; color: #2D1124; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; text-align: center; }
    .card { background: #FFFFFF; border: 1px solid #EADBCE; border-radius: 24px; padding: 48px 32px; max-width: 480px; box-shadow: 0 10px 30px rgba(45,17,36,0.06); }
    .badge { display: inline-block; padding: 4px 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 9999px; background: #FDE8ED; color: #B52B52; margin-bottom: 20px; }
    h1 { font-family: serif; font-size: 28px; margin: 0 0 12px; color: #2D1124; }
    p { font-size: 14px; line-height: 1.6; color: #66505D; margin: 0 0 28px; }
    .btn { display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 600; color: #FFFFFF; background: linear-gradient(135deg, #B52B52 0%, #8A1C3C 100%); border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 14px rgba(181,43,82,0.3); }
    .btn:hover { opacity: 0.95; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Discontinued Service</div>
    <h1>This Service is No Longer Offered</h1>
    <p>We regularly refine our salon menu to deliver the highest standard of luxury doorstep beauty. Explore our updated signature services across Delhi NCR.</p>
    <a href="/services" class="btn">Explore All Services →</a>
  </div>
</body>
</html>`;
        return noindex(
          new NextResponse(goneHtml, {
            status: 410,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          })
        );
      }
    } catch {
      // never take the site down because the rules lookup failed
    }
  }

  const res = NextResponse.next();
  return offHost ? noindex(res) : res;
}

export const config = {
  // skip Next internals, API routes and static assets
  matcher: [
    "/((?!_next/|api/|.*\.(?:png|jpe?g|webp|avif|svg|ico|gif|css|js|map|woff2?|txt|xml|json)$).*)",
  ],
};
