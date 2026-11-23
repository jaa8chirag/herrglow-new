"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Loader2,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button, Card, cn } from "@herrglow/ui";
import { submitLead, type FormState } from "@/app/actions";
import { useServiceOptions } from "@/hooks/api";

export interface BookingFormProps {
  cities: { slug: string; name: string }[];
  /** preselected city (on city/area pages) */
  defaultCity?: string;
  service?: {
    slug: string;
    title: string;
    price?: number | null;
    variants?: { name: string; price: number | null }[];
    addons?: { name: string; price: number | null }[];
  };
  /** preselected package (on package pages) */
  packageItem?: { slug: string; title: string; price?: number | null };
  proSlug?: string;
  proName?: string;
  sourcePath: string;
  heading?: string;
  /** generic enquiry (no fixed service): shows a service picker loaded from /api/v1/service-options */
  enquiry?: boolean;
  /** pre-filled message (e.g. which package is being booked) */
  initialMessage?: string;
  whatsappNumber?: string;
}

const SLOTS = ["Morning (9am to 12pm)", "Afternoon (12pm to 4pm)", "Evening (4pm to 8pm)"] as const;
const STEPS = [
  { label: "Service", icon: Sparkles },
  { label: "Address", icon: MapPin },
  { label: "Date & slot", icon: CalendarDays },
  { label: "Details", icon: User },
] as const;

const fieldCls = "w-full min-h-12 rounded-2xl border border-line bg-white px-4 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-soft/60 focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-600/20 transition";
const inr = (n: number | null) => (n == null ? "" : ` (₹${Math.round(n).toLocaleString("en-IN")})`);

export interface AreaClusterItem {
  name: string;
  region: "Noida" | "Greater Noida" | "Ghaziabad" | "Delhi" | "Gurgaon";
  citySlug: string;
}

const ALL_AREAS: AreaClusterItem[] = [
  // Noida
  { name: "Sector 62, Noida", region: "Noida", citySlug: "noida" },
  { name: "Sector 18 / Atta, Noida", region: "Noida", citySlug: "noida" },
  { name: "Sector 50, Noida", region: "Noida", citySlug: "noida" },
  { name: "Sector 76 / 75 / 78, Noida", region: "Noida", citySlug: "noida" },
  { name: "Sector 137, Noida", region: "Noida", citySlug: "noida" },
  { name: "Sector 128 / Wish Town, Noida", region: "Noida", citySlug: "noida" },
  { name: "Sector 104 / 100, Noida", region: "Noida", citySlug: "noida" },
  { name: "Sector 150 / Expressway, Noida", region: "Noida", citySlug: "noida" },
  { name: "Sector 93 / 93A, Noida", region: "Noida", citySlug: "noida" },
  { name: "Sector 12 / 22, Noida", region: "Noida", citySlug: "noida" },
  { name: "Sector 34 / 52, Noida", region: "Noida", citySlug: "noida" },

  // Ghaziabad
  { name: "Indirapuram, Ghaziabad", region: "Ghaziabad", citySlug: "ghaziabad" },
  { name: "Vaishali, Ghaziabad", region: "Ghaziabad", citySlug: "ghaziabad" },
  { name: "Vasundhara, Ghaziabad", region: "Ghaziabad", citySlug: "ghaziabad" },
  { name: "Kaushambi, Ghaziabad", region: "Ghaziabad", citySlug: "ghaziabad" },
  { name: "Crossings Republik, Ghaziabad", region: "Ghaziabad", citySlug: "ghaziabad" },
  { name: "Raj Nagar Extension, Ghaziabad", region: "Ghaziabad", citySlug: "ghaziabad" },

  // Greater Noida / Gr. Noida West
  { name: "Gaur City 1 & 2 (Noida Ext.)", region: "Greater Noida", citySlug: "greater-noida" },
  { name: "Sector 1 / Techzone 4, Greater Noida", region: "Greater Noida", citySlug: "greater-noida" },
  { name: "Pari Chowk, Greater Noida", region: "Greater Noida", citySlug: "greater-noida" },
  { name: "Alpha 1 & 2, Greater Noida", region: "Greater Noida", citySlug: "greater-noida" },
  { name: "Beta 1 & 2, Greater Noida", region: "Greater Noida", citySlug: "greater-noida" },
  { name: "Delta & Gamma, Greater Noida", region: "Greater Noida", citySlug: "greater-noida" },
  { name: "Knowledge Park, Greater Noida", region: "Greater Noida", citySlug: "greater-noida" },

  // Delhi
  { name: "South Delhi (GK / Saket / Malviya Nagar)", region: "Delhi", citySlug: "delhi" },
  { name: "Dwarka (All Sectors)", region: "Delhi", citySlug: "delhi" },
  { name: "Lajpat Nagar / Defence Colony", region: "Delhi", citySlug: "delhi" },
  { name: "Vasant Kunj / Vasant Vihar", region: "Delhi", citySlug: "delhi" },
  { name: "Hauz Khas / Green Park", region: "Delhi", citySlug: "delhi" },
  { name: "Rohini (Sectors 1-25)", region: "Delhi", citySlug: "delhi" },
  { name: "Janakpuri / West Delhi", region: "Delhi", citySlug: "delhi" },
  { name: "Pitampura / Shalimar Bagh", region: "Delhi", citySlug: "delhi" },
  { name: "East Delhi (Mayur Vihar / Laxmi Nagar)", region: "Delhi", citySlug: "delhi" },

  // Gurgaon
  { name: "DLF Phase 1, 2, 3, 4, 5", region: "Gurgaon", citySlug: "gurgaon" },
  { name: "Golf Course Road & Ext.", region: "Gurgaon", citySlug: "gurgaon" },
  { name: "Sohna Road", region: "Gurgaon", citySlug: "gurgaon" },
  { name: "Sector 56 / 57, Gurgaon", region: "Gurgaon", citySlug: "gurgaon" },
  { name: "Sector 48 / 49, Gurgaon", region: "Gurgaon", citySlug: "gurgaon" },
  { name: "Cyber City & MG Road", region: "Gurgaon", citySlug: "gurgaon" },
  { name: "New Gurgaon (Sectors 81-95)", region: "Gurgaon", citySlug: "gurgaon" },
];

function getQuickDates() {
  const now = new Date();
  const toIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const sat = new Date(now);
  const dayOfWeek = now.getDay();
  const daysToSat = (6 - dayOfWeek + 7) % 7 || 7;
  sat.setDate(now.getDate() + (dayOfWeek === 6 ? 0 : daysToSat));

  const sun = new Date(now);
  const daysToSun = (7 - dayOfWeek) % 7 || 7;
  sun.setDate(now.getDate() + (dayOfWeek === 0 ? 0 : daysToSun));

  return [
    { label: "Today", sub: fmt(today), iso: toIso(today) },
    { label: "Tomorrow", sub: fmt(tomorrow), iso: toIso(tomorrow) },
    { label: "Saturday", sub: fmt(sat), iso: toIso(sat) },
    { label: "Sunday", sub: fmt(sun), iso: toIso(sun) },
  ];
}

function Confetti() {
  const reduce = useReducedMotion();
  const bits = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ id: i, x: (Math.random() - 0.5) * 340, y: -(60 + Math.random() * 190), r: Math.random() * 540 - 270, c: ["#c8a15a", "#c9727e", "#f6e3e1", "#4a1f3d", "#e3cb98"][i % 5]!, d: 1.1 + Math.random() * 0.8 })), []);
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-24 flex justify-center">
      {bits.map((b) => <motion.span key={b.id} className="absolute size-2.5 rounded-[2px]" style={{ background: b.c }} initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }} animate={{ opacity: 0, x: b.x, y: [0, b.y, b.y + 220], rotate: b.r }} transition={{ duration: b.d, ease: "easeOut" }} />)}
    </div>
  );
}

export function BookingForm({ cities, defaultCity, service, packageItem, proSlug, proName, sourcePath, heading, enquiry, initialMessage, whatsappNumber }: BookingFormProps) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitLead, { status: "idle" });
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [v, setV] = useState({
    serviceSlug: service?.slug ?? "",
    packageSlug: packageItem?.slug ?? "",
    variant: "",
    addons: [] as string[],
    city: defaultCity ?? "",
    area: "",
    flat: "",
    society: "",
    landmark: "",
    address: "",
    eventDate: "",
    slot: "",
    name: "",
    phone: "",
    email: "",
    message: initialMessage ?? "",
  });

  const updateAddress = (patch: {
    flat?: string;
    society?: string;
    area?: string;
    landmark?: string;
    city?: string;
  }) => {
    setV((prev) => {
      const nextFlat = patch.flat !== undefined ? patch.flat : prev.flat;
      const nextSociety = patch.society !== undefined ? patch.society : prev.society;
      const nextLandmark = patch.landmark !== undefined ? patch.landmark : prev.landmark;
      const nextArea = patch.area !== undefined ? patch.area : prev.area;
      const nextCity = patch.city !== undefined ? patch.city : prev.city;

      const fullAddress = [
        nextFlat.trim(),
        nextSociety.trim(),
        nextLandmark.trim() ? `Near ${nextLandmark.trim()}` : "",
      ]
        .filter(Boolean)
        .join(", ");

      return {
        ...prev,
        flat: nextFlat,
        society: nextSociety,
        landmark: nextLandmark,
        area: nextArea,
        city: nextCity,
        address: fullAddress,
      };
    });
    setStepErr("");
  };

  // Use TanStack Query to fetch service picker options cached across form sessions
  const isEnquiryMode = !service && !packageItem && !!enquiry;
  const { data: options = [], isLoading: isLoadingOptions } = useServiceOptions({
    enabled: isEnquiryMode,
  });

  const [stepErr, setStepErr] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [groupCount, setGroupCount] = useState("2");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "detecting" | "success" | "error">("idle");
  const [geoError, setGeoError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");
  const [selectedRegionTab, setSelectedRegionTab] = useState<string>("All");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const quickDates = useMemo(() => getQuickDates(), []);
  const set = (k: keyof typeof v, val: string | string[]) => setV((p) => ({ ...p, [k]: val }));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const detectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoStatus("error");
      setGeoError("Geolocation is not supported by your browser");
      return;
    }
    setGeoStatus("detecting");
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setGeoStatus("success");

        // Determine city from coordinates
        let inferredCity = "noida";
        if (lng > 77.44 && lat < 28.52) inferredCity = "greater-noida";
        else if (lng > 77.30 && lat > 28.60) inferredCity = "ghaziabad";
        else if (lng > 77.28 && lat <= 28.60) inferredCity = "noida";
        else if (lng < 77.12 && lat < 28.52) inferredCity = "gurgaon";
        else if (lng >= 77.00 && lng <= 77.30) inferredCity = "delhi";

        // Reverse geocode via OpenStreetMap Nominatim
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
            headers: { "Accept-Language": "en" },
          });
          if (res.ok) {
            const data = await res.json();
            const place =
              data.address?.suburb ||
              data.address?.neighbourhood ||
              data.address?.residential ||
              data.address?.road ||
              data.address?.city_district ||
              "";
            const building = data.address?.building || "";
            updateAddress({
              area: place || undefined,
              society: building || undefined,
              city: inferredCity,
            });
          } else {
            updateAddress({ city: inferredCity });
          }
        } catch {
          updateAddress({ city: inferredCity });
        }
      },
      (e) => {
        setGeoStatus("error");
        setGeoError(
          e.code === 1
            ? "Location permission was denied. You can still enter your address below."
            : "Could not retrieve live GPS pin. Please enter your address below."
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const filteredAreas = useMemo(() => {
    let list = ALL_AREAS;
    if (selectedRegionTab !== "All") {
      list = list.filter((a) => a.region === selectedRegionTab || (selectedRegionTab === "Gr. Noida" && a.region === "Greater Noida"));
    }
    if (areaSearch.trim()) {
      const q = areaSearch.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.region.toLowerCase().includes(q));
    }
    return list;
  }, [selectedRegionTab, areaSearch]);

  // Listen for variant selections from service page
  useEffect(() => {
    const onVariant = (e: Event) => {
      const custom = e as CustomEvent<string>;
      set("variant", String(custom.detail ?? ""));
    };
    window.addEventListener("hg-variant", onVariant);
    return () => window.removeEventListener("hg-variant", onVariant);
  }, []);

  // Listen for add-on toggles from FrequentlyPaired block
  useEffect(() => {
    const onAddon = (e: Event) => {
      const custom = e as CustomEvent<{ name: string; active: boolean; id?: string }>;
      const { name, active } = custom.detail;
      setV((prev) => ({
        ...prev,
        addons: active
          ? prev.addons.includes(name) ? prev.addons : [...prev.addons, name]
          : prev.addons.filter((x) => x !== name),
      }));
    };
    window.addEventListener("hg-addon-toggle", onAddon);
    return () => window.removeEventListener("hg-addon-toggle", onAddon);
  }, []);

  useEffect(() => {
    if (state.status === "done") {
      toast.success(state.outOfArea ? "Request saved. We will tell you when we reach your area." : "Request sent! We will contact you shortly.");
    }
  }, [state]);

  const err = (k: string) => (state.status === "error" ? state.errors[k] : undefined);
  const cityName = cities.find((c) => c.slug === v.city)?.name ?? (v.city === "other" ? "Other city" : "");
  const serviceTitle = packageItem?.title ?? service?.title ?? options.find((o) => o.slug === v.serviceSlug)?.title ?? "";

  const currentBasePrice = useMemo(() => {
    if (packageItem?.price) return Number(packageItem.price);
    if (service?.variants?.length && v.variant) {
      const match = service.variants.find((vr) => vr.name === v.variant);
      if (match?.price) return match.price;
    }
    if (service?.variants?.[0]?.price) return service.variants[0].price;
    if (service?.price) return Number(service.price);
    return null;
  }, [packageItem, service, v.variant]);

  const addonsTotal = useMemo(() => {
    let sum = 0;
    const ADDON_PRICES: Record<string, number> = {
      "Saree / Lehenga Draping": 999,
      "Designer Hair Styling & Setting": 1499,
      "Express Clean-Up & Anti-Tan Pack": 799,
      "Eyebrow & Upper Lip Threading": 99,
      "Saree / Lehenga Draping & Ironing": 999,
      "Designer Hair Styling & Floral Setting": 1499,
      "Party Makeup for Mother / Sister": 2499,
      "Hydrating Deluxe Pedicure": 799,
    };
    for (const add of v.addons) {
      if (ADDON_PRICES[add]) {
        sum += ADDON_PRICES[add];
      } else {
        const matchFromService = service?.addons?.find((a) => a.name === add);
        if (matchFromService?.price) sum += matchFromService.price;
      }
    }
    return sum;
  }, [v.addons, service]);

  const currentCartTotal = (currentBasePrice || 0) + addonsTotal;
  const isBelowMinOrder = currentBasePrice !== null && currentCartTotal > 0 && currentCartTotal < 499;

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    setStepErr("");
    root.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  };

  const next = () => {
    if (step === 0 && isBelowMinOrder) {
      return setStepErr(`Minimum doorstep visit is ₹499. Please select add-on treatments (+₹${499 - currentCartTotal} more) to continue.`);
    }
    if (step === 1) {
      if (!v.area.trim()) {
        return setStepErr("Please select or enter your locality / sector (e.g. Sector 62, Indirapuram)");
      }
      if (!v.society.trim()) {
        return setStepErr("Please enter your society, apartment or building name");
      }
      if (!v.flat.trim()) {
        return setStepErr("Please enter your flat or house number");
      }

      const lower = v.area.toLowerCase();
      const found = ALL_AREAS.find(
        (a) => lower.includes(a.name.toLowerCase()) || a.name.toLowerCase().includes(lower)
      );
      const inferredCity = found
        ? found.citySlug
        : lower.includes("gurgaon") || lower.includes("gurugram") || lower.includes("dlf")
          ? "gurgaon"
          : lower.includes("ghaziabad") || lower.includes("indirapuram") || lower.includes("vaishali") || lower.includes("vasundhara")
            ? "ghaziabad"
            : lower.includes("greater noida") || lower.includes("gaur city")
              ? "greater-noida"
              : lower.includes("delhi") || lower.includes("dwarka") || lower.includes("saket") || lower.includes("rohini")
                ? "delhi"
                : "noida";

      updateAddress({ city: v.city || inferredCity });
      setStepErr("");
      go(step + 1);
      return;
    }
    go(step + 1);
  };

  if (state.status === "done") {
    const rawWa = whatsappNumber || "9319260069";
    const waDigits = rawWa.replace(/\D/g, "");
    const waFull = waDigits.length === 10 ? `91${waDigits}` : waDigits;
    const waUrl = `https://wa.me/${waFull}?text=${encodeURIComponent(`Hi HerrGlow! I just submitted request ${state.ref}. Can you please confirm artist availability?`)}`;

    return (
      <Card id="book" className="relative scroll-mt-24 overflow-hidden p-6 text-center sm:p-10">
        <Confetti />
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <Check className="size-8" />
        </span>
        {state.outOfArea ? (
          <>
            <h3 className="mt-5 !text-2xl font-serif text-plum-900">Coming soon to your area</h3>
            <p className="mx-auto mt-3 max-w-sm text-ink-soft">
              We do not serve your area yet, but we have noted your request. We will reach out as soon as artists are available near you.
            </p>
          </>
        ) : (
          <>
            <h3 className="mt-5 !text-2xl font-serif text-plum-900">Thank you, your appointment request is received!</h3>
            <div className="mx-auto mt-3 max-w-md rounded-2xl border border-gold-400/50 bg-blush-50/70 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Booking Reference</span>
              <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-plum-900">{state.ref}</p>
              {state.finalAmount ? (
                <div className="mt-2 space-y-1 text-center">
                  <p className="text-sm font-semibold text-plum-900">
                    Estimated Total: ₹{Math.round(state.finalAmount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs font-semibold text-emerald-800">
                    10% Advance Deposit: ₹{Math.round(state.finalAmount * 0.1).toLocaleString("en-IN")} · Balance ₹{(Math.round(state.finalAmount) - Math.round(state.finalAmount * 0.1)).toLocaleString("en-IN")} after service
                  </p>
                  <p className="text-[0.72rem] text-ink-soft">
                    10% advance deposit to reserve your slot. 100% full refund guarantee if the beautician does not reach you.
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-xs text-ink-soft">
                  Only 10% advance deposit to lock slot · Remaining 90% after service. 100% refund guarantee if artist does not reach you.
                </p>
              )}
            </div>

            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-line bg-blush-50/80 p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">What happens next?</p>
              <ol className="mt-3 space-y-3 text-xs sm:text-sm text-ink">
                <li className="flex items-start gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-plum-700 text-[0.7rem] font-bold text-white">1</span>
                  <span><strong>15-Minute Confirmation:</strong> Our female coordinator will call or WhatsApp you to confirm your slot &amp; address.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-plum-700 text-[0.7rem] font-bold text-white">2</span>
                  <span><strong>Artist Profile &amp; ETA:</strong> You will receive your verified professional&apos;s details before arrival.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-plum-700 text-[0.7rem] font-bold text-white">3</span>
                  <span><strong>Doorstep Service &amp; Final Payment:</strong> Pay a nominal 10% advance to confirm your slot. Enjoy your relaxing service at home and pay the remaining 90% only after completion. 100% refund if the beautician does not reach you.</span>
                </li>
              </ol>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#1f8f4e] px-6 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-[#187a41] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <MessageCircle className="size-4" /> Message Us on WhatsApp
              </a>
            </div>
          </>
        )}
      </Card>
    );
  }

  const Summary = (
  <div className="rounded-2xl bg-blush-50 p-4 text-sm" aria-label="Selected appointment summary">
    <div className="mb-2.5 flex items-center justify-between border-b border-blush-200/60 pb-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Your request</p>
      {currentCartTotal > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-0.5 text-xs font-bold text-plum-950 border border-blush-200 shadow-2xs">
          Total: <span className="text-rose-700 font-extrabold text-sm">₹{currentCartTotal.toLocaleString("en-IN")}</span>
        </span>
      )}
    </div>
    <dl className="grid grid-cols-[88px_1fr] gap-y-2">
      <dt className="text-ink-soft">Service</dt>
      <dd className="font-medium text-plum-900">
        <div className="flex flex-wrap items-baseline justify-between gap-1">
          <span>{serviceTitle || "Not chosen yet"}{v.variant ? ` · ${v.variant}` : ""}</span>
          {currentBasePrice ? (
            <span className="font-semibold text-plum-950">₹{currentBasePrice.toLocaleString("en-IN")}</span>
          ) : null}
        </div>
      </dd>
      {v.addons.length > 0 && (
        <>
          <dt className="text-ink-soft">Add-ons</dt>
          <dd className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {v.addons.map((add) => {
                const addPrice = {
                  "Saree / Lehenga Draping": 999,
                  "Designer Hair Styling & Setting": 1499,
                  "Express Clean-Up & Anti-Tan Pack": 799,
                  "Eyebrow & Upper Lip Threading": 99,
                  "Saree / Lehenga Draping & Ironing": 999,
                  "Designer Hair Styling & Floral Setting": 1499,
                  "Party Makeup for Mother / Sister": 2499,
                  "Hydrating Deluxe Pedicure": 799,
                }[add] ?? service?.addons?.find((a) => a.name === add)?.price;
                return (
                  <span
                    key={add}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/90 border border-blush-200 px-2 py-0.5 text-xs text-plum-900"
                  >
                    <span>{add}</span>
                    {addPrice ? <span className="font-semibold text-rose-700">+₹{addPrice.toLocaleString("en-IN")}</span> : null}
                  </span>
                );
              })}
            </div>
            {addonsTotal > 0 && (
              <p className="text-[11px] font-medium text-ink-soft">
                Add-ons subtotal: <span className="font-bold text-plum-900">+₹{addonsTotal.toLocaleString("en-IN")}</span>
              </p>
            )}
          </dd>
        </>
      )}
      {proName && (<><dt className="text-ink-soft">Artist</dt><dd>{proName}</dd></>)}
      <dt className="text-ink-soft">Where</dt>
      <dd className="flex items-center gap-1.5 flex-wrap">
        <span>
          {[v.flat, v.society, v.area].filter(Boolean).join(", ") ||
            [v.area, cityName].filter(Boolean).join(", ") ||
            "Not chosen yet"}
        </span>
        {coords && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 rounded-full px-2 py-0.5">
            <CheckCircle2 className="size-2.5 text-emerald-600" /> GPS Pin Attached
          </span>
        )}
      </dd>
      <dt className="text-ink-soft">When</dt><dd>{[v.eventDate && new Date(v.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), v.slot.split(" (")[0]].filter(Boolean).join(", ") || "Flexible"}</dd>
    </dl>
  </div>
  );

  const panel = (children: ReactNode) => (
  <motion.div
    key={step}
    initial={reduce ? false : { opacity: 0, x: dir * 24 }}
    animate={{ opacity: 1, x: 0 }}
    exit={reduce ? undefined : { opacity: 0, x: dir * -24 }}
    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    className="grid gap-4"
  >
    {children}
  </motion.div>
  );

        return (
        <Card id="book" className="scroll-mt-24 !bg-white p-5 sm:p-8">
          <div ref={root}>
            <h3 className="text-2xl font-serif text-plum-900">{heading ?? (enquiry ? "Book your appointment" : "Book this service")}</h3>

            {/* Stepper with WCAG accessibility */}
            <nav aria-label="Booking steps" className="mt-5">
              <ol className="flex items-center gap-2">
                {STEPS.map((s, i) => (
                  <li key={s.label} className="flex flex-1 items-center gap-2">
                    <button
                      type="button"
                      disabled={i > step}
                      onClick={() => i < step && go(i)}
                      aria-current={i === step ? "step" : undefined}
                      aria-label={`Step ${i + 1}: ${s.label}`}
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full border text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600",
                        i < step
                          ? "border-plum-700 bg-plum-700 text-ivory"
                          : i === step
                            ? "border-plum-700 text-plum-800 ring-4 ring-blush-200"
                            : "border-line text-ink-soft cursor-not-allowed"
                      )}
                    >
                      {i < step ? <Check className="size-4" /> : <s.icon className="size-4" />}
                    </button>
                    <span className={cn("hidden text-xs sm:block", i === step ? "font-semibold text-plum-800" : "text-ink-soft")}>
                      {s.label}
                    </span>
                    {i < STEPS.length - 1 && <span className="h-px flex-1 bg-line" aria-hidden />}
                  </li>
                ))}
              </ol>
            </nav>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-blush-100" aria-hidden>
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-rose-600 to-gold-400"
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Screen-reader announcement for step change */}
          <div className="sr-only" aria-live="polite">
            Step {step + 1} of {STEPS.length}: {STEPS[step]?.label}
          </div>

            <form
              action={action}
              className="mt-6"
              noValidate
              onKeyDown={(e) => {
                if (e.key === "Enter" && step < 3 && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                  e.preventDefault();
                  next();
                }
              }}
            >
              {/* Mirrored hidden inputs */}
              {(["serviceSlug", "packageSlug", "variant", "city", "area", "address", "eventDate", "slot", "name", "phone", "email", "message"] as const).map((k) => (
                <input key={k} type="hidden" name={k} value={v[k]} />
              ))}
              {v.addons.map((a) => (
                <input key={a} type="hidden" name="addons" value={a} />
              ))}
              <input type="hidden" name="guestCount" value={isGroup ? groupCount : "1"} />
              <input type="hidden" name="proSlug" value={proSlug ?? ""} />
              <input type="hidden" name="sourceUrl" value={sourcePath} />
              <input type="hidden" name="latitude" value={coords ? String(coords.lat) : ""} />
              <input type="hidden" name="longitude" value={coords ? String(coords.lng) : ""} />
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
              </div>

                        <div className="min-h-[15rem]">
                          <AnimatePresence mode="wait" initial={false}>
                            {step === 0 && panel(<>
                              {service ? (
                                <div className="rounded-2xl border border-line bg-white px-4 py-3.5 text-plum-800 shadow-2xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Selected Service</span>
                                    {currentBasePrice ? (
                                      <span className="rounded-full bg-blush-100/80 px-2.5 py-0.5 text-sm font-bold text-plum-950">
                                        ₹{currentBasePrice.toLocaleString("en-IN")}
                                      </span>
                                    ) : null}
                                  </div>
                                  <strong className="mt-1 block text-lg font-serif text-plum-950">{service.title}</strong>
                                  {proName ? <p className="text-xs text-ink-soft mt-0.5">With {proName}</p> : null}
                                </div>
                              ) : packageItem ? (
                                <div className="rounded-2xl border border-line bg-white px-4 py-3.5 text-plum-800 shadow-2xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Selected Package</span>
                                    {packageItem.price ? (
                                      <span className="rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-sm font-bold text-emerald-800">
                                        ₹{Math.round(packageItem.price).toLocaleString("en-IN")}
                                      </span>
                                    ) : null}
                                  </div>
                                  <strong className="mt-1 block text-lg font-serif text-plum-950">{packageItem.title}</strong>
                                </div>
                              ) : (
                                <div className="grid gap-1.5">
                                  <label htmlFor="booking-service" className="text-sm font-medium text-plum-900">What would you like to book?</label>
                                  <select
                                    id="booking-service"
                                    value={v.serviceSlug}
                                    onChange={(e) => set("serviceSlug", e.target.value)}
                                    className={fieldCls}
                                  >
                                    <option value="">
                                      {isLoadingOptions ? "Loading services…" : (options.length ? "Choose a service (optional)" : "No services available")}
                                    </option>
                                    {options.map((o) => <option key={o.slug} value={o.slug}>{o.title}</option>)}
                                  </select>
                                </div>
                              )}

              {service?.variants && service.variants.length > 0 && (
                                <fieldset className="grid gap-2">
                                  <legend className="mb-1 text-sm font-medium text-plum-900">Option</legend>
                                  {service.variants.map((o) => (
                                    <label
                                      key={o.name}
                                      className={cn(
                                        "flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 text-sm transition",
                                        v.variant === o.name ? "border-plum-700 bg-blush-50" : "border-line bg-white hover:bg-blush-50/60"
                                      )}
                                    >
                                      <span className="flex items-center gap-3">
                                        <input
                                          type="radio"
                                          name="_variant"
                                          checked={v.variant === o.name}
                                          onChange={() => set("variant", o.name)}
                                          className="accent-[var(--color-plum-700)]"
                                        />
                                        {o.name}
                                      </span>
                                      <span className="text-ink-soft">{inr(o.price).replace(/[()]/g, "")}</span>
                                    </label>
                                  ))}
                                </fieldset>
                              )}

              {service?.addons && service.addons.length > 0 && (
                                <fieldset className="grid gap-2">
                                  <legend className="mb-1 text-sm font-medium text-plum-900">Add-ons</legend>
                                  {service.addons.map((a) => (
                                    <label key={a.name} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-line bg-white px-4 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={v.addons.includes(a.name)}
                                        onChange={(e) => set("addons", e.target.checked ? [...v.addons, a.name] : v.addons.filter((x) => x !== a.name))}
                                        className="size-4 accent-[var(--color-plum-700)]"
                                      />
                                      {a.name}{inr(a.price)}
                                    </label>
                                  ))}
                                </fieldset>
                              )}

                            {/* Multi-service visit enhancement */}
                            <div className="rounded-2xl border border-blush-200/70 bg-blush-50/60 p-3.5">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Add to same visit (Save Time)</p>
                                {addonsTotal > 0 && (
                                  <span className="text-xs font-bold text-plum-950">
                                    Added: +₹{addonsTotal.toLocaleString("en-IN")}
                                  </span>
                                )}
                              </div>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {[
                                  { name: "Saree / Lehenga Draping", price: 999 },
                                  { name: "Designer Hair Styling & Setting", price: 1499 },
                                  { name: "Express Clean-Up & Anti-Tan Pack", price: 799 },
                                  { name: "Eyebrow & Upper Lip Threading", price: 99 },
                                ].map((a) => {
                                  const isChecked = v.addons.includes(a.name);
                                  return (
                                    <label key={a.name} className={cn("flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 text-xs transition", isChecked ? "border-plum-700 bg-white font-medium text-plum-900 shadow-soft" : "border-line/70 bg-white/80 hover:bg-white")}>
                                      <span className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={(e) => set("addons", e.target.checked ? [...v.addons, a.name] : v.addons.filter((x) => x !== a.name))}
                                          className="size-3.5 accent-[var(--color-plum-700)]"
                                        />
                                        <span>{a.name}</span>
                                      </span>
                                      <span className="font-semibold text-rose-700 shrink-0">+₹{a.price.toLocaleString("en-IN")}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Minimum Order Value Alert if < 499 */}
                            {isBelowMinOrder && (
                              <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-950 space-y-2">
                                <div className="flex items-center justify-between font-bold text-amber-950">
                                  <span className="flex items-center gap-1.5">
                                    <Sparkles className="size-4 text-amber-600" />
                                    Minimum Doorstep Booking: ₹499
                                  </span>
                                  <span className="font-mono text-xs">₹{currentCartTotal} / ₹499</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-amber-200 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(100, Math.round((currentCartTotal / 499) * 100))}%` }}
                                  />
                                </div>
                                <p className="text-[11px] text-amber-900 leading-relaxed">
                                  To cover travelling beautician visit, minimum booking is ₹499. Add <strong>₹{499 - currentCartTotal}</strong> more from the add-on options above to unlock your booking with 100% Free Doorstep Travel!
                                </p>
                              </div>
                            )}
                          </>)}

                            {step === 1 && panel(<>
                              <div className="space-y-4">
                                {/* Header with Live GPS Pin Button */}
                                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-line">
                                  <div>
                                    <h4 className="font-serif text-base font-bold text-plum-950">
                                      Where should our beautician come?
                                    </h4>
                                    <p className="text-xs text-ink-soft">
                                      Enter your doorstep address. Our certified female artist will arrive at your home.
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={detectLocation}
                                    disabled={geoStatus === "detecting"}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 cursor-pointer shrink-0 shadow-2xs",
                                      coords
                                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                        : "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100"
                                    )}
                                  >
                                    {geoStatus === "detecting" ? (
                                      <>
                                        <Loader2 className="size-3.5 animate-spin shrink-0" />
                                        <span>Detecting Live GPS…</span>
                                      </>
                                    ) : coords ? (
                                      <>
                                        <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                                        <span>GPS Pin Attached ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})</span>
                                      </>
                                    ) : (
                                      <>
                                        <MapPin className="size-3.5 text-rose-600 shrink-0" />
                                        <span>📍 Share Live Location (GPS)</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {coords && (
                                  <p className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-900">
                                    <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                                    <span>
                                      Live GPS pin captured! Your assigned beautician will navigate straight to your doorstep.
                                    </span>
                                  </p>
                                )}

                                {geoError && (
                                  <p className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-800">
                                    {geoError}
                                  </p>
                                )}

                                {/* Address Row 1: Flat/House No. & Society/Apartment */}
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div className="grid gap-1.5">
                                    <label htmlFor="booking-flat" className="text-xs font-semibold uppercase tracking-wider text-plum-900">
                                      Flat / House No. &amp; Floor <span className="text-rose-700">*</span>
                                    </label>
                                    <input
                                      id="booking-flat"
                                      value={v.flat}
                                      onChange={(e) => updateAddress({ flat: e.target.value })}
                                      className={cn(fieldCls, !v.flat && stepErr && "border-rose-600 focus:border-rose-600 focus:ring-rose-600/20")}
                                      placeholder="e.g. Flat 402, 4th Floor / House #14"
                                      autoComplete="address-line1"
                                    />
                                  </div>

                                  <div className="grid gap-1.5">
                                    <label htmlFor="booking-society" className="text-xs font-semibold uppercase tracking-wider text-plum-900">
                                      Society / Apartment / Building <span className="text-rose-700">*</span>
                                    </label>
                                    <input
                                      id="booking-society"
                                      value={v.society}
                                      onChange={(e) => updateAddress({ society: e.target.value })}
                                      className={cn(fieldCls, !v.society && stepErr && "border-rose-600 focus:border-rose-600 focus:ring-rose-600/20")}
                                      placeholder="e.g. Cleo County / Stellar Park / Gaur City"
                                      autoComplete="address-line2"
                                    />
                                  </div>
                                </div>

                                {/* Address Row 2: Locality / Sector & Landmark */}
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div className="grid gap-1.5">
                                    <label htmlFor="booking-area" className="text-xs font-semibold uppercase tracking-wider text-plum-900">
                                      Locality / Sector (Delhi NCR) <span className="text-rose-700">*</span>
                                    </label>
                                    <div className="relative">
                                      <input
                                        id="booking-area"
                                        value={v.area}
                                        onChange={(e) => updateAddress({ area: e.target.value })}
                                        list="booking-areas-list"
                                        autoComplete="address-level2"
                                        className={cn(fieldCls, !v.area && stepErr && "border-rose-600 focus:border-rose-600 focus:ring-rose-600/20")}
                                        placeholder="e.g. Sector 62, Indirapuram, Dwarka"
                                      />
                                      <datalist id="booking-areas-list">
                                        {ALL_AREAS.map((a) => (
                                          <option key={a.name} value={a.name} />
                                        ))}
                                      </datalist>
                                    </div>
                                  </div>

                                  <div className="grid gap-1.5">
                                    <label htmlFor="booking-landmark" className="text-xs font-semibold uppercase tracking-wider text-plum-900">
                                      Nearby Landmark <span className="font-normal text-ink-soft">(optional)</span>
                                    </label>
                                    <input
                                      id="booking-landmark"
                                      value={v.landmark}
                                      onChange={(e) => updateAddress({ landmark: e.target.value })}
                                      className={fieldCls}
                                      placeholder="e.g. Near Clubhouse / Metro Station / Gate 2"
                                    />
                                  </div>
                                </div>

                                {/* Quick Locality Picker from 40+ Localities */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="text-xs font-semibold text-rose-700 hover:text-rose-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>{dropdownOpen ? "▲ Hide locality browser" : "▼ Or choose from 40+ Delhi NCR localities list"}</span>
                                  </button>

                                  {dropdownOpen && (
                                    <div className="mt-2 rounded-2xl border border-line bg-white p-3.5 shadow-lift">
                                      <div className="space-y-2 border-b border-line pb-2.5">
                                        <div className="relative">
                                          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-soft" />
                                          <input
                                            type="text"
                                            value={areaSearch}
                                            onChange={(e) => setAreaSearch(e.target.value)}
                                            placeholder="Search sector, locality or colony…"
                                            className="w-full rounded-xl border border-line bg-blush-50/50 py-1.5 pl-8 pr-7 text-xs text-ink placeholder:text-ink-soft focus:border-rose-600 focus:outline-none"
                                          />
                                          {areaSearch && (
                                            <button
                                              type="button"
                                              onClick={() => setAreaSearch("")}
                                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink cursor-pointer"
                                            >
                                              <X className="size-3.5" />
                                            </button>
                                          )}
                                        </div>

                                        <div className="flex flex-wrap gap-1">
                                          {(["All", "Noida", "Gr. Noida", "Ghaziabad", "Delhi", "Gurgaon"] as const).map((r) => {
                                            const active = selectedRegionTab === r;
                                            return (
                                              <button
                                                key={r}
                                                type="button"
                                                onClick={() => setSelectedRegionTab(r)}
                                                className={cn(
                                                  "rounded-lg px-2 py-0.5 text-[11px] font-semibold transition cursor-pointer",
                                                  active
                                                    ? "bg-plum-700 text-ivory shadow-2xs"
                                                    : "bg-blush-50 text-ink-soft hover:bg-blush-100 hover:text-plum-950"
                                                )}
                                              >
                                                {r}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      <div className="mt-2 max-h-[180px] space-y-1 overflow-y-auto pr-1">
                                        {filteredAreas.map((item) => (
                                          <button
                                            key={item.name}
                                            type="button"
                                            onClick={() => {
                                              updateAddress({ area: item.name, city: item.citySlug });
                                              setDropdownOpen(false);
                                            }}
                                            className={cn(
                                              "flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition cursor-pointer",
                                              v.area === item.name
                                                ? "bg-plum-50 font-bold text-plum-950"
                                                : "hover:bg-blush-50/80 text-ink"
                                            )}
                                          >
                                            <span>{item.name}</span>
                                            <span className="text-[10px] text-ink-soft rounded bg-blush-100 px-1.5 py-0.5">{item.region}</span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* City Region Indicator */}
                                <div className="flex items-center justify-between text-xs text-ink-soft pt-1">
                                  <span>City region: <strong className="text-plum-900 capitalize">{cityName || v.city || "Auto-detected"}</strong></span>
                                  <details className="cursor-pointer">
                                    <summary className="text-rose-700 underline">Change region</summary>
                                    <div className="mt-2">
                                      <select
                                        id="booking-city"
                                        value={v.city}
                                        onChange={(e) => updateAddress({ city: e.target.value })}
                                        className={cn(fieldCls, "text-xs py-1.5 min-h-9")}
                                      >
                                        <option value="" disabled>Select region</option>
                                        {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                                        <option value="other">Outside Delhi NCR</option>
                                      </select>
                                    </div>
                                  </details>
                                </div>

                                {v.city === "other" && (
                                  <p className="rounded-2xl bg-blush-50 p-3 text-sm text-plum-800">
                                    We are not in your city yet. Continue anyway and we will let you know when we arrive.
                                  </p>
                                )}

                                {(stepErr || err("city")) && (
                                  <p className="text-xs font-semibold text-rose-700 rounded-lg bg-rose-50 p-2.5 border border-rose-200" role="alert">
                                    {stepErr || err("city")}
                                  </p>
                                )}
                              </div>
                            </>)}

                            {step === 2 && panel(<>
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-700">Quick-select preferred date</p>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Quick date options">
                                  {quickDates.map((qd) => (
                                    <button
                                      type="button"
                                      key={qd.label}
                                      aria-pressed={v.eventDate === qd.iso}
                                      onClick={() => set("eventDate", qd.iso)}
                                      className={cn(
                                        "flex flex-col items-center justify-center rounded-2xl border p-2.5 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600",
                                        v.eventDate === qd.iso
                                          ? "border-plum-700 bg-plum-700 text-ivory ring-2 ring-blush-200 shadow-soft"
                                          : "border-line bg-white text-plum-900 hover:bg-blush-50"
                                      )}
                                    >
                                      <span className="text-xs font-semibold">{qd.label}</span>
                                      <span className={cn("text-[0.7rem]", v.eventDate === qd.iso ? "text-blush-100" : "text-ink-soft")}>{qd.sub}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="grid gap-1.5">
                                <label htmlFor="booking-date" className="text-sm font-medium text-plum-900">Or choose specific date</label>
                                <input
                                  id="booking-date"
                                  type="date"
                                  min={new Date().toISOString().slice(0, 10)}
                                  value={v.eventDate}
                                  onChange={(e) => set("eventDate", e.target.value)}
                                  className={fieldCls}
                                />
                              </div>

                            <fieldset className="grid gap-2">
                              <legend className="mb-1 text-sm font-medium text-plum-900">Preferred time slot <span className="font-normal text-ink-soft">(optional)</span></legend>
                              <div className="grid gap-2 sm:grid-cols-3">
                                {SLOTS.map((s) => (
                                  <button
                                    type="button"
                                    key={s}
                                    onClick={() => set("slot", v.slot === s ? "" : s)}
                                    aria-pressed={v.slot === s}
                                    className={cn(
                                      "min-h-12 rounded-2xl border px-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600",
                                      v.slot === s ? "border-plum-700 bg-plum-700 text-ivory font-medium" : "border-line bg-white text-plum-800 hover:bg-blush-50"
                                    )}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </fieldset>
                          </>)}

                            {step === 3 && panel(<>
                              <div className="grid gap-1.5">
                                <label htmlFor="booking-name" className="text-sm font-medium text-plum-900">Your name</label>
                                <input
                                  id="booking-name"
                                  value={v.name}
                                  onChange={(e) => set("name", e.target.value)}
                                  autoComplete="name"
                                  className={cn(fieldCls, err("name") && "border-rose-600 focus:border-rose-600 focus:ring-rose-600/20")}
                                  placeholder="Full name"
                                  aria-invalid={!!err("name")}
                                  aria-describedby={err("name") ? "booking-name-err" : undefined}
                                />
                                {err("name") && <span id="booking-name-err" className="text-xs text-rose-700">{err("name")}</span>}
                              </div>

                              <div className="grid gap-1.5">
                                <label htmlFor="booking-phone" className="text-sm font-medium text-plum-900">Mobile number</label>
                                <div className="relative flex items-center">
                                  <span className="pointer-events-none absolute left-4 flex items-center gap-1 text-sm font-semibold text-plum-900 border-r border-line pr-2.5">
                                    🇮🇳 +91
                                  </span>
                                  <input
                                    id="booking-phone"
                                    value={v.phone}
                                    onChange={(e) => set("phone", e.target.value)}
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    className={cn(fieldCls, "pl-20", err("phone") && "border-rose-600 focus:border-rose-600 focus:ring-rose-600/20")}
                                    placeholder="98765 43210"
                                    aria-invalid={!!err("phone")}
                                    aria-describedby={err("phone") ? "booking-phone-err" : undefined}
                                  />
                                </div>
                                {err("phone") && <span id="booking-phone-err" className="text-xs text-rose-700">{err("phone")}</span>}
                              </div>

                              <div className="grid gap-1.5">
                                <label htmlFor="booking-email" className="text-sm font-medium text-plum-900">
                                  Email <span className="font-normal text-ink-soft">(optional, for confirmation receipt)</span>
                                </label>
                                <input
                                  id="booking-email"
                                  value={v.email}
                                  onChange={(e) => set("email", e.target.value)}
                                  type="email"
                                  autoComplete="email"
                                  className={fieldCls}
                                  placeholder="name@example.com"
                                />
                              </div>

                              <div className="grid gap-1.5">
                                <label htmlFor="booking-message" className="text-sm font-medium text-plum-900">
                                  Special requests or preferences <span className="font-normal text-ink-soft">(optional)</span>
                                </label>
                                <textarea
                                  id="booking-message"
                                  value={v.message}
                                  onChange={(e) => set("message", e.target.value)}
                                  rows={2}
                                  className={cn(fieldCls, "py-3")}
                                  placeholder="e.g. Sensitive skin, floral jewellery preference, elevator available"
                                />
                              </div>

                                {/* Group / Multi-person booking option */}
                                <div className="rounded-2xl border border-blush-200/80 bg-blush-50/60 p-4">
                                  <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-plum-900">
                                    <input
                                      type="checkbox"
                                      checked={isGroup}
                                      onChange={(e) => {
                                        setIsGroup(e.target.checked);
                                        if (e.target.checked) {
                                          const clean = v.message.replace(/\s*\[Group: [^\]]+\]/g, "").trim();
                                          set("message", clean ? `${clean} [Group: ${groupCount} people]` : `[Group: ${groupCount} people]`);
                                        } else {
                                          set("message", v.message.replace(/\s*\[Group: [^\]]+\]/g, "").trim());
                                        }
                                      }}
                                      className="size-4 accent-[var(--color-plum-700)]"
                                    />
                                    <span>Booking for more than 1 person? <span className="font-normal text-ink-soft">(e.g. bride + mother, friends)</span></span>
                                  </label>

                                {isGroup && (
                                  <div className="mt-3 pl-7">
                                    <p className="text-xs text-ink-soft mb-2">Total persons receiving services at home:</p>
                                    <div className="flex gap-2">
                                      {["2", "3", "4+"].map((count) => (
                                        <button
                                          type="button"
                                          key={count}
                                          aria-pressed={groupCount === count}
                                          onClick={() => {
                                            setGroupCount(count);
                                            const clean = v.message.replace(/\s*\[Group: [^\]]+\]/g, "").trim();
                                            set("message", clean ? `${clean} [Group: ${count} people]` : `[Group: ${count} people]`);
                                          }}
                                          className={cn(
                                            "rounded-full border px-4 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600",
                                            groupCount === count
                                              ? "border-plum-700 bg-plum-700 text-ivory shadow-soft"
                                              : "border-line bg-white text-plum-900 hover:bg-blush-100"
                                          )}
                                        >
                                          {count} people
                                        </button>
                                      ))}
                                    </div>
                                    <p className="mt-2 text-[0.75rem] text-emerald-800">
                                      ✓ We will allocate additional service time or assign 2 verified female artists so everyone is ready on time.
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Safety & Payment Reassurance Block */}
                              <div className="rounded-2xl border border-emerald-600/20 bg-emerald-50/70 p-3.5 text-xs text-emerald-950">
                                <p className="mb-1.5 flex items-center gap-1.5 font-semibold text-emerald-900">
                                  <Check className="size-4 text-emerald-700" /> HerrGlow Safety &amp; Payment Promise
                                </p>
                                <div className="grid gap-1 sm:grid-cols-2 text-emerald-800">
                                  <span className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600 shrink-0" /> 100% Background-Verified Female Beauticians</span>
                                  <span className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600 shrink-0" /> Only 10% Advance (Balance 90% after service)</span>
                                  <span className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600 shrink-0" /> 100% Refund Guarantee if beautician does not reach</span>
                                  <span className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600 shrink-0" /> Free cancellation anytime up to 2 hrs before visit</span>
                                </div>
                              </div>

                        {err("form") && <p className="text-sm text-rose-700" role="alert">{err("form")}</p>}
                      </>)}
                  </AnimatePresence >
        </div>

              <div className="mt-5">{Summary}</div>

              <div className="mt-5 flex items-center justify-between gap-3">
                {step > 0 ? (
                  <Button type="button" variant="ghost" onClick={() => go(step - 1)}>
                    <ArrowLeft className="size-4" />Back
                  </Button>
                ) : (
                  <span />
                )}
                {step < 3 ? (
                  <Button
                    type="button"
                    variant={step === 0 && isBelowMinOrder ? "outline" : "shimmer"}
                    onClick={next}
                    className={step === 0 && isBelowMinOrder ? "border-amber-400 bg-amber-50 text-amber-950 font-bold hover:bg-amber-100" : undefined}
                  >
                    {step === 0 && isBelowMinOrder ? `Add ₹${499 - currentCartTotal} to Continue` : "Continue"}
                    <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button type="submit" variant="shimmer" size="lg" disabled={pending}>
                    {pending ? "Sending…" : "Confirm Booking · Reserve Slot"}
                  </Button>
                )}
              </div>
              <p className="mt-4 text-xs text-ink-soft text-center sm:text-left">
                Only 10% advance deposit to lock your slot · Remaining 90% after service · 100% full refund guarantee if beautician does not reach you. See our <a className="underline hover:text-plum-800" href="/privacy-policy">privacy policy</a>.
              </p>
            </form>
    </Card>
  );
}
