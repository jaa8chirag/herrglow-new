import Link from "next/link";
import { PIPELINE, STATUS_LABEL, OUT_OF_AREA, leadBoard, leadCounts, listLeads } from "@herrglow/core";
import type { LeadStatus } from "@herrglow/db";
import { PageHeader, Table, Tabs, Td } from "@/components/admin/layout";
import { Pill, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { whatsappLink, telLink } from "@/lib/whatsapp";
import { MessageCircle, Phone, Calendar, IndianRupee } from "lucide-react";
import { moveLead } from "./actions";

type Row = Awaited<ReturnType<typeof listLeads>>["items"][number];
const tone = (s: LeadStatus) =>
  s === "NEW" ? "info" : s === "BOOKED" || s === "COMPLETED" ? "good" : s === "LOST" ? "bad" : "warn";
const ago = (d: Date) =>
  d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

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
      <button className="rounded-lg border border-line bg-white px-2 py-0.5 text-xs font-medium hover:bg-blush-100">
        Update
      </button>
    </form>
  );
}

export default async function LeadsPage(props: PageProps<"/admin/leads">) {
  await requireAdmin("leads");
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const status = PIPELINE.includes(one(sp.status) as LeadStatus) ? (one(sp.status) as LeadStatus) : undefined;
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
        outOfArea: outOfArea ? "1" : undefined,
        view: view === "board" ? "board" : undefined,
        ...o,
      }).filter(([, v]) => v) as [string, string][]
    ).toString();

  return (
    <>
      <PageHeader
        title="Bookings & Customer Leads"
        subtitle={`${counts.total} total bookings recorded · ${counts.outOfArea} outside Delhi NCR`}
        actions={
          <Tabs
            items={[
              { href: qs({ view: undefined }), label: "List View", active: view === "list" },
              { href: qs({ view: "board" }), label: "Status Board", active: view === "board" },
            ]}
          />
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <form className="flex flex-wrap items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search booking ref, name, phone, area..."
            className={inputCls + " min-w-[280px] max-w-sm"}
          />
          {view === "board" && <input type="hidden" name="view" value="board" />}
          <label className="flex items-center gap-2 text-xs font-medium text-ink-soft cursor-pointer">
            <input type="checkbox" name="outOfArea" value="1" defaultChecked={outOfArea} className="rounded" />
            Out of area only
          </label>
          <button className="rounded-lg bg-plum-800 px-4 py-2 text-xs font-semibold text-white hover:bg-plum-900 transition">
            Search
          </button>
          {q && (
            <Link
              href={qs({ q: undefined })}
              className="text-xs text-rose-700 underline hover:text-rose-800 ml-1"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {view === "list" ? (
        <>
          <Tabs
            items={[
              { href: qs({ status: undefined }), label: `All (${counts.total})`, active: !status },
              ...PIPELINE.map((s) => ({
                href: qs({ status: s }),
                label: `${STATUS_LABEL[s]} (${counts.byStatus[s] ?? 0})`,
                active: status === s,
              })),
            ]}
          />
          <List status={status} outOfArea={outOfArea} q={q} page={page} qs={qs} />
        </>
      ) : (
        <Board outOfArea={outOfArea} q={q} />
      )}
    </>
  );
}

async function List({
  status,
  outOfArea,
  q,
  page,
  qs,
}: {
  status?: LeadStatus;
  outOfArea: boolean;
  q?: string;
  page: number;
  qs: (o: Record<string, string | undefined>) => string;
}) {
  const { items, total, pages } = await listLeads({ status, outOfArea, q, page });
  return (
    <>
      <Table
        head={["Booking Ref", "Customer", "Service / Package", "Date & Slot", "Amount", "Location", "Status", "Quick Contact & Action"]}
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
              <Td className="whitespace-nowrap">
                <Link
                  className="font-mono text-xs font-bold text-rose-700 underline"
                  href={`/admin/leads/${l.id}`}
                >
                  {l.bookingRef ?? "NO-REF"}
                </Link>
                <div className="text-[11px] text-ink-soft">{ago(l.createdAt)}</div>
              </Td>

              <Td>
                <p className="font-semibold text-plum-950">{l.name}</p>
                <div className="flex items-center gap-2 text-xs text-ink-soft">
                  {tel ? (
                    <a href={tel} className="hover:text-rose-700 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{l.phone}</span>
                    </a>
                  ) : (
                    <span>{l.phone}</span>
                  )}
                </div>
              </Td>

              <Td className="max-w-[220px]">
                <p className="font-medium text-plum-900 truncate" title={serviceTitle}>
                  {serviceTitle}
                </p>
                {l.pro?.name && (
                  <p className="text-xs text-emerald-700 font-medium">
                    Artist: {l.pro.name}
                  </p>
                )}
              </Td>

              <Td className="whitespace-nowrap text-xs">
                <p className="font-medium text-plum-900">
                  {l.eventDate ? l.eventDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                </p>
                <p className="text-ink-soft">{l.timeSlot || "Flexible"}</p>
              </Td>

              <Td className="whitespace-nowrap font-bold text-plum-950">
                {formatPrice(l.finalAmount ?? l.amount)}
              </Td>

              <Td>
                <p className="text-xs text-plum-900">{l.locationText ?? "—"}</p>
                {l.tags.includes(OUT_OF_AREA) && (
                  <Pill tone="bad">out of area</Pill>
                )}
              </Td>

              <Td className="whitespace-nowrap">
                <Pill tone={tone(l.status)}>{STATUS_LABEL[l.status]}</Pill>
              </Td>

              <Td className="whitespace-nowrap">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-2 py-0.5 text-xs font-medium text-white hover:bg-[#1f8f4e] transition"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="rounded-lg border border-line bg-white px-2 py-0.5 text-xs font-medium text-plum-900 hover:bg-blush-100"
                    >
                      Open
                    </Link>
                  </div>
                  <MoveMenu id={l.id} current={l.status} />
                </div>
              </Td>
            </tr>
          );
        })}
      </Table>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-soft">
        <p>
          Showing {items.length} of {total} bookings · Page {page} of {pages}
        </p>
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              className="rounded-lg border border-line bg-white px-3 py-1 text-xs font-medium text-plum-900 hover:bg-blush-100"
              href={qs({ status, page: String(page - 1) })}
            >
              ← Previous
            </Link>
          )}
          {page < pages && (
            <Link
              className="rounded-lg border border-line bg-white px-3 py-1 text-xs font-medium text-plum-900 hover:bg-blush-100"
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
        <section key={c.status} className="rounded-2xl bg-ivory-deep/80 p-3.5 ring-1 ring-black/5">
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
                      {l.bookingRef ?? "NO-REF"}
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
                    <span>{l.locationText ?? "Delhi NCR"}</span>
                    <span>{l.eventDate ? l.eventDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between gap-2">
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-[#25D366] px-2 py-0.5 text-xs font-medium text-white hover:bg-[#1f8f4e]"
                      >
                        <MessageCircle className="h-3 w-3" />
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
