import { planPages } from "../src/seo/plan";
import { prisma } from "@herrglow/db";

const plans = (await planPages()).filter((p) => p.activePros > 0 || p.areasTotal > 0).sort((a, b) => b.activePros - a.activePros);
const pad = (s: string | number, n: number) => String(s).padEnd(n);
console.log(pad("city", 16), pad("pros", 5), pad("hub", 4), pad("svc×city(pros)", 15), pad("svc×city(live)", 15), pad("areas", 6), "area pages");
for (const p of plans)
  console.log(pad(p.city, 16), pad(p.activePros, 5), pad(p.cityHub ? "YES" : "-", 4), pad(p.serviceCityByPros, 15), pad(p.serviceCityLive, 15), pad(p.areasTotal, 6), p.areaPages);
const hubs = plans.filter((p) => p.cityHub);
const sum = (f: (p: (typeof plans)[number]) => number) => plans.reduce((a, p) => a + f(p), 0);
const proPages = await prisma.pro.count({ where: { status: "ACTIVE", photo: { not: null } } });
const [svc, blog] = await Promise.all([prisma.service.count({ where: { status: "ACTIVE", mergedIntoId: null } }), prisma.blog.count({ where: { status: "ACTIVE" } })]);
console.log(`\nCity hubs: ${hubs.length} (${hubs.map((h) => h.city).join(", ")})`);
console.log(`Service×city if content gate ignored: ${sum((p) => p.serviceCityByPros)} | live today (needs localContent): ${sum((p) => p.serviceCityLive)}`);
console.log(`Area pages: ${sum((p) => p.areaPages)}`);
console.log(`Artist pages (active, photo): ${proPages} | Service pages: ${svc} | Blogs: ${blog} | Categories: 7 | Home: 1`);
await prisma.$disconnect();
