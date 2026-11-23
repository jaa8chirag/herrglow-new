"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, CheckCircle2, RefreshCw, Sparkles, X } from "lucide-react";
import { getLatestLeadSnapshot } from "@/app/admin/(panel)/leads/actions";

interface NewLeadAlert {
  id: string;
  bookingRef: string | null;
  name: string;
  location: string;
  amount: number | null;
  createdAt: string;
}

export function LeadLiveMonitor({
  initialCount = 0,
  initialLatestId,
}: {
  initialCount?: number;
  initialLatestId?: string | null;
}) {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [latestKnownId, setLatestKnownId] = useState<string | null>(initialLatestId ?? null);
  const [knownCount, setKnownCount] = useState<number>(initialCount);
  const [newLeadBanner, setNewLeadBanner] = useState<NewLeadAlert | null>(null);
  const [isRefreshing, startTransition] = useTransition();
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load sound preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hg_admin_sound_alert");
      if (stored !== null) setSoundEnabled(stored === "true");
    } catch {
      // ignore in private browsing
    }
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("hg_admin_sound_alert", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Play luxury 2-tone marimba chime via Web Audio API (zero external assets needed)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Tone 1: 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Tone 2: 880 Hz (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.22, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);
    } catch (e) {
      console.warn("Could not play audio chime:", e);
    }
  };

  // Poll for new leads every 20 seconds while admin tab is open
  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      try {
        const res = await getLatestLeadSnapshot();
        if (!isMounted || !res || !res.latest) return;

        // If a new lead has arrived that wasn't previously known
        if (latestKnownId && res.latest.id !== latestKnownId && res.total > knownCount) {
          setNewLeadBanner({
            id: res.latest.id,
            bookingRef: res.latest.bookingRef,
            name: res.latest.name,
            location: res.latest.location,
            amount: res.latest.amount,
            createdAt: res.latest.createdAt,
          });
          setLatestKnownId(res.latest.id);
          setKnownCount(res.total);
          playChime();
        } else if (!latestKnownId && res.latest) {
          setLatestKnownId(res.latest.id);
          setKnownCount(res.total);
        }
      } catch {
        // Silently ignore background polling errors
      }
    };

    const interval = setInterval(check, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [latestKnownId, knownCount, soundEnabled]);

  const handleRefresh = () => {
    startTransition(() => {
      setNewLeadBanner(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      {/* ───────── Top Status Bar with Sound Toggle ───────── */}
      <div className="flex items-center justify-between text-xs text-ink-soft rounded-xl border border-line bg-white/80 px-3.5 py-2 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-semibold text-plum-950">Live Dispatch Radar Active</span>
          <span className="hidden sm:inline text-ink-soft/70">· Auto-detects new client bookings</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
              soundEnabled
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                : "border-line bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
            title={soundEnabled ? "Sound Alerts are active. Click to mute." : "Sound alerts are muted. Click to enable."}
          >
            {soundEnabled ? <Bell className="size-3 text-emerald-600" /> : <BellOff className="size-3 text-stone-500" />}
            <span>{soundEnabled ? "Sound: ON" : "Muted"}</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-plum-900 hover:bg-blush-50 transition cursor-pointer"
          >
            <RefreshCw className={`size-3 ${isRefreshing ? "animate-spin text-rose-700" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ───────── Floating Glowing New Lead Alert Banner ───────── */}
      {newLeadBanner && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-2xl border-2 border-gold-400/80 bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 p-4 text-ivory shadow-lift">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold-400 text-plum-950 font-bold shadow-soft">
                <Sparkles className="size-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase text-emerald-300">
                    New Booking Just Now
                  </span>
                  {newLeadBanner.bookingRef && (
                    <span className="font-mono text-xs font-semibold text-gold-300">
                      #{newLeadBanner.bookingRef}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-bold text-white">
                  {newLeadBanner.name} · <span className="font-normal text-blush-100">{newLeadBanner.location}</span>
                  {newLeadBanner.amount != null && (
                    <span className="ml-2 font-bold text-gold-300">
                      (₹{newLeadBanner.amount.toLocaleString("en-IN")})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-4 py-2 text-xs font-bold text-plum-950 shadow-soft hover:brightness-105 transition active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="size-4" />
                <span>Load &amp; View Lead</span>
              </button>
              <button
                type="button"
                onClick={() => setNewLeadBanner(null)}
                aria-label="Dismiss banner"
                className="grid size-8 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
