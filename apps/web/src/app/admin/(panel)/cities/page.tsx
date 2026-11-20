import Link from "next/link";
import { can, listCitiesAdmin } from "@herrglow/core";
import { PageHeader, Table, Td } from "@/components/admin/layout";
import { Pill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { toggleCity } from "./actions";

export default async function CitiesPage(props: PageProps<"/admin/cities">) {
  const me = await requireAdmin("cities");
  const sp = await props.searchParams;
  const ok = Array.isArray(sp.ok) ? sp.ok[0] : sp.ok;
  const cities = await listCitiesAdmin();
  const owner = can(me.role, "cities.toggle");
  return (
    <>
      <PageHeader title="Cities & areas" subtitle="Inactive cities keep all their data but have no pages, sitemap entries or navigation. Their old URLs return 410." />
      {ok && <p className="mb-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">{ok}</p>}
      <Table head={["City", "Areas", "Active artists", "Hub page", "Status", "Launch switch"]}>
        {cities.map((c) => (
          <tr key={c.slug}>
            <Td className="font-medium"><Link className="text-rose-700 underline" href={`/admin/cities/${c.slug}`}>{c.name}</Link></Td>
            <Td>{c.areas}</Td>
            <Td>{c.activePros}{c.activePros < 3 && <span className="ml-1 text-xs text-amber-700">(needs 3 for a hub)</span>}</Td>
            <Td>{c.hasHub ? <Pill tone="good">live</Pill> : <Pill>none</Pill>}</Td>
            <Td><Pill tone={c.isActive ? "good" : "neutral"}>{c.isActive ? "active" : "inactive"}</Pill></Td>
            <Td>
              {owner ? (
                <form action={toggleCity} className="flex items-center gap-2">
                  <input type="hidden" name="slug" value={c.slug} /><input type="hidden" name="active" value={c.isActive ? "0" : "1"} />
                  <button className={`rounded-lg px-3 py-1.5 text-xs font-medium ${c.isActive ? "border border-line bg-white text-rose-700 hover:bg-rose-50" : "bg-plum-700 text-ivory hover:bg-plum-800"}`}>{c.isActive ? "Deactivate" : "Activate"}</button>
                </form>
              ) : <span className="text-xs text-ink-soft">owner only</span>}
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
