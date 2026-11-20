"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SETTING_GROUPS, saveSettings } from "@herrglow/core";
import { log, requireAdmin } from "@/lib/admin";

export async function saveSettingsAction(fd: FormData) {
  const me = await requireAdmin("settings");
  const values: Record<string, string> = {};
  for (const f of SETTING_GROUPS.flatMap((g) => g.fields)) values[f.key] = f.type === "bool" ? (fd.get(f.key) === "on" ? "1" : "0") : String(fd.get(f.key) ?? "");
  const res = await saveSettings(values);
  if (!res.ok) redirect(`/admin/settings?err=${encodeURIComponent(Object.values(res.errors).join(" · "))}`);
  await log(me, "settings.save", "SiteSetting", undefined, { keys: Object.keys(values) });
  revalidatePath("/", "layout");
  redirect("/admin/settings?ok=Settings%20saved");
}
