import { prisma } from "@herrglow/db";
import { SITE_URL } from "@/lib/site";
import { SITEMAPS } from "@/lib/seo/sitemaps";

export const revalidate = 3600;

/** Sitemap index. Lists only the child sitemaps that actually contain URLs. */
export async function GET() {
  const entries: string[] = [];
  for (const [id, types] of Object.entries(SITEMAPS)) {
    const latest = await prisma.page.aggregate({ where: { type: { in: types }, isIndexable: true, inSitemap: true }, _max: { lastmod: true }, _count: true });
    if (!latest._count) continue;
    entries.push(`<sitemap><loc>${SITE_URL}/sitemap/${id}.xml</loc>${latest._max.lastmod ? `<lastmod>${latest._max.lastmod.toISOString()}</lastmod>` : ""}</sitemap>`);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</sitemapindex>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
