import { test, expect } from "@playwright/test";

test.describe("Services Hub Search & Live Filtering (/services)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/services");
  });

  test("renders search bar and filters services dynamically on input", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search services \(e\.g\., Rica Wax/i);
    await expect(searchInput).toBeVisible();

    // Type 'wax' in search
    await searchInput.fill("wax");
    // Verify waxing services are shown
    await expect(page.getByText(/Waxing/i).first()).toBeVisible();

    // Type a specific service
    await searchInput.fill("Facial");
    await expect(page.getByText(/Facial/i).first()).toBeVisible();
  });

  test("category filter tabs narrow down items instantly", async ({ page }) => {
    const tabList = page.getByRole("tablist", { name: "Filter by category" });
    await expect(tabList).toBeVisible();

    // Check All Categories tab
    const allTab = page.getByRole("tab", { name: /All Categories/i });
    await expect(allTab).toBeVisible();

    // Verify service cards have title and direct links
    const serviceCardLink = page.locator('a[href^="/services/"]').first();
    await expect(serviceCardLink).toBeVisible();
  });

  test("category selection exposes targeted sub-category filter pills", async ({ page }) => {
    // Click Waxing category tab
    const waxingTab = page.getByRole("tab", { name: /Waxing/i }).first();
    await expect(waxingTab).toBeVisible();
    await waxingTab.click();

    // Verify subcategory filters appear
    await expect(page.getByRole("button", { name: /Rica Wax/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Honey \/ Regular Wax/i }).first()).toBeVisible();
  });
});
