/** Artist-page quality gate: placeholders are thin pages, so an artist needs a REAL photo and ≥ 50 words of bio to be indexable. */
export const MIN_PRO_BIO_WORDS = 50;

const wordCount = (html: string | null | undefined) => (html ? html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length : 0);

/** Media is "configured" once the R2 public base URL is set; before that every stored path is just a placeholder. */
export const mediaConfigured = () => !!(process.env.NEXT_PUBLIC_MEDIA_BASE ?? "").trim();

export const hasRealPhoto = (photo: string | null | undefined) => !!photo && (/^https?:\/\//.test(photo) || mediaConfigured());

export const proBioWords = wordCount;

export const proIsIndexable = (p: { photo?: string | null; bio?: string | null }) => hasRealPhoto(p.photo) && wordCount(p.bio) >= MIN_PRO_BIO_WORDS;

/** Human-readable reason an artist page is noindex (used by the admin SEO manager). */
export const proNoindexReason = (p: { photo?: string | null; bio?: string | null }): string | null => {
  const reasons: string[] = [];
  if (!hasRealPhoto(p.photo)) reasons.push(p.photo ? "photo not available (media not configured)" : "no photo");
  const w = wordCount(p.bio);
  if (w < MIN_PRO_BIO_WORDS) reasons.push(`bio ${w}/${MIN_PRO_BIO_WORDS} words`);
  return reasons.length ? reasons.join("; ") : null;
};
