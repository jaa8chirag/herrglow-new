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
  assert.equal(r.sitemap, `${SITE_URL}/sitemap-index.xml`);
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
