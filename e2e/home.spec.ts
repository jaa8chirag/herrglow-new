import { test, expect } from "@playwright/test";

test.describe("Home Page & Core Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders valid SEO metadata and title", async ({ page }) => {
    await expect(page).toHaveTitle(/HerrGlow/);
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveCount(1);
    const descContent = await metaDesc.getAttribute("content");
    expect(descContent).toBeTruthy();
    expect(descContent!.length).toBeLessThanOrEqual(160);
  });

  test("main header contains all primary navigation links including Make a Combo", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) {
      // On mobile viewports, verify mobile menu button and drawer contents
      const menuBtn = page.getByRole("button", { name: /Open menu/i });
      await expect(menuBtn).toBeVisible();
      await menuBtn.click();

      // Drawer should reveal visible navigation links
      const comboLink = page.locator('a[href="/custom-combo"]:visible').first();
      await expect(comboLink).toBeVisible();
      await expect(comboLink).toContainText(/Make a Combo/i);

      await expect(page.locator('a[href="/packages"]:visible').first()).toBeVisible();
      await expect(page.locator('a[href="/blog"]:visible').first()).toBeVisible();
    } else {
      // On desktop viewports, verify header navigation bar
      const nav = page.locator("header nav");
      await expect(nav).toBeVisible();

      // Verify Make a Combo link
      const comboLink = page.locator('header a[href="/custom-combo"]');
      await expect(comboLink).toBeVisible();
      await expect(comboLink).toContainText(/Make a Combo/i);

      // Verify Services button that opens mega-menu
      const servicesBtn = page.getByRole("button", { name: "Services", exact: true });
      await expect(servicesBtn).toBeVisible();

      // Verify other key links
      await expect(page.locator('header a[href="/packages"]').first()).toBeVisible();
      await expect(page.locator('header a[href="/blog"]').first()).toBeVisible();
      await expect(page.locator('header a[href="/about"]').first()).toBeVisible();
      await expect(page.locator('header a[href="/contact"]').first()).toBeVisible();
    }
  });

  test("hero section renders clean trust badges without sealed kit promises", async ({ page }) => {
    // Check Hero headings
    const heroH1 = page.locator("h1");
    await expect(heroH1).toBeVisible();
    await expect(heroH1).toContainText(/Salon Luxury & Bridal Artistry/i);

    // Check that 'Sealed Kits' or 'Hospital-Grade Sealed Kits' do NOT appear
    const pageContent = await page.content();
    expect(pageContent).not.toMatch(/sealed single-use kit/i);
    expect(pageContent).not.toMatch(/hospital-grade sealed kit/i);

    // Check positive trust badges
    await expect(page.getByText("100% Female Verified").first()).toBeVisible();
    await expect(page.getByText("100% Authentic Products").first()).toBeVisible();
    await expect(page.getByText("Strict Cleanliness & Hygiene").first()).toBeVisible();
  });

  test("navigates to services hub when clicking view categories", async ({ page }) => {
    const viewCategoriesBtn = page.getByRole("link", { name: /View 8 Categories & Prices/i });
    await viewCategoriesBtn.click();
    await expect(page).toHaveURL(/\/services/);
    await expect(page.locator("h1")).toContainText(/Everything we offer, at your home/i);
  });

  test("city selector dropdown navigates to active city hub without 410 Gone", async ({
    page,
    isMobile,
  }) => {
    if (isMobile) {
      // On mobile viewports: Open menu drawer, select Delhi
      const menuBtn = page.getByRole("button", { name: /Open menu/i });
      await menuBtn.click();
      await page.waitForTimeout(400);
      const delhiChip = page.locator('nav[aria-label="Mobile"] a[href="/salon-at-home-delhi"]');
      await expect(delhiChip).toBeVisible();
      await delhiChip.click();
    } else {
      // On desktop viewports: Click city dropdown trigger and select Delhi
      const cityBtn = page.locator("[data-city-menu] button");
      await expect(cityBtn).toBeVisible();
      await cityBtn.click();
      const delhiLink = page.locator('[data-city-menu] a[href="/salon-at-home-delhi"]');
      await expect(delhiLink).toBeVisible();
      await delhiLink.click();
    }

    await expect(page).toHaveURL(/\/salon-at-home-delhi$/, { timeout: 15000 });
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible({ timeout: 15000 });
    await expect(h1).toContainText(/Makeup Artist at Home in Delhi/i);

    // Verify that legacy 410 'Gone' is NEVER displayed
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.trim()).not.toBe("Gone");
    expect(bodyText).toContain("Services available in Delhi");
  });

  test("mobile drawer displays all service cities with direct working links", async ({
    page,
    isMobile,
  }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 375, height: 667 });
    }
    const menuBtn = page.getByRole("button", { name: /Open menu/i });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    await page.waitForTimeout(500);

    const noidaChip = page.locator('nav[aria-label="Mobile"] a[href="/salon-at-home-noida"]');
    await expect(noidaChip).toBeVisible();
    await noidaChip.click();

    await expect(page).toHaveURL(/\/salon-at-home-noida$/, { timeout: 15000 });
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible({ timeout: 15000 });
    await expect(h1).toContainText(/Makeup Artist at Home in Noida/i);
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.trim()).not.toBe("Gone");
  });

  test("legacy /makeup-artist-in-{city} URLs seamlessly 301 redirect to /salon-at-home-{city}", async ({
    page,
  }) => {
    for (const city of ["delhi", "noida", "greater-noida"]) {
      await page.goto(`/makeup-artist-in-${city}`);
      await expect(page).toHaveURL(new RegExp(`/salon-at-home-${city}$`), { timeout: 15000 });
      const bodyText = await page.locator("body").innerText();
      expect(bodyText.trim()).not.toBe("Gone");
      const h1 = page.locator("h1");
      await expect(h1).toBeVisible({ timeout: 15000 });
      await expect(h1).toContainText(/Makeup Artist at Home in/i);
    }
  });

  test("city cards section on homepage links to canonical city hubs", async ({ page }) => {
    const greaterNoidaCard = page.locator('a[href="/salon-at-home-greater-noida"]').first();
    await expect(greaterNoidaCard).toBeVisible();
    await greaterNoidaCard.scrollIntoViewIfNeeded();
    await greaterNoidaCard.click();
    await expect(page).toHaveURL(/\/salon-at-home-greater-noida$/, { timeout: 15000 });
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/Makeup Artist at Home in Greater Noida/i);
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.trim()).not.toBe("Gone");
  });
});
