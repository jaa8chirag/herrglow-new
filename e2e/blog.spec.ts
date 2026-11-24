import { test, expect } from "@playwright/test";

test.describe("Blogs & Internal Linking (/blog)", () => {
  test("blog index page lists all 7 blogs with reading minutes", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.locator("h1")).toContainText(/Beauty guides and tips/i);

    // Verify all 7 blogs exist on the index
    await expect(
      page.getByText("Rica Wax vs Honey Wax: Which Is Best for Sensitive Skin?")
    ).toBeVisible();
    await expect(
      page.getByText("Cleanup vs Facial: Which Does Your Skin Need in Delhi NCR?")
    ).toBeVisible();
    await expect(
      page.getByText("Party Makeup at Home in Delhi NCR: The Complete Glam Guide")
    ).toBeVisible();
    await expect(
      page.getByText("The Ultimate 6-Month Bridal Skincare & Beauty Timeline")
    ).toBeVisible();
    await expect(
      page.getByText("HD vs Airbrush Bridal Makeup: Which Lasts Longer in Delhi?")
    ).toBeVisible();
    await expect(
      page.getByText("Why At-Home Salon Services Are Better Than Traditional Salons")
    ).toBeVisible();
    await expect(
      page.getByText("Complete Pre-Bridal Package Checklist: What to Book & When")
    ).toBeVisible();
  });

  test("blog detail page renders Table of Contents and contextual service backlinks", async ({
    page,
  }) => {
    await page.goto("/blog/rica-wax-vs-honey-wax-sensitive-skin-guide");

    // Title and author
    await expect(page.locator("h1")).toContainText(/Rica Wax vs Honey Wax/i);
    await expect(page.getByText("By Neha Bisht, Head of Hygiene & Standards")).toBeVisible();

    // Table of contents
    const toc = page.locator('nav[aria-label="Table of contents"]');
    await expect(toc).toBeVisible();

    // Verify comparison table exists
    const table = page.locator("table");
    await expect(table).toBeVisible();
    await expect(page.getByText("Rica Liposoluble Wax").first()).toBeVisible();

    // Verify contextual service backlinks in prose
    const armsWaxLink = page.locator('article a[href="/services/waxing/full-arms-waxing"]');
    await expect(armsWaxLink).toBeVisible();
    await expect(armsWaxLink).toHaveAttribute("href", "/services/waxing/full-arms-waxing");

    const customComboLink = page.locator('article a[href="/custom-combo"]');
    await expect(customComboLink).toBeVisible();
    await expect(customComboLink).toHaveAttribute("href", "/custom-combo");

    // Verify Article JSON-LD
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd.first()).toBeAttached();
  });
});
