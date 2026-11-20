"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteRedirect, saveRedirect } from "@herrglow/core";
import { log, requireAdmin } from "@/lib/admin";

export async function addRedirect(fd: FormData) {
  const me = await requireAdmin("redirects");
  const code = fd.get("code") === "GONE_410" ? "GONE_410" : "MOVED_301";
  const res = await saveRedirect({ fromPath: String(fd.get("fromPath") ?? ""), toPath: String(fd.get("toPath") ?? ""), code, note: String(fd.get("note") ?? "") });
  if (!res.ok) redirect(`/admin/redirects?err=${encodeURIComponent(res.error)}`);
  await log(me, "redirect.save", "Redirect", String(fd.get("fromPath")), { code });
  revalidatePath("/admin/redirects");
  redirect(`/admin/redirects?ok=${encodeURIComponent(res.warning ?? "Redirect saved. It takes effect within a minute.")}`);
}

export async function removeRedirect(fd: FormData) {
  const me = await requireAdmin("redirects");
  const from = String(fd.get("fromPath"));
  await deleteRedirect(from);
  await log(me, "redirect.delete", "Redirect", from);
  revalidatePath("/admin/redirects");
}
