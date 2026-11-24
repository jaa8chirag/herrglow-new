import { syncPages } from "../src/seo/pages";
import { prisma } from "@herrglow/db";

console.log(await syncPages());
const by = await prisma.page.groupBy({ by: ["type"], where: { inSitemap: true }, _count: true });
console.log("in sitemap:", Object.fromEntries(by.map((b) => [b.type, b._count])));
const noidx = await prisma.page.findMany({ where: { isIndexable: false }, select: { url: true } });
console.log(
  "noindex:",
  noidx.map((p) => p.url)
);
await prisma.$disconnect();
