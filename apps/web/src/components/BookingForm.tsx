"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, MapPin, MessageCircle, Sparkles, User } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button, Card, cn } from "@herrglow/ui";
import { submitLead, type FormState } from "@/app/actions";
import { useServiceOptions } from "@/hooks/api";

export interface BookingFormProps {
  cities: { slug: string; name: string }[];
  /** preselected city (on city/area pages) */
  defaultCity?: string;
  service?: { slug: string; title: string; variants?: { name: string; price: number | null }[]; addons?: { name: string; price: number | null }[] };
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
  { label: "Area", icon: MapPin },
  { label: "Date & slot", icon: CalendarDays },
  { label: "Details", icon: User },
] as const;

const fieldCls = "w-full min-h-12 rounded-2xl border border-line bg-white px-4 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-soft/60 focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-600/20 transition";
const inr = (n: number | null) => (n == null ? "" : ` (₹${Math.round(n).toLocaleString("en-IN")})`);

const POPULAR_AREAS: Record<string, string[]> = {
  noida: ["Sector 62", "Sector 18", "Sector 137", "Sector 76", "Sector 50", "Sector 128"],
  "greater-noida": ["Gaur City 1", "Gaur City 2", "Pari Chowk", "Sector 1", "Beta 1", "TechZone 4"],
  delhi: ["South Delhi", "Dwarka", "Lajpat Nagar", "Rohini", "Vasant Kunj", "Saket", "Janakpuri"],
};

const ALL_POPULAR_AREAS = [
  { area: "Sector 62", city: "noida", cityName: "Noida" },
  { area: "Sector 18", city: "noida", cityName: "Noida" },
  { area: "Sector 137", city: "noida", cityName: "Noida" },
  { area: "Sector 76", city: "noida", cityName: "Noida" },
  { area: "Gaur City 1", city: "greater-noida", cityName: "Gr. Noida" },
  { area: "Gaur City 2", city: "greater-noida", cityName: "Gr. Noida" },
  { area: "Pari Chowk", city: "greater-noida", cityName: "Gr. Noida" },
  { area: "Sector 1", city: "greater-noida", cityName: "Gr. Noida" },
  { area: "South Delhi", city: "delhi", cityName: "Delhi" },
  { area: "Dwarka", city: "delhi", cityName: "Delhi" },
  { area: "Lajpat Nagar", city: "delhi", cityName: "Delhi" },
  { area: "Rohini", city: "delhi", cityName: "Delhi" },
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
    address: "",
    eventDate: "",
    slot: "",
    name: "",
    phone: "",
    email: "",
    message: initialMessage ?? "",
  });

  // Use TanStack Query to fetch service picker options cached across form sessions
  const isEnquiryMode = !service && !packageItem && !!enquiry;
  const { data: options = [], isLoading: isLoadingOptions } = useServiceOptions({
    enabled: isEnquiryMode,
  });

  const [stepErr, setStepErr] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [groupCount, setGroupCount] = useState("2");
  const root = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const quickDates = useMemo(() => getQuickDates(), []);
  const set = (k: keyof typeof v, val: string | string[]) => setV((p) => ({ ...p, [k]: val }));

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

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
    setStepErr("");
    root.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  };

  const next = () => {
    if (step === 1 && !v.city) {
      if (v.area) {
        const found = ALL_POPULAR_AREAS.find((a) => a.area.toLowerCase() === v.area.trim().toLowerCase());
        if (found) {
          set("city", found.city);
          go(step + 1);
          return;
        }
      }
      return setStepErr("Please select your city or tap a popular area above");
    }
    go(step + 1);
  };

  if (state.status === "done") {
    const rawWa = whatsappNumber || "9876543210";
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
                <p className="mt-1.5 text-sm font-semibold text-emerald-800">
                  Estimated Total: ₹{Math.round(state.finalAmount).toLocaleString("en-IN")} · Pay After Service
                </p>
              ) : (
                <p className="mt-1 text-xs text-ink-soft">No advance payment required. Pay only after your service.</p>
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
                  <span><strong>Doorstep Service &amp; Pay Later:</strong> Enjoy your service with a single-use sanitized kit. Pay via UPI, Card, or Cash only after you are completely satisfied.</span>
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
    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-700">Your request</p>
    <dl className="grid grid-cols-[88px_1fr] gap-y-1.5">
      <dt className="text-ink-soft">Service</dt><dd className="font-medium text-plum-800">{serviceTitle || "Not chosen yet"}{v.variant ? ` · ${v.variant}` : ""}</dd>
      {v.addons.length > 0 && (<><dt className="text-ink-soft">Add-ons</dt><dd>{v.addons.join(", ")}</dd></>)}
      {proName && (<><dt className="text-ink-soft">Artist</dt><dd>{proName}</dd></>)}
      <dt className="text-ink-soft">Where</dt><dd>{[v.area, cityName].filter(Boolean).join(", ") || "Not chosen yet"}</dd>
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
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
              </div>

                        <div className="min-h-[15rem]">
                          <AnimatePresence mode="wait" initial={false}>
                            {step === 0 && panel(<>
                              {service ? (
                                <div className="rounded-2xl border border-line bg-white px-4 py-3 text-plum-800">
                                  <span className="text-xs text-ink-soft">Service</span>
                                  <br />
                                  <strong className="text-lg">{service.title}</strong>
                                  {proName ? <span className="text-ink-soft"> · with {proName}</span> : null}
                                </div>
                              ) : packageItem ? (
                                <div className="rounded-2xl border border-line bg-white px-4 py-3 text-plum-800">
                                  <span className="text-xs text-ink-soft">Package</span>
                                  <br />
                                  <strong className="text-lg">{packageItem.title}</strong>
                                  {packageItem.price ? <span className="text-sm font-semibold text-emerald-700"> · ₹{Math.round(packageItem.price).toLocaleString("en-IN")}</span> : null}
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
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-700">Add to same visit (Save Time)</p>
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
                          </>)}

                            {step === 1 && panel(<>
                              <div className="grid gap-1.5">
                                <label htmlFor="booking-city" className="text-sm font-medium text-plum-900">City</label>
                                <select
                                  id="booking-city"
                                  value={v.city}
                                  onChange={(e) => { set("city", e.target.value); setStepErr(""); }}
                                  className={cn(fieldCls, (stepErr || err("city")) && "border-rose-600 focus:border-rose-600 focus:ring-rose-600/20")}
                                  aria-invalid={!!(stepErr || err("city"))}
                                >
                                  <option value="" disabled>Select your city</option>
                                  {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                                  <option value="other">Other city</option>
                                </select>
                              </div>

                              <div className="rounded-2xl border border-blush-200/60 bg-blush-50/60 p-3.5">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-700">
                                  {v.city && cityName ? `Popular areas in ${cityName}` : "Popular areas in Delhi NCR (tap to auto-select)"}
                                </p>
                                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Popular area suggestions">
                                  {(v.city && POPULAR_AREAS[v.city] ? POPULAR_AREAS[v.city] : ALL_POPULAR_AREAS).map((item) => {
                                    const areaName = typeof item === "string" ? item : item.area;
                                    const itemCity = typeof item === "string" ? v.city : item.city;
                                    const itemCityName = typeof item === "string" ? "" : item.cityName;
                                    const isSelected = v.area === areaName;
                                    return (
                                      <button
                                        type="button"
                                        key={areaName}
                                        aria-pressed={isSelected}
                                        onClick={() => {
                                          setV((prev) => ({ ...prev, area: areaName, city: itemCity || prev.city }));
                                          setStepErr("");
                                        }}
                                        className={cn(
                                          "rounded-full border px-3 py-1.5 text-xs transition flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600",
                                          isSelected
                                            ? "border-plum-700 bg-plum-700 font-medium text-ivory shadow-soft"
                                            : "border-line bg-white text-plum-900 hover:bg-blush-100"
                                        )}
                                      >
                                        <span>{areaName}</span>
                                        {itemCityName && !v.city && (
                                          <span className={cn("text-[0.65rem] opacity-75 font-normal", isSelected ? "text-blush-100" : "text-ink-soft")}>
                                            · {itemCityName}
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="grid gap-1.5">
                                <label htmlFor="booking-area" className="text-sm font-medium text-plum-900">
                                  Area / society / apartment / flat no. <span className="font-normal text-ink-soft">(or choose above)</span>
                                </label>
                                <input
                                  id="booking-area"
                                  value={v.area}
                                  onChange={(e) => set("area", e.target.value)}
                                  autoComplete="street-address"
                                  className={fieldCls}
                                  placeholder="e.g. Sector 62, Gaur City 1, Flat 402"
                                />
                              </div>

                            {v.city === "other" && (
                              <p className="rounded-2xl bg-blush-50 p-3 text-sm text-plum-800">
                                We are not in your city yet. Continue anyway and we will let you know when we arrive.
                              </p>
                            )}
                            {(stepErr || err("city")) && (
                              <p className="text-sm text-rose-700" role="alert">{stepErr || err("city")}</p>
                            )}
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
                                  <span className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600 shrink-0" /> Pay after service (UPI / Cash / Card)</span>
                                  <span className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600 shrink-0" /> Zero advance deposit required</span>
                                  <span className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600 shrink-0" /> Free cancellation anytime before visit</span>
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
                  <Button type="button" variant="shimmer" onClick={next}>
                    Continue<ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button type="submit" variant="shimmer" size="lg" disabled={pending}>
                    {pending ? "Sending…" : "Confirm Booking · Pay Later"}
                  </Button>
                )}
              </div>
              <p className="mt-4 text-xs text-ink-soft text-center sm:text-left">
                No payment required now. Pay directly to your beautician after service. See our <a className="underline hover:text-plum-800" href="/privacy-policy">privacy policy</a>.
              </p>
            </form>
    </Card>
  );
}
