import type { PageType } from "@herrglow/db";

/** Child sitemap id → Page.type values. Served at /sitemaps/{id}.xml; the index is /sitemap.xml. */
export const SITEMAPS: Record<string, PageType[]> = {
  pages: ["HOME", "STATIC", "CATEGORY"],
  services: ["SERVICE"],
  areas: ["CITY", "AREA", "SERVICE_CITY"],
  artists: ["PRO"],
  blogs: ["BLOG"],
};

export const xmlEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const XML_HEADERS = { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" };
