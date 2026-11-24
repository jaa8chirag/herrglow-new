"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveReviewItem, unpublishServiceCity, type ReviewKind } from "@herrglow/core";
import { log, requireAdmin } from "@/lib/admin";

const KINDS: ReviewKind[] = ["service-city", "service", "blog"];

export async function saveReview(fd: FormData) {
  const me = await requireAdmin("drafts");
  const kind = String(fd.get("kind")) as ReviewKind;
  const id = String(fd.get("id"));
  if (!KINDS.includes(kind)) throw new Error("Bad kind");
  const publish = fd.get("intent") === "publish";
  const fields = Object.fromEntries(
    [...fd.entries()].filter(([, v]) => typeof v === "string")
  ) as Record<string, string>;
  const res = await saveReviewItem(kind, id, fields, publish);
  await log(me, publish ? "review.publish" : "review.save", kind, id);
  revalidatePath("/", "layout"); // purge public pages so changes show immediately
  const back = `/admin/review/${kind}/${encodeURIComponent(id)}`;
  redirect(
    `${back}?${res.ok ? "ok=" + encodeURIComponent(res.message) : "err=" + encodeURIComponent(res.error)}`
  );
}

export async function unpublish(fd: FormData) {
  const me = await requireAdmin("drafts");
  const id = String(fd.get("id"));
  await unpublishServiceCity(id);
  await log(me, "review.unpublish", "service-city", id);
  revalidatePath("/", "layout");
  redirect(`/admin/review/service-city/${encodeURIComponent(id)}?ok=Moved%20back%20to%20draft`);
}
