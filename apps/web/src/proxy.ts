import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@herrglow/db";
import { CANONICAL_HOST, SITE_URL } from "@/lib/site";

/**
 * Edge-of-app guard (Next 16 "proxy", Node runtime):
 *  1. Host guard: www → canonical (308). Any other non-canonical host in production is served with X-Robots-Tag: noindex.
 *  2. Redirect manager: 301 / 410 rules from the Redirect table (admin-editable).
 *  3. Inactive-city URLs (hub, service×city, area) → 410, so launching fewer cities never leaves soft-404s.
 */

const TTL_MS = 60_000;
interface Rules { redirects: Map<string, { to: string | null; code: "MOVED_301" | "GONE_410" }>; goneSuffixes: string[]; goneAreas: Set<string>; at: number }
let cache: Rules | null = null;

async function rules(): Promise<Rules> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache;
  const [rows, inactive] = await Promise.all([
    prisma.redirect.findMany(),
    prisma.city.findMany({ where: { isActive: false }, select: { slug: true, areas: { select: { slug: true } } } }),
  ]);
  cache = {
    at: Date.now(),
    redirects: new Map(rows.map((r) => [r.fromPath.toLowerCase().replace(/\/$/, "") || "/", { to: r.toPath, code: r.code }])),
    goneSuffixes: inactive.map((c) => `-in-${c.slug}`),
    goneAreas: new Set(inactive.flatMap((c) => c.areas.map((a) => `/makeup-artist-in-${a.slug}`))),
  };
  return cache;
}

const noindex = (res: NextResponse) => (res.headers.set("X-Robots-Tag", "noindex, nofollow"), res);

export async function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const { pathname, search } = req.nextUrl;
  const prod = process.env.NODE_ENV === "production";
  const offHost = prod && host !== CANONICAL_HOST && !host.startsWith("localhost");

  if (offHost && host === `www.${CANONICAL_HOST}`) return NextResponse.redirect(`${SITE_URL}${pathname}${search}`, 308);

  const path = (pathname.toLowerCase().replace(/\/$/, "") || "/");
  try {
    const r = await rules();
    const hit = r.redirects.get(path);
    if (hit) {
      if (hit.code === "GONE_410" || !hit.to) return noindex(new NextResponse("Gone", { status: 410 }));
      return NextResponse.redirect(new URL(hit.to + search, req.nextUrl.origin), 301);
    }
    if (!path.slice(1).includes("/") && (r.goneSuffixes.some((s) => path.endsWith(s)) || r.goneAreas.has(path)))
      return noindex(new NextResponse("Gone", { status: 410 }));
  } catch {
    // never take the site down because the rules lookup failed
  }

  const res = NextResponse.next();
  return offHost ? noindex(res) : res;
}

export const config = {
  // skip Next internals, API routes and static assets
  matcher: ["/((?!_next/|api/|.*\\.(?:png|jpe?g|webp|avif|svg|ico|gif|css|js|map|woff2?|txt|xml|json)$).*)"],
};
