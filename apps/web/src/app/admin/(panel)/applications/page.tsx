import Link from "next/link";
import { applicationCounts, listApplications } from "@herrglow/core";
import type { ApplicationStatus } from "@herrglow/db";
import { PageHeader, Table, Tabs, Td } from "@/components/admin/layout";
import { Pill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";

export default async function ApplicationsPage(props: PageProps<"/admin/applications">) {
  await requireAdmin("pros");
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const status = (
    ["NEW", "APPROVED", "REJECTED"].includes(one(sp.status) ?? "") ? one(sp.status) : undefined
  ) as ApplicationStatus | undefined;
  const [rows, counts] = await Promise.all([listApplications(status), applicationCounts()]);
  const tone = { NEW: "warn", APPROVED: "good", REJECTED: "neutral" } as const;
  return (
    <>
      <PageHeader
        title="Artist Join Applications"
        subtitle="Applications submitted by beauticians wishing to join HerrGlow. Review and approve new team members."
      />
      {one(sp.ok) && (
        <p className="mb-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">{one(sp.ok)}</p>
      )}
      <Tabs
        items={[
          { href: "/admin/applications", label: "All", active: !status },
          ...(["NEW", "APPROVED", "REJECTED"] as const).map((s) => ({
            href: `?status=${s}`,
            label: `${s[0]}${s.slice(1).toLowerCase()} (${counts[s] ?? 0})`,
            active: status === s,
          })),
        ]}
      />
      <Table
        head={[
          "Applicant",
          "Area & Operating In",
          "Offers",
          "Experience",
          "Received",
          "Status",
          "",
        ]}
        empty={rows.length ? undefined : "No applications."}
      >
        {rows.map((a) => (
          <tr key={a.id}>
            <Td className="font-medium">
              <div className="flex items-center gap-1.5">
                <span>{a.name}</span>
                {a.artistType === "PARLOUR_OWNER" && (
                  <span
                    className="inline-flex items-center rounded-full bg-purple-100 px-1.5 py-0.5 text-[0.65rem] font-bold text-purple-900"
                    title={`Parlour: ${a.parlourName ?? ""}`}
                  >
                    🏬 Parlour
                  </span>
                )}
                {a.latitude != null && a.longitude != null && (
                  <span
                    className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[0.65rem] font-bold text-emerald-800"
                    title={`GPS: ${Number(a.latitude).toFixed(3)}, ${Number(a.longitude).toFixed(3)}`}
                  >
                    📍 GPS
                  </span>
                )}
              </div>
              <span className="text-xs font-normal text-ink-soft">{a.phone}</span>
            </Td>
            <Td className="max-w-xs text-xs">
              {a.city}
              {a.travelRadius ? (
                <span className="mt-0.5 block font-medium text-rose-700">
                  {a.travelRadius >= 40 ? "Radius: All NCR" : `Radius: ≤ ${a.travelRadius} km`}
                </span>
              ) : null}
            </Td>
            <Td>{a.categories.join(", ") || "—"}</Td>
            <Td>{a.experienceYears != null ? `${a.experienceYears} yrs` : "—"}</Td>
            <Td className="whitespace-nowrap">{a.createdAt.toLocaleDateString("en-IN")}</Td>
            <Td>
              <Pill tone={tone[a.status]}>{a.status.toLowerCase()}</Pill>
            </Td>
            <Td>
              <Link
                className="font-medium text-rose-700 underline"
                href={`/admin/applications/${a.id}`}
              >
                Open
              </Link>
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
