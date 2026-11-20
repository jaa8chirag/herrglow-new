/**
 * Legacy MySQL dump → Postgres (content tables only).
 *
 *   pnpm --filter @herrglow/db import:legacy --dump <path-to.sql>           # DRY RUN (default)
 *   pnpm --filter @herrglow/db import:legacy --dump <path-to.sql> --apply   # write to DATABASE_URL
 *
 * Safety:
 *  - never reads password/hash columns or mail_* settings; users, beauticians' logins, leads and
 *    other personal-data tables are NOT imported by this script (later stage).
 *  - replaces Glow Makeover branding with HerrGlow.
 *  - idempotent for services/areas/blogs/packages (upsert); testimonials/gallery only if table empty.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { parseDump, type Row } from "./mysql-dump";
import { prisma } from "../src/index";
import { applyMerges, type Svc } from "./merge-plan";

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const dumpPath = opt("dump") ?? process.env.LEGACY_DUMP;
const APPLY = flag("apply");
if (!dumpPath) { console.error("Missing --dump <file.sql>"); process.exit(1); }

// ───────── helpers ─────────
const rebrand = (s: string) =>
  s
    .replace(/glowmakeover\.co\.in/gi, "herrglow.com")
    .replace(/glow\s*makeover(\s+co\.?)?/gi, "HerrGlow")
    .replace(/glowmakeoverco/gi, "herrglow");
const str = (v: unknown): string | null => (v == null || v === "" ? null : rebrand(String(v)));
const num = (v: unknown): number | null => (v == null || v === "" ? null : Number(v));
const slugify = (s: string) => s.toLowerCase().trim().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const titleCase = (s: string) => s.trim().toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
const status = (v: unknown) => (v === "inactive" ? "INACTIVE" : "ACTIVE") as "ACTIVE" | "INACTIVE";
const json = (v: unknown) => {
  if (v == null || v === "") return undefined;
  try { return JSON.parse(rebrand(String(v))); } catch { return undefined; }
};
/** Legacy HTML was sometimes escaped twice (`<p>&lt;p&gt;…`). Decode once when that pattern is present. */
const fixHtml = (v: unknown): string | null => {
  let s = str(v);
  if (!s) return s;
  if (/&lt;\/?(p|h[1-6]|ul|li|strong|br)\b/i.test(s))
    s = s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  return s;
};
const words = (html: string | null) => (html ? html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length : 0);

const report: Record<string, unknown> = { mode: APPLY ? "APPLY" : "DRY-RUN" };
const warn: string[] = [];

// ───────── load ─────────
const d = parseDump(dumpPath, new Set([
  "services", "locations", "location_service", "blogs", "testimonials", "galleries",
  "packages", "package_service", "site_settings",
  "beauticians", "beautician_service", "beautician_location_prices",
  "leads", "lead_service", // read ONLY for counts (service_id, location text). No lead/customer data is stored by this script.
]));
const T = (n: string): Row[] => d.get(n) ?? [];

// ───────── categories ─────────
const CATEGORY: Record<string, { slug: string; name: string; sort: number }> = {
  makeup: { slug: "makeup", name: "Makeup", sort: 1 },
  salon: { slug: "salon-at-home", name: "Salon at Home", sort: 2 },
  facial: { slug: "facial-skincare", name: "Facial & Skincare", sort: 3 },
  hair: { slug: "hair", name: "Hair", sort: 4 },
  "nail-care-extension": { slug: "nails", name: "Nails", sort: 5 },
  mehndi: { slug: "mehndi", name: "Mehndi", sort: 6 },
  "pre-bridal": { slug: "pre-bridal", name: "Pre-Bridal", sort: 7 },
};
/** Owner-approved: these legacy services move into "Facial & Skincare" (Classic Cleanup, Pigmentation Treatment Facial,
 *  Professional Facial, Premium Glow Facial, Professional Face Cleanup). */
const FACIAL_LEGACY_IDS = new Set([58, 59, 9, 37, 36]);
const categoryFor = (legacyId: number, cat: unknown) =>
  FACIAL_LEGACY_IDS.has(legacyId) ? "facial-skincare" : CATEGORY[String(cat)]?.slug ?? "makeup";
const categories = [...new Map(Object.values(CATEGORY).map((c) => [c.slug, c])).values()];

// ───────── services (+ clean slugs for city-baked ones) ─────────
const CITY_SUFFIX = /-(in-)?(gaur-city|noida-extension|greater-noida|noida|ghaziabad|delhi|gurugram|faridabad)$/;
const redirectsBase: { fromPath: string; toPath: string; note: string }[] = [];
const usedSlugs = new Set<string>();
const legacyServiceSlugs = T("services").map((s) => String(s.slug));
const servicesBase = T("services").map((s) => {
  const old = String(s.slug);
  let slug = old;
  if (CITY_SUFFIX.test(old)) {
    const clean = old.replace(CITY_SUFFIX, "");
    if (legacyServiceSlugs.includes(clean) || usedSlugs.has(clean)) warn.push(`slug collision: ${old} → ${clean} (kept old slug, needs manual merge)`);
    else { slug = clean; redirectsBase.push({ fromPath: `/services/${old}`, toPath: `/services/${clean}`, note: "legacy service slug had a city baked in; legacy URL pattern unverified until audit-pack" }); }
  }
  usedSlugs.add(slug);
  const pt = String(s.provider_type ?? "").toLowerCase();
  return {
    id: `svc_${s.id}`,
    legacyId: Number(s.id),
    slug,
    title: rebrand(String(s.title)),
    categoryId: categoryFor(Number(s.id), s.category),
    providerType: (/artist|makeover/.test(pt) ? "MAKEOVER_ARTIST" : pt === "beautician" ? "BEAUTICIAN" : "BOTH") as "BOTH",
    shortDescription: str(s.short_description),
    description: fixHtml(s.description),
    features: str(s.features),
    price: num(s.price),
    offerPrice: num(s.offer_price),
    priceLabel: str(s.price_label),
    duration: str(s.duration),
    image: str(s.image),
    imageAlt: str(s.image_alt),
    seoTitle: str(s.seo_title),
    seoDescription: str(s.seo_description),
    faqs: json(s.faqs),
    featured: s.featured === 1,
    isPackage: ["complete-bridal-package", "multi-function-wedding-makeup-package", "group-makeup-package-for-3", "essential-glow-pre-bridal", "luxury-ultra-radiance-pre-bridal", "pre-bridal-haldi-mehndi-glow"].includes(slug),
    sort: Number(s.display_order ?? 0),
    status: status(s.status),
    leadCount: 0,
  };
});
for (const s of servicesBase) if (!CATEGORY[String(T("services").find((x) => `svc_${x.id}` === s.id)!.category)]) warn.push(`service ${s.slug}: unknown category`);

// enquiries per service (unique lead ids), then roll merged children into parents
const leadsByService = new Map<number, Set<number>>();
const addLead = (sid: unknown, lid: unknown) => { if (sid == null) return; const k = Number(sid); (leadsByService.get(k) ?? leadsByService.set(k, new Set()).get(k)!).add(Number(lid)); };
for (const l of T("leads")) addLead(l.service_id, l.id);
for (const l of T("lead_service")) addLead(l.service_id, l.lead_id);
for (const s of servicesBase) s.leadCount = leadsByService.get(s.legacyId)?.size ?? 0;

// owner-approved merges (scripts/merge-plan.ts) → final services, variants, add-ons, redirects
const merged = applyMerges(servicesBase as unknown as Svc[], redirectsBase);
const services = merged.services;
const redirects = merged.redirects;
const variants = merged.variants;
const addons = merged.addons;
const parentOf = new Map(services.filter((x) => (x as { mergedIntoId?: string | null }).mergedIntoId).map((x) => [x.id, (x as { mergedIntoId?: string }).mergedIntoId!]));
const toParent = (id: string) => parentOf.get(id) ?? id;

// ───────── cities & areas ─────────
/** Launch scope (owner decision). Other cities keep their data but stay inactive. */
const ACTIVE_CITIES = new Set(["noida", "delhi", "greater-noida"]);
const DELHI_ZONES = new Set(["delhi", "new delhi", "south delhi", "west delhi", "north west delhi", "east delhi", "north delhi", "central delhi", "north east delhi", "south east delhi", "rohini"]);
function cityOf(raw: unknown): { name: string; zone: string | null } | null {
  const c = String(raw ?? "").trim();
  if (!c) return null;
  const k = c.toLowerCase();
  if (k === "maharastra") return null; // ambiguous state-as-city, needs review
  if (DELHI_ZONES.has(k)) return { name: "Delhi", zone: k === "delhi" || k === "new delhi" ? null : titleCase(c) };
  return { name: titleCase(c), zone: null };
}
const cities = new Map<string, { slug: string; name: string }>();
const areaCity = new Map<string, string>(); // legacy location id → city slug
const unmapped: string[] = [];
const areas = T("locations").flatMap((l) => {
  const c = cityOf(l.city);
  if (!c) { unmapped.push(`${l.name} (city="${l.city ?? ""}")`); return []; }
  const citySlug = slugify(c.name);
  cities.set(citySlug, { slug: citySlug, name: c.name });
  areaCity.set(String(l.id), citySlug);
  return [{
    id: `area_${l.id}`,
    legacyId: Number(l.id),
    citySlug,
    slug: String(l.slug),
    name: rebrand(String(l.name)),
    sector: str(l.sector),
    leadCount: 0,
    zone: c.zone,
    latitude: num(l.latitude),
    longitude: num(l.longitude),
    radiusKm: num(l.service_radius_km),
    landmarks: (str(l.nearby_landmarks) ?? "").split(",").map((x) => x.trim()).filter(Boolean),
    nearbyAreaIds: ((json(l.nearby_location_ids) as number[] | undefined) ?? []).map((i) => `area_${i}`), // → AreaNearby rows
    content: fixHtml(l.content),
    faqs: json(l.faqs),
    seoTitle: str(l.seo_title),
    seoDescription: str(l.seo_description),
    showOnHome: l.show_on_home === 1,
    status: status(l.status),
  }];
});
const norm0 = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");
const knownAreaIds = new Set(areas.map((a) => a.id));
// approx. leads per area: legacy free-text location contains the area name (active cities only; names ≥ 6 chars)
{
  const targets = areas.filter((a) => ACTIVE_CITIES.has(a.citySlug) && norm0(a.name).length >= 6);
  for (const l of T("leads")) {
    const text = norm0(String(l.location ?? "") + " " + String(l.address ?? ""));
    if (!text) continue;
    for (const a of targets) if (text.includes(norm0(a.name))) (a as { leadCount?: number }).leadCount = ((a as { leadCount?: number }).leadCount ?? 0) + 1;
  }
}
for (const a of areas) a.nearbyAreaIds = a.nearbyAreaIds.filter((i) => knownAreaIds.has(i));

const nearbyRows = areas.flatMap((a) => a.nearbyAreaIds.filter((n) => n !== a.id).map((nearbyId) => ({ areaId: a.id, nearbyId })));
const areaDataCoverage = {
  total: areas.length,
  withLatLng: areas.filter((a) => a.latitude != null && a.longitude != null).length,
  withRadius: areas.filter((a) => a.radiusKm != null).length,
  withSector: areas.filter((a) => a.sector).length,
  withZone: areas.filter((a) => a.zone).length,
  withLandmarks: areas.filter((a) => a.landmarks.length).length,
  withNearby: areas.filter((a) => a.nearbyAreaIds.length).length,
  withFaqs: areas.filter((a) => a.faqs).length,
  withContent: areas.filter((a) => a.content).length,
  nearbyLinks: nearbyRows.length,
};

// location_service (24k) → distinct service × city
const svcCity = new Set<string>();
for (const r of T("location_service")) {
  const city = areaCity.get(String(r.location_id));
  if (city) svcCity.add(`${toParent(`svc_${r.service_id}`)}|${city}`);
}
const serviceCities = [...svcCity].map((k) => { const [serviceId, cityId] = k.split("|"); return { serviceId: serviceId!, cityId: cityId! }; });

// ───────── pros (profiles public; contact data → ProPrivate; NO passwords/login columns are read) ─────────
const proSlugs = new Set<string>();
const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");
const areasByName = new Map<string, string[]>();
for (const a of areas) areasByName.set(norm(a.name), [...(areasByName.get(norm(a.name)) ?? []), a.id]);
const serviceIds = new Set(services.map((s) => s.id));
const pros = T("beauticians").map((b) => {
  const base = slugify(String(b.name)) || slugify(String(b.slug));
  let slug = base, n = 2;
  while (proSlugs.has(slug)) slug = `${base}-${n++}`;
  proSlugs.add(slug);
  const pf = (json(b.portfolio_images) as unknown[] | undefined) ?? [];
  const portfolio = pf.map((p) => (typeof p === "string" ? { path: p, alt: "" } : { path: String((p as { path?: string }).path ?? ""), alt: String((p as { alt?: string }).alt ?? "") })).filter((p) => p.path);
  const pt = String(b.provider_type ?? "");
  return {
    id: `pro_${b.id}`, legacyId: Number(b.id), legacySlug: String(b.slug), slug,
    name: rebrand(String(b.name)),
    providerType: (pt === "makeover_artist" ? "MAKEOVER_ARTIST" : pt === "beautician" ? "BEAUTICIAN" : "BOTH") as "BOTH",
    photo: str(b.photo), portfolio: portfolio.length ? portfolio : undefined,
    youtubeUrls: ((json(b.youtube_urls) as string[] | undefined) ?? []).filter((u) => typeof u === "string"),
    experienceYears: num(b.experience_years), specialization: str(b.specialization), bio: fixHtml(b.bio), basePrice: num(b.base_price),
    dailyLeadViewLimit: Number(b.daily_lead_view_limit ?? 10), weeklyLeadViewLimit: Number(b.weekly_lead_view_limit ?? 50), monthlyLeadViewLimit: Number(b.monthly_lead_view_limit ?? 200),
    status: (b.status === "active" ? "ACTIVE" : b.status === "pending" ? "PENDING" : "INACTIVE") as "ACTIVE",
    seoTitle: str(b.seo_title), seoDescription: str(b.seo_description),
  };
});
const proIds = new Set(pros.map((p) => p.id));
const proPrivate = T("beauticians").map((b) => ({
  proId: `pro_${b.id}`, phone: b.phone == null ? null : String(b.phone), email: b.email == null ? null : String(b.email),
  addressLine: b.address_line == null ? null : String(b.address_line), landmark: b.landmark == null ? null : String(b.landmark),
  pincode: b.pincode == null ? null : String(b.pincode), serviceAreasText: b.service_areas == null ? null : String(b.service_areas),
  referralCode: b.referral_code == null ? null : String(b.referral_code),
  referredById: b.referred_by_beautician_id != null && proIds.has(`pro_${b.referred_by_beautician_id}`) ? `pro_${b.referred_by_beautician_id}` : null,
}));
const proServiceMap = new Map<string, { proId: string; serviceId: string; price: number | null }>();
for (const r of T("beautician_service")) {
  if (!proIds.has(`pro_${r.beautician_id}`) || !serviceIds.has(`svc_${r.service_id}`)) continue;
  const serviceId = toParent(`svc_${r.service_id}`), proId = `pro_${r.beautician_id}`;
  if (!proServiceMap.has(proId + "|" + serviceId)) proServiceMap.set(proId + "|" + serviceId, { proId, serviceId, price: num(r.price) });
}
const proServices = [...proServiceMap.values()];
const coverageMap = new Map<string, { proId: string; areaId: string; price: number | null; priceLabel: string | null }>();
for (const r of T("beautician_location_prices")) {
  const proId = `pro_${r.beautician_id}`, areaId = `area_${r.location_id}`;
  if (proIds.has(proId) && knownAreaIds.has(areaId)) coverageMap.set(proId + "|" + areaId, { proId, areaId, price: num(r.price), priceLabel: str(r.price_label) });
}
let textMatched = 0, textAmbiguous = 0, textUnmatched = 0;
for (const b of T("beauticians")) {
  for (const part of String(b.service_areas ?? "").split(/[,;\n]/).map((x) => x.trim()).filter(Boolean)) {
    const hit = areasByName.get(norm(part));
    if (!hit) { textUnmatched++; continue; }
    if (hit.length > 1) { textAmbiguous++; continue; }
    const k = `pro_${b.id}|${hit[0]}`;
    if (!coverageMap.has(k)) { coverageMap.set(k, { proId: `pro_${b.id}`, areaId: hit[0]!, price: null, priceLabel: null }); textMatched++; }
  }
}
const coverage = [...coverageMap.values()];
const activeNoCoverage = pros.filter((p) => p.status === "ACTIVE" && !coverage.some((c) => c.proId === p.id)).map((p) => p.name);
const proReport = {
  total: pros.length, active: pros.filter((p) => p.status === "ACTIVE").length,
  services: proServices.length, coverageRows: coverage.length, coverageFromServiceAreasText: textMatched,
  serviceAreasTextAmbiguous: textAmbiguous, serviceAreasTextUnmatched: textUnmatched,
  activeWithoutCoverage: activeNoCoverage,
};

// ───────── content ─────────
const blogs = T("blogs").map((b) => {
  const content = fixHtml(b.content);
  const wc = words(content);
  if (wc < 350) warn.push(`thin blog (${wc} words): ${b.slug}`);
  return {
    slug: String(b.slug), title: rebrand(String(b.title)), image: str(b.image), imageAlt: str(b.image_alt),
    excerpt: str(b.excerpt), content, authorName: str(b.author_name) ? "HerrGlow" : null,
    seoTitle: str(b.seo_title), seoDescription: str(b.seo_description),
    status: status(b.status), publishedAt: b.created_at ? new Date(String(b.created_at).replace(" ", "T") + "Z") : new Date(),
  };
});
const testimonials = T("testimonials").map((t) => ({
  name: String(t.name), photo: str(t.photo), location: str(t.location), serviceName: str(t.service_name),
  rating: Number(t.rating ?? 5), review: rebrand(String(t.review)), status: status(t.status), sort: Number(t.sort_order ?? 0),
}));
const gallery = T("galleries").map((g) => ({
  title: rebrand(String(g.title)),
  mediaType: (g.media_type === "video" ? "VIDEO" : g.media_type === "youtube" ? "YOUTUBE" : "IMAGE") as "IMAGE",
  mediaPath: str(g.media_path), thumbnail: str(g.thumbnail_path), youtubeId: str(g.youtube_id),
  alt: rebrand(String(g.title)), category: str(g.category), status: status(g.status), sort: Number(g.sort_order ?? 0),
}));
const packages = T("packages").map((p) => ({
  id: `pkg_${p.id}`, slug: String(p.slug), title: rebrand(String(p.title)), shortDescription: str(p.short_description),
  description: fixHtml(p.description), price: num(p.price), offerPrice: num(p.offer_price), duration: str(p.duration),
  image: str(p.image), status: status(p.status),
}));
const packageServices = T("package_service").map((r) => ({ packageId: `pkg_${r.package_id}`, serviceId: `svc_${r.service_id}` }));

// ───────── site settings (allowlist; NEVER mail_*) ─────────
const SETTINGS_ALLOW = new Set([
  "site_tagline", "cta_primary_text", "cta_secondary_text", "offer_strip_text", "whatsapp_prefill_text",
  "home_hero_badge", "home_hero_title", "home_hero_highlight", "home_hero_description", "home_hero_note",
  "home_hero_card_title", "home_hero_card_text", "home_hero_primary_image_alt", "home_hero_secondary_image_alt",
  "festival_offer_name", "festival_offer_percent", "festival_offer_enabled",
]);
const settings: { key: string; value: string | null }[] = [
  { key: "site_name", value: "HerrGlow" },
  { key: "site_url", value: "https://herrglow.com" },
  // empty by default → UI hides call/WhatsApp, JSON-LD omits telephone
  { key: "whatsapp_number", value: null },
  { key: "contact_phone", value: null },
  { key: "contact_email", value: null },
  ...T("site_settings").filter((s) => SETTINGS_ALLOW.has(String(s.key))).map((s) => ({ key: String(s.key), value: str(s.value) })),
];
const skippedSettings = T("site_settings").filter((s) => !SETTINGS_ALLOW.has(String(s.key))).map((s) => String(s.key));

// redirect sanity: no chains, no self-redirects, no redirect away from a live page
{
  const from = new Set(redirects.map((r) => r.fromPath));
  const live = new Set(services.filter((x) => x.status === "ACTIVE").map((x) => "/services/" + x.slug));
  for (const r of redirects) {
    if (from.has(r.toPath)) warn.push("redirect chain: " + r.fromPath + " → " + r.toPath);
    if (r.fromPath === r.toPath) warn.push("self redirect: " + r.fromPath);
    if (live.has(r.fromPath)) warn.push("redirect from a live page: " + r.fromPath);
  }
}

// ───────── report ─────────
Object.assign(report, {
  counts: {
    categories: categories.length, services: `${services.filter((x) => x.status === "ACTIVE").length} active (of ${services.length}; ${servicesBase.length} legacy)`, variants: variants.length, addons: addons.length, cities: cities.size, areas: areas.length,
    serviceCities: `${serviceCities.length} (from ${T("location_service").length} location_service rows)`,
    blogs: blogs.length, testimonials: testimonials.length, gallery: gallery.length,
    pros: pros.length, packages: packages.length, settings: settings.length, redirects: redirects.length,
  },
  citiesByAreaCount: Object.fromEntries([...cities.keys()].map((c) => [c, areas.filter((a) => a.citySlug === c).length])),
  areaDataCoverage, pros: proReport,
  unmappedLocations: unmapped,
  activeServices: services.filter((x) => x.status === "ACTIVE").map((x) => x.slug + " (leads " + x.leadCount + ")"),
  variants: variants.map((v) => v.serviceId + " · " + v.name + " · " + (v.offerPrice ?? v.price)),
  redirects, skippedSettings, warnings: warn,
});
mkdirSync(new URL("../../../infra/import/out/", import.meta.url), { recursive: true });
writeFileSync(new URL("../../../infra/import/out/report.json", import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, citiesByAreaCount: undefined, redirects: undefined }, null, 2));

if (!APPLY) { console.log("\nDRY RUN — nothing written. Full report: infra/import/out/report.json. Re-run with --apply."); process.exit(0); }

// ───────── write ─────────
const chunk = <T>(a: T[], n = 1000) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
await prisma.$transaction(async (tx) => {
  for (const c of categories) await tx.category.upsert({ where: { slug: c.slug }, update: { name: c.name, sort: c.sort }, create: { id: c.slug, ...c } });
  for (const c of cities.values()) await tx.city.upsert({ where: { slug: c.slug }, update: { name: c.name, ...(ACTIVE_CITIES.has(c.slug) ? { isActive: true } : {}) }, create: { id: c.slug, ...c, isActive: ACTIVE_CITIES.has(c.slug) } });
  for (const s of services) {
    const { categoryId, ...rest } = s;
    await tx.service.upsert({ where: { id: s.id }, update: { ...rest, category: { connect: { slug: categoryId } } } as never, create: { ...rest, categoryId } as never });
  }
  const parentIds = [...new Set([...variants.map((v) => v.serviceId), ...addons.map((a) => a.serviceId)])];
  await tx.serviceVariant.deleteMany({ where: { serviceId: { in: parentIds } } });
  await tx.serviceVariant.createMany({ data: variants });
  await tx.serviceAddon.deleteMany({ where: { serviceId: { in: parentIds } } });
  await tx.serviceAddon.createMany({ data: addons });
  for (const { nearbyAreaIds: _n, ...a } of areas) await tx.area.upsert({ where: { id: a.id }, update: a as never, create: a as never });
  for (const part of chunk(nearbyRows)) await tx.areaNearby.createMany({ data: part, skipDuplicates: true });
  for (const p of pros) await tx.pro.upsert({ where: { id: p.id }, update: p as never, create: p as never });
  for (const p of proPrivate) await tx.proPrivate.upsert({ where: { proId: p.proId }, update: p, create: p });
  await tx.proService.createMany({ data: proServices, skipDuplicates: true });
  await tx.proCoverage.createMany({ data: coverage, skipDuplicates: true });
  for (const part of chunk(serviceCities)) await tx.serviceCity.createMany({ data: part, skipDuplicates: true });
  for (const b of blogs) await tx.blog.upsert({ where: { slug: b.slug }, update: b, create: b });
  for (const p of packages) await tx.package.upsert({ where: { id: p.id }, update: p as never, create: p as never });
  await tx.packageService.createMany({ data: packageServices, skipDuplicates: true });
  if ((await tx.testimonial.count()) === 0) await tx.testimonial.createMany({ data: testimonials });
  if ((await tx.galleryItem.count()) === 0) await tx.galleryItem.createMany({ data: gallery });
  for (const s of settings) await tx.siteSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  for (const r of redirects) await tx.redirect.upsert({ where: { fromPath: r.fromPath }, update: r, create: r });
}, { timeout: 120_000 });
console.log("\nAPPLIED.");
await prisma.$disconnect();
