import type { MetadataRoute } from "next";
import { prisma } from "@herrglow/db";
import { SITE_URL } from "@/lib/site";
import { SITEMAPS } from "@/lib/seo/sitemaps";

export const revalidate = 3600;

export async function generateSitemaps() {
  return Object.keys(SITEMAPS).map((id) => ({ id }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  const types = SITEMAPS[id];
  if (!types) return [];
  const pages = await prisma.page.findMany({ where: { type: { in: types }, isIndexable: true, inSitemap: true }, orderBy: { url: "asc" } });
  return pages.map((p) => ({ url: SITE_URL + p.url, lastModified: p.lastmod }));
}
