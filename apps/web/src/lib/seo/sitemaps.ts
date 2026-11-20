import type { PageType } from "@herrglow/db";

/** Split sitemap groups → Page.type values. */
export const SITEMAPS: Record<string, PageType[]> = {
  pages: ["HOME", "STATIC", "CATEGORY"],
  services: ["SERVICE"],
  locations: ["CITY", "AREA", "SERVICE_CITY"],
  artists: ["PRO"],
  blogs: ["BLOG"],
};
