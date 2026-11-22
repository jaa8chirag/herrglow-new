import { chromium } from "playwright";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function inspectMobileBottom() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2
  });

  const page = await context.newPage();
  await page.goto("http://localhost:3000/services/bridal/traditional-bridal-makeup", { waitUntil: "networkidle" });

  const dockInfo = await page.evaluate(() => {
    const bottomElements = Array.from(document.querySelectorAll("*")).filter((el) => {
      const style = window.getComputedStyle(el);
      const isFixedOrSticky = style.position === "fixed" || style.position === "sticky";
      const rect = el.getBoundingClientRect();
      return isFixedOrSticky && rect.bottom >= window.innerHeight - 200 && rect.height > 10;
    }).map((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        id: el.id,
        className: el.className ? el.className.toString() : "",
        text: el.innerText ? el.innerText.trim().slice(0, 100) : "",
        rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height },
        zIndex: style.zIndex,
        backgroundColor: style.backgroundColor,
        color: style.color
      };
    });

    return bottomElements;
  });

  console.log("Fixed/Sticky Elements near bottom on mobile service page:");
  console.dir(dockInfo, { depth: null });

  // Also check scroll down behavior
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(500);

  const backToTopInfo = await page.evaluate(() => {
    const btn = document.querySelector("button[aria-label='Back to top']");
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    const style = window.getComputedStyle(btn);
    return {
      opacity: style.opacity,
      pointerEvents: style.pointerEvents,
      rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height },
      zIndex: style.zIndex
    };
  });

  console.log("\nBack to top button after scroll 1000px:");
  console.dir(backToTopInfo, { depth: null });

  // Take screenshot of scrolled mobile page
  await page.screenshot({ path: "/Users/rex/.gemini/antigravity/brain/de3b07d8-1a1d-4c34-94a8-b378c52cb46b/audit-results/mobile_svc_scrolled_dock.png" });

  await browser.close();
}

inspectMobileBottom().catch(console.error);
