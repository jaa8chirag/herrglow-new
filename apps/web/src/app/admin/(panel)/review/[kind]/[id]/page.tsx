import Link from "next/link";
import { notFound } from "next/navigation";
import {
  THIN_BLOG_WORDS,
  THIN_SERVICE_WORDS,
  getReviewItem,
  type ReviewKind,
} from "@herrglow/core";
import { PageHeader, Panel } from "@/components/admin/layout";
import { RichField } from "@/components/admin/RichField";
import { Field, Pill, SubmitButton, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { saveReview, unpublish } from "../../actions";

export default async function ReviewEdit(props: PageProps<"/admin/review/[kind]/[id]">) {
  await requireAdmin("drafts");
  const { kind, id: rawId } = await props.params;
  const sp = await props.searchParams;
  const id = decodeURIComponent(rawId);
  if (!["service-city", "service", "blog"].includes(kind)) notFound();
  const item = await getReviewItem(kind as ReviewKind, id);
  if (!item) notFound();
  const f = item.fields as unknown as Record<string, string>;
  const published = item.status === "PUBLISHED";
  const msg = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));

  return (
    <>
      <PageHeader
        title={item.title}
        subtitle={
          <>
            <Link className="underline" href="/admin/review">
              ← Review queue
            </Link>{" "}
            · <Pill tone={published ? "good" : "warn"}>{String(item.status).toLowerCase()}</Pill>
          </>
        }
        actions={
          published || kind !== "service-city" ? (
            <a
              href={item.publicPath}
              target="_blank"
              className="rounded-lg border border-line bg-white px-4 py-2 text-sm hover:bg-blush-100"
            >
              View live page
            </a>
          ) : undefined
        }
      />
      {msg("ok") && (
        <p className="mb-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">{msg("ok")}</p>
      )}
      {msg("err") && (
        <p className="mb-4 rounded-lg bg-rose-100 p-3 text-sm text-rose-700">{msg("err")}</p>
      )}
      <form action={saveReview} className="grid gap-5">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        <Panel>
          <div className="grid gap-5">
            {kind === "service-city" && (
              <>
                <RichField
                  name="localContent"
                  label="Page content (HTML)"
                  defaultValue={f.localContent!}
                  target={60}
                />
                <Field label="FAQs" hint="one per line: Question || Answer">
                  <textarea name="faqs" rows={7} defaultValue={f.faqs} className={inputCls} />
                </Field>
              </>
            )}
            {kind === "service" && (
              <>
                <RichField
                  name="description"
                  label="Description (HTML)"
                  defaultValue={f.description!}
                  target={THIN_SERVICE_WORDS}
                />
                <Field label="Short description">
                  <textarea
                    name="shortDescription"
                    rows={2}
                    defaultValue={f.shortDescription}
                    className={inputCls}
                  />
                </Field>
                <Field label="What is included" hint="one per line">
                  <textarea
                    name="features"
                    rows={4}
                    defaultValue={f.features}
                    className={inputCls}
                  />
                </Field>
                <Field label="SEO title" hint="≤ 60 characters">
                  <input name="seoTitle" defaultValue={f.seoTitle} className={inputCls} />
                </Field>
                <Field label="SEO description" hint="≤ 155 characters">
                  <textarea
                    name="seoDescription"
                    rows={2}
                    defaultValue={f.seoDescription}
                    className={inputCls}
                  />
                </Field>
                <Field label="FAQs" hint="one per line: Question || Answer">
                  <textarea name="faqs" rows={6} defaultValue={f.faqs} className={inputCls} />
                </Field>
              </>
            )}
            {kind === "blog" && (
              <>
                <RichField
                  name="content"
                  label="Content (HTML)"
                  defaultValue={f.content!}
                  target={THIN_BLOG_WORDS}
                  rows={20}
                />
                <Field label="Excerpt">
                  <textarea name="excerpt" rows={2} defaultValue={f.excerpt} className={inputCls} />
                </Field>
                <Field label="SEO title" hint="≤ 60 characters">
                  <input name="seoTitle" defaultValue={f.seoTitle} className={inputCls} />
                </Field>
                <Field label="SEO description" hint="≤ 155 characters">
                  <textarea
                    name="seoDescription"
                    rows={2}
                    defaultValue={f.seoDescription}
                    className={inputCls}
                  />
                </Field>
              </>
            )}
          </div>
        </Panel>
        <div className="flex flex-wrap gap-3">
          <button
            name="intent"
            value="save"
            className="inline-flex min-h-10 items-center rounded-lg border border-line bg-white px-4 text-sm font-medium text-plum-800 hover:bg-blush-100"
          >
            Save {kind === "service-city" ? "draft" : "& re-check"}
          </button>
          {kind === "service-city" && !published && (
            <button
              name="intent"
              value="publish"
              className="inline-flex min-h-10 items-center rounded-lg bg-plum-700 px-4 text-sm font-medium text-ivory hover:bg-plum-800"
            >
              Save &amp; publish
            </button>
          )}
        </div>
      </form>
      {kind === "service-city" && published && (
        <form action={unpublish} className="mt-4">
          <input type="hidden" name="id" value={id} />
          <SubmitButton variant="ghost">Move back to draft</SubmitButton>
        </form>
      )}
    </>
  );
}
