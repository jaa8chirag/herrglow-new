import { test, expect } from "@playwright/test";

test.describe("Interactive Booking Flow & Step Progression", () => {
  test("enforces multi-step progression and navigates from Step 1 to Step 4", async ({ page }) => {
    await page.goto("/contact#book");

    const form = page.locator("#book").first();
    await expect(form).toBeVisible();

    // Verify stepper buttons exist (Step 1 to Step 4)
    await expect(page.locator('button[aria-label="Step 1: Service"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Step 2: Address"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Step 3: Date & slot"]')).toBeVisible();
    await expect(page.locator('button[aria-label="Step 4: Details"]')).toBeVisible();

    // Step 0: Service selection (optional in general enquiry mode) -> Click Continue
    const continueBtn = page.getByRole("button", { name: /Continue/i });
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    // Step 1: Address step - fill required doorstep location fields
    await expect(page.locator('button[aria-label="Step 2: Address"]')).toHaveAttribute("aria-current", "step");
    await page.locator("#booking-flat").fill("Flat 402, 4th Floor");
    await page.locator("#booking-society").fill("Sunshine Greens Society");
    await page.locator("#booking-area").fill("Sector 62, Noida");

    // Proceed to Step 2: Date & slot
    await continueBtn.click();
    await expect(page.locator('button[aria-label="Step 3: Date & slot"]')).toHaveAttribute("aria-current", "step");

    // Step 2: Date & slot - choose a quick date if visible
    const quickDateBtn = page.locator('button:has-text("Tomorrow")').first();
    if (await quickDateBtn.isVisible()) {
      await quickDateBtn.click();
    }

    // Proceed to Step 3: Details
    await continueBtn.click();
    await expect(page.locator('button[aria-label="Step 4: Details"]')).toHaveAttribute("aria-current", "step");

    // Step 3: Verify contact details inputs are rendered
    await expect(page.locator("#booking-name")).toBeVisible();
    await expect(page.locator("#booking-phone")).toBeVisible();
    await expect(page.locator("#booking-email")).toBeVisible();

    // Verify final CTA button
    const submitBtn = page.getByRole("button", { name: /Confirm Booking · Reserve Slot/i });
    await expect(submitBtn).toBeVisible();
  });

  test("renders direct WhatsApp contact assistance on contact page", async ({ page }) => {
    await page.goto("/contact");

    // Verify WhatsApp direct link is rendered and points to valid wa.me or whatsapp.com URL
    const waHelpBtn = page.locator('a[href*="wa.me"], a[href*="whatsapp.com"]').first();
    await expect(waHelpBtn).toBeVisible();
    const href = await waHelpBtn.getAttribute("href");
    expect(href).toMatch(/wa\.me|whatsapp\.com/);
  });
});
