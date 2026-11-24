import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_DIR =
  "/Users/rex/.gemini/antigravity/brain/de3b07d8-1a1d-4c34-94a8-b378c52cb46b/audit-results";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/services", name: "services_hub" },
  { path: "/services/face-hair-removal", name: "cat_face_hair_removal" },
  { path: "/services/face-hair-removal/eyebrow-threading", name: "svc_eyebrow_threading" },
  { path: "/services/waxing", name: "cat_waxing" },
  { path: "/services/waxing/full-arms-waxing", name: "svc_full_arms_waxing" },
  { path: "/services/facials", name: "cat_facials" },
  { path: "/services/facials/fruit-cleanup", name: "svc_fruit_cleanup" },
  { path: "/services/bridal", name: "cat_bridal" },
  { path: "/services/bridal/traditional-bridal-makeup", name: "svc_bridal_makeup" },
  { path: "/packages", name: "packages" },
  { path: "/about", name: "about" },
  { path: "/contact", name: "contact" },
  { path: "/blog", name: "blog" },
  { path: "/join-as-beautician", name: "join_beautician" },
];

async function runAudit() {
  console.log("Starting E2E Audit with Google Chrome...");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const auditLog = [];

  for (const vp of [
    { name: "mobile", width: 390, height: 844, isMobile: true },
    { name: "desktop", width: 1440, height: 900, isMobile: false },
  ]) {
    console.log(`\n--- Auditing ${vp.name.toUpperCase()} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      deviceScaleFactor: vp.isMobile ? 2 : 1,
    });

    const page = await context.newPage();

    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    for (const route of ROUTES) {
      consoleErrors.length = 0;
      const url = `${BASE_URL}${route.path}`;
      const res = await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
      const status = res ? res.status() : 0;

      // Check for horizontal overflow
      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const offending = [];

        document.querySelectorAll("*").forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 2 || rect.left < -2) {
            offending.push({
              tag: el.tagName,
              id: el.id,
              className: (el.className || "").toString().slice(0, 60),
              right: Math.round(rect.right),
              left: Math.round(rect.left),
              docWidth,
            });
          }
        });

        return {
          hasOverflow: scrollWidth > docWidth || bodyScrollWidth > docWidth,
          docWidth,
          scrollWidth,
          bodyScrollWidth,
          offending: offending.slice(0, 5),
        };
      });

      // Capture screenshot
      const shotPath = path.join(OUTPUT_DIR, `${vp.name}_${route.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });

      const result = {
        route: route.path,
        viewport: vp.name,
        status,
        hasOverflow: overflow.hasOverflow,
        overflowDetails: overflow.hasOverflow ? overflow : null,
        consoleErrors: [...consoleErrors],
        screenshot: shotPath,
      };

      auditLog.push(result);
      console.log(
        `[${status}] ${route.path} | Overflow: ${overflow.hasOverflow ? "FAIL" : "OK"} | Errors: ${consoleErrors.length}`
      );
    }

    await context.close();
  }

  // Next: Test Interactive Booking Flow on Mobile
  console.log("\n--- Testing Booking Flow Interaction on Mobile ---");
  const bookingContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const bPage = await bookingContext.newPage();
  await bPage.goto(`${BASE_URL}/services/bridal/traditional-bridal-makeup`, {
    waitUntil: "networkidle",
  });

  // Test scrolling and booking interactions
  const bookBtn = bPage.locator("button:has-text('Book Now')").first();
  const bookBtnVisible = await bookBtn.isVisible();
  console.log("Book Now button visible on mobile:", bookBtnVisible);

  if (bookBtnVisible) {
    await bookBtn.click();
    await bPage.waitForTimeout(1000);
    const bookShot = path.join(OUTPUT_DIR, `mobile_booking_flow_scrolled.png`);
    await bPage.screenshot({ path: bookShot, fullPage: false });
    console.log("Scrolled to booking form successfully.");
  }

  await bookingContext.close();
  await browser.close();

  const reportPath = path.join(OUTPUT_DIR, "audit_summary.json");
  fs.writeFileSync(reportPath, JSON.stringify(auditLog, null, 2));
  console.log(`\nAudit finished! Summary written to: ${reportPath}`);
}

runAudit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
