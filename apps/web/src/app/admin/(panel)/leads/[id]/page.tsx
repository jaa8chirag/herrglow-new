import Link from "next/link";
import { notFound } from "next/navigation";
import { OUT_OF_AREA, PIPELINE, STATUS_LABEL, getLead, leadProOptions } from "@herrglow/core";
import { PageHeader, Panel } from "@/components/admin/layout";
import { Field, Pill, SubmitButton, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { whatsappLink } from "@/lib/whatsapp";
import { saveLead } from "../actions";

export default async function LeadDetail(props: PageProps<"/admin/leads/[id]">) {
  await requireAdmin("leads");
  const { id } = await props.params;
  const [lead, pros] = await Promise.all([getLead(id), leadProOptions()]);
  if (!lead) notFound();
  const wa = whatsappLink(lead.phone, `Hi ${lead.name}, this is HerrGlow regarding your request.`);
  const meta = (lead.meta ?? {}) as { variant?: string; addons?: string[] };
  const n = (v: unknown) => (v == null ? "" : String(Number(v)));
  return (
    <>
      <PageHeader title={`Lead ${lead.bookingRef ?? ""}`} subtitle={<Link className="underline" href="/admin/leads">← All leads</Link>}
        actions={wa ? <a href={wa} className="rounded-lg bg-[#1f8f4e] px-4 py-2 text-sm font-medium text-white">WhatsApp customer</a> : undefined} />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="Request">
          <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <dt className="text-ink-soft">Customer</dt><dd>{lead.name}</dd>
            <dt className="text-ink-soft">Phone</dt><dd>{lead.phone}</dd>
            {lead.email && (<><dt className="text-ink-soft">Email</dt><dd>{lead.email}</dd></>)}
            <dt className="text-ink-soft">Service</dt><dd>{lead.services.map((s) => s.service.title).join(", ") || "General enquiry"}{meta.variant ? ` · ${meta.variant}` : ""}{meta.addons?.length ? ` · add-ons: ${meta.addons.join(", ")}` : ""}</dd>
            <dt className="text-ink-soft">Location</dt><dd>{lead.locationText ?? "—"} {lead.tags.includes(OUT_OF_AREA) && <Pill tone="bad">out of area</Pill>}</dd>
            <dt className="text-ink-soft">Event date</dt><dd>{lead.eventDate?.toLocaleDateString("en-IN") ?? "—"}</dd>
            <dt className="text-ink-soft">Message</dt><dd className="whitespace-pre-wrap">{lead.message ?? "—"}</dd>
            <dt className="text-ink-soft">Source</dt><dd>{lead.source}{lead.sourceUrl ? ` · ${lead.sourceUrl}` : ""}</dd>
            <dt className="text-ink-soft">Received</dt><dd>{lead.createdAt.toLocaleString("en-IN")}</dd>
          </dl>
        </Panel>
        <Panel title="Pipeline">
          <form action={saveLead} className="grid gap-4">
            <input type="hidden" name="id" value={lead.id} />
            <Field label="Status"><select name="status" defaultValue={lead.status} className={inputCls}>{PIPELINE.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></Field>
            <Field label="Assigned artist"><select name="proId" defaultValue={lead.proId ?? ""} className={inputCls}><option value="">Unassigned</option>{pros.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Quote (₹)"><input name="amount" inputMode="decimal" defaultValue={n(lead.amount)} className={inputCls} /></Field>
              <Field label="Discount (₹)"><input name="discount" inputMode="decimal" defaultValue={n(lead.discount)} className={inputCls} /></Field>
              <Field label="Final (₹)"><input name="finalAmount" inputMode="decimal" defaultValue={n(lead.finalAmount)} className={inputCls} /></Field>
            </div>
            <Field label="Internal note"><textarea name="adminNote" rows={4} defaultValue={lead.adminNote ?? ""} className={inputCls} /></Field>
            <SubmitButton>Save</SubmitButton>
          </form>
        </Panel>
      </div>
    </>
  );
}
