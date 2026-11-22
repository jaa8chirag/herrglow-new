"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  UserCheck,
  UserX,
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
  const [isPending, startTransition] = useTransition();
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentlyAssigned = matches.find((m) => m.id === assignedId);

  const handleAssign = (proId: string) => {
    startTransition(async () => {
      try {
        await assignNearestPro(leadId, proId);
        setAssignedId(proId);
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
      } catch (err) {
        console.error("Failed to unassign beautician:", err);
      }
    });
  };

  const filteredMatches = matches.filter((m) => {
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
                onClick={() => setShowAll(!showAll)}
                disabled={isPending}
                className="text-xs font-semibold text-rose-800 hover:text-rose-950 hover:underline cursor-pointer"
              >
                {showAll ? "Hide other beauticians" : "Change beautician"}
              </button>
              <span className="text-line text-xs">|</span>
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
              <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border-2 border-emerald-300 shadow-sm bg-plum-100">
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
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-plum-950 truncate">
                    {currentlyAssigned.name}
                  </h3>
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
                  <span className="text-ink-soft font-mono">
                    {currentlyAssigned.phone}
                  </span>
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
                This customer booking is waiting for an artist assignment. Choose from recommended nearest professionals below.
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
                Automatically ranked by GPS proximity, sector coverage, service capability, and calendar availability.
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
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-line shadow-2xs bg-plum-100">
                        {m.photo ? (
                          <Image
                            src={m.photo}
                            alt={m.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center font-bold text-plum-900 text-base">
                            {m.name[0]}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="font-bold text-sm text-plum-950 truncate">
                            {m.name}
                          </h4>
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
    </div>
  );
}
