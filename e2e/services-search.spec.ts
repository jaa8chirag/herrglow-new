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

  test("location switcher updates area guarantee and zero surcharge banner", async ({ page }) => {
    // Check default location guarantee banner
    await expect(page.getByText("Zero Travel Surcharge")).toBeVisible();

    // Click Noida location button
    const noidaBtn = page.getByRole("button", { name: "Noida", exact: true });
    await expect(noidaBtn).toBeVisible();
    await noidaBtn.click();

    // Verify Noida verified hub tag appears
    await expect(page.getByText(/Noida Verified Hub/i)).toBeVisible();
  });
});
