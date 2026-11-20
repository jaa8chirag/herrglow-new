import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceAdmin } from "@herrglow/core";
import { PageHeader, Panel } from "@/components/admin/layout";
import { Field, Pill, SubmitButton, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { saveAddonsAction, saveServiceAction, saveVariantsAction } from "../actions";

const n = (v: unknown) => (v == null ? "" : String(Number(v)));

export default async function ServiceEdit(props: PageProps<"/admin/services/[id]">) {
  await requireAdmin("catalog");
  const { id } = await props.params;
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const data = await getServiceAdmin(id);
  if (!data) notFound();
  const { svc, categories } = data;
  const vRows = [...svc.variants, ...Array.from({ length: Math.max(2, 6 - svc.variants.length) }, () => null)];
  const aRows = [...svc.addons, ...Array.from({ length: Math.max(2, 4 - svc.addons.length) }, () => null)];
  return (
    <>
      <PageHeader title={svc.title} subtitle={<><Link className="underline" href="/admin/services">← Services</Link> · <Pill tone={svc.status === "ACTIVE" ? "good" : "neutral"}>{svc.status.toLowerCase()}</Pill></>}
        actions={<><Link className="rounded-lg border border-line bg-white px-4 py-2 text-sm hover:bg-blush-100" href={`/admin/review/service/${svc.id}`}>Edit description, FAQs &amp; SEO</Link><a target="_blank" className="rounded-lg border border-line bg-white px-4 py-2 text-sm hover:bg-blush-100" href={`/services/${svc.slug}`}>View live</a></>} />
      {one(sp.ok) && <p className="mb-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">{one(sp.ok)}</p>}
      {one(sp.err) && <p className="mb-4 rounded-lg bg-rose-100 p-3 text-sm text-rose-700">{one(sp.err)}</p>}
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Details">
          <form action={saveServiceAction} className="grid gap-4">
            <input type="hidden" name="id" value={svc.id} />
            <Field label="Title"><input name="title" defaultValue={svc.title} required className={inputCls} /></Field>
            <Field label="URL slug" hint="changing it creates a 301 from the old URL"><input name="slug" defaultValue={svc.slug} required className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category"><select name="categoryId" defaultValue={svc.categoryId} className={inputCls}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
              <Field label="Status"><select name="status" defaultValue={svc.status} className={inputCls}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></Field>
            </div>
            <Field label="Provider type"><select name="providerType" defaultValue={svc.providerType} className={inputCls}><option value="BOTH">Both</option><option value="BEAUTICIAN">Beautician</option><option value="MAKEOVER_ARTIST">Makeover artist</option></select></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="List price (₹)"><input name="price" inputMode="decimal" defaultValue={n(svc.price)} className={inputCls} /></Field>
              <Field label="Offer price (₹)"><input name="offerPrice" inputMode="decimal" defaultValue={n(svc.offerPrice)} className={inputCls} /></Field>
              <Field label="Price label"><input name="priceLabel" defaultValue={svc.priceLabel ?? ""} placeholder="Starting at" className={inputCls} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Duration"><input name="duration" defaultValue={svc.duration ?? ""} className={inputCls} /></Field>
              <Field label="Sort order"><input name="sort" inputMode="numeric" defaultValue={svc.sort} className={inputCls} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={svc.featured} className="accent-[var(--color-plum-700)]" /> Featured</label>
            <SubmitButton>Save details</SubmitButton>
          </form>
        </Panel>
        <div className="grid content-start gap-6">
          <Panel title="Options & prices (variants)">
            <form action={saveVariantsAction} className="grid gap-3">
              <input type="hidden" name="id" value={svc.id} />
              <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-2 text-xs font-semibold text-ink-soft"><span>Name</span><span>Price</span><span>Offer</span><span>Duration</span></div>
              {vRows.map((v, i) => (
                <div key={i} className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-2">
                  <input name="vName" defaultValue={v?.name ?? ""} placeholder="e.g. HD" className={inputCls} />
                  <input name="vPrice" inputMode="decimal" defaultValue={n(v?.price)} className={inputCls} />
                  <input name="vOffer" inputMode="decimal" defaultValue={n(v?.offerPrice)} className={inputCls} />
                  <input name="vDuration" defaultValue={v?.duration ?? ""} className={inputCls} />
                </div>
              ))}
              <p className="text-xs text-ink-soft">Leave a name blank to remove that row. Empty rows are ignored.</p>
              <SubmitButton>Save options</SubmitButton>
            </form>
          </Panel>
          <Panel title="Add-ons (booking form extras)">
            <form action={saveAddonsAction} className="grid gap-3">
              <input type="hidden" name="id" value={svc.id} />
              {aRows.map((a, i) => (
                <div key={i} className="grid grid-cols-[2fr_1fr] gap-2"><input name="aName" defaultValue={a?.name ?? ""} placeholder="Add-on name" className={inputCls} /><input name="aPrice" inputMode="decimal" defaultValue={n(a?.price)} placeholder="₹" className={inputCls} /></div>
              ))}
              <SubmitButton variant="ghost">Save add-ons</SubmitButton>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
