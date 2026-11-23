import Link from "next/link";
import {
  PIPELINE,
  STATUS_LABEL,
  OUT_OF_AREA,
  leadBoard,
  leadCounts,
  listLeads,
} from "@herrglow/core";
import type { LeadStatus } from "@herrglow/db";
import { PageHeader, Table, Tabs, Td } from "@/components/admin/layout";
import { Pill, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { whatsappLink, telLink } from "@/lib/whatsapp";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  UserCheck,
  UserX,
  Zap,
} from "lucide-react";
import { moveLead } from "./actions";
import { LeadLiveMonitor } from "@/components/admin/LeadLiveMonitor";

type Row = Awaited<ReturnType<typeof listLeads>>["items"][number];

const tone = (s: LeadStatus) =>
  s === "NEW"
    ? "info"
    : s === "BOOKED" || s === "COMPLETED"
    ? "good"
    : s === "LOST"
    ? "bad"
    : "warn";

const ago = (d: Date) =>
  d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatPrice = (amt: unknown) => {
  if (amt == null) return "—";
  const num = Number(amt);
  return isNaN(num) ? "—" : `₹${num.toLocaleString("en-IN")}`;
};

function MoveMenu({ id, current }: { id: string; current: LeadStatus }) {
  return (
    <form action={moveLead} className="flex items-center gap-1">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={current}
        className={inputCls + " !min-h-7 !py-0.5 !px-2 text-xs"}
        aria-label="Change status"
      >
        {PIPELINE.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <button className="rounded-lg border border-line bg-white px-2 py-0.5 text-xs font-medium hover:bg-blush-100 transition cursor-pointer">
        Update
      </button>
    </form>
  );
}

export default async function LeadsPage(props: PageProps<"/admin/leads">) {
  await requireAdmin("leads");
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const status = PIPELINE.includes(one(sp.status) as LeadStatus)
    ? (one(sp.status) as LeadStatus)
    : undefined;
  const unassigned = one(sp.unassigned) === "1";
  const outOfArea = one(sp.outOfArea) === "1";
  const q = one(sp.q)?.trim() || undefined;
  const view = one(sp.view) === "board" ? "board" : "list";
  const page = Number(one(sp.page) ?? 1) || 1;
  const counts = await leadCounts();

  const qs = (o: Record<string, string | undefined>) =>
    "?" +
    new URLSearchParams(
      Object.entries({
        q,
        unassigned: unassigned ? "1" : undefined,
        outOfArea: outOfArea ? "1" : undefined,
        view: view === "board" ? "board" : undefined,
        ...o,
      }).filter(([, v]) => v) as [string, string][]
    ).toString();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings & Customer Leads"
        subtitle={`${counts.total} total bookings recorded · ${counts.unassigned ?? 0} waiting for beautician assignment`}
        actions={
          <Tabs
            items={[
              {
                href: qs({ view: undefined }),
                label: "List View",
                active: view === "list",
              },
              {
                href: qs({ view: "board" }),
                label: "Status Board",
                active: view === "board",
              },
            ]}
          />
        }
      />

      {/* Real-time Dispatch Radar with Chime Alert */}
      <LeadLiveMonitor initialCount={counts.total} />

      {/* Action Notice if unassigned leads exist */}
      {(counts.unassigned ?? 0) > 0 && !unassigned && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-blush-50 p-4 border border-amber-300 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-2xs font-bold text-sm">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-plum-950">
                {counts.unassigned} Customer Booking{counts.unassigned === 1 ? "" : "s"} Need Beautician Assignment
              </h4>
              <p className="text-xs text-ink-soft">
                Match each booking to the nearest verified beautician and dispatch details directly via WhatsApp.
              </p>
            </div>
          </div>
          <Link
            href={qs({ unassigned: "1", status: undefined })}
            className="inline-flex items-center gap-1.5 rounded-xl bg-plum-800 px-3.5 py-2 text-xs font-bold text-white shadow-soft hover:bg-plum-900 transition shrink-0"
          >
            <Zap className="size-3.5 text-gold-400 fill-gold-400" />
            <span>Show Unassigned Only ({counts.unassigned})</span>
          </Link>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form className="flex flex-wrap items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search booking ref, name, phone, area..."
            className={inputCls + " min-w-[260px] sm:min-w-[320px] max-w-sm"}
          />
          {view === "board" && <input type="hidden" name="view" value="board" />}
          {unassigned && <input type="hidden" name="unassigned" value="1" />}

          <label className="flex items-center gap-2 text-xs font-medium text-ink-soft cursor-pointer">
            <input
              type="checkbox"
              name="outOfArea"
              value="1"
              defaultChecked={outOfArea}
              className="rounded"
            />
            Out of area only
          </label>
          <button className="rounded-lg bg-plum-800 px-4 py-2 text-xs font-semibold text-white hover:bg-plum-900 transition cursor-pointer">
            Search
          </button>
          {(q || outOfArea) && (
            <Link
              href={qs({ q: undefined, outOfArea: undefined })}
              className="text-xs text-rose-700 underline hover:text-rose-800 ml-1"
            >
              Clear filters
            </Link>
          )}
        </form>
      </div>

      {view === "list" ? (
        <>
          {/* Filter Tabs */}
          <Tabs
            items={[
              {
                href: qs({ status: undefined, unassigned: undefined }),
                label: `All (${counts.total})`,
                active: !status && !unassigned,
              },
              {
                href: qs({ unassigned: "1", status: undefined }),
                label: (
                  <span className="flex items-center gap-1.5 font-bold">
                    <span>🚨 Needs Beautician</span>
                    <span className="rounded-full bg-amber-100 text-amber-900 px-1.5 py-0.2 text-[10px]">
                      {counts.unassigned ?? 0}
                    </span>
                  </span>
                ),
                active: unassigned,
              },
              ...PIPELINE.map((s) => ({
                href: qs({ status: s, unassigned: undefined }),
                label: `${STATUS_LABEL[s]} (${counts.byStatus[s] ?? 0})`,
                active: status === s && !unassigned,
              })),
            ]}
          />
          <List
            status={status}
            unassigned={unassigned}
            outOfArea={outOfArea}
            q={q}
            page={page}
            qs={qs}
          />
        </>
      ) : (
        <Board outOfArea={outOfArea} q={q} />
      )}
    </div>
  );
}

async function List({
  status,
  unassigned,
  outOfArea,
  q,
  page,
  qs,
}: {
  status?: LeadStatus;
  unassigned?: boolean;
  outOfArea: boolean;
  q?: string;
  page: number;
  qs: (o: Record<string, string | undefined>) => string;
}) {
  const { items, total, pages } = await listLeads({
    status,
    unassigned,
    outOfArea,
    q,
    page,
  });

  return (
    <>
      {/* ───────── Desktop View: Table Layout ───────── */}
      <div className="hidden md:block">
        <Table
          head={[
            "Booking Ref",
            "Customer",
            "Service / Package",
            "Date & Slot",
            "Amount & Deposit",
            "Location",
            "Assigned Beautician",
            "Status",
            "Quick Actions",
          ]}
          empty={items.length ? undefined : "No customer bookings match this filter."}
        >
          {items.map((l: Row) => {
            const serviceTitle =
              l.package?.title ??
              (l.services.map((s) => s.service.title).join(", ") || "Custom Enquiry");

            const waUrl = whatsappLink(
              l.phone,
              `Hi ${l.name}, this is HerrGlow Salon regarding your booking #${l.bookingRef ?? ""}. How can we assist you today?`
            );
            const tel = telLink(l.phone);

            return (
              <tr key={l.id} className="hover:bg-blush-50/50 transition">
                {/* Ref */}
                <Td className="whitespace-nowrap">
                  <Link
                    className="font-mono text-xs font-bold text-rose-700 underline"
                    href={`/admin/leads/${l.id}`}
                  >
                    #{l.bookingRef ?? l.id.slice(0, 8)}
                  </Link>
                  <div className="text-[11px] text-ink-soft">{ago(l.createdAt)}</div>
                </Td>

                {/* Customer */}
                <Td>
                  <p className="font-bold text-plum-950">{l.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-ink-soft mt-0.5">
                    {tel ? (
                      <a href={tel} className="hover:text-rose-700 flex items-center gap-1">
                        <Phone className="size-3" />
                        <span>{l.phone}</span>
                      </a>
                    ) : (
                      <span>{l.phone}</span>
                    )}
                  </div>
                </Td>

                {/* Service */}
                <Td className="max-w-[200px]">
                  <p className="font-semibold text-plum-900 truncate" title={serviceTitle}>
                    {serviceTitle}
                  </p>
                </Td>

                {/* Date & Slot */}
                <Td className="whitespace-nowrap text-xs">
                  <p className="font-semibold text-plum-950">
                    {l.eventDate
                      ? l.eventDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </p>
                  <p className="text-ink-soft text-[11px]">{l.timeSlot || "Flexible"}</p>
                </Td>

                {/* Amount */}
                <Td className="whitespace-nowrap">
                  <p className="font-bold text-plum-950">
                    {formatPrice(l.finalAmount ?? l.amount)}
                  </p>
                  <span className="text-[10px] text-ink-soft">10% advance</span>
                </Td>

                {/* Location */}
                <Td className="max-w-[180px]">
                  <p className="text-xs text-plum-900 line-clamp-2" title={l.locationText ?? ""}>
                    {l.locationText ?? "—"}
                  </p>
                  {l.tags.includes(OUT_OF_AREA) && (
                    <span className="mt-1 inline-block">
                      <Pill tone="bad">out of area</Pill>
                    </span>
                  )}
                </Td>

                {/* Assigned Beautician / Recommender Trigger */}
                <Td className="whitespace-nowrap">
                  {l.pro?.name ? (
                    <div className="flex items-center gap-1.5">
                      <span className="grid size-6 place-items-center rounded-lg bg-emerald-100 text-emerald-800 text-xs">
                        <UserCheck className="size-3.5" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-emerald-950">{l.pro.name}</p>
                        <Link
                          href={`/admin/leads/${l.id}`}
                          className="text-[10px] text-ink-soft hover:underline"
                        >
                          Change
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-plum-800 px-3 py-1.5 text-xs font-bold text-white shadow-soft hover:bg-plum-950 transition active:scale-[0.98]"
                    >
                      <Zap className="size-3 text-gold-400 fill-gold-400" />
                      <span>Assign Nearest Pro</span>
                    </Link>
                  )}
                </Td>

                {/* Status */}
                <Td className="whitespace-nowrap">
                  <Pill tone={tone(l.status)}>{STATUS_LABEL[l.status]}</Pill>
                </Td>

                {/* Quick Actions */}
                <Td className="whitespace-nowrap">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-2 py-1 text-xs font-semibold text-white hover:bg-[#1f8f4e] transition"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="size-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      <Link
                        href={`/admin/leads/${l.id}`}
                        className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-medium text-plum-900 hover:bg-blush-100 transition"
                      >
                        Details
                      </Link>
                    </div>
                    <MoveMenu id={l.id} current={l.status} />
                  </div>
                </Td>
              </tr>
            );
          })}
        </Table>
      </div>

      {/* ───────── Mobile & Tablet View: Intuitive Cards Layout ───────── */}
      <div className="block md:hidden space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-6 text-center text-xs text-ink-soft">
            No customer bookings match this filter.
          </div>
        ) : (
          items.map((l: Row) => {
            const serviceTitle =
              l.package?.title ??
              (l.services.map((s) => s.service.title).join(", ") || "Custom Enquiry");

            const waUrl = whatsappLink(
              l.phone,
              `Hi ${l.name}, this is HerrGlow Salon regarding your booking #${l.bookingRef ?? ""}.`
            );

            return (
              <div
                key={l.id}
                className="rounded-2xl border border-line bg-white p-4 shadow-soft space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="font-mono text-xs font-bold text-rose-700 underline"
                    >
                      #{l.bookingRef ?? l.id.slice(0, 8)}
                    </Link>
                    <span className="text-[11px] text-ink-soft">{ago(l.createdAt)}</span>
                  </div>
                  <Pill tone={tone(l.status)}>{STATUS_LABEL[l.status]}</Pill>
                </div>

                {/* Client info & service */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-plum-950 truncate">{l.name}</h3>
                    <p className="text-xs text-plum-900 font-medium truncate mt-0.5">
                      {serviceTitle}
                    </p>
                    <p className="text-[11px] text-ink-soft truncate mt-0.5">
                      📍 {l.locationText ?? "Delhi NCR"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-sm text-plum-950">
                      {formatPrice(l.finalAmount ?? l.amount)}
                    </span>
                    <p className="text-[10px] text-ink-soft">10% advance</p>
                  </div>
                </div>

                {/* Date & Slot */}
                <div className="flex items-center gap-3 text-xs text-ink-soft bg-ivory-deep/60 p-2 rounded-xl border border-line/60">
                  <div className="flex items-center gap-1 font-medium text-plum-950">
                    <Calendar className="size-3.5 text-rose-700" />
                    <span>
                      {l.eventDate
                        ? l.eventDate.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : "Date not set"}
                    </span>
                  </div>
                  <span className="text-line">|</span>
                  <div className="flex items-center gap-1">
                    <Clock className="size-3 text-gold-600" />
                    <span>{l.timeSlot || "Flexible slot"}</span>
                  </div>
                </div>

                {/* Assigned Pro or Assign Button */}
                <div className="pt-1">
                  {l.pro?.name ? (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        <span>Artist: {l.pro.name}</span>
                      </div>
                      <Link
                        href={`/admin/leads/${l.id}`}
                        className="text-[11px] font-semibold text-rose-800 underline"
                      >
                        Manage
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-plum-800 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-plum-950 transition active:scale-[0.98]"
                    >
                      <Zap className="size-3.5 text-gold-400 fill-gold-400" />
                      <span>⚡ Assign Nearest Beautician</span>
                    </Link>
                  )}
                </div>

                {/* Bottom Bar: WhatsApp and Status Update */}
                <div className="flex items-center justify-between pt-2 border-t border-line gap-2">
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-[#1f8f4e] transition"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>WhatsApp Client</span>
                    </a>
                  )}
                  <MoveMenu id={l.id} current={l.status} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-soft">
        <p>
          Showing {items.length} of {total} bookings · Page {page} of {pages}
        </p>
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              className="rounded-lg border border-line bg-white px-3 py-1 text-xs font-medium text-plum-900 hover:bg-blush-100 transition"
              href={qs({ status, page: String(page - 1) })}
            >
              ← Previous
            </Link>
          )}
          {page < pages && (
            <Link
              className="rounded-lg border border-line bg-white px-3 py-1 text-xs font-medium text-plum-900 hover:bg-blush-100 transition"
              href={qs({ status, page: String(page + 1) })}
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

async function Board({ outOfArea, q }: { outOfArea: boolean; q?: string }) {
  const cols = await leadBoard({ outOfArea, q });
  return (
    <div className="grid auto-cols-[290px] grid-flow-col gap-4 overflow-x-auto pb-4">
      {cols.map((c) => (
        <section
          key={c.status}
          className="rounded-2xl bg-ivory-deep/80 p-3.5 ring-1 ring-black/5"
        >
          <h2 className="mb-3 flex items-center justify-between !text-sm font-bold text-plum-950">
            <span>{STATUS_LABEL[c.status]}</span>
            <Pill tone={tone(c.status)}>{c.total}</Pill>
          </h2>
          <div className="space-y-3">
            {c.items.map((l) => {
              const waUrl = whatsappLink(
                l.phone,
                `Hi ${l.name}, this is HerrGlow Salon regarding your booking #${l.bookingRef ?? ""}.`
              );
              const title =
                l.package?.title ??
                (l.services.map((s) => s.service.title).join(", ") || "Custom Service");

              return (
                <article
                  key={l.id}
                  className="rounded-xl border border-line bg-white p-3.5 text-sm shadow-soft hover:shadow-lift transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-700">
                      #{l.bookingRef ?? l.id.slice(0, 8)}
                    </span>
                    <span className="font-semibold text-xs text-plum-950">
                      {formatPrice(l.finalAmount ?? l.amount)}
                    </span>
                  </div>

                  <Link
                    href={`/admin/leads/${l.id}`}
                    className="mt-1 block font-semibold text-plum-950 hover:text-rose-700 truncate"
                  >
                    {l.name}
                  </Link>

                  <p className="mt-0.5 text-xs text-ink-soft truncate" title={title}>
                    {title}
                  </p>

                  <div className="mt-2 text-xs text-ink-soft flex items-center justify-between">
                    <span className="truncate max-w-[140px]">{l.locationText ?? "Delhi NCR"}</span>
                    <span>
                      {l.eventDate
                        ? l.eventDate.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : ""}
                    </span>
                  </div>

                  {/* Pro assignment status on board card */}
                  <div className="mt-2">
                    {l.pro?.name ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="size-3" />
                        <span>{l.pro.name}</span>
                      </span>
                    ) : (
                      <Link
                        href={`/admin/leads/${l.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-plum-950 bg-gold-100 hover:bg-gold-200 px-2 py-0.5 rounded-md border border-gold-300 transition"
                      >
                        <Zap className="size-3 text-gold-700 fill-gold-700" />
                        <span>Assign Nearest Pro</span>
                      </Link>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between gap-2">
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-[#25D366] px-2 py-0.5 text-xs font-medium text-white hover:bg-[#1f8f4e]"
                      >
                        <MessageCircle className="size-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    <MoveMenu id={l.id} current={l.status} />
                  </div>
                </article>
              );
            })}
            {c.total > c.items.length && (
              <p className="text-center text-xs text-ink-soft py-1">
                +{c.total - c.items.length} more in this column (switch to List view)
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
