import { test, expect } from "@playwright/test";

test.describe("Service Details Page & Add-on Threshold Protection", () => {
  test("low-ticket service (< ₹499) displays Amber Add-on box and threshold guidance", async ({ page }) => {
    await page.goto("/services/face-hair-removal/eyebrow-threading");

    // Verify service title and low price
    await expect(page.locator("h1")).toContainText(/Eyebrow Threading/i);
    await expect(page.getByText("₹49").first()).toBeVisible();

    // Verify Amber Add-on Notice Box is rendered
    const amberNotice = page.locator("div").filter({ hasText: /Add-on Service · Min. Doorstep Visit ₹499/i }).first();
    await expect(amberNotice).toBeVisible();
    await expect(amberNotice).toContainText(/minimum doorstep booking is ₹499/i);

    // Verify direct links in amber notice
    const comboLink = amberNotice.getByRole("link", { name: /Make Your Own Combo →/i });
    await expect(comboLink).toHaveAttribute("href", "/custom-combo");

    const exploreLink = amberNotice.getByRole("link", { name: /Explore Salon at Home/i });
    await expect(exploreLink).toHaveAttribute("href", "/services/salon-at-home");

    // Rate card booking button states Add-on warning
    const bookBtn = page.getByRole("button", { name: /Book with Add-ons \(Min. ₹499\)/i }).first();
    await expect(bookBtn).toBeVisible();

    // Trust promise contains sanitized tools (no sealed kit)
    await expect(page.getByText("Hygienic setup & sanitized tools included").first()).toBeVisible();
  });

  test("regular service (>= ₹499) allows instant booking and option customization", async ({ page, isMobile }) => {
    await page.goto("/services/waxing/full-body-waxing-at-home");

    await expect(page.locator("h1")).toContainText(/Full Body Waxing at Home/i);

    // Verify rate card details
    await expect(page.getByText("100% Female Background-Verified Artist").first()).toBeVisible();
    await expect(page.getByText("Hygienic setup & sanitized tools included").first()).toBeVisible();

    // Booking button is direct
    const bookBtn = isMobile
      ? page.locator('button:has-text("Book Now")').first()
      : page.getByRole("button", { name: /Book this service/i }).first();
    await expect(bookBtn).toBeVisible();

    // Click booking button -> Opens booking form for this service
    if (isMobile) {
      await bookBtn.click({ force: true });
    } else {
      await bookBtn.click();
    }
    await expect(page.locator("#book")).toBeVisible();
    await expect(page.locator("#book h3")).toContainText(/Book this service/i);
  });
});
