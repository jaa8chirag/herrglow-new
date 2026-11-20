import Link from "next/link";
import { listPagesAdmin, seoSummary } from "@herrglow/core";
import type { PageType } from "@herrglow/db";
import { PageHeader, Panel, Table, Tabs, Td } from "@/components/admin/layout";
import { Pill, SubmitButton, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { syncNow, toggleNoindex } from "./actions";

const TYPES: PageType[] = ["HOME", "STATIC", "CATEGORY", "SERVICE", "CITY", "SERVICE_CITY", "AREA", "PRO", "BLOG"];

export default async function SeoManager(props: PageProps<"/admin/seo">) {
  await requireAdmin("seo");
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const type = TYPES.includes(one(sp.type) as PageType) ? (one(sp.type) as PageType) : undefined;
  const state = one(sp.state) === "noindex" ? "noindex" : one(sp.state) === "indexable" ? "indexable" : undefined;
  const q = one(sp.q)?.trim() || undefined;
  const page = Number(one(sp.page) ?? 1) || 1;
  const [sum, list] = await Promise.all([seoSummary(), listPagesAdmin({ type, state, q, page })]);
  const qs = (o: Record<string, string | undefined>) => "?" + new URLSearchParams(Object.entries({ type, state, q, ...o }).filter(([, v]) => v) as [string, string][]).toString();
  const stat = (label: string, v: number | string, note?: string) => <div className="rounded-xl border border-line bg-white p-4"><p className="text-xs text-ink-soft">{label}</p><p className="font-serif text-3xl text-plum-800">{v}</p>{note && <p className="text-xs text-ink-soft">{note}</p>}</div>;
  return (
    <>
      <PageHeader title="SEO manager" subtitle="Every public URL, whether it is indexable, and exactly why."
        actions={<form action={syncNow}><SubmitButton variant="ghost">Re-sync pages now</SubmitButton></form>} />
      {one(sp.ok) && <p className="mb-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">{one(sp.ok)}</p>}
      {!sum.siteIndexing && <p className="mb-4 rounded-lg bg-amber-100 p-3 text-sm text-amber-800"><strong>Site-wide noindex is ON</strong> (ALLOW_INDEXING is not set). This is correct for local and staging. Set ALLOW_INDEXING=true only on the production deployment.</p>}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        {stat("Public pages", sum.total)}{stat("Indexable", sum.indexable)}{stat("Noindex", sum.noindex)}{stat("In sitemap", sum.inSitemap)}{stat("Manual noindex", sum.manual)}
        {stat("Area pages", sum.byType.AREA ?? 0, `${sum.notCreated.areaTextOnly} areas text-only`)}
      </div>
      <Panel title="Pages that do NOT exist yet (by design)" className="mb-6">
        <ul className="grid gap-1 text-sm text-ink-soft sm:grid-cols-3">
          <li><strong className="text-plum-800">{sum.notCreated.areaTextOnly}</strong> areas listed as text only (fail the area gate)</li>
          <li><strong className="text-plum-800">{sum.notCreated.serviceCityDrafts}</strong> service×city drafts awaiting <Link className="underline" href="/admin/review?kind=service-city">review</Link></li>
          <li><strong className="text-plum-800">{sum.notCreated.inactiveCities}</strong> inactive cities (no pages; URLs return 410)</li>
        </ul>
      </Panel>
      <Tabs items={[{ href: qs({ type: undefined, page: undefined }), label: "All types", active: !type }, ...TYPES.map((t) => ({ href: qs({ type: t, page: undefined }), label: `${t.replace("_", "×").toLowerCase()} (${sum.byType[t] ?? 0})`, active: type === t }))]} />
      <form className="mb-4 flex flex-wrap gap-2">
        {type && <input type="hidden" name="type" value={type} />}
        <input name="q" defaultValue={q} placeholder="Search URL" className={inputCls + " max-w-xs"} />
        <select name="state" defaultValue={state ?? ""} className={inputCls + " max-w-40"}><option value="">Any state</option><option value="indexable">Indexable</option><option value="noindex">Noindex</option></select>
        <button className="rounded-lg border border-line bg-white px-4 text-sm hover:bg-blush-100">Filter</button>
      </form>
      <Table head={["URL", "Type", "State", "Why", "Quality", ""]} empty={list.items.length ? undefined : "No pages."}>
        {list.items.map((p) => (
          <tr key={p.url}>
            <Td className="font-mono text-xs"><a className="text-rose-700 underline" href={p.url} target="_blank">{p.url}</a></Td>
            <Td>{p.type.replace("_", "×").toLowerCase()}</Td>
            <Td>{p.isIndexable ? <Pill tone="good">indexable</Pill> : <Pill tone="warn">noindex</Pill>} {p.inSitemap && <Pill tone="info">sitemap</Pill>}</Td>
            <Td className="max-w-md text-ink-soft">{p.reason}</Td>
            <Td>{p.qualityScore}</Td>
            <Td>
              <form action={toggleNoindex}><input type="hidden" name="url" value={p.url} /><input type="hidden" name="on" value={p.manualNoindex ? "0" : "1"} />
                <button className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs hover:bg-blush-100">{p.manualNoindex ? "Remove manual noindex" : "Force noindex"}</button></form>
            </Td>
          </tr>
        ))}
      </Table>
      <p className="mt-3 flex items-center gap-3 text-sm text-ink-soft">{list.total} pages · page {page}/{list.pages}{page > 1 && <Link className="underline" href={qs({ page: String(page - 1) })}>Previous</Link>}{page < list.pages && <Link className="underline" href={qs({ page: String(page + 1) })}>Next</Link>}</p>
    </>
  );
}
