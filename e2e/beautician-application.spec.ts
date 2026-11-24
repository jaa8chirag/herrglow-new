import { test, expect } from "@playwright/test";

test.describe("Beautician Partner Onboarding (/join-as-beautician)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/join-as-beautician");
  });

  test("renders recruitment value proposition and bilingual language switcher", async ({
    page,
  }) => {
    // Check heading
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Grow your.*business with HerrGlow/i);

    // Verify WhatsApp direct application button
    const waBtn = page.locator('a[href*="wa.me"]:visible').first();
    await expect(waBtn).toBeVisible();

    // Verify language toggle button to Hindi
    const hiBtn = page.getByRole("button", { name: /हिन्दी/i });
    if (await hiBtn.isVisible()) {
      await hiBtn.click();
      await expect(page.getByText(/Aapka poora naam/i).first()).toBeVisible();
    }
  });

  test("form contains all required professional onboarding fields", async ({ page }) => {
    const form = page.locator("form").first();
    await expect(form).toBeVisible();

    // Name input
    const nameInput = form.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();

    // Phone input
    const phoneInput = form.locator('input[name="phone"]');
    await expect(phoneInput).toBeVisible();

    // Email input
    const emailInput = form.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();

    // Submit button
    const submitBtn = form.getByRole("button", {
      name: /Submit application|Application Submit Karein/i,
    });
    await expect(submitBtn).toBeVisible();
  });
});
