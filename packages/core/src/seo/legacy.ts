/**
 * Legacy (old Laravel site) URL handling. PURE: no DB, so the proxy, the audit script and the tests all share it.
 *
 * Rules: a URL that exists on the new site keeps the SAME URL (area pages, /services, /join-as-beautician, /contact, …);
 * old artist and blog URLs 301 to their new URLs; retired sections 301 to the closest page; everything else from the old
 * site → 410.
 *
 * Old patterns (from seo_url_settings):
 *   /makeup-artist-in-{area}  /bridal-makeup-in-{area}  /salon-at-home-in-{area}   (local_page)
 *   /{service-local-slug}-in-{area}                                                 (service_local, ~24k)
 *   /services/{slug}  /blogs/{slug}  /beauticians/{slug}  /makeover-artists/{slug}  /beauty-pro-card/{slug}
 *   statics: /services /packages /packages/{slug} /beauticians /makeover-artists /gallery /testimonials /blogs /join-as-beautician
 */
export type LegacyDecision =
  | { kind: "pass" }
  | { kind: "redirect"; to: string; code: 301 }
  | { kind: "gone"; reason: string };

export interface LegacyContext {
  /** every Page.url that exists on the new site (rendered, indexable or not) */
  pageUrls: Set<string>;
  /** Redirect table rows (admin-managed): fromPath → target or null for 410 */
  redirects: Map<string, { to: string | null; code: "MOVED_301" | "GONE_410" }>;
  /** legacy beautician slug → new artist URL (only artists whose page exists) */
  proByLegacySlug: Map<string, string>;
}

export const normalizePath = (p: string) => p.toLowerCase().replace(/\/+$/, "") || "/";

/** Retired old-site sections and where their equity goes. */
export const LEGACY_STATIC_REDIRECTS: Record<string, string> = {
  "/testimonials": "/about#reviews",
  "/gallery": "/",
  "/blogs": "/blog",
  "/makeup-artist-in-delhi": "/salon-at-home-delhi",
  "/makeup-artist-in-noida": "/salon-at-home-noida",
  "/makeup-artist-in-greater-noida": "/salon-at-home-greater-noida",
};
const GONE_PREFIXES = ["/beauty-pro-card/", "/packages/"]; // a /packages/{slug} that does not exist on the new site
const GONE_EXACT = new Set(["/beauticians", "/makeover-artists"]);

export function decideLegacy(rawPath: string, ctx: LegacyContext): LegacyDecision {
  const path = normalizePath(rawPath);

  const rule = ctx.redirects.get(path);
  if (rule) return rule.code === "GONE_410" || !rule.to ? { kind: "gone", reason: "redirect rule: gone" } : { kind: "redirect", to: rule.to, code: 301 };

  const stat = LEGACY_STATIC_REDIRECTS[path];
  if (stat) return { kind: "redirect", to: stat, code: 301 };

  // the URL exists on the new site (area pages, city hubs, /services, /join-as-beautician, service×city, …): same URL
  if (ctx.pageUrls.has(path)) return { kind: "pass" };

  // old artist pages → new artist slug
  const artist = /^\/(?:beauticians|makeover-artists)\/([^/]+)$/.exec(path);
  if (artist) {
    const to = ctx.proByLegacySlug.get(artist[1]!);
    return to ? { kind: "redirect", to, code: 301 } : { kind: "gone", reason: "artist has no page on the new site" };
  }

  const blog = /^\/blogs\/([^/]+)$/.exec(path);
  if (blog) return { kind: "redirect", to: `/blog/${blog[1]}`, code: 301 };

  if (GONE_EXACT.has(path)) return { kind: "gone", reason: "legacy listing page" };
  if (GONE_PREFIXES.some((p) => path.startsWith(p))) return { kind: "gone", reason: "legacy section removed" };

  // any other single-segment "…-in-…" URL is an old area / service-local page that did not make it to the new site
  if (!path.slice(1).includes("/") && /-in-[a-z0-9]/.test(path)) return { kind: "gone", reason: "old area/service-local page not on the new site" };

  return { kind: "pass" };
}
