/**
 * Maps stored media paths (e.g. legacy "beauticians/abc.jpg") to a public URL on Cloudflare R2
 * (NEXT_PUBLIC_MEDIA_BASE). Until media is uploaded the base is empty and this returns null,
 * which the UI renders as an elegant placeholder instead of a broken image.
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const base = (process.env.MEDIA_BASE ?? process.env.NEXT_PUBLIC_MEDIA_BASE ?? "").replace(/\/$/, "");
  return base ? `${base}/${path.replace(/^\//, "")}` : null;
}
