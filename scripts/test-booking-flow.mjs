import { chromium } from "playwright";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = "http://localhost:3000";

async function testBookingFlow() {
  console.log("Starting full interactive booking flow test with exact step sequence...");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2
  });

  const page = await context.newPage();
  
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  // 1. Visit service page
  await page.goto(`${BASE_URL}/services/face-hair-removal/eyebrow-threading`, { waitUntil: "networkidle" });
  console.log("1. Loaded service page: /services/face-hair-removal/eyebrow-threading");

  // 2. Click Book Now to scroll to form
  const bookBtn = page.locator("button:has-text('Book Now')").first();
  await bookBtn.click();
  await page.waitForTimeout(600);

  // STEP 0: Service (already selected: Eyebrow Threading)
  console.log("2. Step 0 (Service): Clicking Continue");
  const continueBtn0 = page.locator("#book button:has-text('Continue')").first();
  await continueBtn0.click();
  await page.waitForTimeout(400);

  // STEP 1: Address
  console.log("3. Step 1 (Address): Filling flat, society, and locality");
  await page.locator("#booking-flat").fill("Flat 402, 4th Floor");
  await page.locator("#booking-society").fill("Aura Chimera Towers");
  await page.locator("#booking-area").fill("Sector 62, Noida");
  await page.waitForTimeout(200);

  // Click Continue
  const continueBtn1 = page.locator("#book button:has-text('Continue')").first();
  await continueBtn1.click();
  await page.waitForTimeout(400);

  // STEP 2: Date & Slot
  console.log("4. Step 2 (Date & Slot): Selecting slot and date");
  // Fill date
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  await page.locator("#booking-date").fill(tomorrow);

  // Select slot
  const slotBtn = page.locator("#book button:has-text('Morning'), #book button:has-text('Afternoon')").first();
  if (await slotBtn.isVisible()) {
    await slotBtn.click();
  }

  // Click Continue
  const continueBtn2 = page.locator("#book button:has-text('Continue')").first();
  await continueBtn2.click();
  await page.waitForTimeout(400);

  // STEP 3: Details
  console.log("5. Step 3 (Details): Filling name, phone, email");
  await page.locator("#booking-name").fill("Priya Sharma");
  await page.locator("#booking-phone").fill("9876543210");
  await page.locator("#booking-email").fill("priya.test@example.com");

  // Submit Booking
  console.log("6. Submitting Booking Form...");
  const submitBtn = page.locator("#book button[type='submit']").first();
  await submitBtn.click();

  // Wait for confirmation card
  await page.waitForSelector("text=Booking Reference", { timeout: 15000 });
  const refText = await page.locator("text=/HG-\\d+/").first().innerText();
  console.log(`\n>>> SUCCESS! Booking confirmed with Reference: ${refText} <<<`);

  const shotPath = "/Users/rex/.gemini/antigravity/brain/de3b07d8-1a1d-4c34-94a8-b378c52cb46b/audit-results/mobile_booking_success.png";
  await page.screenshot({ path: shotPath });
  console.log("Saved confirmation screenshot to:", shotPath);

  await browser.close();
  console.log("Interactive booking test PASSED completely!");
}

testBookingFlow().catch((err) => {
  console.error("Booking test failed:", err);
  process.exit(1);
});
