"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  UserCheck,
  UserX,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@herrglow/ui";
import type { MatchedBeautician } from "@herrglow/core";
import { assignNearestPro, unassignPro } from "@/app/admin/(panel)/leads/actions";

export interface ProAssignerProps {
  leadId: string;
  leadName: string;
  leadLocation: string;
  serviceTitle: string;
  matches: MatchedBeautician[];
  currentAssignedId: string | null;
}

export function ProAssigner({
  leadId,
  leadName,
  leadLocation,
  serviceTitle,
  matches,
  currentAssignedId,
}: ProAssignerProps) {
  const [assignedId, setAssignedId] = useState<string | null>(currentAssignedId);
  const [selectedPro, setSelectedPro] = useState<MatchedBeautician | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChip, setFilterChip] = useState<
    "all" | "free" | "nearby" | "skill" | "top" | "coverage"
  >("all");

  const currentlyAssigned = matches.find((m) => m.id === assignedId);

  // Filter count statistics
  const freeCount = matches.filter((m) => m.isAvailable && !m.hasConflict).length;
  const nearbyCount = matches.filter((m) => m.distanceKm != null && m.distanceKm <= 7).length;
  const skillCount = matches.filter((m) => m.serviceMatch).length;
  const topCount = matches.filter((m) => m.matchScore >= 75).length;
  const coverageCount = matches.filter((m) => m.coversAreaDirectly).length;

  // Close modal on ESC key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPro(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleAssign = (proId: string) => {
    startTransition(async () => {
      try {
        await assignNearestPro(leadId, proId);
        setAssignedId(proId);
        if (selectedPro && selectedPro.id === proId) {
          setSelectedPro((prev) => (prev ? { ...prev, isAssigned: true } : null));
        }
      } catch (err) {
        console.error("Failed to assign beautician:", err);
      }
    });
  };

  const handleUnassign = () => {
    if (!confirm("Are you sure you want to unassign this beautician?")) return;
    startTransition(async () => {
      try {
        await unassignPro(leadId);
        setAssignedId(null);
        if (selectedPro) {
          setSelectedPro((prev) => (prev ? { ...prev, isAssigned: false } : null));
        }
      } catch (err) {
        console.error("Failed to unassign beautician:", err);
      }
    });
  };

  const filteredMatches = matches.filter((m) => {
    // 1. Quick Filter Chip
    if (filterChip === "free" && (!m.isAvailable || m.hasConflict)) return false;
    if (filterChip === "nearby" && (m.distanceKm == null || m.distanceKm > 7)) return false;
    if (filterChip === "skill" && !m.serviceMatch) return false;
    if (filterChip === "top" && m.matchScore < 75) return false;
    if (filterChip === "coverage" && !m.coversAreaDirectly) return false;

    // 2. Text Search Query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.specialization?.toLowerCase().includes(q) ||
      m.coverageAreas.some((a) => a.toLowerCase().includes(q)) ||
      m.allServiceTitles.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* ───────── 1. CURRENTLY ASSIGNED ARTIST CARD ───────── */}
      {currentlyAssigned ? (
        <div className="rounded-2xl border-2 border-emerald-400/80 bg-gradient-to-br from-emerald-50/70 via-white to-blush-50/40 p-4 sm:p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-3 mb-3.5">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                <Check className="size-3.5 stroke-[3]" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                Assigned Beautician
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedPro(currentlyAssigned)}
                className="text-xs font-semibold text-rose-800 hover:text-rose-950 hover:underline cursor-pointer"
              >
                View Full Details
              </button>
              <span className="text-line text-xs">·</span>
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                disabled={isPending}
                className="text-xs font-semibold text-rose-800 hover:text-rose-950 hover:underline cursor-pointer"
              >
                {showAll ? "Hide other beauticians" : "Change beautician"}
              </button>
              <span className="text-line text-xs">·</span>
              <button
                type="button"
                onClick={handleUnassign}
                disabled={isPending}
                className="text-xs font-medium text-ink-soft hover:text-red-700 cursor-pointer"
              >
                Unassign
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Clickable Avatar */}
              <button
                type="button"
                onClick={() => setSelectedPro(currentlyAssigned)}
                className="relative size-14 shrink-0 overflow-hidden rounded-2xl border-2 border-emerald-300 shadow-sm bg-plum-100 cursor-pointer hover:ring-2 hover:ring-emerald-400 transition"
                title={`Click to view ${currentlyAssigned.name}'s full profile card`}
              >
                {currentlyAssigned.photo ? (
                  <Image
                    src={currentlyAssigned.photo}
                    alt={currentlyAssigned.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center font-bold text-plum-900 text-lg">
                    {currentlyAssigned.name[0]}
                  </div>
                )}
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {/* Clickable Name */}
                  <button
                    type="button"
                    onClick={() => setSelectedPro(currentlyAssigned)}
                    className="text-left group cursor-pointer inline-flex items-center gap-1.5"
                    title={`Click to view ${currentlyAssigned.name}'s full profile card`}
                  >
                    <h3 className="font-bold text-base text-plum-950 group-hover:text-rose-700 group-hover:underline truncate">
                      {currentlyAssigned.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200">
                      View Card ↗
                    </span>
                  </button>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    <UserCheck className="size-3" />
                    <span>Locked</span>
                  </span>
                </div>
                <p className="text-xs text-ink-soft truncate">
                  {currentlyAssigned.specialization || "Senior Salon Aesthetician"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                    <MapPin className="size-3" />
                    <span>{currentlyAssigned.distanceLabel}</span>
                  </span>
                  <span className="text-ink-soft font-mono">{currentlyAssigned.phone}</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Dispatch to Assigned Pro */}
            <div className="w-full sm:w-auto shrink-0 flex flex-col gap-2">
              <a
                href={currentlyAssigned.dispatchWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-[#1f8f4e] transition active:scale-[0.98]"
              >
                <MessageCircle className="size-4" />
                <span>Dispatch Booking via WhatsApp</span>
              </a>
              <p className="text-[10px] text-center text-ink-soft">
                Sends formatted appointment details directly to {currentlyAssigned.name}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ───────── 2. NO PRO ASSIGNED WARNING BANNER ───────── */
        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-xs">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Action Required: Assign Nearest Beautician
              </h4>
              <p className="text-xs text-amber-900/80">
                This customer booking is waiting for an artist assignment. Choose from recommended
                nearest professionals below. Click any beautician's name to view their full
                credentials, skills, and coverage areas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ───────── 3. RECOMMENDED NEAREST BEAUTICIANS LIST ───────── */}
      {(!assignedId || showAll) && (
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-gold-500" />
                <h3 className="font-serif text-base font-bold text-plum-950">
                  Nearest &amp; Recommended Beauticians
                </h3>
              </div>
              <p className="text-xs text-ink-soft mt-0.5">
                Automatically ranked by GPS proximity, sector coverage, and calendar availability.
                Click any name to open their full details card.
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-ink-soft" />
              <input
                type="text"
                placeholder="Search by name, sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-line bg-ivory-deep/50 pl-8 pr-3 py-1.5 text-xs text-plum-950 placeholder:text-ink-soft/70 focus:border-rose-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Filter Chips (Option B) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-b border-line pb-3">
            <span className="text-[11px] font-semibold text-ink-soft mr-1">Quick Filters:</span>
            {(
              [
                { id: "all", label: `All Staff (${matches.length})` },
                { id: "free", label: `⚡ Free on Date (${freeCount})` },
                { id: "nearby", label: `📍 Near <7km (${nearbyCount})` },
                { id: "skill", label: `✨ Skill Match (${skillCount})` },
                { id: "top", label: `⭐ Top Match (${topCount})` },
                { id: "coverage", label: `🛡️ Covers Client Area (${coverageCount})` },
              ] as const
            ).map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilterChip(chip.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer select-none",
                  filterChip === chip.id
                    ? "bg-plum-800 text-ivory shadow-xs ring-2 ring-plum-300"
                    : "bg-ivory-deep/80 text-plum-900 hover:bg-blush-100 border border-line"
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3">
            {filteredMatches.length === 0 ? (
              <div className="text-center py-6 text-xs text-ink-soft">
                No beauticians matched your search query.
              </div>
            ) : (
              filteredMatches.map((m) => {
                const isThisAssigned = m.id === assignedId;
                const isTop = m.badge === "TOP_RECOMMENDED" && !isThisAssigned;
                const isNearest = m.badge === "NEAREST" && !isThisAssigned;

                return (
                  <div
                    key={m.id}
                    className={cn(
                      "rounded-2xl border p-3.5 sm:p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5",
                      isThisAssigned
                        ? "border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-300/60"
                        : isTop
                          ? "border-gold-300/80 bg-gradient-to-r from-gold-50/40 via-white to-blush-50/30 hover:border-plum-300 shadow-2xs"
                          : "border-line bg-white hover:border-plum-300 shadow-2xs"
                    )}
                  >
                    {/* Left: Avatar & Profile */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      {/* Clickable Avatar */}
                      <button
                        type="button"
                        onClick={() => setSelectedPro(m)}
                        className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-line shadow-2xs bg-plum-100 cursor-pointer hover:ring-2 hover:ring-rose-400 transition"
                        title={`Click to view ${m.name}'s profile details`}
                      >
                        {m.photo ? (
                          <Image src={m.photo} alt={m.name} fill className="object-cover" />
                        ) : (
                          <div className="grid h-full place-items-center font-bold text-plum-900 text-base">
                            {m.name[0]}
                          </div>
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Clickable Name with Badge */}
                          <button
                            type="button"
                            onClick={() => setSelectedPro(m)}
                            className="font-bold text-sm text-plum-950 hover:text-rose-700 hover:underline text-left cursor-pointer inline-flex items-center gap-1.5"
                            title={`Click to view ${m.name}'s full profile card`}
                          >
                            <span>{m.name}</span>
                            <span className="text-[10px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              Details ↗
                            </span>
                          </button>
                          {isTop && (
                            <span className="rounded-md bg-gold-100 px-1.5 py-0.5 text-[10px] font-bold text-gold-900 border border-gold-300/70">
                              ⭐ Best Match ({m.matchScore}%)
                            </span>
                          )}
                          {isNearest && (
                            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-900">
                              📍 Nearest ({m.distanceLabel})
                            </span>
                          )}
                          {isThisAssigned && (
                            <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              ✓ Currently Assigned
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-ink-soft truncate">
                          {m.specialization || "Professional Beautician"}
                          {m.experienceYears ? ` · ${m.experienceYears} yrs exp` : ""}
                        </p>

                        {/* Match Tags & Badges */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                          {/* Distance Tag */}
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md border",
                              m.isHyperlocal
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-blush-50 text-plum-900 border-line"
                            )}
                          >
                            <MapPin className="size-3 shrink-0" />
                            <span>{m.distanceLabel}</span>
                          </span>

                          {/* Direct Coverage Tag */}
                          {m.coversAreaDirectly && (
                            <span className="inline-flex items-center gap-1 font-medium bg-rose-50 text-rose-800 border border-rose-200/70 px-2 py-0.5 rounded-md">
                              <Check className="size-3" />
                              <span>Covers Client Area</span>
                            </span>
                          )}

                          {/* Service Match Tag */}
                          {m.serviceMatch && (
                            <span className="inline-flex items-center gap-1 font-medium bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-md">
                              <Sparkles className="size-3 text-purple-700" />
                              <span>Service Match</span>
                            </span>
                          )}

                          {/* Availability Tag */}
                          {m.hasConflict ? (
                            <span className="inline-flex items-center gap-1 font-medium bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded-md">
                              <Clock className="size-3" />
                              <span>{m.conflictDetails}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-medium bg-emerald-50/70 text-emerald-900 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="size-3 text-emerald-600" />
                              <span>Available on Date</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: 1-Click Assign & Action */}
                    <div className="flex items-center gap-2 shrink-0 md:self-center">
                      <button
                        type="button"
                        onClick={() => setSelectedPro(m)}
                        className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-plum-900 hover:bg-blush-50 transition"
                      >
                        Profile
                      </button>

                      <a
                        href={m.dispatchWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-line bg-white p-2 text-ink-soft hover:text-emerald-700 hover:border-emerald-300 transition"
                        title="Preview WhatsApp Brief"
                      >
                        <MessageCircle className="size-4" />
                      </a>

                      {isThisAssigned ? (
                        <button
                          type="button"
                          onClick={handleUnassign}
                          disabled={isPending}
                          className="rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-medium text-ink-soft hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                        >
                          Unassign
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAssign(m.id)}
                          disabled={isPending}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer",
                            isTop || isNearest
                              ? "bg-plum-800 text-white hover:bg-plum-950 active:scale-[0.98]"
                              : "border border-plum-300 bg-white text-plum-950 hover:bg-plum-50"
                          )}
                        >
                          {isPending ? (
                            <RefreshCw className="size-3.5 animate-spin" />
                          ) : (
                            <Zap className="size-3.5 text-gold-400 fill-gold-400" />
                          )}
                          <span>Assign Beautician</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ───────── 4. BEAUTICIAN FULL DETAIL MODAL / POPUP CARD ───────── */}
      {selectedPro && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="beautician-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-plum-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPro(null);
          }}
        >
          <div className="relative flex flex-col w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl border border-gold-400/40 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Luxury Header */}
            <div className="relative bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 p-5 sm:p-6 text-ivory">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedPro(null)}
                aria-label="Close details"
                className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
              >
                <X className="size-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-8">
                {/* Avatar with gold border */}
                <div className="relative size-18 sm:size-20 shrink-0 overflow-hidden rounded-2xl border-2 border-gold-400/80 shadow-md bg-plum-800">
                  {selectedPro.photo ? (
                    <Image
                      src={selectedPro.photo}
                      alt={selectedPro.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center font-bold text-ivory text-2xl">
                      {selectedPro.name[0]}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id="beautician-modal-title"
                      className="font-serif text-xl sm:text-2xl font-bold text-white truncate"
                    >
                      {selectedPro.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/20 border border-gold-400/50 px-2.5 py-0.5 text-xs font-semibold text-gold-300">
                      <ShieldCheck className="size-3.5 text-gold-400" />
                      <span>100% Female Verified</span>
                    </span>
                    {selectedPro.id === assignedId && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/25 border border-emerald-400/70 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                        <Check className="size-3.5" />
                        <span>Currently Assigned</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-blush-200 mt-1 font-medium">
                    {selectedPro.specialization || "Senior Doorstep Beauty Specialist"}
                    {selectedPro.experienceYears
                      ? ` · ${selectedPro.experienceYears} Years Experience`
                      : ""}
                  </p>

                  {/* Direct Contact Bar */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <a
                      href={`tel:${selectedPro.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-1 text-xs font-medium text-white transition"
                    >
                      <Phone className="size-3.5 text-gold-400" />
                      <span>{selectedPro.phone}</span>
                    </a>
                    <a
                      href={selectedPro.dispatchWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] hover:bg-[#1f8f4e] px-3.5 py-1 text-xs font-bold text-white transition shadow-xs"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>WhatsApp Beautician</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm text-plum-950">
              {/* 1. Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-line bg-ivory-deep/40 p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
                    Proximity
                  </span>
                  <div className="mt-1 flex items-center justify-center gap-1 font-bold text-sm text-rose-800">
                    <MapPin className="size-3.5 text-rose-700" />
                    <span>{selectedPro.distanceLabel}</span>
                  </div>
                  <span className="text-[10px] text-ink-soft">
                    {selectedPro.isHyperlocal ? "Hyperlocal Match" : "Commute Radius"}
                  </span>
                </div>

                <div className="rounded-2xl border border-line bg-ivory-deep/40 p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
                    Match Score
                  </span>
                  <div className="mt-1 flex items-center justify-center gap-1 font-bold text-sm text-gold-800">
                    <Star className="size-3.5 text-gold-500 fill-gold-500" />
                    <span>{selectedPro.matchScore}%</span>
                  </div>
                  <span className="text-[10px] text-ink-soft">AI Match Algorithm</span>
                </div>

                <div className="rounded-2xl border border-line bg-ivory-deep/40 p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
                    Experience
                  </span>
                  <div className="mt-1 flex items-center justify-center gap-1 font-bold text-sm text-plum-900">
                    <Briefcase className="size-3.5 text-plum-700" />
                    <span>{selectedPro.experienceYears ?? 5} Years</span>
                  </div>
                  <span className="text-[10px] text-ink-soft">Luxury Doorstep Salon</span>
                </div>

                <div className="rounded-2xl border border-line bg-ivory-deep/40 p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
                    Date Status
                  </span>
                  <div className="mt-1 flex items-center justify-center gap-1 font-bold text-sm">
                    {selectedPro.hasConflict ? (
                      <span className="text-red-700 flex items-center gap-1">
                        <Clock className="size-3.5" /> Conflict
                      </span>
                    ) : (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> Free
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-ink-soft">
                    {selectedPro.existingBookingCountOnDate > 0
                      ? `${selectedPro.existingBookingCountOnDate} booking on date`
                      : "Slot fully open"}
                  </span>
                </div>
              </div>

              {/* 2. Match Analysis for this Lead */}
              <div className="rounded-2xl border border-gold-300/80 bg-gradient-to-br from-gold-50/50 via-white to-blush-50/30 p-4">
                <div className="flex items-center gap-2 font-bold text-sm text-plum-950 mb-2">
                  <Sparkles className="size-4 text-gold-600" />
                  <span>Matching Analysis for Booking: {serviceTitle}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <p className="text-ink-soft">
                    Client Location: <strong className="text-plum-950">{leadLocation}</strong>
                  </p>
                  {selectedPro.matchReasons && selectedPro.matchReasons.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {selectedPro.matchReasons.map((reason, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-emerald-900 font-medium"
                        >
                          <Check className="size-3.5 text-emerald-600 shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {selectedPro.hasConflict && selectedPro.conflictDetails && (
                    <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-red-800 bg-red-50 p-2 rounded-xl border border-red-200">
                      <Clock className="size-4 shrink-0 text-red-600" />
                      <span>{selectedPro.conflictDetails}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Schedule & Busy Calendar for this Date */}
              <div className="rounded-2xl border border-line bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-rose-700" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-plum-950">
                      Schedule &amp; Bookings on Appointment Date
                    </h4>
                  </div>
                  <Link
                    href="/admin/calendar"
                    target="_blank"
                    className="text-[11px] font-semibold text-rose-700 hover:underline flex items-center gap-1"
                  >
                    <span>Full Salon Roster</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>

                {selectedPro.existingBookings && selectedPro.existingBookings.length > 0 ? (
                  <div className="space-y-2">
                    <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3 text-xs text-amber-950">
                      <p className="font-bold flex items-center gap-1.5">
                        <Clock className="size-4 text-amber-600" />
                        <span>
                          This beautician has {selectedPro.existingBookings.length} booking(s)
                          scheduled on this date:
                        </span>
                      </p>
                    </div>
                    <div className="grid gap-2">
                      {selectedPro.existingBookings.map((eb) => (
                        <div
                          key={eb.id}
                          className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/60 p-2.5 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-plum-950">{eb.clientName}</span>
                              {eb.bookingRef && (
                                <span className="font-mono text-[10px] text-ink-soft">
                                  #{eb.bookingRef}
                                </span>
                              )}
                            </div>
                            <p className="text-ink-soft mt-0.5">
                              ⏰ {eb.timeSlot || "Slot TBC"} · 💆‍♀️ {eb.serviceTitle} · 📍{" "}
                              {eb.location || "Delhi NCR"}
                            </p>
                          </div>
                          <Link
                            href={`/admin/leads/${eb.id}`}
                            className="rounded-lg bg-white border border-purple-200 px-2.5 py-1 font-semibold text-purple-900 hover:bg-purple-100 transition shrink-0"
                          >
                            View Lead →
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-3 text-xs text-emerald-950 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold block">
                        100% Free &amp; Available on this Date
                      </span>
                      <span className="text-[11px] text-emerald-800">
                        Zero conflicting appointments. Morning, afternoon, and evening slots are all
                        open.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Base Location & Contact Details */}
              <div className="rounded-2xl border border-line bg-white p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-ink-soft">
                  Base Location &amp; Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="size-4 text-rose-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-ink-soft block font-medium">
                        Base Station / Address:
                      </span>
                      <span className="font-semibold text-plum-950">
                        {selectedPro.baseAddress || "Delhi NCR Registered Hub"}
                        {selectedPro.landmark ? `, Near ${selectedPro.landmark}` : ""}
                        {selectedPro.pincode ? ` (${selectedPro.pincode})` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Compass className="size-4 text-gold-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-ink-soft block font-medium">Service Radius:</span>
                      <span className="font-semibold text-plum-950">
                        Up to {selectedPro.travelRadius ?? 10} km from home base
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="size-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-ink-soft block font-medium">Direct Phone:</span>
                      <span className="font-semibold text-plum-950 font-mono">
                        {selectedPro.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="size-4 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-ink-soft block font-medium">Staff Email:</span>
                      <span className="font-semibold text-plum-950">
                        {selectedPro.email || "partner@herrglow.com"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Professional Bio */}
              {selectedPro.bio && (
                <div className="rounded-2xl border border-line bg-white p-4 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-ink-soft">
                    Professional Background &amp; Bio
                  </h4>
                  <p className="text-xs leading-relaxed text-plum-950">{selectedPro.bio}</p>
                </div>
              )}

              {/* 5. Offered Services & Matching Skills */}
              <div className="rounded-2xl border border-line bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-ink-soft">
                    Services &amp; Specializations ({selectedPro.allServiceTitles.length})
                  </h4>
                  {selectedPro.serviceMatch && (
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-100 rounded-full px-2 py-0.5">
                      ✓ Skills Match Lead
                    </span>
                  )}
                </div>

                {selectedPro.matchingServiceTitles &&
                  selectedPro.matchingServiceTitles.length > 0 && (
                    <div className="rounded-xl border border-emerald-300/70 bg-emerald-50/60 p-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block mb-1.5">
                        Direct Matches for this Booking:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPro.matchingServiceTitles.map((title) => (
                          <span
                            key={title}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 shadow-2xs"
                          >
                            <Check className="size-3" />
                            <span>{title}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div>
                  <span className="text-[10px] font-semibold text-ink-soft block mb-1.5">
                    All Qualified Salon &amp; Bridal Capabilities:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedPro.allServiceTitles.map((title) => {
                      const isMatching = selectedPro.matchingServiceTitles.includes(title);
                      return (
                        <span
                          key={title}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-xs font-medium border",
                            isMatching
                              ? "bg-emerald-100 text-emerald-950 border-emerald-300 font-semibold"
                              : "bg-blush-50 text-plum-900 border-line"
                          )}
                        >
                          {title}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 6. Coverage Areas */}
              <div className="rounded-2xl border border-line bg-white p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-ink-soft">
                    Covered Sectors &amp; Localities ({selectedPro.coverageAreas.length})
                  </h4>
                  {selectedPro.coversAreaDirectly && (
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-100 rounded-full px-2 py-0.5">
                      ✓ Direct Sector Coverage
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {selectedPro.coverageAreas.map((area) => {
                    const isDirect =
                      leadLocation.toLowerCase().includes(area.toLowerCase()) ||
                      area.toLowerCase().includes(leadLocation.toLowerCase());
                    return (
                      <span
                        key={area}
                        className={cn(
                          "rounded-lg px-2 py-0.5 text-xs border",
                          isDirect
                            ? "bg-rose-100 text-rose-900 border-rose-300 font-bold"
                            : "bg-ivory-deep text-ink-soft border-line"
                        )}
                      >
                        {area}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Sticky Footer */}
            <div className="border-t border-line bg-ivory/95 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={selectedPro.dispatchWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#1f8f4e] px-4 py-2 text-xs font-bold text-white transition shadow-soft"
                >
                  <MessageCircle className="size-4" />
                  <span>Send WhatsApp Brief</span>
                </a>
                <a
                  href={`tel:${selectedPro.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white hover:bg-blush-50 px-3.5 py-2 text-xs font-semibold text-plum-900 transition shadow-2xs"
                >
                  <Phone className="size-3.5 text-ink-soft" />
                  <span>Call Pro</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                {selectedPro.id === assignedId ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleUnassign();
                    }}
                    disabled={isPending}
                    className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 px-4 py-2 text-xs font-bold transition cursor-pointer"
                  >
                    Unassign from Booking
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleAssign(selectedPro.id);
                    }}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-plum-800 hover:bg-plum-950 text-white px-5 py-2 text-xs font-bold transition shadow-soft cursor-pointer active:scale-95"
                  >
                    {isPending ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <Zap className="size-3.5 text-gold-400 fill-gold-400" />
                    )}
                    <span>Assign {selectedPro.name}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedPro(null)}
                  className="rounded-xl border border-line bg-white hover:bg-blush-50 px-4 py-2 text-xs font-semibold text-ink-soft transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
