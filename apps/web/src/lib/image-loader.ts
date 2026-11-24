/**
 * next/image custom loader → Cloudflare Image Resizing (WebP/AVIF via format=auto).
 * Enable in production with NEXT_PUBLIC_CF_RESIZING=true (zone must have Image Resizing on).
 * Without it (local dev) the source is returned unchanged, with a width hint so next/image stays happy.
 */
export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (process.env.NEXT_PUBLIC_CF_RESIZING === "true") {
    const opts = `width=${width},quality=${quality ?? 75},format=auto,fit=cover`;
    return `/cdn-cgi/image/${opts}/${src.startsWith("http") ? src : src.replace(/^\//, "")}`;
  }
  return src.includes("?") ? `${src}&w=${width}` : `${src}?w=${width}`;
}
