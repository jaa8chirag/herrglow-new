/**
 * Lighthouse (mobile, default simulated slow-4G + 4x CPU) against a running production build.
 *   pnpm tsx scripts/lighthouse.ts http://localhost:3300 / /services/hd-bridal-makeup /makeup-artist-in-noida
 * Prints the four category scores plus LCP / CLS / TBT and the worst failing audits. Saves JSON to infra/import/out/lh-*.json
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const [base, ...raw] = process.argv.slice(2);
// Git Bash rewrites "/x" into "C:/Program Files/Git/x"; undo that and accept "home" for "/"
const paths = raw.map((p) => {
  const q = p.replace(/^[A-Za-z]:[\/]Program Files[\/]Git/, "");
  return q === "home" || q === "" ? "/" : q.startsWith("/") ? q : "/" + q;
});
const chrome = chromium.executablePath();
mkdirSync("infra/import/out", { recursive: true });

for (const p of paths) {
  const out = `infra/import/out/lh-${p === "/" ? "home" : p.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}.json`;
  try {
    execFileSync(
      process.execPath,
      [
        "node_modules/lighthouse/cli/index.js",
        base + p,
        "--output=json",
        `--output-path=${out}`,
        "--quiet",
        "--only-categories=performance,accessibility,best-practices,seo",
        "--chrome-flags=--headless=new --no-sandbox",
      ],
      { env: { ...process.env, CHROME_PATH: chrome }, stdio: "pipe", timeout: 240_000 }
    );
  } catch (e) {
    console.log(`lighthouse failed for ${p}: ${(e as Error).message.slice(0, 200)}`);
  }
  const r = JSON.parse(readFileSync(out, "utf8"));
  const c = r.categories,
    a = r.audits;
  const s = (k: string) => Math.round((c[k]?.score ?? 0) * 100);
  console.log(
    `\n${p}\n  Performance ${s("performance")} · Accessibility ${s("accessibility")} · Best Practices ${s("best-practices")} · SEO ${s("seo")}`
  );
  console.log(
    `  LCP ${a["largest-contentful-paint"].displayValue} · CLS ${a["cumulative-layout-shift"].displayValue} · TBT ${a["total-blocking-time"].displayValue} · FCP ${a["first-contentful-paint"].displayValue} · SI ${a["speed-index"].displayValue}`
  );
  const bad = Object.values(
    r.audits as Record<
      string,
      { id: string; title: string; score: number | null; scoreDisplayMode: string }
    >
  ).filter(
    (x) =>
      x.score !== null &&
      x.score < 0.9 &&
      !["notApplicable", "manual", "informative"].includes(x.scoreDisplayMode)
  );
  for (const b of bad.slice(0, 12))
    console.log(`   ✗ ${b.id}: ${b.title} (${Math.round((b.score ?? 0) * 100)})`);
}
