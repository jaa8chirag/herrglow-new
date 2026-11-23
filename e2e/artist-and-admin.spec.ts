import { test, expect } from "@playwright/test";

test.describe("Artist Profiles, Admin Security & 404 Error Handling", () => {
  test("verified artist profile renders bio, credentials and booking handoff", async ({ page }) => {
    await page.goto("/artists/priyanka-verma");

    // Title and verified badge
    const artistHeading = page.locator("h1");
    await expect(artistHeading).toBeVisible();
    await expect(artistHeading).toContainText(/Priyanka Verma/i);

    // Verified role badge
    await expect(page.getByText(/Makeup Artist/i).first()).toBeVisible();

    // Book CTA link
    const bookCta = page.getByRole("link", { name: /Book Priyanka/i });
    await expect(bookCta).toBeVisible();
    await expect(bookCta).toHaveAttribute("href", "#book");

    // Embedded booking form on artist page
    const form = page.locator("#book").first();
    await expect(form).toBeVisible();
  });

  test("admin portal renders secure login gate with required fields", async ({ page }) => {
    await page.goto("/admin/login");

    await expect(page.locator("h1")).toContainText(/HerrGlow Portal/i);

    // Email and password fields
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("type", "email");

    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Submit button
    const submitBtn = page.getByRole("button", { name: /Sign in|Continue/i });
    await expect(submitBtn).toBeVisible();
  });

  test("unmatched routes render designed 404 page with recovery navigation", async ({ page }) => {
    await page.goto("/non-existent-luxury-page-404");

    // Verify 404 layout
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/This page took a day off/i);

    // Verify recovery links
    const homeLink = page.getByRole("link", { name: /Back to home/i });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute("href", "/");

    const browseServicesLink = page.getByRole("link", { name: /Browse services/i });
    await expect(browseServicesLink).toBeVisible();
    await expect(browseServicesLink).toHaveAttribute("href", "/services");
  });
});
