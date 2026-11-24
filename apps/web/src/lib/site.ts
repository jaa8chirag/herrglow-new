/** Site-wide constants. No DB access here: this file is imported by tests and by the proxy. */
export const SITE_URL = (
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://herrglow.com"
).replace(/\/$/, "");
export const CANONICAL_HOST = new URL(SITE_URL).host;
export const SITE_NAME = "HerrGlow";
/** Indexing is OFF unless explicitly enabled for the production deployment (staging/preview stay noindex). */
export const indexingAllowed = () => process.env.ALLOW_INDEXING === "true";
export const abs = (path: string) => SITE_URL + path;

/** Paths that must never be crawled/indexed. */
export const DISALLOWED_PATHS = ["/admin", "/api", "/search", "/thank-you", "/design"];
