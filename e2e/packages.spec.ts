import { test, expect } from "@playwright/test";

test.describe("Packages Page (/packages)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/packages");
  });

  test("renders top custom combo callout banner linking to /custom-combo", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(/Everything in one booking/i);

    // Callout banner for Custom Combo
    await expect(page.getByText("Make Your Own Custom Combo").first()).toBeVisible();

    const buildBtn = page.getByRole("link", { name: /Build Custom Combo →/i });
    await expect(buildBtn).toBeVisible();
    await expect(buildBtn).toHaveAttribute("href", "/custom-combo");
  });

  test("displays pre-built combos priced at or above ₹499", async ({ page }) => {
    // Check Head-to-Toe Pamper & Glow Combo
    await expect(page.getByText("Head-to-Toe Pamper & Glow Combo").first()).toBeVisible();
    await expect(page.getByText("₹899").first()).toBeVisible();

    // Check Full Face Grooming & Glow Combo
    await expect(page.getByText("Full Face Grooming & Glow Combo").first()).toBeVisible();
    await expect(page.getByText("₹499").first()).toBeVisible();

    // Check Express Wax & Glow Essentials Combo
    await expect(page.getByText("Express Wax & Glow Essentials Combo").first()).toBeVisible();
    await expect(page.getByText("₹649").first()).toBeVisible();
  });
});
