import Link from "next/link";
import { prisma } from "@herrglow/db";
import { STATUS_LABEL, leadCounts, getAnalyticsOverview } from "@herrglow/core";
import type { LeadStatus } from "@herrglow/db";
import { PageHeader, Panel } from "@/components/admin/layout";
import { Pill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { whatsappLink } from "@/lib/whatsapp";
import {
  CalendarDays,
  CalendarCheck2,
  Users,
  IndianRupee,
  MessageCircle,
  ExternalLink,
  ArrowRight,
  Scissors,
  Settings,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  Zap,
  MapPin,
  UserCheck,
  BarChart3,
  Flame,
  Search,
  Eye,
} from "lucide-react";

const tone = (s: LeadStatus) =>
  s === "NEW"
    ? "info"
    : s === "BOOKED" || s === "COMPLETED"
    ? "good"
    : s === "LOST"
    ? "bad"
    : "warn";

const formatPrice = (amt: unknown) => {
  if (amt == null) return "—";
  const num = Number(amt);
  return isNaN(num) ? "—" : `₹${num.toLocaleString("en-IN")}`;
};

const formatDate = (d: Date | null) => {
  if (!d) return "Not set";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default async function Dashboard(props: PageProps<"/admin">) {
  const me = await requireAdmin();
  const sp = await props.searchParams;

  const [
    leadsSummary,
    activePros,
    newApplications,
    unassignedBookings,
    recentBookings,
    revenueAgg,
    analyticsSummary,
  ] = await Promise.all([
    leadCounts(),
    prisma.pro.count({ where: { status: "ACTIVE" } }),
    prisma.proApplication.count({ where: { status: "NEW" } }),
    prisma.lead.findMany({
      where: {
        proId: null,
        status: { in: ["NEW", "BOOKED", "CONTACTED", "QUOTED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        bookingRef: true,
        name: true,
        phone: true,
        eventDate: true,
        timeSlot: true,
        locationText: true,
        amount: true,
        finalAmount: true,
        package: { select: { title: true } },
        services: { select: { service: { select: { title: true } } } },
      },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        bookingRef: true,
        name: true,
        phone: true,
        status: true,
        createdAt: true,
        eventDate: true,
        timeSlot: true,
        locationText: true,
        amount: true,
        finalAmount: true,
        package: { select: { title: true } },
        services: { select: { service: { select: { title: true } } } },
        pro: { select: { name: true } },
      },
    }),
    prisma.lead.aggregate({
      _sum: { finalAmount: true, amount: true },
      where: { status: { in: ["BOOKED", "COMPLETED"] } },
    }),
    getAnalyticsOverview(7),
  ]);

  const newCount = leadsSummary.byStatus.NEW ?? 0;
  const unassignedCount = leadsSummary.unassigned ?? 0;
  const bookedCount = leadsSummary.byStatus.BOOKED ?? 0;
  const confirmedRev = Number(
    revenueAgg._sum.finalAmount ?? revenueAgg._sum.amount ?? 0
  );

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-plum-950 sm:text-3xl">
            Welcome back, {me.name || "Manager"} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            HerrGlow Salon &amp; Beautician Operations. Easily match bookings to the nearest artists and manage appointments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/leads?unassigned=1"
            className="inline-flex items-center gap-1.5 rounded-xl bg-plum-800 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-plum-900"
          >
            <Zap className="size-4 text-gold-400 fill-gold-400" />
            <span>Assign Beauticians ({unassignedCount})</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-medium text-plum-900 shadow-soft transition hover:bg-blush-50"
          >
            <ExternalLink className="size-4 text-ink-soft" />
            <span>View Website</span>
          </Link>
        </div>
      </div>

      {sp.denied && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
          <AlertCircle className="size-5 shrink-0 text-amber-600" />
          <span>Your login role does not have permission to view that section.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Needs Beautician Assignment */}
        <Link
          href="/admin/leads?unassigned=1"
          className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-gold-400 hover:shadow-lift"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Needs Beautician
            </span>
            <span className="rounded-lg bg-amber-50 p-2 text-amber-700 group-hover:bg-amber-100 transition">
              <Zap className="size-4 text-gold-600 fill-gold-600" />
            </span>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-plum-950">
            {unassignedCount}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-rose-600 font-bold">
            <span>Awaiting nearest artist</span>
            <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
          </p>
        </Link>

        {/* Card 2: Confirmed Appointments */}
        <Link
          href="/admin/leads?status=BOOKED"
          className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-emerald-300 hover:shadow-lift"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Confirmed Bookings
            </span>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700 group-hover:bg-emerald-100 transition">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-plum-950">
            {bookedCount}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {leadsSummary.total} total customer enquiries
          </p>
        </Link>

        {/* Card 3: Revenue / Value */}
        <div className="relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Confirmed Revenue
            </span>
            <span className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <IndianRupee className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-plum-950">
            ₹{confirmedRev.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            10% advance deposit secured
          </p>
        </div>

        {/* Card 4: Active Artists */}
        <Link
          href="/admin/pros"
          className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-plum-300 hover:shadow-lift"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Active Beauticians
            </span>
            <span className="rounded-lg bg-plum-50 p-2 text-plum-700 group-hover:bg-plum-100 transition">
              <Users className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-plum-950">
            {activePros}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {newApplications > 0
              ? `${newApplications} applications waiting`
              : "Ready for appointments"}
          </p>
        </Link>
      </div>

      {/* ───────── URGENT DISPATCH SECTION: AWAITING BEAUTICIAN ───────── */}
      {unassignedBookings.length > 0 && (
        <section className="rounded-3xl border-2 border-gold-300/80 bg-gradient-to-br from-gold-50/50 via-white to-blush-50/40 p-5 sm:p-6 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gold-200/60 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-plum-800 text-white shadow-xs">
                <Zap className="size-4.5 text-gold-400 fill-gold-400" />
              </span>
              <div>
                <h2 className="font-serif text-lg font-bold text-plum-950">
                  Urgent Dispatch: Bookings Awaiting Beauticians
                </h2>
                <p className="text-xs text-ink-soft">
                  Assign the nearest verified artist based on customer location and service requirements.
                </p>
              </div>
            </div>
            <Link
              href="/admin/leads?unassigned=1"
              className="text-xs font-bold text-rose-800 hover:underline flex items-center gap-1"
            >
              <span>View all {unassignedCount} unassigned</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {unassignedBookings.map((b) => {
              const itemTitle =
                b.package?.title ??
                b.services.map((s) => s.service.title).join(", ") ??
                "Salon Service";
              const waUrl = whatsappLink(
                b.phone,
                `Hi ${b.name}, this is HerrGlow Salon regarding your appointment #${b.bookingRef ?? ""}.`
              );

              return (
                <div
                  key={b.id}
                  className="rounded-2xl border border-line bg-white p-4 shadow-2xs hover:border-plum-300 transition flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-bold text-rose-700">
                        #{b.bookingRef || b.id.slice(0, 8)}
                      </span>
                      <span className="font-bold text-plum-950">
                        {formatPrice(b.finalAmount ?? b.amount)}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-plum-950 truncate">{b.name}</h3>
                    <p className="text-xs font-semibold text-rose-900 truncate mt-0.5">
                      {itemTitle}
                    </p>

                    <div className="mt-2 text-xs text-ink-soft flex items-center justify-between">
                      <span className="truncate max-w-[160px]">📍 {b.locationText || "Delhi NCR"}</span>
                      <span>📅 {formatDate(b.eventDate)} ({b.timeSlot || "Flexible"})</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line flex items-center justify-between gap-2">
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl bg-[#25D366] px-2.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#1f8f4e]"
                      >
                        <MessageCircle className="size-3.5" />
                        <span>Client</span>
                      </a>
                    )}
                    <Link
                      href={`/admin/leads/${b.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-plum-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-soft hover:bg-plum-950 transition active:scale-[0.98]"
                    >
                      <Zap className="size-3 text-gold-400 fill-gold-400" />
                      <span>⚡ Assign Nearest Pro</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Bookings Section */}
      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-soft">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-serif text-lg font-bold text-plum-950">
              Latest Customer Bookings
            </h2>
            <p className="text-xs text-ink-soft">
              Most recent appointment requests, assigned beauticians, and WhatsApp actions
            </p>
          </div>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-800"
          >
            <span>View All ({leadsSummary.total})</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-12 text-center text-sm text-ink-soft">
            No bookings recorded yet. New appointments booked on the website will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-ivory-deep/80 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Service / Package</th>
                  <th className="px-4 py-3">Date & Slot</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Assigned Beautician</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentBookings.map((b) => {
                  const itemTitle =
                    b.package?.title ??
                    b.services.map((s) => s.service.title).join(", ") ??
                    "Custom Service";

                  const priceDisplay = formatPrice(b.finalAmount ?? b.amount);
                  const waUrl = whatsappLink(
                    b.phone,
                    `Hi ${b.name}, this is HerrGlow Salon regarding your booking #${b.bookingRef ?? ""}. How may we help you?`
                  );

                  return (
                    <tr key={b.id} className="hover:bg-blush-50/40 transition">
                      {/* Booking ID */}
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-rose-700">
                        <Link
                          href={`/admin/leads/${b.id}`}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>#{b.bookingRef || b.id.slice(0, 8)}</span>
                        </Link>
                      </td>

                      {/* Customer Info */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-plum-950">{b.name}</p>
                        <p className="text-xs text-ink-soft flex items-center gap-1">
                          <Phone className="size-3" />
                          <span>{b.phone}</span>
                        </p>
                      </td>

                      {/* Service / Package */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="truncate font-medium text-plum-900" title={itemTitle}>
                          {itemTitle}
                        </p>
                        <p className="truncate text-xs text-ink-soft">
                          📍 {b.locationText || "Delhi NCR"}
                        </p>
                      </td>

                      {/* Date & Slot */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                        <p className="font-medium text-plum-900">
                          {formatDate(b.eventDate)}
                        </p>
                        <p className="text-ink-soft">{b.timeSlot || "Flexible slot"}</p>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-plum-950">
                        {priceDisplay}
                      </td>

                      {/* Assigned Pro */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {b.pro?.name ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="size-3 text-emerald-600" />
                            <span>{b.pro.name}</span>
                          </span>
                        ) : (
                          <Link
                            href={`/admin/leads/${b.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-plum-950 bg-gold-100 hover:bg-gold-200 px-2 py-0.5 rounded-md border border-gold-300 transition"
                          >
                            <Zap className="size-3 text-gold-700 fill-gold-700" />
                            <span>Assign Pro</span>
                          </Link>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Pill tone={tone(b.status)}>{STATUS_LABEL[b.status]}</Pill>
                      </td>

                      {/* WhatsApp Button */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#1f8f4e] transition"
                              title="Chat with customer on WhatsApp"
                            >
                              <MessageCircle className="size-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <Link
                            href={`/admin/leads/${b.id}`}
                            className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-medium text-plum-900 hover:bg-blush-100 transition"
                          >
                            Manage
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ───────── DEMAND & SEARCH INTELLIGENCE PREVIEW ───────── */}
      <section className="rounded-3xl border border-line bg-white p-5 sm:p-6 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-plum-800 text-white shadow-xs">
              <BarChart3 className="size-4.5 text-gold-400" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-bold text-plum-950">
                Customer Demand &amp; Search Intelligence
              </h2>
              <p className="text-xs text-ink-soft">
                Live customer interest, most viewed salon services, and unserved search queries (Last 7 Days)
              </p>
            </div>
          </div>
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-plum-800 hover:text-plum-950 transition"
          >
            <span>View Full Demand Analytics</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top Viewed Services */}
          <div className="rounded-2xl border border-line bg-[#fdfbfa] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                <Flame className="size-3.5 text-rose-600" />
                Most Viewed Services
              </span>
              <span className="text-[11px] font-semibold text-ink-soft">Views</span>
            </div>
            {analyticsSummary.topServices.length === 0 ? (
              <p className="py-4 text-center text-xs text-ink-soft">No views recorded yet.</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {analyticsSummary.topServices.slice(0, 4).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 border-b border-line/60 pb-1.5 last:border-none">
                    <span className="font-medium text-ink truncate" title={s.title}>{s.title}</span>
                    <span className="font-bold text-plum-900 bg-plum-50 px-2 py-0.5 rounded-full shrink-0">
                      {s.viewCount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Top Customer Searches */}
          <div className="rounded-2xl border border-line bg-[#fdfbfa] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
                <Search className="size-3.5 text-blue-600" />
                Top Searched Queries
              </span>
              <span className="text-[11px] font-semibold text-ink-soft">Count</span>
            </div>
            {analyticsSummary.topSearches.length === 0 ? (
              <p className="py-4 text-center text-xs text-ink-soft">No searches recorded yet.</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {analyticsSummary.topSearches.slice(0, 4).map((s) => (
                  <li key={s.query} className="flex items-center justify-between gap-2 border-b border-line/60 pb-1.5 last:border-none">
                    <span className="font-medium text-ink truncate">&ldquo;{s.query}&rdquo;</span>
                    <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                      {s.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Zero-Result Demand Alert */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 text-amber-600" />
                Missed Demand (0 Results)
              </span>
              <Pill tone={analyticsSummary.zeroResultSearches.length > 0 ? "warn" : "good"}>
                {analyticsSummary.zeroResultSearches.length} items
              </Pill>
            </div>
            {analyticsSummary.zeroResultSearches.length === 0 ? (
              <p className="py-4 text-center text-xs text-emerald-800 font-medium">All searches matched live services!</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {analyticsSummary.zeroResultSearches.slice(0, 4).map((s) => (
                  <li key={s.query} className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-1.5 last:border-none">
                    <span className="font-semibold text-amber-950 truncate">&ldquo;{s.query}&rdquo;</span>
                    <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                      {s.count} searches
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Fast Shortcuts for Salon Managers */}
      <section>
        <h2 className="mb-3 font-serif text-lg font-bold text-plum-950">
          Salon Operations Shortcuts
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/leads?unassigned=1"
            className="group rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-plum-300 hover:shadow-lift"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-gold-50 text-gold-800 group-hover:bg-plum-800 group-hover:text-white transition">
              <Zap className="size-5 text-gold-600 group-hover:text-gold-300" />
            </div>
            <h3 className="mt-3 font-bold text-plum-950">Nearest Pro Dispatch</h3>
            <p className="mt-1 text-xs text-ink-soft">
              Quickly find &amp; assign nearest artists to pending bookings.
            </p>
          </Link>

          <Link
            href="/admin/pros"
            className="group rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-plum-300 hover:shadow-lift"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 group-hover:bg-rose-700 group-hover:text-white transition">
              <Users className="size-5" />
            </div>
            <h3 className="mt-3 font-bold text-plum-950">Beautician Team</h3>
            <p className="mt-1 text-xs text-ink-soft">
              Manage artist profiles, locations, travel radius &amp; services.
            </p>
          </Link>

          <Link
            href="/admin/services"
            className="group rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-plum-300 hover:shadow-lift"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-plum-50 text-plum-800 group-hover:bg-plum-800 group-hover:text-white transition">
              <Scissors className="size-5" />
            </div>
            <h3 className="mt-3 font-bold text-plum-950">Services & Rate Cards</h3>
            <p className="mt-1 text-xs text-ink-soft">
              Update salon service prices, packages, and duration.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="group rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-plum-300 hover:shadow-lift"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-700 group-hover:text-white transition">
              <Settings className="size-5" />
            </div>
            <h3 className="mt-3 font-bold text-plum-950">Business & WhatsApp</h3>
            <p className="mt-1 text-xs text-ink-soft">
              Configure salon WhatsApp number, 10% deposits, and hours.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
