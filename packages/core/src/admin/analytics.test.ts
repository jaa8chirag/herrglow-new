import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { prisma } from "@herrglow/db";
import { recordSearchQuery, recordServiceView, getAnalyticsOverview } from "./analytics";

const TEST_TAG = `test-analytics-${Date.now()}`;

after(async () => {
  // Cleanup test search logs
  await prisma.searchQueryLog.deleteMany({
    where: {
      query: { startsWith: TEST_TAG },
    },
  });
  await prisma.$disconnect();
});

test("recordSearchQuery logs valid queries and ignores single character noise", async () => {
  // Should ignore single char
  await recordSearchQuery({ query: "a", resultsCount: 0 });
  const single = await prisma.searchQueryLog.findFirst({ where: { query: "a" } });
  assert.equal(single, null);

  // Should record valid search
  const q = `${TEST_TAG} hydra facial`;
  await recordSearchQuery({ query: q, resultsCount: 0, citySlug: "noida" });

  const found = await prisma.searchQueryLog.findFirst({
    where: { query: q },
  });
  assert.ok(found);
  assert.equal(found.resultsCount, 0);
  assert.equal(found.citySlug, "noida");
});

test("recordServiceView increments viewCount and upserts daily views", async () => {
  const service = await prisma.service.findFirst({ where: { status: "ACTIVE" } });
  assert.ok(service, "Must have at least one active service");

  const initialViews = service.viewCount;
  await recordServiceView(service.id, false);

  const updated = await prisma.service.findUniqueOrThrow({
    where: { id: service.id },
    select: { viewCount: true },
  });
  assert.equal(updated.viewCount, initialViews + 1);

  // If isBot = true, should not increment
  await recordServiceView(service.id, true);
  const afterBot = await prisma.service.findUniqueOrThrow({
    where: { id: service.id },
    select: { viewCount: true },
  });
  assert.equal(afterBot.viewCount, initialViews + 1);
});

test("getAnalyticsOverview aggregates metrics correctly", async () => {
  const zeroQ = `${TEST_TAG} zero search`;
  const hitQ = `${TEST_TAG} hit search`;

  await recordSearchQuery({ query: zeroQ, resultsCount: 0 });
  await recordSearchQuery({ query: zeroQ, resultsCount: 0 });
  await recordSearchQuery({ query: hitQ, resultsCount: 5 });

  const overview = await getAnalyticsOverview(1);
  assert.ok(overview.topServices.length >= 1);
  assert.ok(overview.stats.totalViews >= 1);

  const zeroFound = overview.zeroResultSearches.find((s) => s.query === zeroQ);
  assert.ok(zeroFound, "Zero-result query must be flagged in zeroResultSearches");
  assert.equal(zeroFound.count, 2);
  assert.equal(zeroFound.avgResults, 0);
});
