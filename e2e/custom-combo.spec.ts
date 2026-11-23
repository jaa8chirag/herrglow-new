import { test, expect } from "@playwright/test";

test.describe("Custom Combo Builder (/custom-combo)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/custom-combo");
  });

  test("loads custom combo page with all category filter buttons", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(/Make Your Own Custom Combo/i);

    // Verify category filter buttons exist
    await expect(page.getByRole("button", { name: "All Services", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Face & Threading", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Waxing", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Facials & Cleanup", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hands & Feet", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hair & Styling", exact: true })).toBeVisible();
  });

  test("category filter buttons filter items instantly without page reload", async ({ page }) => {
    // Switch to Face & Threading
    await page.getByRole("button", { name: "Face & Threading", exact: true }).click();
    await expect(page.getByText("Eyebrow Threading").first()).toBeVisible();

    // Switch to Waxing
    await page.getByRole("button", { name: "Waxing", exact: true }).click();
    await expect(page.getByText("Full Arms Waxing (Honey)").first()).toBeVisible();
    await expect(page.getByText("Full Legs Waxing (Honey)").first()).toBeVisible();
  });

  test("enforces ₹499 minimum doorstep visit threshold with live progress bar", async ({ page }) => {
    // Clear all items to start fresh
    const clearBtn = page.getByRole("button", { name: /Clear All/i });
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
    }
    await expect(page.getByText("Your custom combo is empty")).toBeVisible();

    // Add Eyebrow Threading (₹49)
    await page.getByRole("button", { name: "Face & Threading", exact: true }).click();
    const addEyebrow = page.getByRole("button", { name: "Add Eyebrow Threading" });
    await addEyebrow.click();

    // Subtotal should be ₹49, deficit should be ₹450
    await expect(page.getByText(/₹49 \/ ₹499/)).toBeVisible();
    await expect(page.getByText(/Add ₹450 more to meet the ₹499 minimum doorstep visit/i)).toBeVisible();

    // Booking CTA should be disabled
    const disabledBtn = page.getByRole("button", { name: /Add ₹450 More to Book/i });
    await expect(disabledBtn).toBeDisabled();
  });

  test("unlocks booking button and free doorstep travel when subtotal exceeds ₹499", async ({ page }) => {
    // Clear all items first
    const clearBtn = page.getByRole("button", { name: /Clear All/i });
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
    }

    // Add Full Arms Waxing (Honey) (₹299)
    await page.getByRole("button", { name: "Waxing", exact: true }).click();
    await page.getByRole("button", { name: "Add Full Arms Waxing (Honey)" }).click();

    // Add Face & Neck Herbal De-Tan Pack (₹299)
    await page.getByRole("button", { name: "Add Face & Neck Herbal De-Tan Pack" }).click();

    // Total = ₹598 >= ₹499
    await expect(page.getByText(/Minimum ₹499 Reached!/i)).toBeVisible();
    await expect(page.getByText(/100% Free Doorstep Travel Unlocked/i)).toBeVisible();

    // Booking CTA should be enabled
    const bookBtn = page.getByRole("button", { name: /Book Custom Combo \(₹598\) →/i });
    await expect(bookBtn).toBeEnabled();
  });

  test("automatically applies 10% bundle discount for combos of ₹999 or more", async ({ page }) => {
    // Clear all items first
    const clearBtn = page.getByRole("button", { name: /Clear All/i });
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
    }

    // Add Full Body Waxing Combo (₹1,199)
    await page.getByRole("button", { name: "Waxing", exact: true }).click();
    await page.getByRole("button", { name: "Add Full Body Waxing Combo" }).click();

    // 10% discount badge and savings breakdown should appear
    await expect(page.getByText(/10% Custom Bundle Discount Applied!/i)).toBeVisible();
    await expect(page.getByText(/10% Combo Savings/i)).toBeVisible();

    // Subtotal: ₹1,199 - 10% (₹120) = ₹1,079
    await expect(page.getByText(/Final Amount/i)).toBeVisible();
    const bookBtn = page.getByRole("button", { name: /Book Custom Combo \(₹1,079\) →/i });
    await expect(bookBtn).toBeEnabled();

    // Click booking button -> Embedded booking form is revealed
    await bookBtn.click();
    const formHeading = page.locator("#custom-combo-book h2");
    await expect(formHeading).toBeVisible();
    await expect(formHeading).toContainText(/Finalize Your Custom Combo Booking/i);
  });
});
