/**
 * Maps stored media paths (e.g. legacy "beauticians/abc.jpg") to a public URL on Cloudflare R2
 * (NEXT_PUBLIC_MEDIA_BASE). Until media is uploaded the base is empty and this returns null,
 * which the UI renders as an elegant placeholder instead of a broken image.
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path) || path.startsWith("/")) return path;
  const base = (process.env.MEDIA_BASE ?? process.env.NEXT_PUBLIC_MEDIA_BASE ?? "").replace(/\/$/, "");
  return base ? `${base}/${path.replace(/^\//, "")}` : null;
}

/** URL for a stored media key, but ONLY if the file really exists in the media library (or is an absolute URL or local public path). */
export function realImage(keys: ReadonlySet<string>, path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path) || path.startsWith("/")) return path;
  return keys.has(path) ? mediaUrl(path) : null;
}
