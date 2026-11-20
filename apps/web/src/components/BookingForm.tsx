"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, MapPin, Sparkles, User } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button, Card, cn } from "@herrglow/ui";
import { submitLead, type FormState } from "@/app/actions";

export interface BookingFormProps {
  cities: { slug: string; name: string }[];
  /** preselected city (on city/area pages) */
  defaultCity?: string;
  service?: { slug: string; title: string; variants?: { name: string; price: number | null }[]; addons?: { name: string; price: number | null }[] };
  proSlug?: string;
  proName?: string;
  sourcePath: string;
  heading?: string;
  /** generic enquiry (no fixed service): shows a service picker loaded from /api/v1/service-options */
  enquiry?: boolean;
  /** pre-filled message (e.g. which package is being booked) */
  initialMessage?: string;
}

const SLOTS = ["Morning (9am to 12pm)", "Afternoon (12pm to 4pm)", "Evening (4pm to 8pm)"];
const STEPS = [{ label: "Service", icon: Sparkles }, { label: "Area", icon: MapPin }, { label: "Date & slot", icon: CalendarDays }, { label: "Details", icon: User }];
const fieldCls = "w-full min-h-12 rounded-2xl border border-line bg-white px-4 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-soft/60 focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-600/20";
const inr = (n: number | null) => (n == null ? "" : ` (₹${Math.round(n).toLocaleString("en-IN")})`);

function Confetti() {
  const reduce = useReducedMotion();
  const bits = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ id: i, x: (Math.random() - 0.5) * 340, y: -(60 + Math.random() * 190), r: Math.random() * 540 - 270, c: ["#c8a15a", "#c9727e", "#f6e3e1", "#4a1f3d", "#e3cb98"][i % 5]!, d: 1.1 + Math.random() * 0.8 })), []);
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-24 flex justify-center">
      {bits.map((b) => <m.span key={b.id} className="absolute size-2.5 rounded-[2px]" style={{ background: b.c }} initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }} animate={{ opacity: 0, x: b.x, y: [0, b.y, b.y + 220], rotate: b.r }} transition={{ duration: b.d, ease: "easeOut" }} />)}
    </div>
  );
}

export function BookingForm({ cities, defaultCity, service, proSlug, proName, sourcePath, heading, enquiry, initialMessage }: BookingFormProps) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitLead, { status: "idle" });
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [v, setV] = useState({ serviceSlug: service?.slug ?? "", variant: "", addons: [] as string[], city: defaultCity ?? "", area: "", eventDate: "", slot: "", name: "", phone: "", email: "", message: initialMessage ?? "" });
  const [options, setOptions] = useState<{ slug: string; title: string; category: string }[]>([]);
  const [stepErr, setStepErr] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const set = (k: keyof typeof v, val: string | string[]) => setV((p) => ({ ...p, [k]: val }));

  // the service page's price box tells the form which option the visitor picked
  useEffect(() => {
    const on = (e: Event) => set("variant", String((e as CustomEvent).detail ?? ""));
    window.addEventListener("hg-variant", on);
    return () => window.removeEventListener("hg-variant", on);
  }, []);
  // generic enquiries get a service picker (loaded lazily so every page does not carry the list)
  useEffect(() => {
    if (service || !enquiry) return;
    fetch("/api/v1/service-options").then((r) => (r.ok ? r.json() : [])).then(setOptions).catch(() => undefined);
  }, [service, enquiry]);
  useEffect(() => { if (state.status === "done") toast.success(state.outOfArea ? "Request saved. We will tell you when we reach your area." : "Request sent. We will contact you shortly."); }, [state]);

  const err = (k: string) => (state.status === "error" ? state.errors[k] : undefined);
  const cityName = cities.find((c) => c.slug === v.city)?.name ?? (v.city === "other" ? "Other city" : "");
  const serviceTitle = service?.title ?? options.find((o) => o.slug === v.serviceSlug)?.title ?? "";

  const go = (to: number) => { setDir(to > step ? 1 : -1); setStep(to); setStepErr(""); root.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" }); };
  const next = () => {
    if (step === 1 && !v.city) return setStepErr("Please choose your city");
    go(step + 1);
  };

  if (state.status === "done") {
    return (
      <Card id="book" className="relative scroll-mt-24 overflow-hidden p-8 text-center sm:p-10">
        <Confetti />
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check className="size-8" /></span>
        {state.outOfArea ? (
          <><h3 className="mt-5 !text-2xl">Coming soon to your area</h3><p className="mx-auto mt-3 max-w-sm text-ink-soft">We do not serve your area yet, but we have noted your request. We will reach out as soon as artists are available near you.</p></>
        ) : (
          <><h3 className="mt-5 !text-2xl">Thank you, your request is in</h3><p className="mx-auto mt-3 max-w-sm text-ink-soft">We will contact you shortly to confirm the details and your artist.</p><p className="mt-4 text-sm text-ink-soft">Your reference: <strong className="text-plum-800">{state.ref}</strong></p></>
        )}
      </Card>
    );
  }

  const Summary = (
    <div className="rounded-2xl bg-blush-50 p-4 text-sm">
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
    <m.div key={step} initial={reduce ? false : { opacity: 0, x: dir * 28 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? undefined : { opacity: 0, x: dir * -28 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="grid gap-4">{children}</m.div>
  );

  return (
    <Card id="book" className="scroll-mt-24 !bg-white p-5 sm:p-8">
      <div ref={root}>
        <h3 className="text-2xl">{heading ?? (enquiry ? "Book your appointment" : "Book this service")}</h3>
        {/* stepper */}
        <ol className="mt-5 flex items-center gap-2" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s.label} className="flex flex-1 items-center gap-2">
              <button type="button" disabled={i > step} onClick={() => i < step && go(i)} aria-current={i === step ? "step" : undefined} className={cn("grid size-9 shrink-0 place-items-center rounded-full border text-sm transition", i < step ? "border-plum-700 bg-plum-700 text-ivory" : i === step ? "border-plum-700 text-plum-800 ring-4 ring-blush-200" : "border-line text-ink-soft")}>
                {i < step ? <Check className="size-4" /> : <s.icon className="size-4" />}<span className="sr-only">{s.label}</span>
              </button>
              <span className={cn("hidden text-xs sm:block", i === step ? "font-semibold text-plum-800" : "text-ink-soft")}>{s.label}</span>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-line" />}
            </li>
          ))}
        </ol>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-blush-100"><m.div className="h-full rounded-full bg-gradient-to-r from-rose-600 to-gold-400" animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.4 }} /></div>
      </div>

      <form action={action} className="mt-6" noValidate onKeyDown={(e) => { if (e.key === "Enter" && step < 3 && (e.target as HTMLElement).tagName !== "TEXTAREA") { e.preventDefault(); next(); } }}>
        {/* every field is mirrored into hidden inputs so all steps submit together */}
        {(["serviceSlug", "variant", "city", "area", "eventDate", "slot", "name", "phone", "email", "message"] as const).map((k) => <input key={k} type="hidden" name={k} value={v[k]} />)}
        {v.addons.map((a) => <input key={a} type="hidden" name="addons" value={a} />)}
        <input type="hidden" name="proSlug" value={proSlug ?? ""} /><input type="hidden" name="sourceUrl" value={sourcePath} />
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>

        <div className="min-h-[15rem]">
          <AnimatePresence mode="wait" initial={false}>
            {step === 0 && panel(<>
              {service ? <p className="rounded-2xl border border-line bg-white px-4 py-3 text-plum-800"><span className="text-xs text-ink-soft">Service</span><br /><strong>{service.title}</strong>{proName ? <span className="text-ink-soft"> · with {proName}</span> : null}</p> : (
                <label className="grid gap-1.5 text-sm font-medium text-plum-900">What would you like to book?
                  <select value={v.serviceSlug} onChange={(e) => set("serviceSlug", e.target.value)} className={fieldCls}>
                    <option value="">{options.length ? "Choose a service (optional)" : "Loading services…"}</option>
                    {options.map((o) => <option key={o.slug} value={o.slug}>{o.title}</option>)}
                  </select>
                </label>
              )}
              {service?.variants && service.variants.length > 0 && (
                <fieldset className="grid gap-2"><legend className="mb-1 text-sm font-medium text-plum-900">Option</legend>
                  {service.variants.map((o) => <label key={o.name} className={cn("flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 text-sm transition", v.variant === o.name ? "border-plum-700 bg-blush-50" : "border-line bg-white hover:bg-blush-50/60")}><span className="flex items-center gap-3"><input type="radio" name="_variant" checked={v.variant === o.name} onChange={() => set("variant", o.name)} className="accent-[var(--color-plum-700)]" />{o.name}</span><span className="text-ink-soft">{inr(o.price).replace(/[()]/g, "")}</span></label>)}
                </fieldset>
              )}
              {service?.addons && service.addons.length > 0 && (
                <fieldset className="grid gap-2"><legend className="mb-1 text-sm font-medium text-plum-900">Add-ons</legend>
                  {service.addons.map((a) => <label key={a.name} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-line bg-white px-4 text-sm"><input type="checkbox" checked={v.addons.includes(a.name)} onChange={(e) => set("addons", e.target.checked ? [...v.addons, a.name] : v.addons.filter((x) => x !== a.name))} className="size-4 accent-[var(--color-plum-700)]" />{a.name}{inr(a.price)}</label>)}
                </fieldset>
              )}
            </>)}

            {step === 1 && panel(<>
              <label className="grid gap-1.5 text-sm font-medium text-plum-900">City
                <select value={v.city} onChange={(e) => { set("city", e.target.value); setStepErr(""); }} className={cn(fieldCls, (stepErr || err("city")) && "border-rose-600")}>
                  <option value="" disabled>Select your city</option>{cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}<option value="other">Other city</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-plum-900">Area / society <span className="font-normal text-ink-soft">(optional)</span>
                <input value={v.area} onChange={(e) => set("area", e.target.value)} autoComplete="off" className={fieldCls} placeholder="e.g. Sector 62, Gaur City 1" />
              </label>
              {v.city === "other" && <p className="rounded-2xl bg-blush-50 p-3 text-sm text-plum-800">We are not in your city yet. Continue anyway and we will let you know when we arrive.</p>}
              {(stepErr || err("city")) && <p className="text-sm text-rose-700" role="alert">{stepErr || err("city")}</p>}
            </>)}

            {step === 2 && panel(<>
              <label className="grid gap-1.5 text-sm font-medium text-plum-900">Preferred date <span className="font-normal text-ink-soft">(optional)</span>
                <input type="date" min={new Date().toISOString().slice(0, 10)} value={v.eventDate} onChange={(e) => set("eventDate", e.target.value)} className={fieldCls} />
              </label>
              <fieldset className="grid gap-2"><legend className="mb-1 text-sm font-medium text-plum-900">Preferred time slot <span className="font-normal text-ink-soft">(optional)</span></legend>
                <div className="grid gap-2 sm:grid-cols-3">{SLOTS.map((s) => <button type="button" key={s} onClick={() => set("slot", v.slot === s ? "" : s)} aria-pressed={v.slot === s} className={cn("min-h-12 rounded-2xl border px-3 text-sm transition", v.slot === s ? "border-plum-700 bg-plum-700 text-ivory" : "border-line bg-white text-plum-800 hover:bg-blush-50")}>{s}</button>)}</div>
              </fieldset>
            </>)}

            {step === 3 && panel(<>
              <label className="grid gap-1.5 text-sm font-medium text-plum-900">Your name<input value={v.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" className={cn(fieldCls, err("name") && "border-rose-600")} placeholder="Full name" />{err("name") && <span className="text-xs text-rose-700">{err("name")}</span>}</label>
              <label className="grid gap-1.5 text-sm font-medium text-plum-900">Mobile number<input value={v.phone} onChange={(e) => set("phone", e.target.value)} type="tel" inputMode="numeric" autoComplete="tel" className={cn(fieldCls, err("phone") && "border-rose-600")} placeholder="10-digit mobile number" />{err("phone") && <span className="text-xs text-rose-700">{err("phone")}</span>}</label>
              <label className="grid gap-1.5 text-sm font-medium text-plum-900">Email <span className="font-normal text-ink-soft">(optional, for your confirmation)</span><input value={v.email} onChange={(e) => set("email", e.target.value)} type="email" autoComplete="email" className={fieldCls} /></label>
              <label className="grid gap-1.5 text-sm font-medium text-plum-900">Anything we should know? <span className="font-normal text-ink-soft">(optional)</span><textarea value={v.message} onChange={(e) => set("message", e.target.value)} rows={2} className={cn(fieldCls, "py-3")} /></label>
              {err("form") && <p className="text-sm text-rose-700" role="alert">{err("form")}</p>}
            </>)}
          </AnimatePresence>
        </div>

        <div className="mt-5">{Summary}</div>

        <div className="mt-5 flex items-center justify-between gap-3">
          {step > 0 ? <Button type="button" variant="ghost" onClick={() => go(step - 1)}><ArrowLeft className="size-4" />Back</Button> : <span />}
          {step < 3 ? <Button type="button" variant="shimmer" onClick={next}>Continue<ArrowRight className="size-4" /></Button> : <Button type="submit" variant="shimmer" size="lg" disabled={pending}>{pending ? "Sending…" : "Request booking"}</Button>}
        </div>
        <p className="mt-4 text-xs text-ink-soft">By submitting you agree to be contacted about your request. See our <a className="underline" href="/privacy-policy">privacy policy</a>.</p>
      </form>
    </Card>
  );
}
