import type { Metadata } from "next";
import { SITE_NAME, abs, indexingAllowed } from "../site";

export interface SeoInput {
  title: string;
  description: string;
  /** canonical path, e.g. "/services/hd-bridal-makeup" (no query string) */
  path: string;
  image?: string | null;
  /** page-level gate (Page.isIndexable). Combined with the global production switch. */
  indexable?: boolean;
  type?: "website" | "article" | "profile";
  publishedTime?: Date;
  modifiedTime?: Date;
}

const TITLE_MAX = 60;
const DESC_MAX = 155;

const cut = (s: string, max: number) => {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const sliced = t.slice(0, max + 1);
  const at = sliced.lastIndexOf(" ");
  return (at > max * 0.6 ? sliced.slice(0, at) : t.slice(0, max)).replace(/[\s,.;:–-]+$/, "");
};

/** "Title | HerrGlow" when it fits in 60 chars, otherwise the bare title. */
export const fitTitle = (title: string) => {
  // legacy/admin titles may already carry the brand: never append it twice
  if (title.toLowerCase().includes(SITE_NAME.toLowerCase())) return cut(title, TITLE_MAX);
  const full = `${title.trim()} | ${SITE_NAME}`;
  return full.length <= TITLE_MAX ? full : cut(title, TITLE_MAX);
};
export const fitDescription = (d: string) => cut(d, DESC_MAX);

export const robotsMeta = (indexable = true): NonNullable<Metadata["robots"]> => {
  const index = indexable && indexingAllowed();
  return {
    index,
    follow: true,
    googleBot: { index, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  };
};

export function buildMetadata(i: SeoInput): Metadata {
  const title = fitTitle(i.title);
  const description = fitDescription(i.description);
  const url = abs(i.path);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: robotsMeta(i.indexable ?? true),
    openGraph: {
      type: i.type === "article" ? "article" : i.type === "profile" ? "profile" : "website",
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: "en_IN",
      ...(i.image
        ? { images: [{ url: i.image.startsWith("http") ? i.image : abs(i.image) }] }
        : {}),
      ...(i.type === "article"
        ? {
            publishedTime: i.publishedTime?.toISOString(),
            modifiedTime: i.modifiedTime?.toISOString(),
          }
        : {}),
    },
    twitter: { card: i.image ? "summary_large_image" : "summary", title, description },
  };
}
