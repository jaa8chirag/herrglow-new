import { getAllServicesForExplorer } from "@herrglow/core";

/** Light list for the booking form's service picker. Public data only. */
export async function GET() {
  const rows = await getAllServicesForExplorer();
  return Response.json(rows.map((s) => ({ slug: s.slug, title: s.title, category: s.category.name })), { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
