import Link from "next/link";
import { notFound } from "next/navigation";
import {
  OUT_OF_AREA,
  PIPELINE,
  STATUS_LABEL,
  findMatchingBeauticiansForLead,
  getLead,
} from "@herrglow/core";
import { PageHeader, Panel } from "@/components/admin/layout";
import { Field, Pill, SubmitButton, inputCls } from "@/components/admin/ui";
import { ProAssigner } from "@/components/admin/ProAssigner";
import { requireAdmin } from "@/lib/admin";
import { whatsappLink, telLink } from "@/lib/whatsapp";
import {
  Calendar,
  Clock,
  ExternalLink,
  IndianRupee,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { saveLead } from "../actions";

const tone = (s: string) =>
  s === "NEW" ? "info" : s === "BOOKED" || s === "COMPLETED" ? "good" : s === "LOST" ? "bad" : "warn";

export default async function LeadDetail(props: PageProps<"/admin/leads/[id]">) {
  await requireAdmin("leads");
  const { id } = await props.params;

  const [lead, matchData] = await Promise.all([
    getLead(id),
    findMatchingBeauticiansForLead(id),
  ]);

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

  const depositAmount = lead.finalAmount || lead.amount
    ? Math.round(Number(lead.finalAmount ?? lead.amount) * 0.1)
    : null;

  return (
    <div className="space-y-6">
      {/* ───────── Top Navigation & Header ───────── */}
      <PageHeader
        title={`Booking #${lead.bookingRef ?? lead.id.slice(0, 8)}`}
        subtitle={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="text-rose-700 underline hover:text-rose-800 text-xs font-semibold"
              href="/admin/leads"
            >
              ← Back to all bookings
            </Link>
            <span className="text-ink-soft text-xs">·</span>
            <span className="text-ink-soft text-xs">
              Received on {lead.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </span>
            <span className="text-ink-soft text-xs">·</span>
            <Pill tone={tone(lead.status)}>{STATUS_LABEL[lead.status]}</Pill>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {tel && (
              <a
                href={tel}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-semibold text-plum-900 shadow-soft hover:bg-blush-50 transition"
              >
                <Phone className="size-3.5 text-ink-soft" />
                <span>Call Client</span>
              </a>
            )}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold text-white shadow-soft hover:bg-[#1f8f4e] transition"
              >
                <MessageCircle className="size-4" />
                <span>WhatsApp Client</span>
              </a>
            )}
          </div>
        }
      />

      {/* ───────── Main 2-Column Responsive Layout ───────── */}
      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] items-start">
        {/* Left Column: Smart Pro Recommender & Assigner (Hero Focus) */}
        <div className="space-y-6">
          <Panel title="Beautician Assignment & Nearest Matching">
            {matchData ? (
              <ProAssigner
                leadId={lead.id}
                leadName={lead.name}
                leadLocation={lead.address || lead.locationText || "Delhi NCR"}
                serviceTitle={serviceOrPackageTitle}
                matches={matchData.matches}
                currentAssignedId={lead.proId}
              />
            ) : (
              <p className="text-xs text-ink-soft">Could not load beautician match data.</p>
            )}
          </Panel>

          {/* Customer & Appointment Overview */}
          <Panel title="Customer Requirements & Appointment Details">
            <div className="divide-y divide-line text-sm">
              <div className="py-3 grid grid-cols-[140px_1fr] items-center">
                <span className="text-ink-soft text-xs font-medium">Customer Name</span>
                <span className="font-bold text-plum-950">{lead.name}</span>
              </div>

              <div className="py-3 grid grid-cols-[140px_1fr] items-center">
                <span className="text-ink-soft text-xs font-medium">Mobile Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-plum-950 font-semibold">{lead.phone}</span>
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1f8f4e] hover:text-[#187a41]"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle className="size-4" />
                    </a>
                  )}
                </div>
              </div>

              {lead.email && (
                <div className="py-3 grid grid-cols-[140px_1fr] items-center">
                  <span className="text-ink-soft text-xs font-medium">Email Address</span>
                  <span className="text-plum-900">{lead.email}</span>
                </div>
              )}

              <div className="py-3 grid grid-cols-[140px_1fr] items-start">
                <span className="text-ink-soft text-xs font-medium mt-0.5">Requested Service</span>
                <div>
                  <p className="font-bold text-plum-950">{serviceOrPackageTitle}</p>
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

              <div className="py-3 grid grid-cols-[140px_1fr] items-center">
                <span className="text-ink-soft text-xs font-medium">Appointment Date</span>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-rose-700" />
                  <span className="font-semibold text-plum-950">
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
              </div>

              <div className="py-3 grid grid-cols-[140px_1fr] items-center">
                <span className="text-ink-soft text-xs font-medium">Preferred Slot</span>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-gold-600" />
                  <span className="font-medium text-plum-900">
                    {lead.timeSlot || "Flexible / To be confirmed"}
                  </span>
                </div>
              </div>

              <div className="py-3 grid grid-cols-[140px_1fr] items-start">
                <span className="text-ink-soft text-xs font-medium mt-0.5">Service Address</span>
                <div>
                  <p className="text-plum-950 font-medium leading-relaxed">
                    {lead.address || lead.locationText || "Address not provided"}
                  </p>
                  {lead.latitude && lead.longitude && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-900">
                      <MapPin className="size-3 text-emerald-700" />
                      <span>GPS Pin Confirmed: {Number(lead.latitude).toFixed(4)}, {Number(lead.longitude).toFixed(4)}</span>
                    </div>
                  )}
                  {lead.tags.includes(OUT_OF_AREA) && (
                    <div className="mt-1.5">
                      <Pill tone="bad">Outside Delhi NCR Service Zone</Pill>
                    </div>
                  )}
                </div>
              </div>

              {lead.message && (
                <div className="py-3 grid grid-cols-[140px_1fr] items-start">
                  <span className="text-ink-soft text-xs font-medium mt-0.5">Customer Note</span>
                  <p className="whitespace-pre-wrap rounded-xl bg-ivory-deep/80 p-3 text-xs text-plum-950 border border-line">
                    {lead.message}
                  </p>
                </div>
              )}

              <div className="py-3 grid grid-cols-[140px_1fr] items-center">
                <span className="text-ink-soft text-xs font-medium">Lead Source</span>
                <span className="text-xs text-ink-soft">
                  {lead.source} {lead.sourceUrl ? `(${lead.sourceUrl})` : ""}
                </span>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column: Fast Pricing, Deposit & Staff Management */}
        <div className="space-y-6">
          {/* Deposit & Payment Card */}
          <Panel title="Payment & 10% Advance Deposit">
            <div className="rounded-xl border border-gold-300/80 bg-gradient-to-br from-gold-50/60 via-white to-blush-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-800 uppercase tracking-wide">
                  Advance Security Protocol
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5">
                  10% Required
                </span>
              </div>
              <p className="text-xs text-plum-950 leading-relaxed">
                HerrGlow collects 10% in advance to eliminate last-minute fake cancellations and compensate beauticians for travel time.
              </p>
              {depositAmount != null && (
                <div className="flex items-center justify-between pt-2 border-t border-gold-200 text-xs">
                  <span className="text-ink-soft font-medium">Calculated 10% Deposit:</span>
                  <span className="font-bold text-plum-950 text-sm">₹{depositAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
          </Panel>

          {/* Quick Edit Form for Status & Pricing */}
          <Panel title="Update Status & Rate Card">
            <form action={saveLead} className="grid gap-4">
              <input type="hidden" name="id" value={lead.id} />

              <Field label="Booking Status" hint="Current stage in salon pipeline">
                <select name="status" defaultValue={lead.status} className={inputCls}>
                  {PIPELINE.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="rounded-xl border border-line bg-blush-50/50 p-3.5 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-plum-900">
                  Service Billing (₹)
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

              <Field label="Internal Salon Notes" hint="Private notes for salon managers">
                <textarea
                  name="adminNote"
                  rows={4}
                  placeholder="e.g. Client requested organic scrub. Verified advance deposit received on UPI. Dispatched to Sunita."
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
