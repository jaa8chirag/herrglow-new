import { planPages } from "../src/seo/plan";
import { prisma } from "@herrglow/db";

const plan = await planPages();
const W = [14, 6, 6, 16, 11, 12, 13, 13];
const row = (v: (string | number)[]) => v.map((x, i) => String(x).padEnd(W[i]!)).join("");
console.log(row(["city", "pros", "hub", "svc×city drafts", "(eligible)", "area pages", "(text only)", "artist pages"]));
for (const p of plan.cities)
  console.log(row([p.city, p.activePros, p.cityHub ? "YES" : "no", p.serviceCityDrafts, p.serviceCityEligible, p.areaPages, p.areaTextOnly, p.artistPages]));
const sum = (f: (p: (typeof plan.cities)[number]) => number) => plan.cities.reduce((a, p) => a + f(p), 0);
const uniqueArtists = await prisma.pro.count({
  where: { status: "ACTIVE", photo: { not: null }, coverage: { some: { area: { city: { isActive: true } } } } },
});
console.log(`\nTOTAL  hubs ${plan.cities.filter((c) => c.cityHub).length} | service×city drafts ${sum((p) => p.serviceCityDrafts)} (published ${sum((p) => p.serviceCityPublished)}) | area pages ${sum((p) => p.areaPages)} | artist pages ${uniqueArtists} unique (active, with photo)`);
console.log(`GLOBAL service pages ${plan.servicePages} | categories ${plan.categories} | blogs ${plan.blogs} | home 1`);
console.log(`INACTIVE (no pages, no sitemap, no nav): ${plan.inactiveCities.join(", ")}`);
await prisma.$disconnect();
