import { ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import { urls, type Faq } from "@herrglow/core";
import { BlurFade, Card, Carousel, Container, NumberTicker, Section, SectionHeading } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { ArtistCard, type ArtistCardData } from "@/components/page/ArtistCard";
import { PageHero } from "@/components/page/PageHero";
import { FaqList, Html, ServiceCard } from "@/components/parts";
import { JsonLd, faqLd } from "@/lib/seo/jsonld";

type Svc = Parameters<typeof ServiceCard>[0]["s"] & { id: string };

function BookBand({ cities, defaultCity, path, title }: { cities: { slug: string; name: string }[]; defaultCity: string; path: string; title: string }) {
  return (
    <section className="section-dark py-16 sm:py-20">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Book now</p><h2 className="mt-3 text-ivory">{title}</h2><div className="gold-rule my-5 w-24" /><p className="max-w-md text-lg text-blush-100">Four quick steps. We confirm an artist who covers your area before anything is final.</p></div>
        <BookingForm cities={cities} defaultCity={defaultCity} sourcePath={path} enquiry heading={title} />
      </Container>
    </section>
  );
}

const Chips = ({ items }: { items: { href?: string; label: string }[] }) => (
  <div className="flex flex-wrap gap-2">{items.map((c) => c.href ? <Link key={c.label} href={c.href} className="rounded-full border border-plum-700/20 bg-white px-4 py-2 text-sm text-plum-800 transition hover:bg-blush-100">{c.label}</Link> : <span key={c.label} className="rounded-full bg-blush-50 px-4 py-2 text-sm text-ink-soft">{c.label}</span>)}</div>
);

const CITY_HERO_IMAGES: Record<string, string> = {
  delhi: "/images/cities/delhi.jpg",
  noida: "/images/cities/noida.jpg",
  "greater-noida": "/images/cities/greater-noida.jpg",
};

/* ───────── city hub ───────── */
export function CityHubView({ city, path, cities, services, artists, withPage, textOnly, serviceCityPages, faqs, areaCount }: {
  city: { slug: string; name: string }; path: string; cities: { slug: string; name: string }[]; services: Svc[]; artists: ArtistCardData[];
  withPage: { slug: string; name: string }[]; textOnly: { name: string }[]; serviceCityPages: Set<string>; faqs: Faq[]; areaCount: number;
}) {
  return (
    <>
      <JsonLd data={faqLd(faqs)!} />
      <PageHero crumbs={[{ name: city.name, path }]} eyebrow={`${city.name}`} title={<>Makeup Artist at Home in {city.name}</>} intro={`Bridal, party and salon services at your doorstep in ${city.name}. Pick a service, see clear prices and book an artist who covers your area.`} image={{ src: CITY_HERO_IMAGES[city.slug] ?? null, alt: city.name, kind: "city", seedKey: city.slug }}>
        <div className="flex flex-wrap gap-8">
          {([[artists.length, "verified artists"], [areaCount, "areas covered"], [services.length, "services"]] as const).map(([n, l]) => <div key={l}><p className="font-serif text-4xl text-plum-800"><NumberTicker value={n} /></p><p className="text-sm text-ink-soft">{l}</p></div>)}
        </div>
      </PageHero>

      <Section>
        <Container>
          <SectionHeading eyebrow="Services" title={`Services available in ${city.name}`} />
          <Carousel dots label="Services" itemClassName="basis-[82%] sm:basis-1/2 lg:basis-1/3">
            {services.slice(0, 12).map((s) => (
              <div key={s.id} className="h-full"><ServiceCard s={s} />{serviceCityPages.has(s.slug) && <Link className="mt-2 inline-block text-sm text-rose-700 underline underline-offset-4" href={urls.serviceCity(s.slug, city.slug)}>{s.title} in {city.name}</Link>}</div>
            ))}
          </Carousel>
        </Container>
      </Section>

      {artists.length > 0 && (
        <Section tone="blush"><Container>
          <SectionHeading eyebrow="Artists" title={`Artists covering ${city.name}`} />
          <Carousel dots label="Artists" itemClassName="basis-[72%] sm:basis-1/3 lg:basis-1/4">{artists.slice(0, 12).map((a) => <ArtistCard key={a.slug} a={a} />)}</Carousel>
        </Container></Section>
      )}

      <Section>
        <Container>
          <SectionHeading eyebrow="Coverage" title={`Areas we serve in ${city.name}`} />
          {withPage.length > 0 && <div className="mb-6"><Chips items={withPage.map((a) => ({ href: urls.area(a.slug), label: a.name }))} /></div>}
          {textOnly.length > 0 && <p className="leading-relaxed text-ink-soft"><span className="font-medium text-plum-900">Also covering: </span>{textOnly.map((a) => a.name).join(", ")}.</p>}
        </Container>
      </Section>

      <Section tone="blush"><Container className="max-w-3xl"><SectionHeading eyebrow="FAQ" title={`${city.name}: your questions`} /><FaqList faqs={faqs} /></Container></Section>
      <BookBand cities={cities} defaultCity={city.slug} path={path} title={`Book in ${city.name}`} />
    </>
  );
}

/* ───────── area ───────── */
export function AreaView({ area, city, path, cities, content, landmarks, services, artists, nearby, areaPageSlugs, faqs, geo }: {
  area: { name: string; slug: string }; city: { slug: string; name: string }; path: string; cities: { slug: string; name: string }[]; content: string | null; landmarks: string[];
  services: Svc[]; artists: ArtistCardData[]; nearby: { slug: string; name: string }[]; areaPageSlugs: Set<string>; faqs: Faq[]; geo: { lat: number; lng: number } | null;
}) {
  return (
    <>
      {faqs.length > 0 && <JsonLd data={faqLd(faqs)!} />}
      <PageHero className="pb-2" crumbs={[{ name: city.name, path: urls.cityHub(city.slug) }, { name: area.name, path }]} eyebrow={city.name} title={<>Makeup Artist in {area.name}</>} intro={`Makeup artists and beauticians who come to you in ${area.name}, ${city.name}.`} />
      <Section className="py-10">
        <Container className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {content ? <Html html={content} /> : null}
            {landmarks.length > 0 && <div className="mt-8"><h2 className="mb-3 !text-2xl">Near {area.name}</h2><Chips items={landmarks.map((l) => ({ label: l }))} /></div>}
          </div>
          {/* static "map" card: no third-party map request; links out to an OpenStreetMap view */}
          <BlurFade>
            <Card className="relative overflow-hidden">
              <div aria-hidden className="relative aspect-[4/3] bg-gradient-to-br from-blush-100 via-ivory to-blush-50">
                <svg className="absolute inset-0 size-full text-plum-700/10" viewBox="0 0 400 300" preserveAspectRatio="none"><g fill="none" stroke="currentColor" strokeWidth="2"><path d="M0 70 C100 40 180 110 400 60" /><path d="M0 190 C120 230 260 140 400 220" /><path d="M90 0 C120 100 70 200 130 300" /><path d="M260 0 C230 90 300 190 270 300" /><path d="M0 130 H400 M200 0 V300" strokeDasharray="6 8" /></g></svg>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full"><MapPin className="size-12 fill-rose-600 text-plum-800 drop-shadow-lg" strokeWidth={1.5} /></div>
                <div className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-600/15" />
              </div>
              <div className="flex items-center justify-between gap-3 p-4"><div><p className="font-medium text-plum-800">{area.name}</p><p className="text-sm text-ink-soft">{city.name}</p></div>{geo && <a href={`https://www.openstreetmap.org/?mlat=${geo.lat}&mlon=${geo.lng}#map=15/${geo.lat}/${geo.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-rose-700 underline-offset-4 hover:underline">Open map <ExternalLink className="size-3.5" /></a>}</div>
            </Card>
          </BlurFade>
        </Container>
      </Section>

      {services.length > 0 && <Section tone="blush"><Container><SectionHeading eyebrow="Services" title={`Popular services in ${area.name}`} /><Carousel dots label="Services" itemClassName="basis-[82%] sm:basis-1/2 lg:basis-1/3">{services.slice(0, 8).map((s) => <ServiceCard key={s.id} s={{ ...s, category: null }} />)}</Carousel></Container></Section>}
      {artists.length > 0 && <Section><Container><SectionHeading eyebrow="Artists" title={`Artists covering ${area.name}`} /><Carousel dots label="Artists" itemClassName="basis-[72%] sm:basis-1/3 lg:basis-1/4">{artists.map((a) => <ArtistCard key={a.slug} a={a} />)}</Carousel></Container></Section>}
      {nearby.length > 0 && <Section tone="blush"><Container><SectionHeading eyebrow="Nearby" title="Nearby areas" /><Chips items={nearby.map((n) => (areaPageSlugs.has(n.slug) ? { href: urls.area(n.slug), label: n.name } : { label: n.name }))} /></Container></Section>}
      {faqs.length > 0 && <Section><Container className="max-w-3xl"><SectionHeading eyebrow="FAQ" title="Frequently asked questions" /><FaqList faqs={faqs} /></Container></Section>}
      <BookBand cities={cities} defaultCity={city.slug} path={path} title={`Book in ${area.name}`} />
    </>
  );
}
