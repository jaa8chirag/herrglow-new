import Link from "next/link";
import { listServicesAdmin } from "@herrglow/core";
import type { Status } from "@herrglow/db";
import { PageHeader, Table, Tabs, Td } from "@/components/admin/layout";
import { Pill, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";

export default async function ServicesPage(props: PageProps<"/admin/services">) {
  await requireAdmin("catalog");
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const q = one(sp.q)?.trim() || undefined;
  const categoryId = one(sp.category) || undefined;
  const status = (["ACTIVE", "INACTIVE"].includes(one(sp.status) ?? "") ? one(sp.status) : undefined) as Status | undefined;
  const page = Number(one(sp.page) ?? 1) || 1;
  const needsPhoto = one(sp.photo) === "missing";
  const { items, total, pages, categories, needsPhotoCount } = await listServicesAdmin({ q, categoryId, status, page, needsPhoto });
  return (
    <>
      <PageHeader title="Services" subtitle={`${total} services (merged duplicates are hidden; they redirect to their parent)`} />
      <Tabs items={[{ href: "/admin/services", label: "All", active: !needsPhoto }, { href: "?photo=missing", label: `Needs photo (${needsPhotoCount})`, active: needsPhoto }]} />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search title" className={inputCls + " max-w-xs"} />
        <select name="category" defaultValue={categoryId ?? ""} className={inputCls + " max-w-48"}><option value="">All categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select name="status" defaultValue={status ?? ""} className={inputCls + " max-w-36"}><option value="">Any status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
        <button className="rounded-lg border border-line bg-white px-4 text-sm hover:bg-blush-100">Filter</button>
      </form>
      <Table head={["Service", "Category", "Price", "Options", "Enquiries", "Photo", "Description", "Status", ""]} empty={items.length ? undefined : "No services."}>
        {items.map((s) => (
          <tr key={s.id}>
            <Td className="font-medium">{s.title}<br /><span className="text-xs font-normal text-ink-soft">/services/{s.slug}</span></Td>
            <Td>{s.category.name}</Td>
            <Td>{s.price != null ? `₹${Math.round(Number(s.price)).toLocaleString("en-IN")}` : "—"}</Td>
            <Td>{s._count.variants || "—"}{s._count.addons ? ` + ${s._count.addons} add-ons` : ""}</Td>
            <Td>{s.leadCount}</Td>
            <Td>{s.hasPhoto ? <Pill tone="good">photo</Pill> : <Pill tone="warn">needs photo</Pill>}</Td>
            <Td>{s.words < 80 ? <Pill tone="warn">{s.words} words (thin)</Pill> : <span className="text-xs text-ink-soft">{s.words} words</span>}</Td>
            <Td><Pill tone={s.status === "ACTIVE" ? "good" : "neutral"}>{s.status.toLowerCase()}</Pill></Td>
            <Td><Link className="font-medium text-rose-700 underline" href={`/admin/services/${s.id}`}>Edit</Link></Td>
          </tr>
        ))}
      </Table>
      <p className="mt-3 flex items-center gap-3 text-sm text-ink-soft">page {page}/{pages}{page > 1 && <Link className="underline" href={`?page=${page - 1}`}>Previous</Link>}{page < pages && <Link className="underline" href={`?page=${page + 1}`}>Next</Link>}</p>
    </>
  );
}
