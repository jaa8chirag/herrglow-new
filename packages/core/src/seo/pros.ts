/**
 * Artist-page quality gate: placeholders are thin pages, so an artist needs a REAL photo and ≥ 50 words of bio to be indexable.
 * "Real photo" = an absolute URL, or a stored media key that exists in the Media library (uploaded via admin) while
 * media delivery is configured. A legacy path that points at a file nobody uploaded does NOT count.
 */
export const MIN_PRO_BIO_WORDS = 50;

const wordCount = (html: string | null | undefined) => (html ? html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length : 0);

/** Media delivery is "configured" once the public base URL (R2 domain, or /media in dev) is set. */
export const mediaConfigured = () => !!(process.env.MEDIA_BASE ?? process.env.NEXT_PUBLIC_MEDIA_BASE ?? "").trim();

export const hasRealPhoto = (photo: string | null | undefined, mediaKeys?: ReadonlySet<string>) =>
  !!photo && (/^https?:\/\//.test(photo) || (mediaConfigured() && !!mediaKeys?.has(photo)));

export const proBioWords = wordCount;

export const proIsIndexable = (p: { photo?: string | null; bio?: string | null }, mediaKeys?: ReadonlySet<string>) =>
  hasRealPhoto(p.photo, mediaKeys) && wordCount(p.bio) >= MIN_PRO_BIO_WORDS;

/** Human-readable reason an artist page is noindex (used by the admin). */
export const proNoindexReason = (p: { photo?: string | null; bio?: string | null }, mediaKeys?: ReadonlySet<string>): string | null => {
  const reasons: string[] = [];
  if (!hasRealPhoto(p.photo, mediaKeys)) reasons.push(p.photo ? "photo file not uploaded" : "no photo");
  const w = wordCount(p.bio);
  if (w < MIN_PRO_BIO_WORDS) reasons.push(`bio ${w}/${MIN_PRO_BIO_WORDS} words`);
  return reasons.length ? reasons.join("; ") : null;
};
