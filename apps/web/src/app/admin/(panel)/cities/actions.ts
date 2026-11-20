"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveArea, setCityActive } from "@herrglow/core";
import { log, requireAdmin } from "@/lib/admin";

/** Owner-only launch switch. Pages for a newly active city appear only after they pass thresholds + the content gate. */
export async function toggleCity(fd: FormData) {
  const me = await requireAdmin("cities.toggle");
  const slug = String(fd.get("slug")), active = fd.get("active") === "1";
  const res = await setCityActive(slug, active);
  await log(me, active ? "city.activate" : "city.deactivate", "City", slug, { pages: res.upserted, removed: res.removed });
  revalidatePath("/", "layout");
  redirect(`/admin/cities?ok=${encodeURIComponent(`${slug} ${active ? "activated" : "deactivated"}. ${res.removed} page(s) removed, ${res.upserted} checked.`)}`);
}

export async function saveAreaAction(fd: FormData) {
  const me = await requireAdmin("cities");
  const id = String(fd.get("id"));
  const s = (k: string) => String(fd.get(k) ?? "");
  await saveArea(id, {
    name: s("name"), status: s("status") === "INACTIVE" ? "INACTIVE" : "ACTIVE", sector: s("sector"), zone: s("zone"), landmarks: s("landmarks"),
    content: s("content"), faqs: s("faqs"), seoTitle: s("seoTitle"), seoDescription: s("seoDescription"), showOnHome: fd.get("showOnHome") === "on",
  });
  await log(me, "area.save", "Area", id);
  revalidatePath("/", "layout");
  redirect(`/admin/areas/${id}?ok=Saved`);
}
