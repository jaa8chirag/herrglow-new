import { prisma } from "@herrglow/db";
import { SITE_URL } from "@/lib/site";
import { SITEMAPS, XML_HEADERS, xmlEscape } from "@/lib/seo/sitemaps";

export const dynamic = "force-dynamic";

/** /sitemaps/{pages|services|areas|artists|blogs}.xml, generated from the Page model (indexable + inSitemap, real lastmod). */
export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const id = file.endsWith(".xml") ? file.slice(0, -4) : "";
  const types = SITEMAPS[id];
  if (!types) return new Response("Not found", { status: 404 });
  const pages = await prisma.page.findMany({ where: { type: { in: types }, isIndexable: true, inSitemap: true }, orderBy: { url: "asc" } });
  const urls = pages.map((p) => `<url><loc>${xmlEscape(SITE_URL + p.url)}</loc><lastmod>${p.lastmod.toISOString()}</lastmod></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: XML_HEADERS });
}
