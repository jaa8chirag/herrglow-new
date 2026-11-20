import Link from "next/link";
import type { Metadata } from "next";
import { getBlogs, getPopularServices, getTestimonials } from "@herrglow/core";
import { Badge, ButtonLink, Card, Container, Reveal, RevealItem, RevealList, Section, SectionHeading } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { ServiceCard } from "@/components/parts";
import { getCategories, getLiveCities, getSettings } from "@/lib/data";
import { JsonLd, organizationLd, websiteLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: "Makeup Artist & Salon at Home in Delhi NCR",
  description: "Book verified makeup artists and beauticians at home in Delhi, Noida and Greater Noida. Bridal, party and salon services with clear prices.",
  path: "/",
});

const STEPS = [
  ["Choose a service", "Pick from bridal, party, facial, nails and more, with transparent prices."],
  ["Tell us where and when", "Share your area and date. We confirm that an artist covers your location."],
  ["Relax at home", "A verified artist arrives with a clean, complete kit and does the rest."],
];

export default async function HomePage() {
  const [s, categories, cities, popular, testimonials, blogs] = await Promise.all([
    getSettings(), getCategories(), getLiveCities(), getPopularServices(6), getTestimonials(5), getBlogs(),
  ]);
  const wa = whatsappLink(s.whatsappNumber, s.raw.whatsapp_prefill_text ?? undefined);
  return (
    <>
      <JsonLd data={[organizationLd({ email: s.contactEmail, telephone: s.contactPhone ?? s.whatsappNumber, areaServed: cities.map((c) => c.name) }), websiteLd()]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-blush-100 via-blush-50 to-ivory">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-gold-300/25 blur-3xl" />
        <Container className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <Badge tone="gold">Makeup and salon, at your home</Badge>
            <h1 className="mt-5">Look and feel your best, without leaving home.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">Verified makeup artists and beauticians for bridal, party and everyday glam across {cities.length ? cities.map((c) => c.name).join(", ") : "Delhi NCR"}. Clear prices, your schedule.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#book" size="lg">Book now</ButtonLink>
              <ButtonLink href={categories[0] ? `/${categories[0].slug}` : "#services"} variant="outline" size="lg">Explore services</ButtonLink>
              {wa && <ButtonLink href={wa} variant="whatsapp" size="lg">WhatsApp us</ButtonLink>}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <BookingForm cities={cities} sourcePath="/" heading="Book your appointment" enquiry />
          </Reveal>
        </Container>
      </section>

      {/* Categories */}
      <Section id="services">
        <Container>
          <SectionHeading eyebrow="What we do" title="Beauty services, delivered to your door" />
          <RevealList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <RevealItem key={c.slug}>
                <Link href={`/${c.slug}`} className="group block h-full">
                  <Card className="flex h-full flex-col justify-between p-6 transition-transform duration-300 group-hover:-translate-y-1">
                    <h3 className="group-hover:text-rose-700">{c.name}</h3>
                    <p className="mt-6 text-sm text-ink-soft">{c._count.services} services <span aria-hidden className="text-rose-600">→</span></p>
                  </Card>
                </Link>
              </RevealItem>
            ))}
          </RevealList>
        </Container>
      </Section>

      {/* Popular */}
      <Section tone="blush">
        <Container>
          <SectionHeading eyebrow="Most requested" title="Popular services" intro="What customers book most." />
          <RevealList className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((p) => <RevealItem key={p.id}><ServiceCard s={{ ...p, category: p.category }} /></RevealItem>)}
          </RevealList>
        </Container>
      </Section>

      {/* How it works */}
      <Section>
        <Container>
          <SectionHeading eyebrow="How it works" title="Three simple steps" align="center" />
          <RevealList className="grid gap-6 md:grid-cols-3">
            {STEPS.map(([t, d], i) => (
              <RevealItem key={t}>
                <div className="text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-full bg-plum-700 font-serif text-xl text-ivory">{i + 1}</span>
                  <h3 className="mt-4">{t}</h3>
                  <p className="mt-2 text-ink-soft">{d}</p>
                </div>
              </RevealItem>
            ))}
          </RevealList>
        </Container>
      </Section>

      {/* Cities */}
      {cities.length > 0 && (
        <Section tone="deep">
          <Container>
            <SectionHeading eyebrow="Where we are" title="Serving Delhi NCR" intro="Choose your city to see local artists and areas." />
            <div className="flex flex-wrap gap-3">
              {cities.map((c) => <ButtonLink key={c.slug} href={`/makeup-artist-in-${c.slug}`} variant="outline" className="border-gold-300/50 text-ivory hover:bg-white/10">Makeup artist in {c.name}</ButtonLink>)}
            </div>
          </Container>
        </Section>
      )}

      {/* Real reviews (shown as reviews; no aggregateRating markup) */}
      {testimonials.length > 0 && (
        <Section>
          <Container>
            <SectionHeading eyebrow="Reviews" title="What customers say" />
            <RevealList className="grid gap-5 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t) => (
                <RevealItem key={t.id}>
                  <Card className="h-full p-6">
                    <p aria-label={`${t.rating} out of 5`} className="text-gold-500">{"★".repeat(t.rating)}</p>
                    <p className="mt-3 leading-relaxed text-ink-soft">{t.review}</p>
                    <p className="mt-4 text-sm font-medium text-plum-800">{t.name}{t.location ? `, ${t.location}` : ""}</p>
                  </Card>
                </RevealItem>
              ))}
            </RevealList>
          </Container>
        </Section>
      )}

      {/* Blog */}
      {blogs.length > 0 && (
        <Section tone="blush">
          <Container>
            <SectionHeading eyebrow="Journal" title="Beauty guides" />
            <div className="grid gap-5 md:grid-cols-3">
              {blogs.slice(0, 3).map((b) => (
                <Link key={b.slug} href={`/blog/${b.slug}`} className="group block"><Card className="h-full p-6"><h3 className="group-hover:text-rose-700">{b.title}</h3>{b.excerpt && <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{b.excerpt}</p>}</Card></Link>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
