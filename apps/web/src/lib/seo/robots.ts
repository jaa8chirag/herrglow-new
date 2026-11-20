import type { MetadataRoute } from "next";
import { CANONICAL_HOST, DISALLOWED_PATHS, SITE_URL, indexingAllowed } from "../site";

/** Pure so it can be unit-tested. `host` = request Host header. */
export function buildRobots(host: string | null, allowed = indexingAllowed()): MetadataRoute.Robots {
  const isCanonical = !!host && host.toLowerCase() === CANONICAL_HOST;
  if (!allowed || !isCanonical) {
    // staging / preview / non-canonical host: block everything
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: DISALLOWED_PATHS }],
    sitemap: `${SITE_URL}/sitemap-index.xml`,
    host: SITE_URL,
  };
}
