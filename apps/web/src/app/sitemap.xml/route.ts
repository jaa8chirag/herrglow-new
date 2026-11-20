import { prisma } from "@herrglow/db";
import { SITE_URL } from "@/lib/site";
import { SITEMAPS, XML_HEADERS } from "@/lib/seo/sitemaps";

export const revalidate = 3600;

/** Sitemap INDEX, served directly at /sitemap.xml (no redirect). Lists only child sitemaps that contain URLs. */
export async function GET() {
  const entries: string[] = [];
  for (const [id, types] of Object.entries(SITEMAPS)) {
    const agg = await prisma.page.aggregate({ where: { type: { in: types }, isIndexable: true, inSitemap: true }, _max: { lastmod: true }, _count: true });
    if (!agg._count) continue;
    entries.push(`<sitemap><loc>${SITE_URL}/sitemaps/${id}.xml</loc>${agg._max.lastmod ? `<lastmod>${agg._max.lastmod.toISOString()}</lastmod>` : ""}</sitemap>`);
  }
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</sitemapindex>`, { headers: XML_HEADERS });
}
