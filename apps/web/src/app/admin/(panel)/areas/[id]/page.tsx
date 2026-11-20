import Link from "next/link";
import { notFound } from "next/navigation";
import { getAreaAdmin } from "@herrglow/core";
import { PageHeader, Panel } from "@/components/admin/layout";
import { RichField } from "@/components/admin/RichField";
import { Field, SubmitButton, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { saveAreaAction } from "../../cities/actions";

export default async function AreaEdit(props: PageProps<"/admin/areas/[id]">) {
  await requireAdmin("cities");
  const { id } = await props.params;
  const sp = await props.searchParams;
  const a = await getAreaAdmin(id);
  if (!a) notFound();
  const ok = Array.isArray(sp.ok) ? sp.ok[0] : sp.ok;
  return (
    <>
      <PageHeader title={a.name} subtitle={<><Link className="underline" href={`/admin/cities/${a.city.slug}`}>← {a.city.name}</Link> · URL /makeup-artist-in-{a.slug} (fixed, so links and old URLs never break)</>} />
      {ok && <p className="mb-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">{ok}</p>}
      <form action={saveAreaAction} className="grid max-w-4xl gap-5">
        <input type="hidden" name="id" value={a.id} />
        <Panel>
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Name"><input name="name" defaultValue={a.name} required className={inputCls} /></Field>
              <Field label="Sector"><input name="sector" defaultValue={a.sector ?? ""} className={inputCls} /></Field>
              <Field label="Zone"><input name="zone" defaultValue={a.zone ?? ""} className={inputCls} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status"><select name="status" defaultValue={a.status} className={inputCls}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></Field>
              <label className="mt-6 flex items-center gap-2 text-sm"><input type="checkbox" name="showOnHome" defaultChecked={a.showOnHome} className="accent-[var(--color-plum-700)]" /> Show on home</label>
            </div>
            <Field label="Nearby landmarks" hint="comma or one per line (needs at least 1 for an area page)"><textarea name="landmarks" rows={3} defaultValue={a.landmarks.join(", ")} className={inputCls} /></Field>
            <RichField name="content" label="Area content (HTML)" defaultValue={a.content ?? ""} rows={10} />
            <Field label="FAQs" hint="one per line: Question || Answer"><textarea name="faqs" rows={5} defaultValue={a.faqsText} className={inputCls} /></Field>
            <Field label="SEO title"><input name="seoTitle" defaultValue={a.seoTitle ?? ""} className={inputCls} /></Field>
            <Field label="SEO description"><textarea name="seoDescription" rows={2} defaultValue={a.seoDescription ?? ""} className={inputCls} /></Field>
          </div>
        </Panel>
        <div><SubmitButton>Save area</SubmitButton></div>
      </form>
    </>
  );
}
