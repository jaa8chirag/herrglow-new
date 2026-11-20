import Link from "next/link";
import { PIPELINE, STATUS_LABEL, OUT_OF_AREA, leadBoard, leadCounts, listLeads } from "@herrglow/core";
import type { LeadStatus } from "@herrglow/db";
import { PageHeader, Table, Tabs, Td } from "@/components/admin/layout";
import { Pill, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { moveLead } from "./actions";

type Row = Awaited<ReturnType<typeof listLeads>>["items"][number];
const tone = (s: LeadStatus) => (s === "NEW" ? "info" : s === "BOOKED" || s === "COMPLETED" ? "good" : s === "LOST" ? "bad" : "warn") as "info" | "good" | "bad" | "warn";
const ago = (d: Date) => d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function MoveMenu({ id, current }: { id: string; current: LeadStatus }) {
  return (
    <form action={moveLead} className="flex items-center gap-1">
      <input type="hidden" name="id" value={id} />
      <select name="status" defaultValue={current} className={inputCls + " !min-h-8 !py-1 text-xs"} aria-label="Move to">
        {PIPELINE.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
      </select>
      <button className="rounded-lg border border-line bg-white px-2 text-xs hover:bg-blush-100">Move</button>
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

  const qs = (o: Record<string, string | undefined>) => "?" + new URLSearchParams(Object.entries({ q, outOfArea: outOfArea ? "1" : undefined, view: view === "board" ? "board" : undefined, ...o }).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <>
      <PageHeader title="Leads" subtitle={`${counts.total} total · ${counts.outOfArea} out of area`}
        actions={<Tabs items={[{ href: qs({ view: undefined }), label: "List", active: view === "list" }, { href: qs({ view: "board" }), label: "Pipeline board", active: view === "board" }]} />} />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search name, phone, ref, area" className={inputCls + " max-w-xs"} />
        {view === "board" && <input type="hidden" name="view" value="board" />}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="outOfArea" value="1" defaultChecked={outOfArea} /> Out of area only</label>
        <button className="rounded-lg border border-line bg-white px-4 text-sm hover:bg-blush-100">Filter</button>
      </form>

      {view === "list" ? (
        <>
          <Tabs items={[{ href: qs({ status: undefined }), label: `All (${counts.total})`, active: !status }, ...PIPELINE.map((s) => ({ href: qs({ status: s }), label: `${STATUS_LABEL[s]} (${counts.byStatus[s] ?? 0})`, active: status === s }))]} />
          <List status={status} outOfArea={outOfArea} q={q} page={page} qs={qs} />
        </>
      ) : (
        <Board outOfArea={outOfArea} q={q} />
      )}
    </>
  );
}

async function List({ status, outOfArea, q, page, qs }: { status?: LeadStatus; outOfArea: boolean; q?: string; page: number; qs: (o: Record<string, string | undefined>) => string }) {
  const { items, total, pages } = await listLeads({ status, outOfArea, q, page });
  return (
    <>
      <Table head={["Ref", "Customer", "Service", "Location", "Received", "Status", ""]} empty={items.length ? undefined : "No leads match."}>
        {items.map((l: Row) => (
          <tr key={l.id} className="hover:bg-blush-50/50">
            <Td><Link className="font-medium text-rose-700 underline" href={`/admin/leads/${l.id}`}>{l.bookingRef ?? "—"}</Link></Td>
            <Td>{l.name}<br /><span className="text-xs text-ink-soft">{l.phone}</span></Td>
            <Td>{l.services.map((s) => s.service.title).join(", ") || "—"}</Td>
            <Td>{l.locationText ?? "—"} {l.tags.includes(OUT_OF_AREA) && <Pill tone="bad">out of area</Pill>}</Td>
            <Td className="whitespace-nowrap">{ago(l.createdAt)}</Td>
            <Td><Pill tone={tone(l.status)}>{STATUS_LABEL[l.status]}</Pill></Td>
            <Td><MoveMenu id={l.id} current={l.status} /></Td>
          </tr>
        ))}
      </Table>
      <p className="mt-3 flex items-center gap-3 text-sm text-ink-soft">
        {total} leads · page {page}/{pages}
        {page > 1 && <Link className="underline" href={qs({ status, page: String(page - 1) })}>Previous</Link>}
        {page < pages && <Link className="underline" href={qs({ status, page: String(page + 1) })}>Next</Link>}
      </p>
    </>
  );
}

async function Board({ outOfArea, q }: { outOfArea: boolean; q?: string }) {
  const cols = await leadBoard({ outOfArea, q });
  return (
    <div className="grid auto-cols-[270px] grid-flow-col gap-4 overflow-x-auto pb-4">
      {cols.map((c) => (
        <section key={c.status} className="rounded-2xl bg-ivory-deep/70 p-3">
          <h2 className="mb-3 flex items-center justify-between !text-sm font-semibold">{STATUS_LABEL[c.status]}<Pill tone={tone(c.status)}>{c.total}</Pill></h2>
          <div className="space-y-3">
            {c.items.map((l) => (
              <article key={l.id} className="rounded-xl border border-line bg-white p-3 text-sm shadow-soft">
                <Link href={`/admin/leads/${l.id}`} className="font-medium text-plum-900 hover:text-rose-700">{l.name}</Link>
                <p className="text-xs text-ink-soft">{l.services.map((s) => s.service.title).join(", ") || "General enquiry"}</p>
                <p className="mt-1 text-xs">{l.locationText ?? "—"} {l.tags.includes(OUT_OF_AREA) && <Pill tone="bad">out of area</Pill>}</p>
                <p className="mt-1 text-xs text-ink-soft">{ago(l.createdAt)}</p>
                <div className="mt-2"><MoveMenu id={l.id} current={l.status} /></div>
              </article>
            ))}
            {c.total > c.items.length && <p className="text-center text-xs text-ink-soft">+{c.total - c.items.length} more (use List)</p>}
          </div>
        </section>
      ))}
    </div>
  );
}
