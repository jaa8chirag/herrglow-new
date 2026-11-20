/**
 * Legacy (old Laravel site) URL handling. PURE: no DB, so the proxy, the audit script and the tests all share it.
 *
 * Owner rule: area pages that exist on the new site keep the SAME URL; old artist URLs 301 to the new artist slug;
 * everything else from the old site → 410.
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
  /** owner rule says 410; flip to true to 301 /blogs/{slug} → /blog/{slug} instead */
  blogsRedirect?: boolean;
}

export const normalizePath = (p: string) => p.toLowerCase().replace(/\/+$/, "") || "/";

const GONE_PREFIXES = ["/beauty-pro-card/", "/packages/"];
const GONE_EXACT = new Set(["/services", "/packages", "/beauticians", "/makeover-artists", "/gallery", "/testimonials", "/join-as-beautician"]);

export function decideLegacy(rawPath: string, ctx: LegacyContext): LegacyDecision {
  const path = normalizePath(rawPath);

  const rule = ctx.redirects.get(path);
  if (rule) return rule.code === "GONE_410" || !rule.to ? { kind: "gone", reason: "redirect rule: gone" } : { kind: "redirect", to: rule.to, code: 301 };

  // the URL exists on the new site (area pages, city hubs, service×city, services, …): serve it at the SAME URL
  if (ctx.pageUrls.has(path)) return { kind: "pass" };

  // old artist pages → new artist slug
  const artist = /^\/(?:beauticians|makeover-artists)\/([^/]+)$/.exec(path);
  if (artist) {
    const to = ctx.proByLegacySlug.get(artist[1]!);
    return to ? { kind: "redirect", to, code: 301 } : { kind: "gone", reason: "artist has no page on the new site" };
  }

  if (GONE_EXACT.has(path)) return { kind: "gone", reason: "legacy static page" };
  if (GONE_PREFIXES.some((p) => path.startsWith(p))) return { kind: "gone", reason: "legacy section removed" };

  const blog = /^\/blogs\/([^/]+)$/.exec(path);
  if (blog) return ctx.blogsRedirect ? { kind: "redirect", to: `/blog/${blog[1]}`, code: 301 } : { kind: "gone", reason: "legacy blog URL (owner rule: 410)" };
  if (path === "/blogs") return ctx.blogsRedirect ? { kind: "redirect", to: "/blog", code: 301 } : { kind: "gone", reason: "legacy blog index" };

  // any other single-segment "…-in-…" URL is an old area / service-local page that did not make it to the new site
  if (!path.slice(1).includes("/") && /-in-[a-z0-9]/.test(path)) return { kind: "gone", reason: "old area/service-local page not on the new site" };

  return { kind: "pass" };
}
