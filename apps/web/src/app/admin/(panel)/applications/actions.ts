"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { approveApplication, rejectApplication } from "@herrglow/core";
import { log, requireAdmin } from "@/lib/admin";

/** Creates an INACTIVE artist and sends you to their profile to complete it (bio, services, coverage) and activate. */
export async function approveAction(fd: FormData) {
  const me = await requireAdmin("pros");
  const id = String(fd.get("id"));
  const res = await approveApplication(id, me.email);
  if (!res.ok) redirect(`/admin/applications/${id}?err=${encodeURIComponent(res.error)}`);
  await log(me, "application.approve", "ProApplication", id, { proId: res.proId });
  revalidatePath("/admin/applications");
  redirect(`/admin/pros/${res.proId}?ok=${encodeURIComponent("Artist created as inactive. Complete the profile, then set status to Active.")}`);
}

export async function rejectAction(fd: FormData) {
  const me = await requireAdmin("pros");
  const id = String(fd.get("id"));
  await rejectApplication(id, String(fd.get("reason") ?? ""), me.email);
  await log(me, "application.reject", "ProApplication", id);
  revalidatePath("/admin/applications");
  redirect("/admin/applications?ok=Application%20rejected");
}
