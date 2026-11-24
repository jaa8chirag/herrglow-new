import { listRedirects } from "@herrglow/core";
import { PageHeader, Panel, Table, Td } from "@/components/admin/layout";
import { Field, Pill, SubmitButton, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { addRedirect, removeRedirect } from "./actions";

export default async function RedirectsPage(props: PageProps<"/admin/redirects">) {
  await requireAdmin("redirects");
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const q = one(sp.q)?.trim() || undefined;
  const rows = await listRedirects(q);
  return (
    <>
      <PageHeader
        title="Redirects"
        subtitle="301 (moved) and 410 (gone). Chains, loops and redirects away from live pages are rejected."
      />
      {one(sp.ok) && (
        <p className="mb-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">{one(sp.ok)}</p>
      )}
      {one(sp.err) && (
        <p className="mb-4 rounded-lg bg-rose-100 p-3 text-sm text-rose-700">{one(sp.err)}</p>
      )}
      <Panel title="Add a rule" className="mb-6">
        <form
          action={addRedirect}
          className="grid items-end gap-3 md:grid-cols-[1.3fr_1.3fr_150px_1fr_auto]"
        >
          <Field label="From path">
            <input name="fromPath" placeholder="/old-page" required className={inputCls} />
          </Field>
          <Field label="To path (301 only)">
            <input name="toPath" placeholder="/new-page" className={inputCls} />
          </Field>
          <Field label="Type">
            <select name="code" className={inputCls}>
              <option value="MOVED_301">301 moved</option>
              <option value="GONE_410">410 gone</option>
            </select>
          </Field>
          <Field label="Note">
            <input name="note" className={inputCls} />
          </Field>
          <SubmitButton>Save</SubmitButton>
        </form>
      </Panel>
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search" className={inputCls + " max-w-xs"} />
        <button className="rounded-lg border border-line bg-white px-4 text-sm hover:bg-blush-100">
          Search
        </button>
      </form>
      <Table
        head={["From", "To", "Type", "Note", ""]}
        empty={rows.length ? undefined : "No rules."}
      >
        {rows.map((r) => (
          <tr key={r.fromPath}>
            <Td className="font-mono text-xs">{r.fromPath}</Td>
            <Td className="font-mono text-xs">{r.toPath ?? "—"}</Td>
            <Td>
              <Pill tone={r.code === "MOVED_301" ? "info" : "bad"}>
                {r.code === "MOVED_301" ? "301" : "410"}
              </Pill>
            </Td>
            <Td className="text-ink-soft">{r.note}</Td>
            <Td>
              <form action={removeRedirect}>
                <input type="hidden" name="fromPath" value={r.fromPath} />
                <button className="text-xs text-rose-700 underline">Delete</button>
              </form>
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
