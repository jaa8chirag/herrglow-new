"use client";

import { useActionState } from "react";
import { Button, Card, cn } from "@herrglow/ui";
import { submitApplication, type ApplyState } from "@/app/actions-apply";

const fieldCls = "w-full min-h-11 rounded-xl border border-line bg-white px-4 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-soft/60 focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-600/20";

export function ApplyForm({ categories, cities }: { categories: { slug: string; name: string }[]; cities: { slug: string; name: string }[] }) {
  const [state, action, pending] = useActionState<ApplyState, FormData>(submitApplication, { status: "idle" });
  const err = (k: string) => (state.status === "error" ? state.errors[k] : undefined);
  if (state.status === "done")
    return (
      <Card id="apply" className="p-8"><h2 className="text-2xl">Thank you, we have your application</h2><p className="mt-3 text-ink-soft">Our team will review your details and contact you on the number you gave. Approved artists get a profile on HerrGlow.</p></Card>
    );
  return (
    <Card id="apply" className="scroll-mt-24 p-6 sm:p-8">
      <form action={action} className="grid gap-4" noValidate>
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-plum-900">Full name<input name="name" required autoComplete="name" className={cn(fieldCls, err("name") && "border-rose-600")} />{err("name") && <span className="text-xs text-rose-700">{err("name")}</span>}</label>
          <label className="grid gap-1.5 text-sm font-medium text-plum-900">Mobile number<input name="phone" type="tel" inputMode="numeric" required autoComplete="tel" className={cn(fieldCls, err("phone") && "border-rose-600")} />{err("phone") && <span className="text-xs text-rose-700">{err("phone")}</span>}</label>
          <label className="grid gap-1.5 text-sm font-medium text-plum-900">Email <span className="font-normal text-ink-soft">(optional)</span><input name="email" type="email" autoComplete="email" className={cn(fieldCls, err("email") && "border-rose-600")} />{err("email") && <span className="text-xs text-rose-700">{err("email")}</span>}</label>
          <label className="grid gap-1.5 text-sm font-medium text-plum-900">City you work in
            <input name="city" required list="apply-cities" className={cn(fieldCls, err("city") && "border-rose-600")} placeholder="e.g. Noida" />
            <datalist id="apply-cities">{cities.map((c) => <option key={c.slug} value={c.name} />)}</datalist>{err("city") && <span className="text-xs text-rose-700">{err("city")}</span>}
          </label>
        </div>
        <fieldset className="grid gap-2"><legend className="mb-1 text-sm font-medium text-plum-900">What do you offer?</legend>
          <div className="flex flex-wrap gap-2">{categories.map((c) => <label key={c.slug} className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm"><input type="checkbox" name="categories" value={c.slug} className="accent-[var(--color-plum-700)]" />{c.name}</label>)}</div>
        </fieldset>
        <label className="grid gap-1.5 text-sm font-medium text-plum-900">Specialities <span className="font-normal text-ink-soft">(optional)</span><input name="servicesText" className={fieldCls} placeholder="e.g. HD bridal, airbrush, hair styling" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-plum-900">Years of experience<input name="experienceYears" inputMode="numeric" className={cn(fieldCls, err("experienceYears") && "border-rose-600")} />{err("experienceYears") && <span className="text-xs text-rose-700">{err("experienceYears")}</span>}</label>
          <label className="grid gap-1.5 text-sm font-medium text-plum-900">Portfolio link <span className="font-normal text-ink-soft">(Instagram, website)</span><input name="portfolioUrl" type="url" className={cn(fieldCls, err("portfolioUrl") && "border-rose-600")} placeholder="https://" />{err("portfolioUrl") && <span className="text-xs text-rose-700">{err("portfolioUrl")}</span>}</label>
        </div>
        <label className="grid gap-1.5 text-sm font-medium text-plum-900">Your photo <span className="font-normal text-ink-soft">(optional, up to 5 MB)</span><input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="text-sm" />{err("photo") && <span className="text-xs text-rose-700">{err("photo")}</span>}</label>
        <label className="grid gap-1.5 text-sm font-medium text-plum-900">Anything else? <span className="font-normal text-ink-soft">(optional)</span><textarea name="message" rows={3} className={cn(fieldCls, "py-3")} /></label>
        {err("form") && <p className="text-sm text-rose-700">{err("form")}</p>}
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">{pending ? "Sending…" : "Submit application"}</Button>
        <p className="text-xs text-ink-soft">We use these details only to review your application. See our <a className="underline" href="/privacy-policy">privacy policy</a>.</p>
      </form>
    </Card>
  );
}
