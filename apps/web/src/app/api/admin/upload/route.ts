import path from "node:path";
import { auth } from "@/auth";
import { audit, can, uploadMedia } from "@herrglow/core";

export const runtime = "nodejs";

/** Local fallback storage root (served at /media). Production uses R2 (see core/media/storage.ts). */
export const LOCAL_MEDIA_ROOT = path.join(process.cwd(), "public", "media");

/** Authenticated image upload. Alt text is required; type is verified by magic bytes; ≤ 8 MB. */
export async function POST(req: Request) {
  const s = await auth();
  if (!s?.user?.id || !can(s.user.role, "media")) return Response.json({ ok: false, error: "Not allowed" }, { status: 403 });
  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File)) return Response.json({ ok: false, error: "No file" }, { status: 400 });
  const folder = ["uploads", "pros", "blogs", "services"].includes(String(fd.get("folder"))) ? String(fd.get("folder")) : "uploads";
  const res = await uploadMedia({ filename: file.name, body: Buffer.from(await file.arrayBuffer()), alt: String(fd.get("alt") ?? ""), folder, uploadedBy: s.user.email ?? undefined, localRoot: LOCAL_MEDIA_ROOT });
  if (!res.ok) return Response.json(res, { status: 400 });
  await audit({ id: s.user.id, email: s.user.email ?? undefined }, "media.upload", "Media", res.id, { key: res.key });
  return Response.json(res);
}
