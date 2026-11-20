import Link from "next/link";
import { prisma } from "@herrglow/db";
import { can, leadCounts } from "@herrglow/core";
import { PageHeader, Panel } from "@/components/admin/layout";
import { requireAdmin } from "@/lib/admin";

export default async function Dashboard(props: PageProps<"/admin">) {
  const me = await requireAdmin();
  const sp = await props.searchParams;
  const [leads, drafts, needsCoverage, pages, newApps] = await Promise.all([
    can(me.role, "leads") ? leadCounts() : null,
    prisma.serviceCity.count({ where: { contentStatus: "DRAFT", localContent: { not: null } } }),
    prisma.pro.count({ where: { status: "ACTIVE", coverage: { none: {} } } }),
    prisma.page.count({ where: { isIndexable: true, inSitemap: true } }),
    prisma.proApplication.count({ where: { status: "NEW" } }),
  ]);
  const card = (label: string, value: number | string, href: string, note?: string) => (
    <Link href={href} className="rounded-2xl border border-line bg-white p-5 shadow-soft hover:shadow-lift">
      <p className="text-sm text-ink-soft">{label}</p><p className="mt-1 font-serif text-4xl text-plum-800">{value}</p>{note && <p className="mt-1 text-xs text-ink-soft">{note}</p>}
    </Link>
  );
  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Signed in as ${me.email}`} />
      {sp.denied && <p className="mb-4 rounded-lg bg-amber-100 p-3 text-sm text-amber-800">Your role does not have access to that section.</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {leads && card("New leads", leads.byStatus.NEW ?? 0, "/admin/leads?status=NEW", `${leads.total} total`)}
        {leads && card("Out of area", leads.outOfArea, "/admin/leads?outOfArea=1", "demand outside the 3 cities")}
        {card("Drafts to review", drafts, "/admin/review", "service×city pages")}
        {card("Artists needing coverage", needsCoverage, "/admin/pros?filter=needs-coverage")}
        {can(me.role, "pros") && card("New artist applications", newApps, "/admin/applications?status=NEW")}
        {card("URLs in sitemap", pages, "/admin/seo")}
      </div>
      <Panel title="Quick links" className="mt-6"><p className="text-sm text-ink-soft">Use the sidebar to manage leads, review drafts, edit artists, services, cities, SEO, blogs and settings.</p></Panel>
    </>
  );
}
