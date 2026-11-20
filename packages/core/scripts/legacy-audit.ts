/** Runs every legacy URL (from the old seo_url_settings) through the SAME decision function the proxy uses. */
import { mkdirSync, writeFileSync } from "node:fs";
import { prisma } from "@herrglow/db";
import { parseDump } from "../../db/scripts/mysql-dump";
import { decideLegacy, normalizePath, type LegacyContext } from "../src/seo/legacy";

const dump = process.argv[2];
if (!dump) { console.error("usage: legacy-audit <dump.sql>"); process.exit(1); }
const rows = parseDump(dump, new Set(["seo_url_settings"])).get("seo_url_settings")!;

const [redirects, pages, pros] = await Promise.all([
  prisma.redirect.findMany(), prisma.page.findMany({ select: { url: true, type: true } }),
  prisma.pro.findMany({ where: { legacySlug: { not: null } }, select: { legacySlug: true, slug: true } }),
]);
const proPages = new Set(pages.filter((p) => p.type === "PRO").map((p) => p.url));
const ctx: LegacyContext = {
  redirects: new Map(redirects.map((r) => [normalizePath(r.fromPath), { to: r.toPath, code: r.code }])),
  pageUrls: new Set(pages.map((p) => p.url)),
  proByLegacySlug: new Map(pros.filter((p) => proPages.has(`/artists/${p.slug}`)).map((p) => [p.legacySlug!.toLowerCase(), `/artists/${p.slug}`])),
};

const family = (r: Record<string, string | number | null>) => `${r.route_name}`;
const tally = new Map<string, Record<string, number>>();
const csv = ["legacy_url,pattern,was_indexable,outcome,target"];
for (const r of rows) {
  if (r.source_type === "private") continue;
  const url = String(r.url_path);
  const d = decideLegacy(url, ctx);
  const outcome = d.kind === "pass" ? (ctx.pageUrls.has(normalizePath(url)) ? "200 same URL" : "pass (no page → 404)") : d.kind === "redirect" ? "301" : "410";
  const t = tally.get(family(r)) ?? {};
  t[outcome] = (t[outcome] ?? 0) + 1;
  tally.set(family(r), t);
  csv.push(`${url},${family(r)},${r.is_indexable},${outcome},${d.kind === "redirect" ? d.to : ""}`);
}
console.log("route_name".padEnd(28), "outcomes");
for (const [k, t] of [...tally].sort((a, b) => Object.values(b[1]).reduce((x, y) => x + y, 0) - Object.values(a[1]).reduce((x, y) => x + y, 0)))
  console.log(k.padEnd(28), Object.entries(t).map(([o, n]) => `${o}: ${n}`).join(" | "));
mkdirSync(new URL("../../../infra/import/out/", import.meta.url), { recursive: true });
writeFileSync(new URL("../../../infra/import/out/legacy-url-audit.csv", import.meta.url), csv.join("\n"));
await prisma.$disconnect();
