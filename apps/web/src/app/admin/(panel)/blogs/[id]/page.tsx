import Link from "next/link";
import { notFound } from "next/navigation";
import { THIN_BLOG_WORDS, getBlogAdmin, listMedia, suggestBlogLinks } from "@herrglow/core";
import { PageHeader, Panel } from "@/components/admin/layout";
import { RichField } from "@/components/admin/RichField";
import { Field, SubmitButton, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { saveBlogAction } from "../actions";

export default async function BlogEdit(props: PageProps<"/admin/blogs/[id]">) {
  await requireAdmin("blogs");
  const { id } = await props.params;
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const isNew = id === "new";
  const blog = isNew ? null : await getBlogAdmin(id);
  if (!isNew && !blog) notFound();
  const [media, links] = await Promise.all([listMedia(80), suggestBlogLinks(blog?.content ?? "")]);
  return (
    <>
      <PageHeader title={isNew ? "New post" : blog!.title} subtitle={<Link className="underline" href="/admin/blogs">← Blogs</Link>} actions={!isNew && <a target="_blank" className="rounded-lg border border-line bg-white px-4 py-2 text-sm hover:bg-blush-100" href={`/blog/${blog!.slug}`}>View live</a>} />
      {one(sp.ok) && <p className="mb-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">{one(sp.ok)}</p>}
      {one(sp.err) && <p className="mb-4 rounded-lg bg-rose-100 p-3 text-sm text-rose-700">{one(sp.err)}</p>}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <form action={saveBlogAction} className="grid gap-5">
          <input type="hidden" name="id" value={isNew ? "new" : id} />
          <Panel>
            <div className="grid gap-4">
              <Field label="Title"><input name="title" required defaultValue={blog?.title ?? ""} className={inputCls} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="URL slug" hint="blank = from title; changing it creates a 301"><input name="slug" defaultValue={blog?.slug ?? ""} className={inputCls} /></Field>
                <Field label="Status"><select name="status" defaultValue={blog?.status ?? "ACTIVE"} className={inputCls}><option value="ACTIVE">Published</option><option value="INACTIVE">Hidden</option></select></Field>
              </div>
              <Field label="Excerpt"><textarea name="excerpt" rows={2} defaultValue={blog?.excerpt ?? ""} className={inputCls} /></Field>
              <RichField name="content" label="Content (HTML)" defaultValue={blog?.content ?? ""} target={THIN_BLOG_WORDS} rows={22} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Cover image" hint="from the media library"><select name="image" defaultValue={blog?.image ?? ""} className={inputCls}><option value="">None</option>{media.map((m) => <option key={m.id} value={m.key}>{m.alt.slice(0, 50)} ({m.key.split("/").pop()})</option>)}</select></Field>
                <Field label="Cover alt text"><input name="imageAlt" defaultValue={blog?.imageAlt ?? ""} className={inputCls} /></Field>
              </div>
              <Field label="Author"><input name="authorName" defaultValue={blog?.authorName ?? ""} className={inputCls} /></Field>
              <Field label="SEO title" hint="≤ 60 characters"><input name="seoTitle" defaultValue={blog?.seoTitle ?? ""} className={inputCls} /></Field>
              <Field label="SEO description" hint="≤ 155 characters"><textarea name="seoDescription" rows={2} defaultValue={blog?.seoDescription ?? ""} className={inputCls} /></Field>
            </div>
          </Panel>
          <div><SubmitButton>{isNew ? "Create post" : "Save post"}</SubmitButton></div>
        </form>
        <aside className="grid content-start gap-4">
          <Panel title="Internal links">
            <p className="mb-3 text-sm text-ink-soft">{links.existing} internal link(s) in the saved text. Aim for at least 3 contextual links to services and cities.</p>
            {links.suggestions.length === 0 ? <p className="text-sm text-ink-soft">No suggestions. Save the text first, or mention service names in it.</p> : (
              <ul className="space-y-2 text-sm">{links.suggestions.map((s) => <li key={s.href}><span className="font-medium text-plum-900">{s.label}</span><br /><code className="select-all rounded bg-ivory-deep px-1.5 py-0.5 text-xs">&lt;a href=&quot;{s.href}&quot;&gt;{s.label}&lt;/a&gt;</code></li>)}</ul>
            )}
          </Panel>
        </aside>
      </div>
    </>
  );
}
