import test from "node:test";
import assert from "node:assert/strict";

/**
 * Business rules for Doorstep Salon & Make Your Own Combo
 */
const MIN_DOORSTEP_ORDER_INR = 499;
const BUNDLE_DISCOUNT_THRESHOLD_INR = 999;
const BUNDLE_DISCOUNT_RATE = 0.1; // 10%

export function isAddonOnly(price: number): boolean {
  return price > 0 && price < MIN_DOORSTEP_ORDER_INR;
}

export function calculateComboTotals(prices: number[]): {
  subtotal: number;
  discount: number;
  finalAmount: number;
  advanceDeposit: number;
  isEligibleForDoorstep: boolean;
  deficit: number;
  progressPercent: number;
} {
  const subtotal = prices.reduce((sum, p) => sum + p, 0);
  const discount =
    subtotal >= BUNDLE_DISCOUNT_THRESHOLD_INR ? Math.round(subtotal * BUNDLE_DISCOUNT_RATE) : 0;
  const finalAmount = subtotal - discount;
  const advanceDeposit = Math.round(finalAmount * 0.1);
  const isEligibleForDoorstep = subtotal >= MIN_DOORSTEP_ORDER_INR;
  const deficit = Math.max(0, MIN_DOORSTEP_ORDER_INR - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / MIN_DOORSTEP_ORDER_INR) * 100));

  return {
    subtotal,
    discount,
    finalAmount,
    advanceDeposit,
    isEligibleForDoorstep,
    deficit,
    progressPercent,
  };
}

test("unit economics: low-ticket services below ₹499 are flagged as add-on only", () => {
  assert.equal(isAddonOnly(49), true, "Eyebrow threading ₹49 must be add-on only");
  assert.equal(isAddonOnly(29), true, "Upper lip threading ₹29 must be add-on only");
  assert.equal(isAddonOnly(199), true, "Half arms waxing ₹199 must be add-on only");
  assert.equal(isAddonOnly(499), false, "₹499 meets the doorstep minimum, not add-on only");
  assert.equal(isAddonOnly(899), false, "₹899 exceeds threshold, full standalone service");
});

test("unit economics: cart below ₹499 reports deficit and blocks solo checkout", () => {
  const cart = calculateComboTotals([49, 29]); // ₹78
  assert.equal(cart.subtotal, 78);
  assert.equal(cart.isEligibleForDoorstep, false);
  assert.equal(cart.deficit, 421);
  assert.ok(cart.progressPercent < 20);
  assert.equal(cart.discount, 0);
});

test("unit economics: cart at or above ₹499 qualifies for doorstep booking", () => {
  const cart = calculateComboTotals([49, 299, 179]); // ₹527
  assert.equal(cart.subtotal, 527);
  assert.equal(cart.isEligibleForDoorstep, true);
  assert.equal(cart.deficit, 0);
  assert.equal(cart.progressPercent, 100);
  assert.equal(cart.finalAmount, 527);
  assert.equal(cart.advanceDeposit, 53); // 10%
});

test("unit economics: combos at or above ₹999 unlock 10% automated bundle discount", () => {
  const cart = calculateComboTotals([599, 449, 199]); // ₹1247
  assert.equal(cart.subtotal, 1247);
  assert.equal(cart.discount, 125); // round(1247 * 0.1)
  assert.equal(cart.finalAmount, 1122);
  assert.equal(cart.isEligibleForDoorstep, true);
  assert.equal(cart.advanceDeposit, 112); // round(1122 * 0.1)
});
