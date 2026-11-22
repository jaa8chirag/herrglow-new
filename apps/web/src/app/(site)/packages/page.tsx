import { Check } from "lucide-react";
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
  const cards = [
    ...services.map((s) => ({
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
