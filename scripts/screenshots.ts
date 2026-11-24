/**
 * Playwright screenshots: mobile (390px) + desktop (1440px), full page.
 *   pnpm shots UI-0 / /services /makeup "/services/hd-bridal-makeup"
 *   pnpm shots final                       # every page type (see PAGES below)
 * Output: docs/screens/<checkpoint>/<name>-mobile.png and -desktop.png
 * BASE_URL defaults to http://localhost:3000. Scrolls the page first so scroll-reveal animations have fired.
 */
import { mkdirSync } from "node:fs";
import { chromium, type Page } from "playwright";

const [cp, ...paths] = process.argv.slice(2);
if (!cp) {
  console.error("usage: pnpm shots <checkpoint> [paths…]");
  process.exit(1);
}
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const PAGES = [
  "/",
  "/services",
  "/makeup",
  "/services/hd-bridal-makeup",
  "/packages",
  "/blog",
  "/blog/ultimate-3-month-pre-bridal-skincare-timeline",
  "/makeup-artist-in-noida",
  "/makeup-artist-in-gaur-city-1",
  "/about",
  "/contact",
  "/join-as-beautician",
  "/does-not-exist",
];
// Git Bash rewrites "/services" into "C:/Program Files/Git/services"; undo that, and accept "home" for "/"
const fix = (p: string) => {
  const q = p.replace(/^[A-Za-z]:[\/]Program Files[\/]Git/, "");
  return q === "home" ? "/" : q.startsWith("/") ? q : "/" + q;
};
const list = (paths.length ? paths : cp === "final" ? PAGES : ["/"]).map(fix);
const nameOf = (p: string) =>
  p === "/"
    ? "home"
    : p
        .replace(/^\//, "")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/-$/, "");

async function settle(page: Page) {
  // scroll through the page in steps so whileInView reveals, lazy images and carousels all trigger
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(90);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
}

const browser = await chromium.launch();
const dir = `docs/screens/${cp}`;
mkdirSync(dir, { recursive: true });
for (const [label, vp] of [
  ["mobile", { width: 390, height: 844 }],
  ["desktop", { width: 1440, height: 900 }],
] as const) {
  const ctx = await browser.newContext({
    viewport: vp,
    deviceScaleFactor: 1,
    isMobile: label === "mobile",
  });
  const page = await ctx.newPage();
  for (const p of list) {
    await page
      .goto(BASE + p, { waitUntil: "networkidle", timeout: 120_000 })
      .catch(() => page.goto(BASE + p, { waitUntil: "load", timeout: 120_000 }));
    for (let i = 0; i < 3; i++) {
      try {
        await page.waitForLoadState("load");
        await settle(page);
        break;
      } catch {
        await page.waitForTimeout(1500);
      }
    } // dev HMR can reload the page mid-scroll
    await page.screenshot({ path: `${dir}/${nameOf(p)}-${label}.png`, fullPage: true });
    console.log(`✓ ${label.padEnd(7)} ${p}`);
  }
  await ctx.close();
}
await browser.close();
