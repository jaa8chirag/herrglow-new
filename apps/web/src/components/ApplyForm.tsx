"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCircle2, ChevronDown, Loader2, MapPin, MessageCircle, Plus, Search, Sparkles, X } from "lucide-react";
import { Button, Card, cn } from "@herrglow/ui";
import { submitApplication, type ApplyState } from "@/app/actions-apply";
import { whatsappLink } from "@/lib/whatsapp";

const fieldCls = "w-full min-h-12 rounded-xl border border-line bg-white px-4 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-soft/60 focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-600/20";

const DEFAULT_AREAS = [
  "Indirapuram",
  "Vaishali",
  "Vasundhara",
  "Noida Sector 62",
  "Noida Sector 76",
  "Noida Sector 50",
  "Noida Sector 18",
  "Noida Sector 137",
  "Noida Sector 128",
  "Gaur City 1",
  "Gaur City 2",
  "Pari Chowk",
  "Greater Noida West",
  "South Delhi",
  "Dwarka",
  "Lajpat Nagar",
  "Rohini",
  "Saket",
  "Janakpuri",
  "Vasant Kunj",
  "Gurgaon DLF Phase 1-5",
  "Sohna Road",
  "Golf Course Road",
];

const TRAVEL_DISTANCES = [
  { value: 5, enLabel: "Up to 5 km", hiLabel: "5 km tak", enDesc: "Hyperlocal (nearby sectors)", hiDesc: "Sirf paas ke sectors" },
  { value: 10, enLabel: "Up to 10 km", hiLabel: "10 km tak", enDesc: "Standard (comfortable commute)", hiDesc: "Normal aane-jaane ki doori" },
  { value: 20, enLabel: "Up to 20 km", hiLabel: "20 km tak", enDesc: "Wide (entire city / across sectors)", hiDesc: "Pore city mein kahin bhi" },
  { value: 40, enLabel: "All Delhi NCR", hiLabel: "Pura Delhi NCR", enDesc: "Bridal, Party & VIP appointments", hiDesc: "Bridal aur VIP party bookings" },
];

export interface AreaClusterItem {
  name: string;
  region: "Noida" | "Greater Noida" | "Ghaziabad" | "Delhi" | "Gurgaon";
}

const ALL_AREAS: AreaClusterItem[] = [
  // Noida
  { name: "Sector 62, Noida", region: "Noida" },
  { name: "Sector 18 / Atta, Noida", region: "Noida" },
  { name: "Sector 50, Noida", region: "Noida" },
  { name: "Sector 76 / 75 / 78, Noida", region: "Noida" },
  { name: "Sector 137, Noida", region: "Noida" },
  { name: "Sector 128 / Wish Town, Noida", region: "Noida" },
  { name: "Sector 104 / 100, Noida", region: "Noida" },
  { name: "Sector 150 / Expressway, Noida", region: "Noida" },
  { name: "Sector 93 / 93A, Noida", region: "Noida" },
  { name: "Sector 12 / 22, Noida", region: "Noida" },
  { name: "Sector 34 / 52, Noida", region: "Noida" },

  // Ghaziabad
  { name: "Indirapuram, Ghaziabad", region: "Ghaziabad" },
  { name: "Vaishali, Ghaziabad", region: "Ghaziabad" },
  { name: "Vasundhara, Ghaziabad", region: "Ghaziabad" },
  { name: "Kaushambi, Ghaziabad", region: "Ghaziabad" },
  { name: "Crossings Republik, Ghaziabad", region: "Ghaziabad" },
  { name: "Raj Nagar Extension, Ghaziabad", region: "Ghaziabad" },

  // Greater Noida / Gr. Noida West
  { name: "Gaur City 1 & 2 (Noida Ext.)", region: "Greater Noida" },
  { name: "Sector 1 / Techzone 4, Greater Noida", region: "Greater Noida" },
  { name: "Pari Chowk, Greater Noida", region: "Greater Noida" },
  { name: "Alpha 1 & 2, Greater Noida", region: "Greater Noida" },
  { name: "Beta 1 & 2, Greater Noida", region: "Greater Noida" },
  { name: "Delta & Gamma, Greater Noida", region: "Greater Noida" },
  { name: "Knowledge Park, Greater Noida", region: "Greater Noida" },

  // Delhi
  { name: "South Delhi (GK / Saket / Malviya Nagar)", region: "Delhi" },
  { name: "Dwarka (All Sectors)", region: "Delhi" },
  { name: "Lajpat Nagar / Defence Colony", region: "Delhi" },
  { name: "Vasant Kunj / Vasant Vihar", region: "Delhi" },
  { name: "Hauz Khas / Green Park", region: "Delhi" },
  { name: "Rohini (Sectors 1-25)", region: "Delhi" },
  { name: "Janakpuri / West Delhi", region: "Delhi" },
  { name: "Pitampura / Shalimar Bagh", region: "Delhi" },
  { name: "East Delhi (Mayur Vihar / Laxmi Nagar)", region: "Delhi" },

  // Gurgaon
  { name: "DLF Phase 1, 2, 3, 4, 5", region: "Gurgaon" },
  { name: "Golf Course Road & Ext.", region: "Gurgaon" },
  { name: "Sohna Road", region: "Gurgaon" },
  { name: "Sector 56 / 57, Gurgaon", region: "Gurgaon" },
  { name: "Sector 48 / 49, Gurgaon", region: "Gurgaon" },
  { name: "Cyber City & MG Road", region: "Gurgaon" },
  { name: "New Gurgaon (Sectors 81-95)", region: "Gurgaon" },
];

export interface ApplyFormProps {
  categories: { slug: string; name: string }[];
  cities?: { slug: string; name: string }[];
  areas?: string[];
  whatsappNumber?: string;
  initialLang?: "en" | "hi";
  lang?: "en" | "hi";
  onLangChange?: (newLang: "en" | "hi") => void;
  hideLangToggle?: boolean;
  hideWhatsAppCard?: boolean;
}

export function ApplyForm({
  categories,
  areas = [],
  whatsappNumber,
  initialLang = "en",
  lang: controlledLang,
  onLangChange,
  hideLangToggle = false,
  hideWhatsAppCard = false,
}: ApplyFormProps) {
  const [internalLang, setInternalLang] = useState<"en" | "hi">(initialLang);
  const lang = controlledLang ?? internalLang;
  const [state, action, pending] = useActionState<ApplyState, FormData>(submitApplication, { status: "idle" });
  const [geoStatus, setGeoStatus] = useState<"idle" | "detecting" | "success" | "error">("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const [geoError, setGeoError] = useState("");
  const [areaValue, setAreaValue] = useState("");

  // Helper for bilingual strings
  const t = (en: string, hi: string) => (lang === "hi" ? hi : en);

  // Sync lang with URL query param and localStorage
  const handleLanguageChange = (newLang: "en" | "hi") => {
    if (onLangChange) {
      onLangChange(newLang);
    } else {
      setInternalLang(newLang);
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("herrglow_apply_lang", newLang);
        const url = new URL(window.location.href);
        if (newLang === "hi") {
          url.searchParams.set("lang", "hi");
        } else {
          url.searchParams.delete("lang");
        }
        window.history.replaceState({}, "", url.toString());
      } catch {
        // storage or history restricted
      }
    }
  };

  useEffect(() => {
    if (controlledLang) return;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang");
      if (urlLang === "hi" || urlLang === "en") {
        setInternalLang(urlLang);
      } else {
        const stored = localStorage.getItem("herrglow_apply_lang");
        if (stored === "hi" || stored === "en") {
          setInternalLang(stored);
        }
      }
    }
  }, [controlledLang]);

  const err = (k: string) => {
    if (state.status !== "error") return undefined;
    const msg = state.errors[k];
    if (!msg) return undefined;
    if (lang === "hi") {
      if (k === "name") return "Kripya apna poora naam daalein";
      if (k === "phone") return "Sahi 10-digit mobile number daalein (jaise 9876543210)";
      if (k === "email") return "Sahi email ID daalein ya ise khali chhod dein";
      if (k === "area" || k === "city") return "Kripya apna area ya locality chunein";
      if (k === "operatingAreas") return "Kripya kam se kam ek operating area chunein";
      if (k === "experienceYears") return "Experience ke saal number mein daalein (jaise 3 ya 5)";
      if (k === "portfolioUrl") return "Poora web link https:// ke sath daalein";
      if (k === "photo") return "Photo 5 MB se choti aur sahi format (JPG, PNG) mein honi chahiye";
      if (k === "idProof") return "Govt ID photo ya PDF 5 MB se kam size ki honi chahiye";
      if (k === "form") return "Bahut saari requests aayi hain. Kripya thodi der baad koshish karein.";
    }
    return msg;
  };

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
        // Reverse-geocode via OpenStreetMap for friendly locality name if user hasn't typed one
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
              data.address?.city_district ||
              data.address?.city ||
              "";
            if (place && !areaValue) {
              setAreaValue(place);
            }
          }
        } catch {
          // Coordinates are captured even if reverse geocoding is blocked
        }
      },
      (e) => {
        setGeoStatus("error");
        setGeoError(
          e.code === 1
            ? "Location permission was denied. You can still type your area manually below."
            : "Could not retrieve live GPS pin. Please type your area manually below."
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");
  const [selectedRegionTab, setSelectedRegionTab] = useState<string>("All");
  const [customArea, setCustomArea] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const detectedRegion = useMemo<"Noida" | "Greater Noida" | "Ghaziabad" | "Delhi" | "Gurgaon">(() => {
    const text = areaValue.toLowerCase();
    if (text.includes("noida") && !text.includes("greater") && !text.includes("ext")) return "Noida";
    if (text.includes("indirapuram") || text.includes("vaishali") || text.includes("vasundhara") || text.includes("ghaziabad") || text.includes("kaushambi")) return "Ghaziabad";
    if (text.includes("gaur city") || text.includes("greater noida") || text.includes("pari chowk") || text.includes("noida ext") || text.includes("beta") || text.includes("alpha")) return "Greater Noida";
    if (text.includes("delhi") || text.includes("dwarka") || text.includes("saket") || text.includes("rohini") || text.includes("lajpat") || text.includes("vasant") || text.includes("hauz") || text.includes("janakpuri")) return "Delhi";
    if (text.includes("gurgaon") || text.includes("gurugram") || text.includes("dlf") || text.includes("sohna") || text.includes("golf course")) return "Gurgaon";

    if (coords) {
      if (coords.lng > 77.44 && coords.lat < 28.52) return "Greater Noida";
      if (coords.lng > 77.30 && coords.lat > 28.60) return "Ghaziabad";
      if (coords.lng > 77.28 && coords.lat <= 28.60) return "Noida";
      if (coords.lng < 77.12 && coords.lat < 28.52) return "Gurgaon";
      if (coords.lng >= 77.00 && coords.lng <= 77.30) return "Delhi";
    }

    return "Noida";
  }, [areaValue, coords]);

  const nearbyAreas = useMemo(() => {
    if (detectedRegion === "Ghaziabad") {
      return ALL_AREAS.filter((a) => a.region === "Ghaziabad" || a.name.includes("Sector 62") || a.name.includes("Sector 50"));
    }
    if (detectedRegion === "Noida") {
      return ALL_AREAS.filter((a) => a.region === "Noida" || a.name.includes("Indirapuram") || a.name.includes("Gaur City"));
    }
    return ALL_AREAS.filter((a) => a.region === detectedRegion);
  }, [detectedRegion]);

  const toggleArea = (name: string) => {
    setSelectedAreas((prev) => (prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]));
  };

  const allNearbySelected = nearbyAreas.length > 0 && nearbyAreas.every((a) => selectedAreas.includes(a.name));

  const toggleAllNearby = () => {
    if (allNearbySelected) {
      const names = new Set(nearbyAreas.map((a) => a.name));
      setSelectedAreas((prev) => prev.filter((a) => !names.has(a)));
    } else {
      const names = new Set([...selectedAreas, ...nearbyAreas.map((a) => a.name)]);
      setSelectedAreas([...names]);
    }
  };

  const addCustomArea = () => {
    const trimmed = customArea.trim();
    if (trimmed && !selectedAreas.includes(trimmed)) {
      setSelectedAreas([...selectedAreas, trimmed]);
      setCustomArea("");
    }
  };

  const removeArea = (name: string) => {
    setSelectedAreas((prev) => prev.filter((a) => a !== name));
  };

  const filteredAreas = useMemo(() => {
    return ALL_AREAS.filter((item) => {
      if (selectedRegionTab === "Recommended") {
        const isNearby = nearbyAreas.some((na) => na.name === item.name);
        if (!isNearby) return false;
      } else if (selectedRegionTab !== "All" && item.region !== selectedRegionTab) {
        return false;
      }
      if (areaSearch.trim()) {
        const q = areaSearch.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.region.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedRegionTab, areaSearch, nearbyAreas]);

  const waUrl = whatsappLink(
    whatsappNumber,
    lang === "hi"
      ? "Namaste HerrGlow! Main ek professional beautician / makeup artist hoon aur HerrGlow ke sath judna chahti hoon. Main apna kaam aur operating areas share karna chahti hoon."
      : "Hi HerrGlow! I am a professional beautician / makeup artist and would like to register with HerrGlow. I want to share my work and operating areas."
  );

  const areaSuggestions = areas.length > 0 ? areas : DEFAULT_AREAS;

  if (state.status === "done")
    return (
      <Card id="apply" className="p-8">
        <h2 className="text-2xl font-serif text-plum-900">
          {t("Thank you, we have received your application", "Dhanyawaad! Aapki application hume mil gayi hai 🎉")}
        </h2>
        <p className="mt-3 text-ink-soft">
          {t(
            "Our Artist Onboarding team will review your portfolio and operating areas and reach out to you via call / WhatsApp within 24 hours.",
            "Hamari Artist Onboarding team aapki details aur operating areas review karke 24 ghante ke andar aapko phone ya WhatsApp karegi."
          )}
        </p>
      </Card>
    );

  return (
    <Card id="apply" className="scroll-mt-24 p-6 sm:p-8 lg:p-10 w-full min-w-0">
      {/* Language Selector Header (rendered when not controlled externally) */}
      {!hideLangToggle && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-blush-200/90 bg-gradient-to-r from-blush-50 via-white to-blush-50/60 p-3.5 sm:p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-plum-100 font-bold text-xs text-plum-900 shadow-xs">
              A/आ
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-plum-950 truncate">
                {lang === "hi" ? "Form ki Bhasha (Language)" : "Choose Form Language"}
              </p>
              <p className="text-[0.72rem] text-ink-soft">
                {lang === "hi"
                  ? "Form aasan Hinglish (spoken Hindi) mein dikhaya ja raha hai"
                  : "Select English or simple conversational Hinglish"}
              </p>
            </div>
          </div>

          <div className="inline-flex rounded-xl bg-blush-100/90 p-1 border border-blush-200/80 self-start sm:self-center shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => handleLanguageChange("en")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                lang === "en"
                  ? "bg-white text-plum-950 shadow-xs ring-1 ring-black/5"
                  : "text-ink-soft hover:text-plum-950"
              )}
              aria-pressed={lang === "en"}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("hi")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer",
                lang === "hi"
                  ? "bg-plum-700 text-ivory shadow-xs font-bold"
                : "text-ink-soft hover:text-plum-950"
              )}
              aria-pressed={lang === "hi"}
            >
              <span>हिन्दी</span>
              <span className="text-[0.68rem] opacity-90 font-medium">(Hinglish)</span>
            </button>
          </div>
        </div>
      )}

      {!hideWhatsAppCard && waUrl && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <MessageCircle className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-950">
                {t("Prefer applying via WhatsApp?", "Kya aap seedhe WhatsApp par apply karna chahti hain?")}
              </p>
              <p className="text-xs text-emerald-800">
                {t(
                  "Chat directly with our Artist Coordinator to share your profile and portfolio.",
                  "Hamare Artist Coordinator se seedhe WhatsApp par baat karein aur apna profile share karein."
                )}
              </p>
            </div>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1f8f4e] px-4 py-2.5 text-xs font-semibold text-white shadow-soft transition hover:bg-[#187a41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <MessageCircle className="size-4" /> {t("Chat on WhatsApp", "WhatsApp par baat karein")}
          </a>
        </div>
      )}

      <form action={action} className="grid gap-5 min-w-0" noValidate>
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 min-w-0">
          <label className="grid gap-1.5 text-sm font-medium text-plum-900 min-w-0">
            {t("Full name", "Aapka poora naam (Full Name)")}
            <input
              name="name"
              required
              autoComplete="name"
              className={cn(fieldCls, err("name") && "border-rose-600")}
              placeholder={t("e.g. Priya Sharma", "Jaise: Priya Sharma")}
            />
            {err("name") && <span className="text-xs text-rose-700">{err("name")}</span>}
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-plum-900 min-w-0">
            {t("Mobile number (WhatsApp preferred)", "Mobile number (WhatsApp wala)")}
            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              required
              autoComplete="tel"
              className={cn(fieldCls, err("phone") && "border-rose-600")}
              placeholder={t("10-digit mobile number", "10-digit mobile number")}
            />
            {err("phone") && <span className="text-xs text-rose-700">{err("phone")}</span>}
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-plum-900 sm:col-span-2 min-w-0">
            <span>
              {t("Email", "Email ID")}{" "}
              <span className="font-normal text-ink-soft">({t("optional", "agar hai to")})</span>
            </span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              className={cn(fieldCls, err("email") && "border-rose-600")}
              placeholder={t("you@example.com", "aapka-email@example.com")}
            />
            {err("email") && <span className="text-xs text-rose-700">{err("email")}</span>}
          </label>

          <div className="grid gap-1.5 sm:col-span-2 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
              <label htmlFor="apply-area-input" className="text-sm font-medium text-plum-900">
                {t("Your home area / locality", "Aap kahan rehti hain? (Ghar ka area)")}{" "}
                <span className="font-normal text-ink-soft">
                  ({t("where you live", "aapki society ya sector")})
                </span>
              </label>
              <button
                type="button"
                onClick={detectLocation}
                disabled={geoStatus === "detecting"}
                className={cn(
                  "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 cursor-pointer shrink-0",
                  coords
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50/70 text-rose-800 hover:bg-rose-100"
                )}
              >
                {geoStatus === "detecting" ? (
                  <>
                    <Loader2 className="size-3 animate-spin shrink-0" />{" "}
                    <span className="truncate">{t("Detecting Live GPS…", "GPS Location dhundh rahe hain…")}</span>
                  </>
                ) : coords ? (
                  <>
                    <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />{" "}
                    <span className="truncate">
                      {t("GPS Pin Captured", "GPS Location mil gayi")} ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
                    </span>
                  </>
                ) : (
                  <>
                    <MapPin className="size-3 text-rose-600 shrink-0" />{" "}
                    <span className="truncate">{t("Share Live Location (GPS)", "📍 Live Location Share Karein (GPS)")}</span>
                  </>
                )}
              </button>
            </div>

            <input
              id="apply-area-input"
              name="area"
              required
              value={areaValue}
              onChange={(e) => setAreaValue(e.target.value)}
              list="apply-areas"
              className={cn(fieldCls, (err("area") || err("city")) && "border-rose-600")}
              placeholder={t("e.g. Indirapuram, Sector 62, Dwarka", "Jaise: Indirapuram, Sector 62, Dwarka")}
            />
            <datalist id="apply-areas">
              {areaSuggestions.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>

            {coords && (
              <p className="flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-900 min-w-0">
                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                <span className="min-w-0">
                  {t(
                    "Live GPS coordinates attached. Clients near your location will be matched directly to you.",
                    "Aapki live GPS location save ho gayi hai. Aapke paas ke clients ke bookings direct aapko milenge."
                  )}
                </span>
              </p>
            )}

            {geoError && (
              <p className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs text-amber-800">
                {geoError}
              </p>
            )}

            {(err("area") || err("city")) && <span className="text-xs text-rose-700">{err("area") || err("city")}</span>}

            {/* Hidden GPS inputs sent with form submission */}
            <input type="hidden" name="latitude" value={coords ? coords.lat : ""} />
            <input type="hidden" name="longitude" value={coords ? coords.lng : ""} />
          </div>

          <div className="grid gap-2 sm:col-span-2 min-w-0" ref={dropdownRef}>
            <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
              <label className="text-sm font-medium text-plum-900">
                {t("Which areas do you operate in?", "Aap kin-kin areas mein service de sakti hain?")}{" "}
                <span className="font-normal text-ink-soft">
                  ({t("select all localities you cover", "Operating Areas - jahan aap ja sakti hain")})
                </span>
              </label>
              {selectedAreas.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedAreas([])}
                  className="text-xs text-rose-700 underline hover:text-rose-800 transition cursor-pointer shrink-0"
                >
                  {t(`Clear all (${selectedAreas.length})`, `Sabhi hatayein (${selectedAreas.length})`)}
                </button>
              )}
            </div>

            {/* Smart Recommendation based on their location */}
            <div className="rounded-2xl border border-blush-200/80 bg-blush-50/70 p-3.5 sm:p-4 space-y-2.5 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700 min-w-0">
                  <Sparkles className="size-3.5 text-gold-500 shrink-0" />
                  <span className="truncate">{t(`Recommended for your location (${detectedRegion})`, `Aapke area ke paas ke sectors (${detectedRegion})`)}</span>
                </span>
                <button
                  type="button"
                  onClick={toggleAllNearby}
                  className="text-xs font-semibold text-plum-900 underline hover:text-rose-700 transition cursor-pointer shrink-0"
                >
                  {allNearbySelected
                    ? t("Deselect all nearby", "Sabhi paas ke areas hatayein")
                    : t(`+ Select all ${nearbyAreas.length} nearby areas`, `+ Paas ke sabhi ${nearbyAreas.length} areas chunein`)}
                </button>
              </div>

              {/* Quick-tap chips for nearby areas */}
              <div className="flex flex-wrap gap-1.5 min-w-0">
                {nearbyAreas.map((item) => {
                  const isSelected = selectedAreas.includes(item.name);
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => toggleArea(item.name)}
                      className={cn(
                        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition cursor-pointer",
                        isSelected
                          ? "border-plum-700 bg-plum-700 font-medium text-ivory shadow-xs"
                          : "border-line bg-white text-plum-900 hover:border-plum-400 hover:bg-blush-100"
                      )}
                    >
                      {isSelected ? <Check className="size-3 shrink-0" /> : <Plus className="size-3 text-ink-soft shrink-0" />}
                      <span className="truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dropdown Button */}
            <div className="relative min-w-0">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={cn(
                  fieldCls,
                  "flex items-center justify-between text-left cursor-pointer transition gap-2",
                  dropdownOpen && "ring-2 ring-rose-600/20 border-rose-600",
                  err("operatingAreas") && selectedAreas.length === 0 && "border-rose-600"
                )}
              >
                <span className={cn("truncate min-w-0", selectedAreas.length === 0 ? "text-ink-soft/70" : "text-plum-950 font-medium")}>
                  {selectedAreas.length === 0
                    ? t("Choose operating areas from dropdown (or tap above)…", "List mein se apne service areas chunein (ya upar tap karein)…")
                    : t(`${selectedAreas.length} operating areas selected`, `${selectedAreas.length} service areas chune gaye hain`)}
                </span>
                <ChevronDown className={cn("size-4 text-ink-soft shrink-0 transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[420px] overflow-hidden rounded-2xl border border-line bg-white p-3.5 shadow-lift w-full max-w-full">
                  {/* Search and region filter tabs */}
                  <div className="space-y-2.5 border-b border-line pb-3 min-w-0">
                    <div className="relative min-w-0">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
                      <input
                        type="text"
                        value={areaSearch}
                        onChange={(e) => setAreaSearch(e.target.value)}
                        placeholder={t("Search sectors, societies (e.g. Sector 62, Dwarka, Gaur City)...", "Area ya society ka naam search karein (jaise Sector 62, Gaur City)...")}
                        className="w-full rounded-xl border border-line bg-blush-50/50 pl-9 pr-3 py-2 text-xs text-ink placeholder:text-ink-soft/60 focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-w-0">
                      {[
                        { id: "All", label: t("All", "Sabhi") },
                        { id: "Recommended", label: t(`✨ ${detectedRegion}`, `✨ Paas ke (${detectedRegion})`) },
                        { id: "Noida", label: "Noida" },
                        { id: "Ghaziabad", label: "Ghaziabad" },
                        { id: "Greater Noida", label: "Gr. Noida" },
                        { id: "Delhi", label: "Delhi" },
                        { id: "Gurgaon", label: "Gurgaon" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSelectedRegionTab(tab.id)}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[0.72rem] font-medium transition cursor-pointer whitespace-nowrap",
                            selectedRegionTab === tab.id
                              ? "bg-plum-700 text-ivory font-semibold shadow-xs"
                              : "bg-blush-100/70 text-plum-900 hover:bg-blush-200"
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scrollable multi-select checkbox list */}
                  <div className="max-h-[200px] overflow-y-auto py-2 divide-y divide-line/40 min-w-0">
                    {filteredAreas.length === 0 ? (
                      <p className="py-4 text-center text-xs text-ink-soft">
                        {t("No matching areas found.", "Koi area nahi mila. Aap neeche se apna area jodh sakti hain.")}
                      </p>
                    ) : (
                      filteredAreas.map((item) => {
                        const checked = selectedAreas.includes(item.name);
                        return (
                          <label
                            key={item.name}
                            className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-blush-50/70 cursor-pointer transition text-xs min-w-0"
                          >
                            <span className="flex items-center gap-2 text-plum-950 font-medium min-w-0 truncate">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleArea(item.name)}
                                className="size-4 shrink-0 rounded accent-[var(--color-plum-700)] cursor-pointer"
                              />
                              <span className="truncate">{item.name}</span>
                            </span>
                            <span className="text-[0.68rem] text-ink-soft font-normal shrink-0">{item.region}</span>
                          </label>
                        );
                      })
                    )}
                  </div>

                  {/* Custom area add + done footer */}
                  <div className="mt-2 border-t border-line pt-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 min-w-0">
                    <div className="flex flex-1 min-w-0 items-center gap-1.5 w-full sm:w-auto">
                      <input
                        type="text"
                        value={customArea}
                        onChange={(e) => setCustomArea(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomArea())}
                        placeholder={t("Other society/sector...", "Koi aur society ya sector...")}
                        className="flex-1 min-w-0 rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-soft/60"
                      />
                      <button
                        type="button"
                        onClick={addCustomArea}
                        className="shrink-0 rounded-lg bg-blush-100 px-3 py-1.5 text-xs font-semibold text-plum-900 hover:bg-blush-200 transition cursor-pointer"
                      >
                        {t("+ Add", "+ Jodein")}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(false)}
                      className="shrink-0 rounded-xl bg-plum-700 px-4 py-1.5 text-xs font-semibold text-ivory hover:bg-plum-800 transition shadow-xs cursor-pointer ml-auto"
                    >
                      {t(`Done (${selectedAreas.length})`, `Ho Gaya (${selectedAreas.length})`)}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Selected areas pills */}
            {selectedAreas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 max-w-full">
                {selectedAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex max-w-full items-center gap-1 rounded-full border border-plum-300 bg-blush-50 px-2.5 py-1 text-xs font-medium text-plum-900"
                  >
                    <span className="truncate max-w-[220px] sm:max-w-[320px]">{area}</span>
                    <button
                      type="button"
                      onClick={() => removeArea(area)}
                      className="rounded-full p-0.5 hover:bg-blush-200 text-ink-soft hover:text-plum-950 transition cursor-pointer shrink-0"
                      aria-label={`Remove ${area}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Hidden input submitted with form */}
            <input type="hidden" name="operatingAreas" value={selectedAreas.join(", ")} />

            {err("operatingAreas") && (
              <span className="text-xs text-rose-700" role="alert">{err("operatingAreas")}</span>
            )}
          </div>

          <div className="grid gap-2 sm:col-span-2 min-w-0">
            <label className="text-sm font-medium text-plum-900">
              {t("Maximum Travel Distance", "Aap kitni door tak jakar service de sakti hain?")}{" "}
              <span className="font-normal text-ink-soft">
                ({t("how far are you willing to travel from your location?", "Travel distance")})
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 min-w-0">
              {TRAVEL_DISTANCES.map((d) => {
                const active = selectedRadius === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setSelectedRadius(d.value)}
                    className={cn(
                      "flex flex-col items-start rounded-2xl border p-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 cursor-pointer min-w-0 w-full",
                      active
                        ? "border-plum-700 bg-blush-50 text-plum-950 ring-2 ring-plum-700/20 shadow-xs"
                        : "border-line bg-white text-ink hover:border-plum-300 hover:bg-blush-50/40"
                    )}
                  >
                    <span className="text-xs sm:text-sm font-semibold truncate w-full">
                      {lang === "hi" ? d.hiLabel : d.enLabel}
                    </span>
                    <span className="text-[0.7rem] text-ink-soft mt-1 leading-snug">
                      {lang === "hi" ? d.hiDesc : d.enDesc}
                    </span>
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="travelRadius" value={selectedRadius} />
          </div>
        </div>

        <fieldset className="grid gap-2 min-w-0">
          <legend className="mb-1 text-sm font-medium text-plum-900">
            {t("What services do you offer?", "Aap kaun-kaun si services deti hain?")}
          </legend>
          <div className="flex flex-wrap gap-2 min-w-0">
            {categories.map((c) => (
              <label key={c.slug} className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm hover:border-plum-400 transition cursor-pointer">
                <input type="checkbox" name="categories" value={c.slug} className="accent-[var(--color-plum-700)] size-4 cursor-pointer" />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="grid gap-1.5 text-sm font-medium text-plum-900 min-w-0">
          <span>
            {t("Specialities & techniques", "Aapki khaas skills ya services (Specialities)")}{" "}
            <span className="font-normal text-ink-soft">({t("optional", "zaroori nahi")})</span>
          </span>
          <input
            name="servicesText"
            className={fieldCls}
            placeholder={t("e.g. HD Bridal, Airbrush, Rica Waxing, Korean Glass Skin", "Jaise: HD Bridal, Airbrush, Rica Waxing, Korean Facial, Hair Spa")}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2 min-w-0">
          <label className="grid gap-1.5 text-sm font-medium text-plum-900 min-w-0">
            {t("Years of professional experience", "Kitne saal ka kaam ka experience hai?")}
            <input
              name="experienceYears"
              inputMode="numeric"
              className={cn(fieldCls, err("experienceYears") && "border-rose-600")}
              placeholder={t("e.g. 4", "Jaise: 3 ya 5")}
            />
            {err("experienceYears") && <span className="text-xs text-rose-700">{err("experienceYears")}</span>}
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-plum-900 min-w-0">
            <span>
              {t("Instagram or portfolio link", "Instagram ID ya photos ka link")}{" "}
              <span className="font-normal text-ink-soft">({t("optional", "agar hai to")})</span>
            </span>
            <input
              name="portfolioUrl"
              type="url"
              className={cn(fieldCls, err("portfolioUrl") && "border-rose-600")}
              placeholder={t("https://instagram.com/yourhandle", "https://instagram.com/yourhandle ya @username")}
            />
            {err("portfolioUrl") && <span className="text-xs text-rose-700">{err("portfolioUrl")}</span>}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 min-w-0">
          <div className="rounded-2xl border border-line/90 bg-blush-50/30 p-3.5 space-y-2 min-w-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-plum-900 truncate">
                {t("Profile photo or work sample", "Aapki photo ya kaam ki photo")}
              </p>
              <p className="text-[0.72rem] text-ink-soft">
                {t("Optional, JPG/PNG up to 5 MB", "Optional, JPG/PNG 5 MB tak")}
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-plum-300 bg-white px-3 py-2 text-xs font-medium text-plum-900 hover:bg-blush-50 transition min-w-0">
              <input
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="w-full text-xs text-ink-soft file:mr-2 file:rounded-lg file:border-0 file:bg-blush-100 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-plum-900 hover:file:bg-blush-200 cursor-pointer overflow-hidden"
              />
            </label>
            {err("photo") && <span className="text-xs text-rose-700">{err("photo")}</span>}
          </div>

          <div className="rounded-2xl border border-line/90 bg-blush-50/30 p-3.5 space-y-2 min-w-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-plum-900 truncate">
                {t("Govt ID proof (Aadhaar / Voter ID / DL)", "Govt ID Proof (Aadhaar / Voter ID)")}
              </p>
              <p className="text-[0.72rem] text-ink-soft">
                {t("Used to verify our “100% Female Verified” badge", "Sirf “100% Verified Artist” badge ke liye")}
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-plum-300 bg-white px-3 py-2 text-xs font-medium text-plum-900 hover:bg-blush-50 transition min-w-0">
              <input
                name="idProof"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,application/pdf"
                className="w-full text-xs text-ink-soft file:mr-2 file:rounded-lg file:border-0 file:bg-blush-100 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-plum-900 hover:file:bg-blush-200 cursor-pointer overflow-hidden"
              />
            </label>
            {err("idProof") && <span className="text-xs text-rose-700">{err("idProof")}</span>}
          </div>
        </div>

        <label className="grid gap-1.5 text-sm font-medium text-plum-900 min-w-0">
          <span>
            {t("Anything else you would like us to know?", "Koi aur baat jo aap hume batana chahein?")}{" "}
            <span className="font-normal text-ink-soft">({t("optional", "zaroori nahi")})</span>
          </span>
          <textarea
            name="message"
            rows={3}
            className={cn(fieldCls, "py-3")}
            placeholder={t(
              "Tell us about the brands you work with (e.g., MAC, Kryolan, O3+) or your schedule preferences.",
              "Jaise aap kaunse products use karti hain (MAC, Kryolan, O3+) ya kis time kaam karna pasand karti hain."
            )}
          />
        </label>

        {err("form") && <p className="text-sm text-rose-700" role="alert">{err("form")}</p>}

        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending
            ? t("Submitting application…", "Application jama ho rahi hai…")
            : t("Submit application", "Application Submit Karein")}
        </Button>

        <p className="text-xs text-ink-soft">
          {t(
            "We respect your privacy and only use these details to evaluate your partnership with HerrGlow. See our",
            "Aapki jaankari hamare paas bilkul surakshit hai. Hum iska use sirf HerrGlow onboarding ke liye karenge. Hamari"
          )}{" "}
          <a className="underline" href="/privacy-policy">
            {t("privacy policy", "privacy policy")}
          </a>
          {t(".", "dekhein.")}
        </p>
      </form>
    </Card>
  );
}
