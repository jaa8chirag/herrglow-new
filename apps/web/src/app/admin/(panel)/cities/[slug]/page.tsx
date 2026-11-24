import Link from "next/link";
import { notFound } from "next/navigation";
import { cityLaunchPreview, listAreasAdmin } from "@herrglow/core";
import { PageHeader, Panel, Table, Td } from "@/components/admin/layout";
import { Pill, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";

export default async function CityDetail(props: PageProps<"/admin/cities/[slug]">) {
  await requireAdmin("cities");
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const q = one(sp.q)?.trim() || undefined;
  const page = Number(one(sp.page) ?? 1) || 1;
  const [data, preview] = await Promise.all([
    listAreasAdmin(slug, q, page),
    cityLaunchPreview(slug),
  ]);
  if (!data.city) notFound();
  return (
    <>
      <PageHeader
        title={data.city.name}
        subtitle={
          <>
            <Link className="underline" href="/admin/cities">
              ← Cities
            </Link>{" "}
            ·{" "}
            <Pill tone={data.city.isActive ? "good" : "neutral"}>
              {data.city.isActive ? "active" : "inactive"}
            </Pill>
          </>
        }
      />
      {preview && (
        <Panel
          title={data.city.isActive ? "What this city produces now" : "If you activated this city"}
          className="mb-6"
        >
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 xl:grid-cols-6">
            <div>
              <dt className="text-ink-soft">Active artists</dt>
              <dd className="font-serif text-2xl text-plum-800">{preview.activePros}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">City hub</dt>
              <dd className="font-serif text-2xl text-plum-800">
                {preview.cityHub ? "yes" : "no (needs 3 artists)"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-soft">Service×city eligible</dt>
              <dd className="font-serif text-2xl text-plum-800">{preview.serviceCityEligible}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Area pages</dt>
              <dd className="font-serif text-2xl text-plum-800">{preview.areaPages}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Text-only areas</dt>
              <dd className="font-serif text-2xl text-plum-800">{preview.areaTextOnly}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Artist pages</dt>
              <dd className="font-serif text-2xl text-plum-800">{preview.artistPages}</dd>
            </div>
          </dl>
          {!data.city.isActive && (
            <p className="mt-3 text-xs text-ink-soft">
              Service×city pages stay as drafts until reviewed and published in the review queue.
            </p>
          )}
        </Panel>
      )}
      <form className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search areas"
          className={inputCls + " max-w-xs"}
        />
        <button className="rounded-lg border border-line bg-white px-4 text-sm hover:bg-blush-100">
          Search
        </button>
      </form>
      <Table
        head={["Area", "Zone", "Artists", "Enquiries", "Landmarks", "Nearby", "Page", ""]}
        empty={data.items.length ? undefined : "No areas."}
      >
        {data.items.map((a) => (
          <tr key={a.id}>
            <Td className="font-medium">
              {a.name}
              {a.status === "INACTIVE" && (
                <>
                  {" "}
                  <Pill>inactive</Pill>
                </>
              )}
            </Td>
            <Td>{a.zone ?? "—"}</Td>
            <Td>{a.proCount}</Td>
            <Td>{a.leadCount}</Td>
            <Td>{a.landmarks.length}</Td>
            <Td>{a.nearby}</Td>
            <Td>
              {a.hasPage ? (
                <Pill tone="good">page</Pill>
              ) : (
                <span className="text-xs text-ink-soft">text only</span>
              )}
            </Td>
            <Td>
              <Link className="font-medium text-rose-700 underline" href={`/admin/areas/${a.id}`}>
                Edit
              </Link>
            </Td>
          </tr>
        ))}
      </Table>
      <p className="mt-3 flex items-center gap-3 text-sm text-ink-soft">
        {data.total} areas · page {page}/{data.pages}
        {page > 1 && (
          <Link className="underline" href={`?page=${page - 1}`}>
            Previous
          </Link>
        )}
        {page < data.pages && (
          <Link className="underline" href={`?page=${page + 1}`}>
            Next
          </Link>
        )}
      </p>
    </>
  );
}
