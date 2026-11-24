"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveBlog } from "@herrglow/core";
import { log, requireAdmin } from "@/lib/admin";

export async function saveBlogAction(fd: FormData) {
  const me = await requireAdmin("blogs");
  const s = (k: string) => String(fd.get(k) ?? "");
  const id = s("id") && s("id") !== "new" ? s("id") : undefined;
  const res = await saveBlog({
    id,
    title: s("title"),
    slug: s("slug"),
    excerpt: s("excerpt"),
    content: s("content"),
    status: s("status") === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    authorName: s("authorName"),
    seoTitle: s("seoTitle"),
    seoDescription: s("seoDescription"),
    image: s("image"),
    imageAlt: s("imageAlt"),
  });
  if (!res.ok) redirect(`/admin/blogs/${id ?? "new"}?err=${encodeURIComponent(res.error)}`);
  await log(me, id ? "blog.update" : "blog.create", "Blog", res.id);
  revalidatePath("/", "layout");
  redirect(
    `/admin/blogs/${res.id}?ok=${encodeURIComponent(res.links < 3 ? `Saved. Only ${res.links} internal link(s): aim for at least 3.` : "Saved.")}`
  );
}
