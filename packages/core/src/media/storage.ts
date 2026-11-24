import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Media storage. Production: Cloudflare R2 (S3 API). Development fallback: local disk under apps/web/public/media,
 * served at /media (set NEXT_PUBLIC_MEDIA_BASE=/media).
 */
export const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "application/pdf": "pdf",
};
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const env = () => ({
  acct: process.env.R2_ACCOUNT_ID,
  id: process.env.R2_ACCESS_KEY_ID,
  secret: process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_BUCKET,
});
export const r2Configured = () => {
  const e = env();
  return !!(e.acct && e.id && e.secret && e.bucket);
};

let client: S3Client | null = null;
const s3 = () =>
  (client ??= new S3Client({
    region: "auto",
    endpoint: `https://${env().acct}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env().id!, secretAccessKey: env().secret! },
  }));

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "image";

/** uploads/2026/11/abc123-name.webp  (random prefix → unguessable, cache-safe, no overwrites) */
export function newMediaKey(filename: string, mime: string, folder = "uploads") {
  const d = new Date();
  const rand = Math.random().toString(36).slice(2, 10);
  return `${folder}/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${rand}-${slug(filename)}.${ALLOWED_MIME[mime]}`;
}

export async function putObject(key: string, body: Buffer, mime: string, localRoot: string) {
  if (r2Configured()) {
    await s3().send(
      new PutObjectCommand({
        Bucket: env().bucket!,
        Key: key,
        Body: body,
        ContentType: mime,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    return "r2" as const;
  }
  const file = path.join(localRoot, key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
  return "local" as const;
}

export async function removeObject(key: string, localRoot: string) {
  if (r2Configured()) await s3().send(new DeleteObjectCommand({ Bucket: env().bucket!, Key: key }));
  else await unlink(path.join(localRoot, key)).catch(() => undefined);
}

/** Cheap magic-byte check so a renamed .exe can't be uploaded as an image. */
export function sniffMime(b: Buffer): string | null {
  if (b.length < 4) return null;
  if (b.subarray(0, 4).toString() === "%PDF") return "application/pdf";
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "image/png";
  if (b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP")
    return "image/webp";
  if (b.subarray(4, 8).toString() === "ftyp" && /avif|avis/.test(b.subarray(8, 16).toString()))
    return "image/avif";
  return null;
}
