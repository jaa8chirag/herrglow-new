import { prisma } from "@herrglow/db";
import {
  ALLOWED_MIME,
  MAX_UPLOAD_BYTES,
  newMediaKey,
  putObject,
  removeObject,
  sniffMime,
} from "../media/storage";

export type UploadResult = { ok: true; id: string; key: string } | { ok: false; error: string };

/** Validates and stores an image, then records it in the media library. Alt text is REQUIRED. */
export async function uploadMedia(i: {
  filename: string;
  body: Buffer;
  alt: string;
  folder?: string;
  uploadedBy?: string;
  localRoot: string;
}): Promise<UploadResult> {
  const alt = i.alt.trim();
  if (alt.length < 5)
    return {
      ok: false,
      error: "Alt text is required (at least 5 characters). Describe the image.",
    };
  if (i.body.length > MAX_UPLOAD_BYTES) return { ok: false, error: "File is larger than 8 MB." };
  const mime = sniffMime(i.body);
  if (!mime || !ALLOWED_MIME[mime])
    return { ok: false, error: "Only JPEG, PNG, WebP or AVIF images are allowed." };
  const key = newMediaKey(i.filename, mime, i.folder ?? "uploads");
  await putObject(key, i.body, mime, i.localRoot);
  const row = await prisma.media.create({
    data: { key, alt, mime, size: i.body.length, uploadedBy: i.uploadedBy },
  });
  return { ok: true, id: row.id, key };
}

export const listMedia = (take = 60) =>
  prisma.media.findMany({ orderBy: { createdAt: "desc" }, take });

export async function deleteMedia(id: string, localRoot: string) {
  const m = await prisma.media.findUnique({ where: { id } });
  if (!m) return;
  const inUse = await prisma.pro.count({
    where: {
      OR: [{ photo: m.key }, { portfolio: { path: [], array_contains: [{ path: m.key }] } }],
    },
  });
  if (inUse) throw new Error("This image is used by an artist profile. Remove it there first.");
  await removeObject(m.key, localRoot);
  await prisma.media.delete({ where: { id } });
}

export const mediaKeySet = async () =>
  new Set((await prisma.media.findMany({ select: { key: true } })).map((m) => m.key));
