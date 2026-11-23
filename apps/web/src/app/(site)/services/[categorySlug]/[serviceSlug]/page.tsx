import { Clock, MessageCircle, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { asFaqs, findPage, getRelatedBlogs, getReviewsFor, getServiceArtists, urls } from "@herrglow/core";
import { Badge, Card, Carousel, Container, Section, SectionHeading, buttonStyles, cn } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { ArtistCard } from "@/components/page/ArtistCard";
import { Breadcrumbs, FaqList, Html, ServiceCard, stripTags } from "@/components/parts";
import { Photo } from "@/components/Photo";
import { PriceBox } from "@/components/services/PriceBox";
import { FrequentlyPaired } from "@/components/services/FrequentlyPaired";
import { RealLooksGallery } from "@/components/services/RealLooksGallery";
import { HomeSetupGuide, Included, ProcessSteps, ProductsUsed, SafetyHygienePromise } from "@/components/services/blocks";
import { getLiveCities, getMediaKeys, getServicePage, getSettings } from "@/lib/data";
import { realImage } from "@/lib/media";
import { JsonLd, faqLd, serviceLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { whatsappLink } from "@/lib/whatsapp";

interface ServicePageParams {
  categorySlug: string;
  serviceSlug: string;
}

const LEGACY_CAT_REDIRECTS: Record<string, string> = {
  waxing: "salon-at-home",
  "facial-and-skincare": "facial-skincare",
  "hair-styling": "hair",
  "nail-art": "nails",
  "bridal-makeup": "makeup",
  "engagement-party-makeup": "makeup",
  "pre-bridal-packages": "pre-bridal",
  "draping-eye-mehndi": "mehndi",
};

export async function generateMetadata({ params }: { params: Promise<ServicePageParams> }): Promise<Metadata> {
  const { categorySlug, serviceSlug } = await params;
  const canonicalCat = LEGACY_CAT_REDIRECTS[categorySlug] || categorySlug;
  const data = await getServicePage(serviceSlug, canonicalCat);
  if (!data) return {};
  const { svc } = data;
  const page = await findPage(`/services/${svc.category.slug}/${svc.slug}`);
  const price = svc.offerPrice ?? svc.price;
  const keys = await getMediaKeys();
  const isP2 = svc.status === "COMING_SOON";

  return buildMetadata({
    title: svc.seoTitle || `${svc.title} at Home | HerrGlow`,
    description: svc.seoDescription || stripTags(svc.shortDescription) || `Book ${svc.title} at home${price ? ` from ₹${Math.round(Number(price)).toLocaleString("en-IN")}` : ""}. Verified female beauticians in Delhi NCR.`,
    path: `/services/${svc.category.slug}/${svc.slug}`,
    image: realImage(keys, svc.image),
    indexable: isP2 ? false : (page?.isIndexable ?? true),
  });
}

const num = (v: unknown) => (v == null ? null : Number(v));
const PRODUCT_CATS = new Set(["makeup", "facials", "hair", "bridal"]);

const DEFAULT_FAQS = [
  {
    question: "Are your makeup artists and beauticians 100% female & verified?",
    answer: "Yes, 100%. Every visiting professional sent to your home is female, background-checked, identity-verified, and evaluated for safety and professional hygiene standards.",
  },
  {
    question: "Is there any travel fee or extra hidden charge for my area?",
    answer: "No. Zero hidden charges. All prices shown on our website include travel, artist fees, and authentic products across all areas we serve in Noida, Greater Noida, and Delhi.",
  },
  {
    question: "What do I need to keep ready at home before the artist arrives?",
    answer: "Zero stress! All you need is a comfortable chair, access to a mirror, and a normal power socket. Our artist brings their own professional ring light, extension cord, clean disposable sheets, sanitized tools, and authentic products.",
  },
  {
    question: "When and how do I make payment?",
    answer: "We charge only a nominal 10% advance deposit to reserve your artist's travel slot and prevent last-minute schedule conflicts. The remaining 90% is paid directly after the service is completed to your 100% satisfaction via Google Pay, PhonePe, Paytm, Card, or Cash. If our beautician fails to reach your location on time, 100% of your advance deposit is refunded immediately.",
  },
  {
    question: "Can I book for multiple people (e.g., bride + mother/sister/friends)?",
    answer: "Yes! You can add extra services or specify additional family members during booking. We can allocate extra service time or assign 2 verified artists so everyone is ready on time.",
  },
  {
    question: "What if I need to reschedule or cancel?",
    answer: "We understand wedding and family schedules can change. You can reschedule or cancel your appointment for free anytime up to 2 hours before the scheduled time with no penalty.",
  },
];

export default async function ServicePage({ params }: { params: Promise<ServicePageParams> }) {
  const { categorySlug, serviceSlug } = await params;
  const canonicalCat = LEGACY_CAT_REDIRECTS[categorySlug] || categorySlug;
  let data = await getServicePage(serviceSlug, canonicalCat);

  // Fallback: If service wasn't found under categorySlug, check if serviceSlug exists under any category
  if (!data) {
    const fallback = await getServicePage(serviceSlug);
    if (fallback?.svc?.category?.slug) {
      redirect(`/services/${fallback.svc.category.slug}/${fallback.svc.slug}`);
    }
    notFound();
  }

  // If URL has a legacy category slug, 301 redirect to canonical category URL
  if (data?.svc?.category?.slug && data.svc.category.slug !== categorySlug) {
    redirect(`/services/${data.svc.category.slug}/${data.svc.slug}`);
  }
  const { svc, related, serviceCities, variantLinks } = data;
  const [artists, reviews, blogs, cities, keys, s] = await Promise.all([
    getServiceArtists(svc.id),
    getReviewsFor(svc.title),
    getRelatedBlogs(`${svc.title} ${svc.category.name}`, null, 3),
    getLiveCities(),
    getMediaKeys(),
    getSettings(),
  ]);

  const faqs = asFaqs(svc.faqs);
  const isMakeover = /bridal|makeup/i.test(svc.category.slug) || /bridal|makeup/i.test(svc.slug);
  const displayFaqs = faqs.length >= 4 ? faqs : [...faqs, ...DEFAULT_FAQS.filter((df) => !faqs.some((f) => f.question.toLowerCase().slice(0, 15) === df.question.toLowerCase().slice(0, 15)))];
  const path = `/services/${svc.category.slug}/${svc.slug}`;
  const features = (svc.features ?? "").split(/\r?\n|;|•/).map((f) => f.trim()).filter(Boolean);
  const nowPrice = svc.offerPrice ?? svc.price;
  const image = realImage(keys, svc.image);
  const options = svc.variants.map((v) => ({ name: v.name, price: num(v.price), offerPrice: num(v.offerPrice), duration: v.duration }));
  const relatedCards = related.map((r) => r);
  const isP2 = svc.status === "COMING_SOON";

  const notifyWaUrl = whatsappLink(
    s.whatsappNumber || "9319260069",
    `Hi HerrGlow! I'm interested in ${svc.title} (${svc.category.name}). Could you please notify me when this service launches?`
  );

  return (
    <div className="pb-28 lg:pb-0 overflow-x-clip">
      <JsonLd
        data={serviceLd({
          name: svc.title,
          description: stripTags(svc.shortDescription) || stripTags(svc.description).slice(0, 300),
          path,
          image,
          category: svc.category.name,
          price: nowPrice == null ? null : Number(nowPrice),
          areaServed: cities.map((c) => c.name),
        })}
      />
      {faqLd(faqs) && <JsonLd data={faqLd(faqs)!} />}

      <section className="bg-gradient-to-b from-blush-100 via-blush-50 to-ivory">
        <Container className="pb-12 pt-8">
          <Breadcrumbs
            items={[
              { name: "Services", path: "/services" },
              { name: svc.category.name, path: `/services/${svc.category.slug}` },
              { name: svc.title, path },
            ]}
          />
          <div className="grid items-start gap-8 lg:grid-cols-[1.35fr_1fr] min-w-0">
            <div className="min-w-0">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border-4 border-ivory shadow-lift">
                <Photo
                  src={image}
                  alt={svc.imageAlt || svc.title}
                  kind={svc.category.slug}
                  seedKey={svc.slug}
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />
                {isP2 ? (
                  <Badge tone="plum" className="absolute left-4 top-4">Coming Soon (Phase 2)</Badge>
                ) : svc.isPackage ? (
                  <Badge tone="plum" className="absolute left-4 top-4">Package</Badge>
                ) : null}
              </div>
              <div className="mt-7">
                <Link href={`/services/${svc.category.slug}`}>
                  <Badge className="hover:bg-blush-200 transition cursor-pointer">{svc.category.name}</Badge>
                </Link>
                {svc.subCategory && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                    {svc.subCategory.name}
                  </span>
                )}
                <h1 className="mt-3 !text-[clamp(2rem,4.5vw,3.5rem)]">{svc.title}</h1>
                {svc.shortDescription && (
                  <p className="mt-4 text-lg leading-relaxed text-ink-soft">{stripTags(svc.shortDescription)}</p>
                )}
                {svc.duration && (
                  <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm text-plum-800">
                    <Clock className="size-4" />
                    {svc.duration}
                  </p>
                )}
              </div>
            </div>

            <aside className="lg:sticky lg:top-28 min-w-0">
              {isP2 ? (
                <>
                  <div className="rounded-[1.75rem] border border-line bg-white p-6 shadow-lift text-center">
                    <span className="mx-auto grid size-12 place-items-center rounded-full bg-plum-100 text-plum-900 mb-4">
                      <Sparkles className="size-6 text-gold-500" />
                    </span>
                    <h3 className="font-serif text-xl font-bold text-plum-950">Coming Soon in Phase 2</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {svc.title} is currently being prepared for doorstep rollout with specialized training and authentic clinical equipment.
                    </p>
                    <a
                      href={notifyWaUrl || "https://wa.me/919319260069"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonStyles({ variant: "shimmer", size: "lg" }), "mt-6 flex w-full items-center justify-center gap-2")}
                    >
                      <MessageCircle className="size-5" />
                      Notify Me on WhatsApp
                    </a>
                  </div>

                  {/* Mobile Fixed CTA for Phase 2 */}
                  <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
                    <div className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-full border border-gold-400/30 bg-ivory/95 p-2 shadow-lift backdrop-blur-xl">
                      <a
                        href={notifyWaUrl || "https://wa.me/919319260069"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonStyles({ variant: "shimmer", size: "md" }), "flex-1 min-h-12 text-sm font-bold flex items-center justify-center gap-2")}
                      >
                        <MessageCircle className="size-5 text-emerald-600" />
                        Notify Me on WhatsApp
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <PriceBox
                    title={svc.title}
                    options={options}
                    price={num(svc.price)}
                    offerPrice={num(svc.offerPrice)}
                    label={svc.priceLabel && !/d/.test(svc.priceLabel) ? svc.priceLabel : null}
                    duration={svc.duration}
                    whatsappNumber={s.whatsappNumber}
                  />
                  {options.some((o) => o.name && variantLinks && svc.variants.find((v) => v.name === o.name)?.linkedServiceId) && (
                    <p className="mt-4 hidden text-sm text-ink-soft lg:block">
                      More detail:{" "}
                      {svc.variants
                        .filter((v) => v.linkedServiceId && variantLinks[v.linkedServiceId])
                        .map((v, i) => (
                          <span key={v.id}>
                            {i > 0 && " · "}
                            <Link
                              className="text-rose-700 underline underline-offset-4"
                              href={`/services/${svc.category.slug}/${variantLinks[v.linkedServiceId!]!}`}
                            >
                              {v.name} page
                            </Link>
                          </span>
                        ))}
                    </p>
                  )}
                </>
              )}
            </aside>
          </div>
        </Container>
      </section>

      <Section className="py-12">
        <Container className="max-w-4xl">
          <div className="space-y-12">
            {features.length > 0 && <Included items={features} />}
            {svc.description && (
              <div>
                <h2 className="mb-2 !text-2xl sm:!text-3xl">About this service</h2>
                <Html html={svc.description} />
              </div>
            )}
            {PRODUCT_CATS.has(svc.category.slug) && <ProductsUsed />}
            <SafetyHygienePromise />
            <HomeSetupGuide />
            <FrequentlyPaired categorySlug={svc.category.slug} serviceTitle={svc.title} />
            {isMakeover && <RealLooksGallery />}
          </div>
        </Container>
      </Section>

      <ProcessSteps />

      {artists.length > 0 && (
        <Section>
          <Container>
            <SectionHeading eyebrow="Your artists" title={`Artists who offer ${svc.title}`} />
            <Carousel dots label="Artists" itemClassName="basis-[72%] sm:basis-1/3 lg:basis-1/4">
              {artists.map((a) => (
                <ArtistCard
                  key={a.slug}
                  a={{
                    slug: a.slug,
                    name: a.name,
                    photo: realImage(keys, a.photo),
                    specialization: a.specialization,
                    years: a.experienceYears,
                    city: a.city,
                    linked: a.linked,
                    kind: a.providerType === "MAKEOVER_ARTIST" ? "Makeup artist" : "Beautician",
                  }}
                />
              ))}
            </Carousel>
          </Container>
        </Section>
      )}

      {reviews.items.length > 0 && (
        <Section tone="blush">
          <Container>
            <SectionHeading eyebrow="Reviews" title={reviews.matched ? `What customers say about ${svc.title}` : "What customers say"} />
            <div className="grid gap-5 md:grid-cols-3">
              {reviews.items.slice(0, 3).map((t) => (
                <Card key={t.id} className="p-6">
                  <p aria-label={`${t.rating} out of 5`} className="text-gold-500">
                    {"★".repeat(t.rating)}
                  </p>
                  <p className="mt-3 leading-relaxed text-ink-soft">&ldquo;{t.review}&rdquo;</p>
                  <p className="mt-4 text-sm font-medium text-plum-800">
                    {t.name}
                    {t.location ? `, ${t.location}` : ""}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {displayFaqs.length > 0 && (
        <Section>
          <Container className="max-w-3xl">
            <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
            <FaqList faqs={displayFaqs} />
          </Container>
        </Section>
      )}

      {cities.length > 0 && (
        <Section tone="blush">
          <Container>
            <SectionHeading title={`${svc.title} across Delhi NCR`} />
            <div className="flex flex-wrap gap-3">
              {cities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${svc.category.slug}-at-home-${c.slug}`}
                  className="rounded-full border border-plum-700/20 bg-white px-5 py-2.5 text-sm text-plum-800 hover:bg-blush-100 transition"
                >
                  {svc.title} in {c.name}
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {related.length > 0 && (
        <Section>
          <Container>
            <SectionHeading eyebrow="You may also like" title={`More in ${svc.category.name}`} />
            <Carousel dots label="Related services" itemClassName="basis-[82%] sm:basis-1/2 lg:basis-1/3">
              {relatedCards.map((r) => (
                <ServiceCard key={r.id} s={{ ...r, category: null }} />
              ))}
            </Carousel>
            {blogs.length > 0 && (
              <div className="mt-10">
                <h3 className="mb-3">Related guides</h3>
                <ul className="space-y-2">
                  {blogs.map((b) => (
                    <li key={b.slug}>
                      <Link className="text-rose-700 underline underline-offset-4" href={urls.blog(b.slug)}>
                        {b.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Container>
        </Section>
      )}

      {!isP2 && (
        <section className="section-dark relative overflow-hidden py-16 sm:py-20">
          <Container className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Book now</p>
              <h2 className="mt-3 text-ivory">Ready for {svc.title}?</h2>
              <div className="gold-rule my-5 w-24" />
              <p className="max-w-md text-lg text-blush-100">
                Four quick steps. We confirm your verified female artist and the exact price before anything is final.
              </p>
            </div>
            <BookingForm
              cities={cities}
              sourcePath={path}
              service={{
                slug: svc.slug,
                title: svc.title,
                price: num(svc.offerPrice ?? svc.price),
                variants: svc.variants.map((v) => ({ name: v.name, price: num(v.offerPrice ?? v.price) })),
                addons: svc.addons.map((a) => ({ name: a.name, price: num(a.price) })),
              }}
            />
          </Container>
        </section>
      )}
    </div>
  );
}
