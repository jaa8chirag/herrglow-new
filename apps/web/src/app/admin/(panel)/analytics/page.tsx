import Link from "next/link";
import { getAnalyticsOverview } from "@herrglow/core";
import { PageHeader, Panel, Table, Td } from "@/components/admin/layout";
import { Pill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import {
  TrendingUp,
  Search,
  Eye,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ExternalLink,
  Target,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Service Views & Demand Analytics | HerrGlow Admin",
};

interface PageProps {
  searchParams: Promise<{ days?: string }>;
}

export default async function AnalyticsPage(props: PageProps) {
  await requireAdmin();
  const searchParams = await props.searchParams;
  const days = searchParams.days ? parseInt(searchParams.days, 10) || 30 : 30;

  const data = await getAnalyticsOverview(days);
  const { topServices, topSearches, zeroResultSearches, recentSearches, stats } = data;

  return (
    <div className="space-y-8">
      {/* Page Header with Time Range Selector */}
      <PageHeader
        title="Service Views & Demand Analytics"
        subtitle={`Track customer interest, top searched services, and unserved demand over the last ${days} days.`}
        actions={
          <div className="flex items-center gap-2">
            {[
              { label: "7 Days", val: 7 },
              { label: "30 Days", val: 30 },
              { label: "90 Days", val: 90 },
            ].map((t) => (
              <Link
                key={t.val}
                href={`/admin/analytics?days=${t.val}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  days === t.val
                    ? "bg-plum-800 text-white shadow-xs"
                    : "border border-line bg-white text-ink-soft hover:bg-blush-50 hover:text-ink"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="border-l-4 border-l-plum-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Total Service Views</span>
            <span className="rounded-lg bg-plum-100 p-2 text-plum-800">
              <Eye className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-ink">{stats.totalViews.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-ink-soft">Across verified salon services</p>
        </Panel>

        <Panel className="border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Total User Searches</span>
            <span className="rounded-lg bg-blue-100 p-2 text-blue-700">
              <Search className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-ink">{stats.totalSearches.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-ink-soft">Queries logged from service explorer</p>
        </Panel>

        <Panel className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Zero-Result Searches</span>
            <span className="rounded-lg bg-amber-100 p-2 text-amber-700">
              <AlertTriangle className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-amber-900">{stats.zeroResultCount.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-ink-soft">
            <span className="font-semibold text-amber-700">{stats.zeroResultRate}%</span> of searches found 0 results
          </p>
        </Panel>

        <Panel className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Top Converting Service</span>
            <span className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <Target className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-sm font-bold text-ink truncate" title={stats.topConvertingService ?? "Awaiting view data"}>
            {stats.topConvertingService ?? "Collecting metrics..."}
          </p>
          <p className="mt-1 text-xs text-ink-soft">Highest lead to view ratio</p>
        </Panel>
      </div>

      {/* Main Grid: Zero Result Alert + Most Viewed Services */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Zero-Result Searches (Demand Alert) */}
        <Panel className="border-amber-200/80 bg-linear-to-b from-amber-50/40 to-white">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/10 p-1.5 text-amber-700">
                <AlertTriangle className="size-4" />
              </span>
              <div>
                <h2 className="!text-base font-bold text-ink">Unserved Demand (Zero-Result Searches)</h2>
                <p className="text-xs text-ink-soft">Services users searched for that had 0 matches on your site</p>
              </div>
            </div>
            <Pill tone={zeroResultSearches.length > 0 ? "warn" : "good"}>
              {zeroResultSearches.length > 0 ? "Action Required" : "All Served"}
            </Pill>
          </div>

          {zeroResultSearches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-white/60 p-8 text-center">
              <CheckCircle2 className="mx-auto size-8 text-emerald-600" />
              <p className="mt-2 text-sm font-semibold text-ink">Zero Missed Searches!</p>
              <p className="mt-1 text-xs text-ink-soft">
                All logged searches in the last {days} days returned matching services.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-line bg-white">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-ivory-deep font-semibold text-ink-soft">
                  <tr>
                    <th className="px-3.5 py-2.5">Searched Term</th>
                    <th className="px-3.5 py-2.5 text-right">Attempts</th>
                    <th className="px-3.5 py-2.5">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {zeroResultSearches.map((s) => (
                    <tr key={s.query} className="hover:bg-amber-50/30 transition">
                      <td className="px-3.5 py-2.5 font-medium text-ink">
                        <span className="font-semibold text-amber-900">&ldquo;{s.query}&rdquo;</span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-bold text-ink">{s.count}</td>
                      <td className="px-3.5 py-2.5">
                        <Link
                          href={`/admin/services/new`}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100"
                        >
                          <span>+ Add Service</span>
                          <ArrowUpRight className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Top Searched Queries */}
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-500/10 p-1.5 text-blue-700">
                <Search className="size-4" />
              </span>
              <div>
                <h2 className="!text-base font-bold text-ink">Top Searched Queries</h2>
                <p className="text-xs text-ink-soft">Most frequent customer searches in the services explorer</p>
              </div>
            </div>
          </div>

          {topSearches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line p-8 text-center text-xs text-ink-soft">
              No searches logged yet. Searches will automatically appear as users use the website.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-line bg-white">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-ivory-deep font-semibold text-ink-soft">
                  <tr>
                    <th className="px-3.5 py-2.5">Query</th>
                    <th className="px-3.5 py-2.5 text-right">Searches</th>
                    <th className="px-3.5 py-2.5 text-right">Avg Results Found</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {topSearches.map((s) => (
                    <tr key={s.query} className="hover:bg-blush-50/40 transition">
                      <td className="px-3.5 py-2.5 font-medium text-ink">
                        <span className="text-plum-900 font-semibold">&ldquo;{s.query}&rdquo;</span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-bold text-ink">{s.count}</td>
                      <td className="px-3.5 py-2.5 text-right">
                        <Pill tone={s.avgResults > 0 ? "good" : "warn"}>{s.avgResults} found</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {/* Top Viewed Services & Conversion Funnel Table */}
      <Panel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-plum-500/10 p-1.5 text-plum-800">
              <Flame className="size-4" />
            </span>
            <div>
              <h2 className="!text-base font-bold text-ink">Most Viewed Services &amp; Conversion Funnel</h2>
              <p className="text-xs text-ink-soft">
                Traffic volume vs lead generation per service to identify high-interest services and pricing drop-offs
              </p>
            </div>
          </div>
          <Link
            href="/admin/services"
            className="text-xs font-semibold text-plum-800 hover:text-plum-900 hover:underline"
          >
            Manage All Services &rarr;
          </Link>
        </div>

        {topServices.length === 0 ? (
          <p className="p-6 text-center text-xs text-ink-soft">No service views recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-ivory-deep font-semibold text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Page Views</th>
                  <th className="px-4 py-3 text-right">Leads / Bookings</th>
                  <th className="px-4 py-3 text-right">Conversion Rate</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {topServices.map((svc) => (
                  <tr key={svc.id} className="hover:bg-blush-50/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div>
                          <p className="font-semibold text-ink">{svc.title}</p>
                          <p className="text-[11px] text-ink-soft">/services/{svc.categorySlug}/{svc.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone="neutral">{svc.categoryName}</Pill>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-ink">
                      {svc.offerPrice ? (
                        <span>₹{svc.offerPrice.toLocaleString("en-IN")}</span>
                      ) : svc.price ? (
                        <span>₹{svc.price.toLocaleString("en-IN")}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-ink">
                      {svc.viewCount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-800">
                      {svc.leadCount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                          svc.conversionRate >= 5
                            ? "bg-emerald-100 text-emerald-800"
                            : svc.conversionRate > 0
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {svc.conversionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/services/${svc.categorySlug}/${svc.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-plum-800 hover:text-plum-900"
                      >
                        <span>View</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Real-time Live Search Feed */}
      <Panel>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-purple-500/10 p-1.5 text-purple-700">
              <Clock className="size-4" />
            </span>
            <div>
              <h2 className="!text-base font-bold text-ink">Recent Real-Time Searches</h2>
              <p className="text-xs text-ink-soft">Live stream of latest searches executed by visitors on HerrGlow</p>
            </div>
          </div>
        </div>

        {recentSearches.length === 0 ? (
          <p className="p-6 text-center text-xs text-ink-soft">No recent searches yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-ivory-deep font-semibold text-ink-soft">
                <tr>
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Searched Query</th>
                  <th className="px-4 py-2.5">Location Hub</th>
                  <th className="px-4 py-2.5 text-right">Results Found</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentSearches.map((r) => (
                  <tr key={r.id} className="hover:bg-blush-50/20 transition">
                    <td className="px-4 py-2 text-ink-soft font-mono text-[11px]">
                      {new Date(r.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-4 py-2 font-medium text-ink">
                      <span className="font-semibold text-plum-900">&ldquo;{r.query}&rdquo;</span>
                    </td>
                    <td className="px-4 py-2 text-ink-soft">
                      {r.citySlug ? (
                        <span className="inline-flex items-center gap-1 capitalize">
                          <MapPin className="size-3 text-gold-600" />
                          {r.citySlug}
                        </span>
                      ) : (
                        <span className="text-gray-400">All Delhi NCR</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Pill tone={r.resultsCount > 0 ? "good" : "warn"}>
                        {r.resultsCount} {r.resultsCount === 1 ? "result" : "results"}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
