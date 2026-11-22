import Link from "next/link";
import { notFound } from "next/navigation";
import { OUT_OF_AREA, PIPELINE, STATUS_LABEL, getLead, leadProOptions } from "@herrglow/core";
import { PageHeader, Panel } from "@/components/admin/layout";
import { Field, Pill, SubmitButton, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { whatsappLink, telLink } from "@/lib/whatsapp";
import { MessageCircle, Phone, Calendar, MapPin, Sparkles, UserCheck, IndianRupee } from "lucide-react";
import { saveLead } from "../actions";

export default async function LeadDetail(props: PageProps<"/admin/leads/[id]">) {
  await requireAdmin("leads");
  const { id } = await props.params;
  const [lead, pros] = await Promise.all([getLead(id), leadProOptions()]);
  if (!lead) notFound();

  const wa = whatsappLink(
    lead.phone,
    `Hi ${lead.name}, this is HerrGlow Salon regarding your booking #${lead.bookingRef ?? ""}.`
  );
  const tel = telLink(lead.phone);
  const meta = (lead.meta ?? {}) as { variant?: string; addons?: string[] };
  const n = (v: unknown) => (v == null ? "" : String(Number(v)));

  const leadData = lead as unknown as {
    services?: { service: { title: string; slug: string } }[];
    package?: { title: string; slug: string } | null;
  };
  const serviceOrPackageTitle =
    leadData.package?.title ??
    (leadData.services?.map((s) => s.service.title).join(", ") || "General Enquiry");

  const dispatchMsg = [
    `✨ New HerrGlow Booking Assignment ✨`,
    `Booking ID: #${lead.bookingRef ?? lead.id.slice(0, 8)}`,
    `Service: ${serviceOrPackageTitle}`,
    lead.eventDate ? `Date: ${lead.eventDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}` : null,
    lead.timeSlot ? `Slot: ${lead.timeSlot}` : null,
    `Area: ${lead.address || lead.locationText || "Delhi NCR"}`,
    `Total Amount: ₹${lead.finalAmount ?? lead.amount ?? "As per service"}`,
    `\nPlease confirm acceptance.`,
  ].filter(Boolean).join("\n");
  const dispatchWaUrl = `https://wa.me/?text=${encodeURIComponent(dispatchMsg)}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Booking #${lead.bookingRef ?? lead.id.slice(0, 8)}`}
        subtitle={
          <div className="flex items-center gap-2">
            <Link className="text-rose-700 underline hover:text-rose-800 text-xs font-medium" href="/admin/leads">
              ← Back to all bookings
            </Link>
            <span className="text-ink-soft text-xs">·</span>
            <span className="text-ink-soft text-xs">
              Received on {lead.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={dispatchWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-plum-900 px-3.5 py-2 text-xs font-semibold text-ivory shadow-soft hover:bg-plum-800 transition"
              title="Share formatted appointment details with an artist on WhatsApp"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold-400" />
              <span>Dispatch to Artist</span>
            </a>
            {tel && (
              <a
                href={tel}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-semibold text-plum-900 shadow-soft hover:bg-blush-50"
              >
                <Phone className="h-3.5 w-3.5 text-ink-soft" />
                <span>Call {lead.phone}</span>
              </a>
            )}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-[#1f8f4e] transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Customer</span>
              </a>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: Customer & Booking Info */}
        <div className="space-y-6">
          <Panel title="Customer & Appointment Information">
            <div className="divide-y divide-line text-sm">
              <div className="py-2.5 grid grid-cols-[130px_1fr] items-center">
                <span className="text-ink-soft text-xs font-medium">Customer Name</span>
                <span className="font-semibold text-plum-950">{lead.name}</span>
              </div>

              <div className="py-2.5 grid grid-cols-[130px_1fr] items-center">
                <span className="text-ink-soft text-xs font-medium">Phone Number</span>
                <span className="font-mono text-plum-950 font-medium">{lead.phone}</span>
              </div>

              {lead.email && (
                <div className="py-2.5 grid grid-cols-[130px_1fr] items-center">
                  <span className="text-ink-soft text-xs font-medium">Email Address</span>
                  <span className="text-plum-900">{lead.email}</span>
                </div>
              )}

              <div className="py-2.5 grid grid-cols-[130px_1fr] items-center">
                <span className="text-ink-soft text-xs font-medium">Requested Service</span>
                <div>
                  <p className="font-semibold text-plum-950">{serviceOrPackageTitle}</p>
                  {meta.variant && (
                    <p className="text-xs text-ink-soft mt-0.5">Variant: {meta.variant}</p>
                  )}
                  {meta.addons && meta.addons.length > 0 && (
                    <p className="text-xs text-ink-soft mt-0.5">
                      Add-ons: {meta.addons.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="py-2.5 grid grid-cols-[130px_1fr] items-center">
                <span className="text-ink-soft text-xs font-medium">Appointment Date</span>
                <span className="font-medium text-plum-950">
                  {lead.eventDate
                    ? lead.eventDate.toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Not scheduled yet"}
                </span>
              </div>

              <div className="py-2.5 grid grid-cols-[130px_1fr] items-center">
                <span className="text-ink-soft text-xs font-medium">Preferred Time Slot</span>
                <span className="font-medium text-plum-900">{lead.timeSlot || "Flexible / To be confirmed"}</span>
              </div>

              <div className="py-2.5 grid grid-cols-[130px_1fr] items-start">
                <span className="text-ink-soft text-xs font-medium mt-0.5">Service Address</span>
                <div>
                  <p className="text-plum-950 font-medium">
                    {lead.address || lead.locationText || "Address not provided"}
                  </p>
                  {lead.tags.includes(OUT_OF_AREA) && (
                    <span className="mt-1 inline-block">
                      <Pill tone="bad">Outside Delhi NCR Service Zone</Pill>
                    </span>
                  )}
                </div>
              </div>

              {lead.message && (
                <div className="py-2.5 grid grid-cols-[130px_1fr] items-start">
                  <span className="text-ink-soft text-xs font-medium mt-0.5">Customer Note</span>
                  <p className="whitespace-pre-wrap rounded-lg bg-ivory-deep/80 p-2.5 text-xs text-plum-950 border border-line">
                    {lead.message}
                  </p>
                </div>
              )}

              <div className="py-2.5 grid grid-cols-[130px_1fr] items-center">
                <span className="text-ink-soft text-xs font-medium">Lead Source</span>
                <span className="text-xs text-ink-soft">{lead.source} {lead.sourceUrl ? `(${lead.sourceUrl})` : ""}</span>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right: Salon Actions & Assignment */}
        <div className="space-y-6">
          <Panel title="Appointment Management & Assignment">
            <form action={saveLead} className="grid gap-4">
              <input type="hidden" name="id" value={lead.id} />

              <Field label="Booking Status" hint="Update as you progress">
                <select name="status" defaultValue={lead.status} className={inputCls}>
                  {PIPELINE.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Assign Beautician / Artist" hint="Select team member">
                <select name="proId" defaultValue={lead.proId ?? ""} className={inputCls}>
                  <option value="">-- No artist assigned yet --</option>
                  {pros.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="rounded-xl border border-line bg-blush-50/50 p-3.5 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-plum-900">
                  Pricing & Payment (₹)
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  <Field label="Quote (₹)">
                    <input
                      name="amount"
                      inputMode="decimal"
                      placeholder="0"
                      defaultValue={n(lead.amount)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Discount (₹)">
                    <input
                      name="discount"
                      inputMode="decimal"
                      placeholder="0"
                      defaultValue={n(lead.discount)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Final Total (₹)">
                    <input
                      name="finalAmount"
                      inputMode="decimal"
                      placeholder="0"
                      defaultValue={n(lead.finalAmount)}
                      className={inputCls + " font-bold text-plum-950"}
                    />
                  </Field>
                </div>
              </div>

              <Field label="Internal Staff Notes" hint="Only visible to salon team">
                <textarea
                  name="adminNote"
                  rows={4}
                  placeholder="e.g. Customer requested Priya. Prefers organic hair mask. Deposit paid via UPI."
                  defaultValue={lead.adminNote ?? ""}
                  className={inputCls}
                />
              </Field>

              <div className="pt-2">
                <SubmitButton className="w-full">Save Changes</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
