/**
 * Maps stored media paths (e.g. legacy "beauticians/abc.jpg", "services/x.jpg") to a public URL.
 * Public base = Cloudflare R2 public bucket / custom domain (NEXT_PUBLIC_MEDIA_BASE).
 * Until files are uploaded to R2 the base is empty and images resolve to /media/... (404), which UI treats as "no image".
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_MEDIA_BASE ?? "").replace(/\/$/, "");
  return `${base || "/media"}/${path.replace(/^\//, "")}`;
}
