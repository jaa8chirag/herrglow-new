import Link from "next/link";
import { prisma } from "@herrglow/db";
import { STATUS_LABEL, leadCounts } from "@herrglow/core";
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
  CheckCircle2,
  Clock,
  Phone,
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

  const [leadsSummary, activePros, newApplications, recentBookings, revenueAgg] =
    await Promise.all([
      leadCounts(),
      prisma.pro.count({ where: { status: "ACTIVE" } }),
      prisma.proApplication.count({ where: { status: "NEW" } }),
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
    ]);

  const newCount = leadsSummary.byStatus.NEW ?? 0;
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
            Here is your salon summary for today. Everything you need to manage
            clients, appointments, and staff.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/leads?status=NEW"
            className="inline-flex items-center gap-1.5 rounded-xl bg-plum-800 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-plum-900"
          >
            <CalendarDays className="h-4 w-4" />
            <span>New Bookings ({newCount})</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-medium text-plum-900 shadow-soft transition hover:bg-blush-50"
          >
            <ExternalLink className="h-4 w-4 text-ink-soft" />
            <span>View Website</span>
          </Link>
        </div>
      </div>

      {sp.denied && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <span>Your login role does not have permission to view that section.</span>
        </div>
      )}

      {/* Action Banners if pending items */}
      {newCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-rose-50 to-blush-100 p-4 sm:p-5 ring-1 ring-rose-200 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
              <CalendarCheck2 className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-rose-950">
                {newCount} New Booking Request{newCount > 1 ? "s" : ""} Waiting!
              </p>
              <p className="text-xs text-rose-800/80">
                Customers are waiting for appointment confirmation and artist assignment.
              </p>
            </div>
          </div>
          <Link
            href="/admin/leads?status=NEW"
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-800"
          >
            <span>Review New Requests</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: New Bookings */}
        <Link
          href="/admin/leads?status=NEW"
          className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-rose-300 hover:shadow-lift"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              New Bookings
            </span>
            <span className="rounded-lg bg-rose-50 p-2 text-rose-700 group-hover:bg-rose-100 transition">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-plum-950">
            {newCount}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-rose-600 font-medium">
            <span>Needs attention</span>
            <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
          </p>
        </Link>

        {/* Card 2: Confirmed Appointments */}
        <Link
          href="/admin/leads?status=BOOKED"
          className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-emerald-300 hover:shadow-lift"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Confirmed Booked
            </span>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700 group-hover:bg-emerald-100 transition">
              <CheckCircle2 className="h-4 w-4" />
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
              <IndianRupee className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-plum-950">
            ₹{confirmedRev.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            From booked & completed visits
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
              <Users className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 font-serif text-3xl font-bold text-plum-950">
            {activePros}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {newApplications > 0
              ? `${newApplications} new applications waiting`
              : "Ready for appointments"}
          </p>
        </Link>
      </div>

      {/* Recent Bookings Section with 1-Click WhatsApp */}
      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-soft">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-serif text-lg font-bold text-plum-950">
              Latest Customer Bookings
            </h2>
            <p className="text-xs text-ink-soft">
              Most recent appointment requests and direct WhatsApp contacts
            </p>
          </div>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-800"
          >
            <span>View All ({leadsSummary.total})</span>
            <ArrowRight className="h-3.5 w-3.5" />
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
                          <span>{b.bookingRef || "NO-REF"}</span>
                        </Link>
                      </td>

                      {/* Customer Info */}
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-plum-950">{b.name}</p>
                        <p className="text-xs text-ink-soft flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{b.phone}</span>
                        </p>
                      </td>

                      {/* Service / Package */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="truncate font-medium text-plum-900" title={itemTitle}>
                          {itemTitle}
                        </p>
                        <p className="truncate text-xs text-ink-soft">
                          {b.locationText || "Delhi NCR"}
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
                              <MessageCircle className="h-3.5 w-3.5" />
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

      {/* Fast Shortcuts for Salon Managers */}
      <section>
        <h2 className="mb-3 font-serif text-lg font-bold text-plum-950">
          Salon Management Shortcuts
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/services"
            className="group rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-plum-300 hover:shadow-lift"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-plum-50 text-plum-800 group-hover:bg-plum-800 group-hover:text-white transition">
              <Scissors className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-bold text-plum-950">Services & Rate Cards</h3>
            <p className="mt-1 text-xs text-ink-soft">
              Update salon service prices, packages, and duration.
            </p>
          </Link>

          <Link
            href="/admin/pros"
            className="group rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-plum-300 hover:shadow-lift"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 group-hover:bg-rose-700 group-hover:text-white transition">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-bold text-plum-950">Our Beautician Team</h3>
            <p className="mt-1 text-xs text-ink-soft">
              Manage artist profiles, verified badges, and city coverage.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="group rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-plum-300 hover:shadow-lift"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-700 group-hover:text-white transition">
              <Settings className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-bold text-plum-950">WhatsApp & Business Settings</h3>
            <p className="mt-1 text-xs text-ink-soft">
              Configure salon WhatsApp number, alerts, and hours.
            </p>
          </Link>

          <Link
            href="/admin/seo"
            className="group rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:border-plum-300 hover:shadow-lift"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-bold text-plum-950">Google Search & SEO</h3>
            <p className="mt-1 text-xs text-ink-soft">
              Optimize titles, descriptions, and sitemap for Google rankings.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
