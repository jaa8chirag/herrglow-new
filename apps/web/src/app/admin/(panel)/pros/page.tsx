import Link from "next/link";
import { listProsAdmin, needsCoverageCount } from "@herrglow/core";
import type { ProStatus } from "@herrglow/db";
import { PageHeader, Table, Tabs, Td } from "@/components/admin/layout";
import { Pill, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";

export default async function ProsPage(props: PageProps<"/admin/pros">) {
  await requireAdmin("pros");
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const filter = one(sp.filter);
  const q = one(sp.q)?.trim() || undefined;
  const status = (["ACTIVE", "INACTIVE", "PENDING"].includes(one(sp.status) ?? "") ? one(sp.status) : undefined) as ProStatus | undefined;
  const page = Number(one(sp.page) ?? 1) || 1;
  const [{ items, total, pages }, needs] = await Promise.all([listProsAdmin({ q, status, needsCoverage: filter === "needs-coverage", page }), needsCoverageCount()]);
  return (
    <>
      <PageHeader title="Artists" subtitle={`${total} shown`} />
      <Tabs items={[
        { href: "/admin/pros", label: "All", active: !filter && !status },
        { href: "?status=ACTIVE", label: "Active", active: status === "ACTIVE" },
        { href: "?status=INACTIVE", label: "Inactive", active: status === "INACTIVE" },
        { href: "?filter=needs-coverage", label: `Needs coverage (${needs})`, active: filter === "needs-coverage" },
      ]} />
      <form className="mb-4 flex gap-2"><input name="q" defaultValue={q} placeholder="Search by name" className={inputCls + " max-w-xs"} /><button className="rounded-lg border border-line bg-white px-4 text-sm hover:bg-blush-100">Search</button></form>
      <Table head={["Artist", "Type", "Status", "Services", "Areas (live cities)", "Public page", ""]} empty={items.length ? undefined : "No artists."}>
        {items.map((p) => (
          <tr key={p.id}>
            <Td className="font-medium">{p.name}{p.needsCoverage && <> <Pill tone="bad">needs coverage</Pill></>}</Td>
            <Td>{p.providerType === "MAKEOVER_ARTIST" ? "Makeover artist" : p.providerType === "BEAUTICIAN" ? "Beautician" : "Both"}</Td>
            <Td><Pill tone={p.status === "ACTIVE" ? "good" : "neutral"}>{p.status.toLowerCase()}</Pill></Td>
            <Td>{p.services}</Td>
            <Td>{p.coverage}{p.coverage > 0 && p.activeCityCoverage === 0 && <span className="ml-1 text-xs text-amber-700">(none in live cities)</span>}</Td>
            <Td className="text-xs">{p.noindexReason ? <span className="text-amber-700">noindex: {p.noindexReason}</span> : <span className="text-emerald-700">indexable</span>}</Td>
            <Td><Link className="font-medium text-rose-700 underline" href={`/admin/pros/${p.id}`}>Edit</Link></Td>
          </tr>
        ))}
      </Table>
      <p className="mt-3 flex items-center gap-3 text-sm text-ink-soft">page {page}/{pages}
        {page > 1 && <Link className="underline" href={`?page=${page - 1}`}>Previous</Link>}{page < pages && <Link className="underline" href={`?page=${page + 1}`}>Next</Link>}</p>
    </>
  );
}
