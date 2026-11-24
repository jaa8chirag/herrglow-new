import { ArrowRight, BadgeCheck, CalendarCheck, Check, Clock, DoorOpen, Search, ShieldCheck, Sparkles, Star, Wallet } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge, BentoGrid, BlurFade, BorderBeam, Card, Carousel, Container, InfiniteMovingCards, Marquee, NumberTicker, Price, Section, SectionHeading, Spotlight, TiltCard, buttonStyles, categoryIcon, cn } from "@herrglow/ui";
import { urls } from "@herrglow/core";
import { BookingForm } from "@/components/BookingForm";
import { BookLink } from "@/components/chrome/BookLink";
import { Photo } from "@/components/Photo";
import { FaqList } from "@/components/parts";
import { BeforeAfter } from "./BeforeAfter";
import { BRANDS } from "./brands";

const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/* ───────── 1.5 trust badges ───────── */
export function TrustBadges() {
  const items = [
    {
      icon: ShieldCheck,
      title: "100% Female Verified Staff",
      desc: "Background & police-checked senior female beauticians. Complete safety & privacy in your home.",
    },
    {
      icon: Sparkles,
      title: "Strict Cleanliness & Hygiene",
      desc: "Sanitized tools, fresh clean setup, and meticulous hygiene protocols for every service.",
    },
    {
      icon: BadgeCheck,
      title: "100% Authentic Luxury Brands",
      desc: "MAC, Huda Beauty, Kryolan, Rica & O3+. Zero fake, expired, or diluted duplicates.",
    },
    {
      icon: Wallet,
      title: "10% Advance · 100% Refund Guarantee",
      desc: "Just 10% advance to lock your artist's slot (90% after service). 100% instant refund if the beautician does not reach you.",
    },
  ];

  return (
    <section aria-label="Our safety and quality guarantees" className="border-b border-line bg-gradient-to-b from-white via-blush-50/40 to-white py-12 sm:py-16">
      <Container>
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
            Our Safety &amp; Trust Guarantee
          </p>
          <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-plum-950">
            Why Women Trust HerrGlow
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Five-star salon luxury and bridal artistry, delivered to your doorstep without compromising on safety, hygiene, or authentic products.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div
              key={it.title}
              className="flex items-start gap-4 rounded-2xl border border-line/70 bg-white p-5 shadow-soft transition-all duration-300 hover:border-gold-300 hover:shadow-lift"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blush-100 to-blush-200 text-rose-700 shadow-xs">
                <it.icon className="size-6 text-rose-700" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-bold text-plum-950 sm:text-[0.95rem]">{it.title}</p>
                <p className="mt-1 text-xs text-ink-soft leading-relaxed">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ───────── 2. brand marquee ───────── */
export function BrandMarquee() {
  return (
    <section aria-label="Products our artists work with" className="border-y border-line bg-ivory-deep/50 py-7">
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">Products our artists work with</p>
      <Marquee duration={34} gap="3.5rem">{BRANDS.map((b) => <span key={b} className="whitespace-nowrap font-serif text-2xl tracking-wide text-plum-700/60 sm:text-3xl">{b}</span>)}</Marquee>
    </section>
  );
}

/* ───────── 3. categories bento ───────── */
export interface CatTile { slug: string; name: string; count: number; image: string | null }
const BENTO = ["col-span-2 row-span-2", "", "", "", "", "col-span-2", "col-span-2"];
export function CategoryBento({ cats }: { cats: CatTile[] }) {
  return (
    <Section id="services">
      <Container>
        <SectionHeading eyebrow="What we do" title="Beauty services, delivered to your door" intro="From bridal glam to everyday self-care. Pick a category to see options and prices." />
        <BentoGrid>
          {cats.slice(0, 7).map((c, i) => {
            const Icon = categoryIcon(c.slug);
            return (
              <BlurFade key={c.slug} delay={i * 0.06} className={cn("min-h-0", BENTO[i])}>
                <TiltCard className="size-full">
                  <Link href={`/services/${c.slug}`} className="group relative block size-full overflow-hidden rounded-[1.5rem] shadow-soft transition-shadow hover:shadow-lift">
                    <Photo src={c.image} alt={`${c.name} at home`} kind={c.slug} seedKey={c.slug} sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"} />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-plum-900/75 via-plum-900/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 sm:p-5">
                      <div>
                        <Icon className="mb-2 size-5 text-gold-300" strokeWidth={1.5} />
                        <h3 className={cn("text-ivory", i === 0 ? "!text-2xl sm:!text-4xl" : "!text-lg sm:!text-xl")}>{c.name}</h3>
                        <p className="text-xs text-blush-100 sm:text-sm">{c.count} services</p>
                      </div>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ivory/90 text-plum-800 transition group-hover:bg-gold-400"><ArrowRight className="size-4" /></span>
                    </div>
                  </Link>
                </TiltCard>
              </BlurFade>
            );
          })}
        </BentoGrid>
      </Container>
    </Section>
  );
}

/* ───────── 4. popular services slider ───────── */
export interface SvcSlide { slug: string; title: string; image: string | null; alt: string; price: number | null; offerPrice: number | null; duration: string | null; category: string; categorySlug: string; popular: boolean; from: boolean }
export function PopularSlider({ items }: { items: SvcSlide[] }) {
  return (
    <Section tone="blush">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Most requested" title="Popular services" intro="What customers book most." />
          <Link href="/services" className="mb-10 inline-flex items-center gap-1.5 text-sm font-medium text-rose-700 underline-offset-4 hover:underline">All services <ArrowRight className="size-4" /></Link>
        </div>
        <Carousel autoplay dots label="Popular services" itemClassName="basis-[82%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
          {items.map((s) => (
            <Card key={s.slug} className="group h-full overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <Link href={`/services/${s.slug}`} className="block">
                <div className="relative aspect-[4/5]">
                  <Photo src={s.image} alt={s.alt} kind={s.categorySlug} seedKey={s.slug} sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 82vw" />
                  {s.popular && <Badge tone="gold" className="absolute left-3 top-3 shadow-soft">Most booked</Badge>}
                </div>
              </Link>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">{s.category}</p>
                <h3 className="mt-1 line-clamp-2 min-h-[3.1rem]"><Link href={`/services/${s.slug}`} className="hover:text-rose-700">{s.title}</Link></h3>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Price price={s.price} offerPrice={s.offerPrice} label={s.from ? "From" : undefined} />
                  {s.duration && <span className="flex items-center gap-1 text-xs text-ink-soft"><Clock className="size-3.5" />{s.duration}</span>}
                </div>
                <Link href={`/services/${s.slug}`} className={cn(buttonStyles({ variant: "outline", size: "sm" }), "mt-4 w-full")}>Book</Link>
              </div>
            </Card>
          ))}
        </Carousel>
      </Container>
    </Section>
  );
}

/* ───────── 5. packages ───────── */
export interface PkgCard { slug: string; title: string; image: string | null; price: number | null; offerPrice: number | null; included: string[]; popular: boolean; href: string }
export function PackagesBand({ items }: { items: PkgCard[] }) {
  return (
    <Section>
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Packages" title="Everything in one booking" intro="Bundles for your monthly routine &amp; big days: verified female beauticians, one clear price." />
          <Link href="/packages" className="mb-10 inline-flex items-center gap-1.5 text-sm font-medium text-rose-700 underline-offset-4 hover:underline">All packages <ArrowRight className="size-4" /></Link>
        </div>

        {/* Featured Monthly Grooming Essentials Spotlight Banner */}
        <div className="mb-10 rounded-3xl border-2 border-gold-400/60 bg-gradient-to-br from-plum-950 via-plum-900 to-plum-950 p-6 sm:p-8 text-ivory shadow-lift relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-gold-400/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -left-20 -bottom-20 size-60 rounded-full bg-rose-600/15 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/40 bg-gold-400/20 px-3 py-1 text-xs font-bold text-gold-300">
                  <Star className="size-3.5 fill-current text-gold-400" /> Delhi NCR #1 Routine Bestseller
                </span>
                <span className="rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  Save 37%
                </span>
              </div>

              <div>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
                  Monthly Grooming Essentials Package
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-blush-100/90 leading-relaxed">
                  The complete monthly doorstep ritual for women across Delhi, Noida &amp; Greater Noida. Includes Full Arms &amp; Legs Waxing, Underarms, Threading &amp; Face Cleanup.
                </p>
              </div>

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
                  href="/services/salon-at-home"
                  className={cn(buttonStyles({ variant: "shimmer", size: "md" }), "font-bold text-xs sm:text-sm text-center justify-center")}
                >
                  View Salon Services →
                </Link>
                <Link
                  href="/custom-combo"
                  className={cn(buttonStyles({ variant: "outline", size: "md" }), "border-white/30 text-white hover:bg-white/10 text-xs sm:text-sm text-center justify-center")}
                >
                  Make a Combo
                </Link>
              </div>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p, i) => (
              <BlurFade key={p.slug} delay={i * 0.07} className="h-full">
                <Card className={cn("relative flex h-full flex-col overflow-hidden", p.popular && "border-gold-400/60 shadow-lift")}>
                  {p.popular && <BorderBeam />}
                  <div className="relative aspect-[16/10]"><Photo src={p.image} alt={p.title} kind="package" seedKey={p.slug} sizes="(min-width: 1024px) 25vw, 50vw" />
                    {p.popular && <Badge tone="gold" className="absolute left-3 top-3"><Star className="mr-1 size-3 fill-current" />Most popular</Badge>}</div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3>{p.title}</h3>
                    <ul className="mt-3 flex-1 space-y-1.5 text-sm text-ink-soft">
                      {p.included.slice(0, 4).map((x) => <li key={x} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />{x}</li>)}
                    </ul>
                    <div className="mt-4"><Price price={p.price} offerPrice={p.offerPrice} /></div>
                    <Link href={p.href} className={cn(buttonStyles({ variant: p.popular ? "shimmer" : "outline", size: "sm" }), "mt-4 w-full")}>View &amp; book</Link>
                  </div>
                </Card>
              </BlurFade>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

/* ───────── 6. how it works ───────── */
const STEPS = [
  { icon: Search, title: "Choose a service", text: "Pick from bridal, party, facial, nails and more, with prices shown upfront." },
  { icon: CalendarCheck, title: "Book your slot", text: "Share your area and date. We confirm an artist covers your location." },
  { icon: DoorOpen, title: "Artist at your door", text: "A verified artist arrives with sanitized tools and clean setup at home." },
  { icon: Sparkles, title: "Glow", text: "Step out camera-ready, or simply enjoy the self-care, without the travel." },
];
export function HowItWorks() {
  return (
    <Section tone="blush">
      <Container>
        <SectionHeading eyebrow="How it works" title="Four simple steps" align="center" />
        <div className="relative grid gap-8 md:grid-cols-4">
          <div aria-hidden className="gold-rule absolute left-[12%] right-[12%] top-8 hidden md:block" />
          {STEPS.map((s, i) => (
            <BlurFade key={s.title} delay={i * 0.1}>
              <div className="relative text-center">
                <span className="relative mx-auto grid size-16 place-items-center rounded-full border border-gold-400/60 bg-ivory shadow-soft"><s.icon className="size-7 text-plum-700" strokeWidth={1.4} /><span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-plum-700 text-xs font-semibold text-ivory">{i + 1}</span></span>
                <h3 className="mt-5">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-[16rem] text-ink-soft">{s.text}</p>
              </div>
            </BlurFade>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ───────── 7. before/after (only with admin-paired images) or a looks gallery ───────── */
export function LooksSection({ pair, looks }: { pair: { before: string; after: string; alt: string } | null; looks: { src: string; alt: string }[] }) {
  if (!pair && looks.length < 3) return null;
  return (
    <Section>
      <Container>
        <SectionHeading eyebrow={pair ? "Before & after" : "Our work"} title={pair ? "See the transformation" : "Looks our artists create"} align="center" />
        {pair ? (
          <div className="mx-auto max-w-md"><BeforeAfter before={pair.before} after={pair.after} alt={pair.alt} /></div>
        ) : (
          <Carousel autoplay label="Looks" itemClassName="basis-[70%] sm:basis-1/3 lg:basis-1/4">
            {looks.map((l) => <div key={l.src} className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] shadow-soft"><Photo src={l.src} alt={l.alt} sizes="(min-width: 1024px) 25vw, 70vw" /></div>)}
          </Carousel>
        )}
      </Container>
    </Section>
  );
}

/* ───────── 8. artists ───────── */
export interface ArtistCard { slug: string; name: string; photo: string | null; specialization: string | null; years: number | null; city: string | null; linked: boolean; kind: string }
export function ArtistsCarousel({ artists }: { artists: ArtistCard[] }) {
  if (!artists.length) return null;
  return (
    <Section tone="blush">
      <Container>
        <SectionHeading eyebrow="Our artists" title="Meet the people behind the glow" intro="Verified, experienced and local to your area." />
        <Carousel dots label="Artists" itemClassName="basis-[72%] sm:basis-1/3 lg:basis-1/4">
          {artists.map((a) => {
            const body = (
              <Card className="group h-full overflow-hidden">
                <div className="relative aspect-[4/5]"><Photo src={a.photo} alt={`${a.name}, ${a.kind}`} kind="artist" seedKey={a.slug} sizes="(min-width: 1024px) 25vw, 72vw" /></div>
                <div className="p-5">
                  <h3 className="truncate">{a.name}</h3>
                  <p className="mt-1 line-clamp-1 text-sm text-ink-soft">{a.specialization ?? a.kind}</p>
                  <p className="mt-3 flex items-center justify-between text-xs text-rose-700">{a.years ? <span>{a.years}+ yrs experience</span> : <span />}{a.city && <span>{a.city}</span>}</p>
                </div>
              </Card>
            );
            return a.linked ? <Link key={a.slug} href={`/artists/${a.slug}`} className="block h-full">{body}</Link> : <div key={a.slug} className="h-full">{body}</div>;
          })}
        </Carousel>
      </Container>
    </Section>
  );
}

/* ───────── 9. stats ───────── */
export function StatsBand({ stats }: { stats: { artists: number; services: number; areas: number; cities: number } }) {
  const items: [number, string][] = [[stats.artists, "Verified artists"], [stats.services, "Services"], [stats.areas, "Areas covered"], [stats.cities, "Cities"]];
  return (
    <section className="section-dark relative overflow-hidden py-16 sm:py-20">
      <Spotlight />
      <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-[0.07]" />
      <Container className="relative">
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {items.map(([n, label]) => (
            <div key={label}><p className="font-serif text-5xl text-gold-300 sm:text-6xl"><NumberTicker value={n} suffix={label === "Cities" ? "" : "+"} /></p><div className="gold-rule mx-auto my-3 w-16" /><p className="text-blush-100">{label}</p></div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ───────── 10. testimonials ───────── */
export function ReviewsMarquee({ reviews }: { reviews: { id: string; name: string; location: string | null; rating: number; review: string; serviceName: string | null; photo?: string | null }[] }) {
  if (!reviews.length) return null;
  return (
    <Section>
      <Container><SectionHeading eyebrow="Reviews" title="What customers say" align="center" /></Container>
      <InfiniteMovingCards duration={55}>
        {reviews.map((t) => (
          <Card key={t.id} className="w-[19rem] shrink-0 p-6 sm:w-[24rem]">
            <p aria-label={`${t.rating} out of 5`} className="text-gold-500">{"★".repeat(t.rating)}</p>
            <p className="mt-3 leading-relaxed text-ink-soft">&ldquo;{t.review}&rdquo;</p>
            <div className="mt-4 flex items-center gap-3">
              {t.photo ? (
                <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-gold-400/40 shadow-sm">
                  <Image src={t.photo} alt={t.name} fill sizes="44px" className="object-cover" />
                </div>
              ) : (
                <div className="grid size-11 shrink-0 place-items-center rounded-full bg-blush-100 font-serif text-sm font-bold text-plum-800">
                  {t.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-plum-800">{t.name}{t.location ? <span className="font-normal text-ink-soft">, {t.location}</span> : ""}</p>
                {t.serviceName && <p className="truncate text-xs font-medium text-rose-700">{t.serviceName}</p>}
              </div>
            </div>
          </Card>
        ))}
      </InfiniteMovingCards>
    </Section>
  );
}

/* ───────── 11. cities ───────── */
const CITY_CARDS_IMAGES: Record<string, string> = {
  delhi: "/images/cities/delhi.jpg",
  noida: "/images/cities/noida.jpg",
  "greater-noida": "/images/cities/greater-noida.jpg",
};

export function CityCards({ cities }: { cities: { slug: string; name: string; artists: number; areas: number }[] }) {
  if (!cities.length) return null;
  return (
    <Section tone="blush">
      <Container>
        <SectionHeading eyebrow="Where we are" title="Serving Delhi NCR" intro="Choose your city to see local artists and the areas we cover." />
        <div className="grid gap-5 md:grid-cols-3">
          {cities.map((c, i) => (
            <BlurFade key={c.slug} delay={i * 0.08}>
              <TiltCard>
                <Link href={urls.cityHub(c.slug)} className="group relative block aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-soft transition-shadow hover:shadow-lift">
                  <Photo src={CITY_CARDS_IMAGES[c.slug] ?? null} alt={c.name} kind="city" seedKey={c.slug} />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-plum-900/85 via-plum-900/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="!text-3xl text-ivory">{c.name}</h3>
                    <p className="mt-1 text-blush-100">{c.artists} artists · {c.areas} areas</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-300">Explore {c.name} <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              </TiltCard>
            </BlurFade>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ───────── 12. blogs ───────── */
export function BlogCards({ posts }: { posts: { slug: string; title: string; excerpt: string | null; image: string | null; date: Date }[] }) {
  if (!posts.length) return null;
  return (
    <Section>
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Journal" title="Beauty guides" />
          <Link href="/blog" className="mb-10 inline-flex items-center gap-1.5 text-sm font-medium text-rose-700 underline-offset-4 hover:underline">All articles <ArrowRight className="size-4" /></Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((b, i) => (
            <BlurFade key={b.slug} delay={i * 0.08} className="h-full">
              <Link href={`/blog/${b.slug}`} className="group block h-full">
                <Card className="h-full overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="relative aspect-[16/10]"><Photo src={b.image} alt={b.title} kind="blog" seedKey={b.slug} sizes="(min-width: 768px) 33vw, 100vw" /></div>
                  <div className="p-6"><p className="text-xs text-rose-700">{fmt(b.date)}</p><h3 className="mt-2 line-clamp-2 group-hover:text-rose-700">{b.title}</h3>{b.excerpt && <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{b.excerpt}</p>}</div>
                </Card>
              </Link>
            </BlurFade>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ───────── 13. FAQ + final CTA (this band holds the on-page booking form, id="book") ───────── */
export function FaqSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <Section tone="blush">
      <Container className="max-w-3xl"><SectionHeading eyebrow="FAQ" title="Questions, answered" align="center" /><FaqList faqs={faqs} /></Container>
    </Section>
  );
}

export function FinalCta({ cities }: { cities: { slug: string; name: string }[] }) {
  return (
    <section className="section-dark relative overflow-hidden py-20 sm:py-28">
      <Spotlight className="md:left-1/3" />
      <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-[0.07]" />
      <Container className="relative grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Ready when you are</p>
          <h2 className="mt-4 text-ivory">Ready to glow?</h2>
          <div className="gold-rule my-6 w-24" />
          <p className="max-w-md text-lg text-blush-100">Tell us what you need and where. We will confirm an artist near you and take care of the rest.</p>
          <p className="mt-8 flex flex-wrap gap-3 text-sm text-blush-100"><Link href="/services" className="underline underline-offset-4 hover:text-gold-300">Browse services</Link><span aria-hidden>·</span><Link href="/packages" className="underline underline-offset-4 hover:text-gold-300">See packages</Link></p>
        </div>
        <BookingForm cities={cities} sourcePath="/" heading="Book your appointment" enquiry />
      </Container>
    </section>
  );
}

export { BookLink };
