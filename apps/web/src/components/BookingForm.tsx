"use client";

import { useActionState, useState } from "react";
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
  /** pass true for the generic contact enquiry (no service) */
  enquiry?: boolean;
}

const fieldCls = "w-full min-h-11 rounded-xl border border-line bg-white px-4 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-soft/60 focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-600/20";
const inr = (n: number | null) => (n == null ? "" : ` (₹${Math.round(n).toLocaleString("en-IN")})`);

export function BookingForm({ cities, defaultCity, service, proSlug, proName, sourcePath, heading, enquiry }: BookingFormProps) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitLead, { status: "idle" });
  const [city, setCity] = useState(defaultCity ?? "");
  const err = (k: string) => (state.status === "error" ? state.errors[k] : undefined);

  if (state.status === "done") {
    return (
      <Card id="book" className="scroll-mt-24 p-6 sm:p-8">
        {state.outOfArea ? (
          <>
            <h3>Coming soon to your area</h3>
            <p className="mt-3 text-ink-soft">We do not serve your area yet, but we have noted your request. We are expanding and will reach out as soon as artists are available near you.</p>
          </>
        ) : (
          <>
            <h3>Thank you, your request is in</h3>
            <p className="mt-3 text-ink-soft">We will contact you shortly to confirm details. Your reference is <strong className="text-plum-800">{state.ref}</strong>.</p>
          </>
        )}
      </Card>
    );
  }

  return (
    <Card id="book" className="scroll-mt-24 p-6 sm:p-8">
      <h3 className="text-2xl">{heading ?? (enquiry ? "Send us an enquiry" : "Book this service")}</h3>
      {service && <p className="mt-1 text-sm text-ink-soft">{service.title}{proName ? ` · with ${proName}` : ""}</p>}
      {!service && proName && <p className="mt-1 text-sm text-ink-soft">Request {proName}</p>}
      <form action={action} className="mt-5 grid gap-4" noValidate>
        <input type="hidden" name="serviceSlug" value={service?.slug ?? ""} />
        <input type="hidden" name="proSlug" value={proSlug ?? ""} />
        <input type="hidden" name="sourceUrl" value={sourcePath} />
        {/* honeypot */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>

        <label className="grid gap-1.5 text-sm font-medium text-plum-900">Your name
          <input name="name" autoComplete="name" required className={cn(fieldCls, err("name") && "border-rose-600")} placeholder="Full name" />
          {err("name") && <span className="text-xs text-rose-700">{err("name")}</span>}
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-plum-900">Mobile number
          <input name="phone" type="tel" inputMode="numeric" autoComplete="tel" required className={cn(fieldCls, err("phone") && "border-rose-600")} placeholder="10-digit mobile number" />
          {err("phone") && <span className="text-xs text-rose-700">{err("phone")}</span>}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-plum-900">City
            <select name="city" required value={city} onChange={(e) => setCity(e.target.value)} className={cn(fieldCls, err("city") && "border-rose-600")}>
              <option value="" disabled>Select your city</option>
              {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              <option value="other">Other city</option>
            </select>
            {err("city") && <span className="text-xs text-rose-700">{err("city")}</span>}
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-plum-900">Area / society
            <input name="area" autoComplete="off" className={fieldCls} placeholder="e.g. Sector 62, Gaur City 1" />
          </label>
        </div>
        {city === "other" && <p className="rounded-xl bg-blush-50 p-3 text-sm text-plum-800">We are not in your city yet. Send your request anyway and we will let you know when we arrive.</p>}

        {service?.variants && service.variants.length > 0 && (
          <label className="grid gap-1.5 text-sm font-medium text-plum-900">Option
            <select name="variant" className={fieldCls} defaultValue="">
              <option value="">Not sure yet</option>
              {service.variants.map((v) => <option key={v.name} value={v.name}>{v.name}{inr(v.price)}</option>)}
            </select>
          </label>
        )}
        {service?.addons && service.addons.length > 0 && (
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium text-plum-900">Add-ons</legend>
            {service.addons.map((a) => (
              <label key={a.name} className="flex min-h-11 items-center gap-3 rounded-xl border border-line bg-white px-4 text-sm"><input type="checkbox" name="addons" value={a.name} className="size-4 accent-[var(--color-plum-700)]" />{a.name}{inr(a.price)}</label>
            ))}
          </fieldset>
        )}

        <label className="grid gap-1.5 text-sm font-medium text-plum-900">Date of event / service <span className="font-normal text-ink-soft">(optional)</span>
          <input name="eventDate" type="date" className={fieldCls} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-plum-900">Message <span className="font-normal text-ink-soft">(optional)</span>
          <textarea name="message" rows={3} className={cn(fieldCls, "py-3")} placeholder="Anything we should know?" />
        </label>

        {err("form") && <p className="text-sm text-rose-700">{err("form")}</p>}
        <Button type="submit" size="lg" disabled={pending} className="w-full">{pending ? "Sending…" : enquiry ? "Send enquiry" : "Request booking"}</Button>
        <p className="text-xs text-ink-soft">By submitting you agree to be contacted about your request. See our <a className="underline" href="/privacy-policy">privacy policy</a>.</p>
      </form>
    </Card>
  );
}
