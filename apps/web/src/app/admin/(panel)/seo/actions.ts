"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setManualNoindex, syncPages } from "@herrglow/core";
import { log, requireAdmin } from "@/lib/admin";

export async function toggleNoindex(fd: FormData) {
  const me = await requireAdmin("seo");
  const url = String(fd.get("url")),
    on = fd.get("on") === "1";
  await setManualNoindex(url, on);
  await log(me, on ? "seo.noindex" : "seo.reindex", "Page", url);
  revalidatePath("/", "layout");
  revalidatePath("/admin/seo");
}

export async function syncNow() {
  const me = await requireAdmin("seo");
  const r = await syncPages();
  await log(me, "seo.sync", "Page", undefined, r);
  revalidatePath("/", "layout");
  redirect(
    `/admin/seo?ok=${encodeURIComponent(`Synced: ${r.upserted} pages checked, ${r.removed} removed.`)}`
  );
}
