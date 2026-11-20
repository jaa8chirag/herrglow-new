"use server";

import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteMedia } from "@herrglow/core";
import { log, requireAdmin } from "@/lib/admin";

export async function deleteMediaAction(fd: FormData) {
  const me = await requireAdmin("media");
  const id = String(fd.get("id"));
  try {
    await deleteMedia(id, path.join(process.cwd(), "public", "media"));
  } catch (e) {
    redirect(`/admin/media?err=${encodeURIComponent((e as Error).message)}`);
  }
  await log(me, "media.delete", "Media", id);
  revalidatePath("/admin/media");
}
