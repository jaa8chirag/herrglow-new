/**
 * SEO guard tests. Run by `pnpm test:seo`, which `pnpm build` runs first: a failure blocks the build.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { buildMetadata, fitDescription, fitTitle } from "./metadata";
import { buildRobots } from "./robots";
import { CANONICAL_HOST, SITE_URL } from "../site";

const src = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("home page is indexable when production indexing is enabled", () => {
  const m = buildMetadata({ title: "Makeup Artist at Home in Delhi NCR", description: "Book a verified makeup artist at home.", path: "/" });
  const prev = process.env.ALLOW_INDEXING;
  process.env.ALLOW_INDEXING = "true";
  const on = buildMetadata({ title: "x", description: "y", path: "/" });
  if (prev === undefined) delete process.env.ALLOW_INDEXING; else process.env.ALLOW_INDEXING = prev;
  assert.equal((on.robots as { index: boolean }).index, true);
  assert.equal(m.alternates?.canonical, `${SITE_URL}/`);
});

test("without ALLOW_INDEXING (staging/preview) everything is noindex", () => {
  const prev = process.env.ALLOW_INDEXING;
  delete process.env.ALLOW_INDEXING;
  const m = buildMetadata({ title: "x", description: "y", path: "/" });
  if (prev !== undefined) process.env.ALLOW_INDEXING = prev;
  assert.equal((m.robots as { index: boolean }).index, false);
});

test("DEPLOY GUARD: a production deploy must have ALLOW_INDEXING=true", () => {
  if (process.env.DEPLOY_ENV === "production")
    assert.equal(process.env.ALLOW_INDEXING, "true", "production build without ALLOW_INDEXING=true would noindex the whole site");
});

test("root layout and home page never hard-code noindex", () => {
  for (const f of ["../../app/layout.tsx", "../../app/page.tsx"]) {
    let text = "";
    try { text = src(f); } catch { continue; }
    assert.ok(!/index:\s*false|noindex|indexable:\s*false/.test(text), `${f} must not set noindex`);
  }
});

test("robots.txt: canonical host allows crawling, blocks admin/api, lists sitemap", () => {
  const r = buildRobots(CANONICAL_HOST, true);
  const rule = (Array.isArray(r.rules) ? r.rules[0] : r.rules)!;
  assert.equal(rule.allow, "/");
  assert.ok((rule.disallow as string[]).includes("/admin") && (rule.disallow as string[]).includes("/api"));
  assert.ok(!(rule.disallow as string[]).includes("/"));
  assert.equal(r.sitemap, `${SITE_URL}/sitemap.xml`);
});

test("robots.txt: other hosts and disabled indexing block everything", () => {
  for (const r of [buildRobots("staging.herrglow.com", true), buildRobots(CANONICAL_HOST, false)]) {
    const rule = (Array.isArray(r.rules) ? r.rules[0] : r.rules)!;
    assert.equal(rule.disallow, "/");
  }
});

test("title ≤ 60 and description ≤ 155", () => {
  assert.ok(fitTitle("A very long service title for bridal makeup artists in Greater Noida and nearby areas").length <= 60);
  assert.ok(fitDescription("word ".repeat(80)).length <= 155);
  assert.ok(fitTitle("HD Bridal Makeup").endsWith("| HerrGlow"));
});

/* ───────── legacy URL handling (owner rule: same URL if the page exists; artists 301; everything else 410) ───────── */
import { decideLegacy, type LegacyContext } from "@herrglow/core/src/seo/legacy";
import { proIsIndexable, proNoindexReason } from "@herrglow/core/src/seo/pros";

const ctx = (over: Partial<LegacyContext> = {}): LegacyContext => ({
  pageUrls: new Set(["/makeup-artist-in-gaur-city-1", "/hd-bridal-makeup-in-noida", "/services/hd-bridal-makeup", "/makeup-artist-in-noida", "/contact", "/"]),
  redirects: new Map([["/services/hd-engagement-makeup", { to: "/services/engagement-makeup-artist", code: "MOVED_301" as const }]]),
  proByLegacySlug: new Map([["best-makeover-artist-in-gaur-city-pritibha-singh", "/artists/pritibha-singh"]]),
  ...over,
});
const eq = (path: string, expected: object, c = ctx()) => assert.deepEqual(decideLegacy(path, c), expected, path);
const gone = (path: string, c = ctx()) => assert.equal(decideLegacy(path, c).kind, "gone", path);

test("legacy /makeup-artist-in-{area}: area page that exists keeps the SAME URL (200)", () => {
  eq("/makeup-artist-in-gaur-city-1", { kind: "pass" });
  eq("/makeup-artist-in-gaur-city-1/", { kind: "pass" });
});
test("legacy /makeup-artist-in-{area}: area without a page on the new site → 410", () => gone("/makeup-artist-in-some-textonly-area"));
test("legacy /bridal-makeup-in-{area} → 410", () => gone("/bridal-makeup-in-gaur-city-1"));
test("legacy /salon-at-home-in-{area} → 410", () => gone("/salon-at-home-in-gaur-city-1"));
test("legacy /{service}-in-{area} (service_local): 410, unless the same URL exists as a new service×city page", () => {
  gone("/full-body-waxing-service-in-ashoka-enclave");
  eq("/hd-bridal-makeup-in-noida", { kind: "pass" });
});
test("legacy /services/{slug}: live = same URL; merged/renamed = 301", () => {
  eq("/services/hd-bridal-makeup", { kind: "pass" });
  eq("/services/hd-engagement-makeup", { kind: "redirect", to: "/services/engagement-makeup-artist", code: 301 });
});
test("legacy /blogs/{slug} → 410 (owner rule); switchable to 301 /blog/{slug}", () => {
  gone("/blogs/gaur-city-bridal-makeup-artist-booking-guide");
  eq("/blogs/gaur-city-bridal-makeup-artist-booking-guide", { kind: "redirect", to: "/blog/gaur-city-bridal-makeup-artist-booking-guide", code: 301 }, ctx({ blogsRedirect: true }));
});
test("legacy /beauticians/{slug} and /makeover-artists/{slug} → 301 to the new artist slug; unknown artist → 410", () => {
  const to = { kind: "redirect", to: "/artists/pritibha-singh", code: 301 };
  eq("/beauticians/best-makeover-artist-in-gaur-city-pritibha-singh", to);
  eq("/makeover-artists/best-makeover-artist-in-gaur-city-pritibha-singh", to);
  gone("/beauticians/someone-without-a-page");
});
test("legacy /beauty-pro-card/{slug} → 410", () => gone("/beauty-pro-card/best-makeover-artist-in-gaur-city-pritibha-singh"));
test("legacy static pages (/services, /packages, /gallery, /testimonials, /blogs) → 410; /contact and / stay 200", () => {
  for (const p of ["/services", "/packages", "/packages/luxe-party-glam-package", "/beauticians", "/makeover-artists", "/gallery", "/testimonials", "/blogs", "/join-as-beautician"]) gone(p);
  eq("/contact", { kind: "pass" });
  eq("/", { kind: "pass" });
});
test("unrelated unknown URLs are not marked gone (normal 404)", () => eq("/some-random-page", { kind: "pass" }));

/* ───────── artist quality gate: real photo AND ≥ 50 words of bio ───────── */
const bio = (n: number) => Array.from({ length: n }, () => "glow").join(" ");
test("artist indexable only with a real photo AND ≥ 50 words of bio", () => {
  const prev = process.env.NEXT_PUBLIC_MEDIA_BASE;
  delete process.env.NEXT_PUBLIC_MEDIA_BASE;
  assert.equal(proIsIndexable({ photo: "beauticians/x.jpg", bio: bio(80) }), false, "stored path but media not configured = placeholder");
  assert.equal(proIsIndexable({ photo: "https://media.herrglow.com/x.jpg", bio: bio(80) }), true);
  process.env.NEXT_PUBLIC_MEDIA_BASE = "https://media.herrglow.com";
  assert.equal(proIsIndexable({ photo: "beauticians/x.jpg", bio: bio(50) }), true);
  assert.equal(proIsIndexable({ photo: "beauticians/x.jpg", bio: bio(49) }), false);
  assert.equal(proIsIndexable({ photo: null, bio: bio(80) }), false);
  assert.match(proNoindexReason({ photo: null, bio: bio(10) })!, /no photo; bio 10\/50 words/);
  if (prev === undefined) delete process.env.NEXT_PUBLIC_MEDIA_BASE; else process.env.NEXT_PUBLIC_MEDIA_BASE = prev;
});
