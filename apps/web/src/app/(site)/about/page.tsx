import { Award, CheckCircle2, HeartHandshake, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getHomeExtras, getTestimonials } from "@herrglow/core";
import { Badge, BlurFade, Card, Container, Section, SectionHeading, buttonStyles, cn } from "@herrglow/ui";
import { PageHero } from "@/components/page/PageHero";
import { Photo } from "@/components/Photo";
import { getLiveCities } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: "About HerrGlow | Luxury Salon & Makeup Artists at Home in Delhi NCR",
  description: "Learn how HerrGlow brings certified makeup artists, sanitized salon setups, and authentic luxury cosmetics directly to your home in Delhi, Noida and Greater Noida.",
  path: "/about",
});

const PILLARS = [
  {
    icon: Sparkles,
    title: "Strict Hygiene & Cleanliness",
    desc: "Every appointment adheres to strict hygiene: sanitized brushes, clean setup, sterilized tools, and authentic premium cosmetics.",
  },
  {
    icon: ShieldCheck,
    title: "100% Verified Female Artists",
    desc: "Every beautician and makeover artist undergoes strict background checks, government ID verification, and hands-on skill audits. Only the top 5% join our roster.",
  },
  {
    icon: Award,
    title: "100% Genuine Luxury Brands",
    desc: "We exclusively formulate and style with authentic international products: MAC, Bobbi Brown, Kryolan, Dyson, Rica and O3+. Absolutely zero counterfeit or diluted products.",
  },
  {
    icon: HeartHandshake,
    title: "Transparent Upfront Pricing",
    desc: "No hidden travel fees, no last-minute convenience surcharges. The price you see online is the complete price you pay, guaranteed.",
  },
];

export default async function AboutPage() {
  const [cities, extras, reviews] = await Promise.all([
    getLiveCities(),
    getHomeExtras(),
    getTestimonials(12),
  ]);

  const cityNames = cities.map((c) => c.name);

  return (
    <>
      <PageHero
        crumbs={[{ name: "About", path: "/about" }]}
        eyebrow="Our Story &amp; Standard"
        title={<>Luxury Salon &amp; Bridal Artistry, at Your Doorstep</>}
        intro="HerrGlow was founded with a singular conviction: premium beauty care should never require battling Delhi NCR traffic, sitting in crowded salons, or worrying about hygiene."
        image={{
          src: "/hero/doorstep-salon.jpg",
          alt: "HerrGlow verified artist preparing luxury doorstep salon session",
          kind: "about",
          seedKey: "about-hero",
        }}
      />

      {/* The HerrGlow Story */}
      <Section className="py-16 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <BlurFade>
            <div className="space-y-6">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">The Problem We Solve</span>
              <h2 className="!text-3xl sm:!text-4xl text-plum-900">Why Women Choose Doorstep Salon Over Parlors</h2>
              <p className="text-lg leading-relaxed text-ink-soft">
                For decades, getting ready for a wedding, family celebration, or simple monthly self-care meant hours lost to city commutes, waiting in salon reception areas, and exposing yourself to unhygienic shared tools.
              </p>
              <p className="leading-relaxed text-ink-soft">
                At HerrGlow, we designed the salon-at-home experience from scratch. Our verified artists bring complete, sanitized mobile stations into your home. You relax in your favorite armchair or bridal suite, while our senior artists deliver precision makeup, facials, waxing, and hair styling with zero rush.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm font-medium text-plum-800">
                  <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                  <span>Serving {cityNames.length ? cityNames.join(", ") : "Delhi, Noida, and Greater Noida"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-plum-800">
                  <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                  <span>Over {extras.stats.services}+ specialized bridal, party &amp; salon services</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-plum-800">
                  <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                  <span>{extras.stats.artists}+ vetted senior artists with an average 6+ years experience</span>
                </div>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.15}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="relative mx-auto w-full overflow-hidden rounded-[2rem] border border-gold-400/40 bg-ivory shadow-lift">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src="/images/about/hygiene-safety-kit.jpg"
                    alt="HerrGlow clean mobile beauty station and professional sanitized setup"
                    fill
                    sizes="(min-width: 1024px) 500px, 100vw"
                    className="object-cover"
                  />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-plum-950/85 via-plum-950/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
                    <Badge tone="gold" className="mb-2">Strict Hygiene &amp; Care</Badge>
                    <p className="font-serif text-lg">Sanitized &amp; Clean Setup</p>
                    <p className="mt-1 text-xs text-blush-100">Disinfected tools, fresh setup &amp; premium branded cosmetics at your home</p>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>
        </Container>
      </Section>

      {/* 4 Pillars Grid */}
      <Section tone="blush" className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="The HerrGlow Standard"
            title="Our Four Pillars of Trust"
            intro="We hold ourselves to the highest benchmarks of cleanliness, safety, and artistic mastery."
            align="center"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p, i) => (
              <BlurFade key={p.title} delay={i * 0.08} className="h-full">
                <Card className="h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                  <span className="grid size-12 place-items-center rounded-2xl bg-blush-100 text-plum-700">
                    <p.icon className="size-6 text-rose-700" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-5 !text-xl text-plum-900">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.desc}</p>
                </Card>
              </BlurFade>
            ))}
          </div>
        </Container>
      </Section>

      {/* Meet Our Artists */}
      {extras.pros.length > 0 && (
        <Section className="py-16 sm:py-24">
          <Container>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="The Team"
                title="Meet Our Senior Artists"
                intro="Verified, background-checked, and highly reviewed beauticians and makeover artists."
              />
              <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-700 underline-offset-4 hover:underline">
                Explore all services
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {extras.pros.slice(0, 6).map((a, i) => (
                <BlurFade key={a.slug} delay={i * 0.07}>
                  <Link href={`/artists/${a.slug}`} className="group block h-full">
                    <Card className="h-full overflow-hidden transition-all duration-300 group-hover:shadow-lift">
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <Photo
                          src={a.photo}
                          alt={`${a.name}, ${a.providerType === "MAKEOVER_ARTIST" ? "Makeup Artist" : "Beautician"}`}
                          kind="artist"
                          seedKey={a.slug}
                          sizes="(min-width: 1024px) 33vw, 50vw"
                        />
                        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-plum-950/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <span className="absolute bottom-3 right-3 rounded-full bg-ivory/95 px-3 py-1 text-xs font-semibold text-plum-900 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                          View Profile &rarr;
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <h3 className="truncate !text-xl group-hover:text-rose-700">{a.name}</h3>
                          <Badge tone="gold" className="text-[10px]">
                            {a.providerType === "MAKEOVER_ARTIST" ? "Makeup" : "Beautician"}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm text-ink-soft">{a.specialization ?? "Bridal & Party Artistry"}</p>
                        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-rose-700">
                          {a.experienceYears ? <span>{a.experienceYears}+ yrs experience</span> : <span />}
                          {a.city && <span className="flex items-center gap-1"><MapPin className="size-3" />{a.city}</span>}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </BlurFade>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Customer Reviews */}
      {reviews.length > 0 && (
        <Section id="reviews" tone="blush" className="scroll-mt-20 py-16 sm:py-24">
          <Container className="max-w-6xl">
            <SectionHeading eyebrow="Real Experiences" title="What Delhi NCR Customers Say" align="center" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((t, i) => (
                <BlurFade key={t.id} delay={i * 0.05}>
                  <Card className="h-full p-6 flex flex-col justify-between">
                    <div>
                      <p aria-label={`${t.rating} out of 5`} className="text-gold-500">{"★".repeat(t.rating)}</p>
                      <p className="mt-3 leading-relaxed text-ink-soft">&ldquo;{t.review}&rdquo;</p>
                    </div>
                    <div className="mt-5 flex items-center gap-3 border-t border-line/60 pt-4">
                      {t.photo ? (
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-gold-400/40">
                          <Image src={t.photo} alt={t.name} fill sizes="40px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-blush-100 font-serif text-sm font-bold text-plum-800">
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-plum-800">{t.name}{t.location ? <span className="font-normal text-ink-soft">, {t.location}</span> : ""}</p>
                        {t.serviceName && <p className="truncate text-xs font-medium text-rose-700">{t.serviceName}</p>}
                      </div>
                    </div>
                  </Card>
                </BlurFade>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Ready to Book */}
      <section className="section-dark relative overflow-hidden py-20 sm:py-28">
        <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-[0.07]" />
        <Container className="relative text-center max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Experience the difference</p>
          <h2 className="mt-4 text-ivory">Ready for a 5-Star Salon Experience at Home?</h2>
          <div className="gold-rule mx-auto my-6 w-24" />
          <p className="text-lg text-blush-100">
            Book online in less than 60 seconds. We confirm a verified artist near you and bring everything needed for your transformation.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/services" className={cn(buttonStyles({ variant: "shimmer", size: "lg" }))}>
              Browse Services &amp; Prices
            </Link>
            <Link href="/contact" className={cn(buttonStyles({ variant: "ghost", size: "lg" }), "text-ivory hover:text-gold-300")}>
              Contact Us
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
