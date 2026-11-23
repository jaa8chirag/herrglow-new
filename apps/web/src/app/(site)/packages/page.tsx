import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getPackagesData } from "@herrglow/core";
import { Badge, BlurFade, BorderBeam, Card, Container, Price, Section, buttonStyles, cn } from "@herrglow/ui";
import { PageHero } from "@/components/page/PageHero";
import { Photo } from "@/components/Photo";
import { getLiveCities, getMediaKeys } from "@/lib/data";
import { realImage } from "@/lib/media";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Bridal, Pre-Bridal & Party Packages at Home",
  description: "Complete bridal, multi-function wedding, group makeup and pre-bridal packages at home. See exactly what is included and the price.",
  path: "/packages",
});

const FLAGSHIP = "complete-bridal-package";
const num = (v: unknown) => (v == null ? null : Number(v));
const low = (...v: unknown[]) => { const n = v.map((x) => (x == null ? NaN : Number(x))).filter((x) => x > 0); return n.length ? Math.min(...n) : null; };

export default async function PackagesPage() {
  const [{ packages, services }, keys, cities] = await Promise.all([getPackagesData(), getMediaKeys(), getLiveCities()]);
  void cities;
  const MONTHLY = "monthly-grooming-essentials-package";
  const cards = [
    ...services
      .filter((s) => s.slug !== MONTHLY)
      .map((s) => ({
        key: `svc-${s.id ?? s.slug}`,
        href: `/services/${s.category.slug}/${s.slug}`,
        title: s.title,
        image: realImage(keys, s.image),
        price: num(s.price),
        offer: low(s.offerPrice, ...s.variants.map((v) => v.offerPrice)) ?? num(s.offerPrice),
        included: (s.features ?? "").split(/\r?\n|;|•/).map((x) => x.trim()).filter(Boolean),
        popular: s.slug === FLAGSHIP,
        tag: s.category.name,
        lead: s.leadCount,
      })),
    ...packages.map((p) => ({
      key: `pkg-${p.id ?? p.slug}`,
      href: `/packages/${p.slug}`,
      title: p.title,
      image: realImage(keys, p.image),
      price: num(p.price),
      offer: num(p.offerPrice),
      included: p.services.map((x) => x.service.title),
      popular: false,
      tag: "Package",
      lead: 0,
    })),
  ].sort((a, b) => Number(b.popular) - Number(a.popular) || b.lead - a.lead);

  return (
    <>
      <PageHero crumbs={[{ name: "Packages", path: "/packages" }]} eyebrow="Packages" title="Everything in one booking" intro="Bundles for the big days: one artist team, clear inclusions, one price. Compare what is included and book." />
      <Section className="pt-8">
        <Container>
          {/* Monthly Routine Package Hero Feature Card */}
          <div className="mb-8 rounded-3xl border-2 border-gold-400/60 bg-gradient-to-br from-plum-950 via-plum-900 to-plum-950 p-6 sm:p-8 text-ivory shadow-lift relative overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gold-400/15 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -left-20 -bottom-20 size-64 rounded-full bg-rose-600/15 blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/40 bg-gold-400/20 px-3 py-1 text-xs font-bold text-gold-300">
                    <Sparkles className="size-3.5 text-gold-400" /> Delhi NCR #1 Routine Bestseller
                  </span>
                  <span className="rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                    Save 37%
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
                  Monthly Grooming Essentials Package
                </h3>
                <p className="text-xs sm:text-sm text-blush-100/90 leading-relaxed">
                  Everything you need for your monthly salon maintenance at home. 100% verified female beautician, sanitized tools, authentic products &amp; zero travel fee across Delhi NCR.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs text-blush-100/90 font-medium">
                  <span className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1.5 backdrop-blur-xs">
                    <Check className="size-3.5 text-emerald-400 shrink-0" /> Full Arms Waxing
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1.5 backdrop-blur-xs">
                    <Check className="size-3.5 text-emerald-400 shrink-0" /> Full Legs Waxing
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1.5 backdrop-blur-xs">
                    <Check className="size-3.5 text-emerald-400 shrink-0" /> Underarms Waxing
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1.5 backdrop-blur-xs">
                    <Check className="size-3.5 text-emerald-400 shrink-0" /> Threading + Cleanup
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 lg:border-l border-white/15 pt-4 lg:pt-0 lg:pl-8">
                <div className="text-left lg:text-right">
                  <p className="text-[11px] uppercase tracking-wider text-gold-300 font-semibold">Starts from</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm line-through text-blush-200/60">₹1,599</span>
                    <span className="text-3xl font-bold font-serif text-white">₹999</span>
                  </div>
                  <p className="text-[11px] text-emerald-300 font-medium mt-0.5">
                    🍯 Honey ₹999 · 🍫 Rica ₹1,299
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                  <Link
                    href="/services/waxing/monthly-grooming-essentials-package"
                    className={cn(buttonStyles({ variant: "shimmer", size: "md" }), "font-bold text-xs sm:text-sm text-center justify-center")}
                  >
                    Book Package @ ₹999 →
                  </Link>
                  <Link
                    href="/custom-combo"
                    className={cn(buttonStyles({ variant: "outline", size: "md" }), "border-white/30 text-white hover:bg-white/10 text-xs sm:text-sm text-center justify-center")}
                  >
                    Build Custom Combo
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Combo Callout Banner */}
          <div className="mb-10 rounded-3xl border border-gold-400/60 bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 p-6 sm:p-8 text-ivory shadow-lift flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/20 border border-gold-400/40 px-3 py-1 text-xs font-bold text-gold-300">
                <Sparkles className="size-3.5 text-gold-400" /> Want a Custom Bundle?
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
                Make Your Own Custom Combo
              </h3>
              <p className="text-xs sm:text-sm text-blush-100/90 max-w-xl leading-relaxed">
                Pick your own mix of waxing, facial cleanups, threading, and mani-pedi treatments. Reach <strong>₹499</strong> to unlock 100% Free Doorstep Travel, plus get an extra <strong>10% OFF</strong> on combos ₹999+.
              </p>
            </div>
            <Link
              href="/custom-combo"
              className={cn(buttonStyles({ variant: "shimmer", size: "lg" }), "shrink-0 font-bold text-sm w-full md:w-auto")}
            >
              Build Custom Combo →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((p, i) => (
              <BlurFade key={p.key} delay={(i % 3) * 0.07} className="h-full">
                <Card className={cn("relative flex h-full flex-col overflow-hidden", p.popular && "border-gold-400/60 shadow-lift")}>
                  {p.popular && <BorderBeam />}
                  <div className="relative aspect-[16/10]">
                    <Photo src={p.image} alt={p.title} kind="package" seedKey={p.key} sizes="(min-width: 1024px) 33vw, 50vw" />
                    <Badge className="absolute right-3 top-3" tone="plum">{p.tag}</Badge>
                    {p.popular && <Badge tone="gold" className="absolute left-3 top-3">Most popular</Badge>}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="!text-2xl">{p.title}</h2>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-rose-700">What is included</p>
                    <ul className="mt-2 flex-1 space-y-2 text-sm text-ink-soft">
                      {p.included.length ? p.included.slice(0, 6).map((x) => <li key={x} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />{x}</li>) : <li>See the package page for details.</li>}
                    </ul>
                    <div className="mt-5 flex items-center justify-between gap-3"><Price price={p.price} offerPrice={p.offer} label={p.offer != null && p.price != null && p.offer !== p.price ? undefined : undefined} /></div>
                    <Link href={p.href} className={cn(buttonStyles({ variant: p.popular ? "shimmer" : "primary", size: "md" }), "mt-4 w-full")}>View &amp; book</Link>
                  </div>
                </Card>
              </BlurFade>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
