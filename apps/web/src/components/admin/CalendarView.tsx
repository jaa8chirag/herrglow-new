"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@herrglow/ui";
import type { DayScheduleResult, BeauticianDaySchedule, ScheduledBooking } from "@herrglow/core";

export function CalendarView({ schedule }: { schedule: DayScheduleResult }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "free" | "busy">("all");
  const [selectedSlot, setSelectedSlot] = useState<"all" | "morning" | "afternoon" | "evening">(
    "all"
  );
  const [selectedBeauticianModal, setSelectedBeauticianModal] =
    useState<BeauticianDaySchedule | null>(null);

  const onDateChange = (newDateStr: string) => {
    router.push(`/admin/calendar?date=${newDateStr}`);
  };

  const filteredBeauticians = schedule.beauticians.filter((b) => {
    // 1. Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchSpec = b.specialization?.toLowerCase().includes(q);
      const matchArea = b.coverageAreas.some((a) => a.toLowerCase().includes(q));
      const matchService = b.allServices.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchSpec && !matchArea && !matchService) return false;
    }

    // 2. Status filter
    if (filterMode === "free" && b.totalBookings > 0) return false;
    if (filterMode === "busy" && b.totalBookings === 0) return false;

    // 3. Slot availability filter
    if (selectedSlot === "morning" && b.slots.morning.isBooked) return false;
    if (selectedSlot === "afternoon" && b.slots.afternoon.isBooked) return false;
    if (selectedSlot === "evening" && b.slots.evening.isBooked) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* ───────── Top Control Bar: Date Navigator & KPIs ───────── */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] items-center">
        {/* Date Selector */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white p-3 shadow-soft">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onDateChange(schedule.previousDateStr)}
              className="grid size-9 place-items-center rounded-xl border border-line hover:bg-blush-50 text-plum-900 transition"
              title="Previous Day"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onDateChange(new Date().toISOString().slice(0, 10))}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-xl transition",
                schedule.isToday
                  ? "bg-plum-800 text-ivory shadow-xs"
                  : "border border-line bg-white text-plum-900 hover:bg-blush-50"
              )}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onDateChange(schedule.nextDateStr)}
              className="grid size-9 place-items-center rounded-xl border border-line hover:bg-blush-50 text-plum-900 transition"
              title="Next Day"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="h-5 w-px bg-line mx-1 hidden sm:block" />

          {/* Date Picker Input */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-rose-700 shrink-0" />
            <input
              type="date"
              value={schedule.targetDateStr}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
              className="rounded-xl border border-line bg-ivory-deep/40 px-3 py-1.5 text-xs font-semibold text-plum-950 focus:border-rose-600 focus:outline-none"
            />
          </div>

          <span className="text-xs font-serif font-bold text-plum-950 pl-1 hidden md:inline">
            {schedule.displayDate}
          </span>
        </div>

        {/* 4 Summary Stat Chips */}
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-xl border border-line bg-white p-2.5 text-center shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-ink-soft block">Beauticians</span>
            <span className="text-sm font-bold text-plum-950">{schedule.summary.totalPros}</span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 text-center shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">
              Available
            </span>
            <span className="text-sm font-bold text-emerald-900">{schedule.summary.freePros}</span>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 text-center shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">On Duty</span>
            <span className="text-sm font-bold text-amber-950">{schedule.summary.busyPros}</span>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-2.5 text-center shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-purple-800 block">Bookings</span>
            <span className="text-sm font-bold text-purple-950">
              {schedule.summary.totalBookings}
            </span>
          </div>
        </div>
      </div>

      {/* ───────── Filters & Quick Search ───────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-soft">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-ink-soft mr-1">Status:</span>
          {(
            [
              { id: "all", label: `All Staff (${schedule.summary.totalPros})` },
              { id: "free", label: `⚡ Free All Day (${schedule.summary.freePros})` },
              { id: "busy", label: `📅 Booked Today (${schedule.summary.busyPros})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilterMode(t.id)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer",
                filterMode === t.id
                  ? "bg-plum-800 text-ivory shadow-xs"
                  : "bg-ivory-deep/60 text-plum-900 hover:bg-blush-100"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Slot Availability Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-ink-soft mr-1">Slot Free:</span>
          {(
            [
              { id: "all", label: "Any" },
              { id: "morning", label: "Morning" },
              { id: "afternoon", label: "Afternoon" },
              { id: "evening", label: "Evening" },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSlot(s.id)}
              className={cn(
                "rounded-lg px-2 py-0.5 text-xs font-semibold transition cursor-pointer",
                selectedSlot === s.id
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "border border-line bg-white text-ink-soft hover:bg-blush-50"
              )}
            >
              {s.label}
            </button>
          ))}

          {/* Quick Search Input */}
          <div className="relative min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-ink-soft" />
            <input
              type="text"
              placeholder="Search staff, sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-line bg-ivory-deep/50 pl-7 pr-3 py-1 text-xs text-plum-950 placeholder:text-ink-soft/70 focus:border-rose-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ───────── Main Schedule Matrix Roster ───────── */}
      <div className="space-y-4">
        {filteredBeauticians.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-12 text-center text-sm text-ink-soft shadow-soft">
            <Users className="mx-auto size-8 text-ink-soft/60 mb-2" />
            <p className="font-semibold text-plum-950">
              No beauticians match your filter criteria.
            </p>
            <p className="text-xs mt-1">Try resetting the slot or availability filters above.</p>
          </div>
        ) : (
          filteredBeauticians.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-soft hover:border-plum-300 transition-all"
            >
              {/* Row Header: Beautician Info & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3 mb-3.5">
                <div className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-line bg-plum-100">
                    {b.photo ? (
                      <Image src={b.photo} alt={b.name} fill className="object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center font-bold text-plum-900 text-base">
                        {b.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBeauticianModal(b)}
                        className="font-bold text-base text-plum-950 hover:text-rose-700 hover:underline cursor-pointer"
                      >
                        {b.name}
                      </button>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/20 px-2 py-0.5 text-[10px] font-semibold text-gold-900 border border-gold-300/60">
                        <ShieldCheck className="size-3 text-gold-500" />
                        <span>Verified</span>
                      </span>
                      {b.totalBookings > 0 ? (
                        <span className="rounded-full bg-purple-100 text-purple-900 font-bold px-2 py-0.5 text-[10px]">
                          {b.totalBookings} {b.totalBookings === 1 ? "Booking" : "Bookings"}
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 text-[10px]">
                          ✓ 100% Free
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-soft">
                      {b.specialization || "Senior Beauty Specialist"}
                      {b.experienceYears ? ` · ${b.experienceYears} yrs exp` : ""}
                      {b.baseAddress ? ` · Base: ${b.baseAddress}` : ""}
                    </p>
                  </div>
                </div>

                {/* Right Action: WhatsApp Day Itinerary Dispatch */}
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${b.phone}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-line bg-white hover:bg-blush-50 px-3 py-1.5 text-xs font-semibold text-plum-900 transition"
                  >
                    <Phone className="size-3.5 text-ink-soft" />
                    <span>Call</span>
                  </a>
                  <a
                    href={b.dayWhatsAppSummaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#1f8f4e] px-3.5 py-1.5 text-xs font-bold text-white transition shadow-xs"
                    title="Send entire day appointment brief to this beautician via WhatsApp"
                  >
                    <MessageCircle className="size-3.5" />
                    <span>WhatsApp Daily Schedule</span>
                  </a>
                </div>
              </div>

              {/* 3 Slot Columns Matrix: Morning, Afternoon, Evening */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Morning Slot */}
                <SlotCard slotLabel="Morning (9:00 AM – 12:00 PM)" slotData={b.slots.morning} />

                {/* Afternoon Slot */}
                <SlotCard slotLabel="Afternoon (12:00 PM – 4:00 PM)" slotData={b.slots.afternoon} />

                {/* Evening Slot */}
                <SlotCard slotLabel="Evening (4:00 PM – 8:00 PM)" slotData={b.slots.evening} />
              </div>

              {/* Additional custom timed bookings if any */}
              {b.slots.custom.length > 0 && (
                <div className="mt-3 pt-3 border-t border-line space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                    Additional Appointments on this Date:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {b.slots.custom.map((cb) => (
                      <BookingPill key={cb.id} booking={cb} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ───────── Beautician Profile Modal (from Calendar) ───────── */}
      {selectedBeauticianModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-plum-950/70 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBeauticianModal(null);
          }}
        >
          <div className="relative flex flex-col w-full max-w-lg max-h-[85vh] overflow-hidden rounded-3xl border border-gold-400/30 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold">{selectedBeauticianModal.name}</h3>
                <p className="text-xs text-blush-200 mt-0.5">
                  {selectedBeauticianModal.specialization}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBeauticianModal(null)}
                className="grid size-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs text-plum-950">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-ink-soft">
                  Home Base Station:
                </span>
                <p className="font-semibold">
                  {selectedBeauticianModal.baseAddress || "Delhi NCR"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-ink-soft">
                  Covered Sectors & Localities:
                </span>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                  {selectedBeauticianModal.coverageAreas.map((a) => (
                    <span
                      key={a}
                      className="rounded-md bg-blush-50 px-2 py-0.5 text-[11px] border border-line"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-ink-soft">
                  Skills & Offerings:
                </span>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                  {selectedBeauticianModal.allServices.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-purple-50 text-purple-900 px-2 py-0.5 text-[11px] border border-purple-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-line bg-ivory flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBeauticianModal(null)}
                className="rounded-xl border border-line bg-white px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-blush-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SlotCard({
  slotLabel,
  slotData,
}: {
  slotLabel: string;
  slotData: { isBooked: boolean; booking: ScheduledBooking | null };
}) {
  const isBooked = slotData.isBooked && slotData.booking;
  const b = slotData.booking;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 flex flex-col justify-between transition-all",
        isBooked
          ? "border-purple-300 bg-purple-50/50 shadow-2xs"
          : "border-dashed border-emerald-300/80 bg-emerald-50/30"
      )}
    >
      <div>
        <div className="flex items-center justify-between text-[11px] font-semibold mb-2">
          <span className="text-plum-950 font-bold">{slotLabel}</span>
          {isBooked ? (
            <span className="rounded-full bg-purple-200 text-purple-900 px-2 py-0.5 text-[10px] font-bold">
              Booked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-800 text-[10px] font-bold">
              <CheckCircle2 className="size-3 text-emerald-600" />
              <span>Available</span>
            </span>
          )}
        </div>

        {isBooked && b ? (
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <Link
                href={`/admin/leads/${b.id}`}
                className="font-bold text-plum-950 hover:text-rose-700 hover:underline flex items-center gap-1"
                title="Open lead details"
              >
                <span>{b.clientName}</span>
                <ExternalLink className="size-3 text-ink-soft" />
              </Link>
              {b.bookingRef && (
                <span className="font-mono text-[10px] text-ink-soft">#{b.bookingRef}</span>
              )}
            </div>

            <p className="text-ink-soft text-[11px] truncate flex items-center gap-1">
              <MapPin className="size-3 shrink-0 text-rose-600" />
              <span className="truncate">{b.address}</span>
            </p>

            <p className="text-plum-900 font-medium text-[11px] truncate">💆‍♀️ {b.serviceTitle}</p>

            {b.finalAmount != null && (
              <p className="text-emerald-800 font-semibold text-[11px]">
                ₹{Math.round(b.finalAmount).toLocaleString("en-IN")}
              </p>
            )}
          </div>
        ) : (
          <div className="py-3 text-center text-xs text-emerald-800/80">
            <span className="block font-medium">Slot Open</span>
            <span className="text-[10px] text-ink-soft">Ready for doorstep booking</span>
          </div>
        )}
      </div>

      {isBooked && b && (
        <div className="mt-2.5 pt-2 border-t border-purple-200/60 flex items-center justify-between gap-2">
          <Link
            href={`/admin/leads/${b.id}`}
            className="text-[11px] font-semibold text-rose-800 hover:underline"
          >
            Manage Lead →
          </Link>
          {b.whatsappClientUrl && (
            <a
              href={b.whatsappClientUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1f8f4e] hover:text-[#187a41]"
              title="WhatsApp Client"
            >
              <MessageCircle className="size-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function BookingPill({ booking }: { booking: ScheduledBooking }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50/70 px-2.5 py-1 text-xs">
      <div className="truncate">
        <Link
          href={`/admin/leads/${booking.id}`}
          className="font-bold text-plum-950 hover:underline"
        >
          {booking.clientName}
        </Link>
        <span className="text-ink-soft ml-1">({booking.timeSlot || "Custom Slot"})</span>
      </div>
      <Link href={`/admin/leads/${booking.id}`} className="text-rose-700 font-medium ml-2">
        View →
      </Link>
    </div>
  );
}
