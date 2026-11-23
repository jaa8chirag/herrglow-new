import { test, expect } from "@playwright/test";

test.describe("Mobile Viewport & UX Responsiveness", () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 / Pixel standard mobile viewport

  test("home page has no horizontal overflow on mobile", async ({ page }) => {
    await page.goto("/");

    // Verify document width equals viewport width (zero horizontal scroll)
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);
  });

  test("custom combo builder has no horizontal overflow on mobile", async ({ page }) => {
    await page.goto("/custom-combo");

    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);

    // Verify touch targets on category buttons are clickable
    const faceBtn = page.getByRole("button", { name: "Face & Threading", exact: true });
    await expect(faceBtn).toBeVisible();
    await faceBtn.click();
  });

  test("service detail page displays unified mobile floating action dock", async ({ page }) => {
    await page.goto("/services/face-hair-removal/eyebrow-threading");

    // Unified floating action dock should be visible at bottom on mobile
    const dock = page.locator("div.fixed.bottom-0");
    await expect(dock).toBeVisible();

    // Verify trust banner within dock
    await expect(dock.getByText(/100% Female Verified/i)).toBeVisible();

    // Verify WhatsApp direct quick-action
    const waBtn = dock.locator('a[aria-label="Chat with Beauty Expert on WhatsApp"]');
    await expect(waBtn).toBeVisible();
  });
});
