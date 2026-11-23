import { Clock, ShieldCheck, Sparkles, ArrowRight, Check, MapPin, Tag } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@herrglow/db";
import { asFaqs, urls } from "@herrglow/core";
import { Badge, Card, Container, Section, SectionHeading, buttonStyles, cn } from "@herrglow/ui";
import { Breadcrumbs, FaqList, Html, stripTags } from "@/components/parts";
import { Photo } from "@/components/Photo";
import { getCategoryPage, getLiveCities, getMediaKeys, getSettings } from "@/lib/data";
import { realImage } from "@/lib/media";
import { JsonLd, faqLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

interface CategoryPageParams {
  categorySlug: string;
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

export async function generateMetadata({ params }: { params: Promise<CategoryPageParams> }): Promise<Metadata> {
  const { categorySlug } = await params;
  const canonicalCat = LEGACY_CAT_REDIRECTS[categorySlug] || categorySlug;
  const cat = await getCategoryPage(canonicalCat);
  if (!cat) {
    const svc = await prisma.service.findFirst({ where: { slug: categorySlug, mergedIntoId: null }, include: { category: true } });
    if (svc) {
      return buildMetadata({
        title: `${svc.title} at Home | HerrGlow`,
        description: `Book ${svc.title} at home in Delhi, Noida & Greater Noida. Verified female beauticians.`,
        path: `/services/${svc.category.slug}/${svc.slug}`,
      });
    }
    return {};
  }

  const title = cat.seoTitle || `${cat.name} at Home in Delhi, Noida & Greater Noida | HerrGlow`;
  const description = cat.seoDescription || cat.shortDescription || `Explore our premium doorstep ${cat.name.toLowerCase()} services. 100% verified female beauticians, sanitized tools & authentic products, and 10% advance deposit.`;

  return buildMetadata({
    title,
    description,
    path: `/services/${cat.slug}`,
    indexable: true,
  });
}

const num = (v: unknown) => (v == null ? null : Number(v));

const DEFAULT_CAT_FAQS = [
  {
    question: "Are your beauticians 100% female and background-verified?",
    answer: "Yes, absolutely. HerrGlow strictly dispatches verified female beauticians and makeup artists who have undergone rigorous background checks, document verification, and trade skill testing.",
  },
  {
    question: "Do I need to arrange any equipment or products at home?",
    answer: "No. Our visiting beauty professional brings everything needed, including sterilized tools, clean sheets, and authentic salon-grade products. You only need a comfortable chair and access to a normal power outlet.",
  },
  {
    question: "What are your payment terms and cancellation policies?",
    answer: "We collect only a nominal 10% advance deposit to lock your artist's travel slot. The remaining 90% is payable after your service is completed to your satisfaction. You can cancel or reschedule for free up to 2 hours prior to your slot.",
  },
  {
    question: "Which areas do you serve in Delhi NCR?",
    answer: "We provide doorstep beauty and salon services across all sectors of Noida, Greater Noida (including Noida Extension / Gaur City), and South, West & Central Delhi.",
  },
];

export default async function CategoryPage({ params }: { params: Promise<CategoryPageParams> }) {
  const { categorySlug } = await params;
  if (LEGACY_CAT_REDIRECTS[categorySlug]) {
    redirect(`/services/${LEGACY_CAT_REDIRECTS[categorySlug]}`);
  }
  const [cat, cities, keys, s] = await Promise.all([
    getCategoryPage(categorySlug),
    getLiveCities(),
    getMediaKeys(),
    getSettings(),
  ]);

  if (!cat) {
    // Check if categorySlug is actually a legacy flat service slug
    const svc = await prisma.service.findFirst({
      where: { slug: categorySlug, mergedIntoId: null },
      include: { category: true },
    });
    if (svc) {
      redirect(`/services/${svc.category.slug}/${svc.slug}`);
    }
    notFound();
  }

  const faqs = asFaqs(cat.faqs);
  const displayFaqs = faqs.length >= 4 ? faqs : [...faqs, ...DEFAULT_CAT_FAQS.filter((df) => !faqs.some((f) => f.question.toLowerCase().slice(0, 15) === df.question.toLowerCase().slice(0, 15)))];

  const subcats = cat.subcategories || [];
  const servicesWithoutSubcat = cat.services.filter((s) => !s.subCategoryId);

  return (
    <div className="pb-24">
      {faqLd(displayFaqs) && <JsonLd data={faqLd(displayFaqs)!} />}

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blush-100 via-blush-50 to-ivory border-b border-line">
        <Container className="pb-6 pt-5 sm:pb-8 sm:pt-6">
          <Breadcrumbs
            items={[
              { name: "Services", path: "/services" },
              { name: cat.name, path: `/services/${cat.slug}` },
            ]}
          />

          <div className="mt-2 max-w-3xl">
            <h1 className="!text-[clamp(1.85rem,4.5vw,3.25rem)] font-serif font-bold text-plum-950">
              {cat.name} at Home
            </h1>
            <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-ink-soft">
              {cat.shortDescription || `Professional doorstep ${cat.name.toLowerCase()} treatments delivered by certified female specialists across Delhi, Noida, and Greater Noida.`}
            </p>

            {/* Micro Trust Indicators */}
            <div className="mt-4 flex flex-wrap gap-3 sm:gap-4 text-xs font-medium text-plum-900">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                100% Female Background-Verified
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-4 text-emerald-600 shrink-0" />
                Sanitized &amp; Clean Tools
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-4 text-emerald-600 shrink-0" />
                10% Advance Deposit · 100% Refund Guarantee
              </span>
            </div>

            {/* Sub-Category Jump Links */}
            {subcats.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="self-center text-xs font-bold uppercase tracking-wider text-rose-700 mr-1 flex items-center gap-1">
                  <Tag className="size-3" /> Explore:
                </span>
                {subcats.map((sub) => (
                  <a
                    key={sub.id}
                    href={`#subcat-${sub.slug}`}
                    className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-plum-900 shadow-xs transition hover:border-plum-700 hover:bg-blush-50"
                  >
                    {sub.name} ({sub.services.length})
                  </a>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Subcategory Sections & Service Grids */}
      <Container className="mt-12 space-y-16">
        {subcats.map((sub) => {
          if (sub.services.length === 0) return null;
          return (
            <section key={sub.id} id={`subcat-${sub.slug}`} className="scroll-mt-24 space-y-6">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-plum-950">{sub.name}</h2>
                  <p className="text-xs text-ink-soft">
                    Doorstep treatments for {cat.name} · Verified specialists &amp; authentic products
                  </p>
                </div>
                <Badge tone="plum">{sub.services.length} {sub.services.length === 1 ? "Option" : "Options"}</Badge>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sub.services.map((svc) => {
                  const image = realImage(keys, svc.image);
                  const allPrices = [svc.offerPrice ?? svc.price, ...(svc.variants || []).map((v) => v.offerPrice ?? v.price)]
                    .map((n) => (n == null ? NaN : Number(n)))
                    .filter((n) => Number.isFinite(n) && n > 0);
                  const lowPrice = allPrices.length ? Math.min(...allPrices) : (svc.price != null ? Number(svc.price) : null);
                  const highPrice = allPrices.length > 1 ? Math.max(...allPrices) : null;
                  const hasRange = lowPrice != null && highPrice != null && highPrice > lowPrice;
                  const isP2 = svc.status === "COMING_SOON";

                  return (
                    <Card
                      key={svc.slug}
                      className="group flex h-full flex-col overflow-hidden border border-line bg-white shadow-soft transition-all duration-300 hover:border-rose-300 hover:shadow-lift"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-deep">
                        <Link href={`/services/${cat.slug}/${svc.slug}`} className="block h-full w-full">
                          <Photo
                            src={image}
                            alt={svc.imageAlt || svc.title}
                            kind={cat.slug}
                            seedKey={svc.slug}
                            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          />
                        </Link>
                        {isP2 ? (
                          <Badge tone="plum" className="absolute left-3 top-3 shadow-soft">
                            Coming Soon
                          </Badge>
                        ) : svc.offerPrice && svc.price && Number(svc.price) > Number(svc.offerPrice) ? (
                          <Badge tone="gold" className="absolute left-3 top-3 shadow-soft">
                            Special Offer
                          </Badge>
                        ) : null}
                      </div>

                      {/* Card Details */}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
                            {sub.name}
                          </span>
                          {svc.duration && (
                            <span className="flex items-center gap-1 text-[11px] text-ink-soft font-medium">
                              <Clock className="size-3" />
                              <span>{svc.duration}</span>
                            </span>
                          )}
                        </div>

                        <Link href={`/services/${cat.slug}/${svc.slug}`} className="group-hover:text-rose-700 transition">
                          <h3 className="font-serif text-base font-bold text-plum-950 line-clamp-2">
                            {svc.title}
                          </h3>
                        </Link>

                        {svc.shortDescription && (
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                            {stripTags(svc.shortDescription)}
                          </p>
                        )}

                        {/* Trust & Inclusions Highlight */}
                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50/80 rounded-md px-2 py-1 border border-emerald-200/60">
                          <ShieldCheck className="size-3.5 shrink-0 text-emerald-600" />
                          <span className="truncate">
                            {cat.slug === "makeup" && "100% Genuine MAC/Huda · Doorstep Artist"}
                            {cat.slug === "salon-at-home" && "Italian Rica Wax · Sanitized Disposables"}
                            {cat.slug === "facial-skincare" && "O3+ Glow Range · Extraction & Massage"}
                            {cat.slug === "hair" && "L'Oreal & Keratin · Advanced Styling"}
                            {cat.slug === "nails" && "Non-Toxic Gel · Cuticle Care & Shine"}
                            {cat.slug === "mehndi" && "100% Herbal Henna · Deep Dark Stain"}
                            {cat.slug === "pre-bridal" && "All-in-One Luxury Routine · High Savings"}
                            {!["makeup", "salon-at-home", "facial-skincare", "hair", "nails", "mehndi", "pre-bridal"].includes(cat.slug) && "100% Verified Female Beautician"}
                          </span>
                        </div>

                        {/* Variants pill preview */}
                        {svc.variants && svc.variants.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {svc.variants.slice(0, 3).map((v) => (
                              <span
                                key={v.name}
                                className="inline-flex items-center rounded-md bg-blush-50 px-2 py-0.5 text-[10px] text-plum-900 border border-line/60"
                              >
                                {v.name.split("(")[0]?.trim()}
                              </span>
                            ))}
                            {svc.variants.length > 3 && (
                              <span className="text-[10px] font-semibold text-rose-700 self-center pl-1">
                                +{svc.variants.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Price & CTA */}
                        <div className="mt-auto pt-4 border-t border-line/60 flex items-center justify-between gap-2">
                          <div>
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                              {hasRange ? "Price Range" : "Starting Price"}
                            </span>
                            {isP2 ? (
                              <span className="text-xs font-semibold text-plum-900">Notify Me</span>
                            ) : lowPrice != null ? (
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-serif text-base sm:text-lg font-bold text-plum-950">
                                  {hasRange
                                    ? `₹${Math.round(lowPrice).toLocaleString("en-IN")} - ₹${Math.round(highPrice!).toLocaleString("en-IN")}`
                                    : `₹${Math.round(lowPrice).toLocaleString("en-IN")}`}
                                </span>
                                {svc.offerPrice && svc.price && Number(svc.price) > Number(svc.offerPrice) && (
                                  <s className="text-xs text-ink-soft">
                                    ₹{Math.round(Number(svc.price)).toLocaleString("en-IN")}
                                  </s>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs font-semibold text-rose-700">Custom Quote</span>
                            )}
                          </div>

                          <Link
                            href={`/services/${cat.slug}/${svc.slug}`}
                            className={cn(buttonStyles({ variant: "shimmer", size: "sm" }), "text-xs px-3.5 h-8")}
                          >
                            {isP2 ? "Details" : "Book Now"}
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Services without subcategories (if any) */}
        {servicesWithoutSubcat.length > 0 && (
          <section className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-plum-950">Additional {cat.name} Options</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {servicesWithoutSubcat.map((svc) => {
                const image = realImage(keys, svc.image);
                const allPrices = [svc.offerPrice ?? svc.price, ...(svc.variants || []).map((v) => v.offerPrice ?? v.price)]
                  .map((n) => (n == null ? NaN : Number(n)))
                  .filter((n) => Number.isFinite(n) && n > 0);
                const lowPrice = allPrices.length ? Math.min(...allPrices) : (svc.price != null ? Number(svc.price) : null);
                const highPrice = allPrices.length > 1 ? Math.max(...allPrices) : null;
                const hasRange = lowPrice != null && highPrice != null && highPrice > lowPrice;

                return (
                  <Card
                    key={svc.slug}
                    className="group flex h-full flex-col overflow-hidden border border-line bg-white shadow-soft transition-all duration-300 hover:border-rose-300 hover:shadow-lift"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-deep">
                      <Link href={`/services/${cat.slug}/${svc.slug}`} className="block h-full w-full">
                        <Photo
                          src={image}
                          alt={svc.imageAlt || svc.title}
                          kind={cat.slug}
                          seedKey={svc.slug}
                          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                      </Link>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
                          {cat.name}
                        </span>
                        {svc.duration && (
                          <span className="flex items-center gap-1 text-[11px] text-ink-soft font-medium">
                            <Clock className="size-3" />
                            <span>{svc.duration}</span>
                          </span>
                        )}
                      </div>
                      <Link href={`/services/${cat.slug}/${svc.slug}`} className="group-hover:text-rose-700 transition">
                        <h3 className="font-serif text-base font-bold text-plum-950 line-clamp-2">
                          {svc.title}
                        </h3>
                      </Link>
                      {svc.shortDescription && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                          {stripTags(svc.shortDescription)}
                        </p>
                      )}
                      <div className="mt-auto pt-4 border-t border-line/60 flex items-center justify-between gap-2">
                        <div>
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                            {hasRange ? "Price Range" : "Starting Price"}
                          </span>
                          {lowPrice != null ? (
                            <span className="font-serif text-base sm:text-lg font-bold text-plum-950">
                              {hasRange
                                ? `₹${Math.round(lowPrice).toLocaleString("en-IN")} - ₹${Math.round(highPrice!).toLocaleString("en-IN")}`
                                : `₹${Math.round(lowPrice).toLocaleString("en-IN")}`}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-rose-700">Custom Quote</span>
                          )}
                        </div>
                        <Link
                          href={`/services/${cat.slug}/${svc.slug}`}
                          className={cn(buttonStyles({ variant: "shimmer", size: "sm" }), "text-xs px-3.5 h-8")}
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </Container>

      {/* Safety & Hygiene Section */}
      <Section className="mt-16 py-12" tone="blush">
        <Container className="max-w-4xl text-center">
          <SectionHeading
            eyebrow="The HerrGlow Standard"
            title="Safe, Hygienic & 100% Female-Led Salon at Home"
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-3 text-left">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <span className="grid size-10 place-items-center rounded-full bg-emerald-100 text-emerald-700 mb-3">
                <ShieldCheck className="size-5" />
              </span>
              <h3 className="font-serif text-base font-bold text-plum-950">Verified Professionals</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                Government ID verified, police cleared, and trade skill evaluated senior female beauticians.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <span className="grid size-10 place-items-center rounded-full bg-gold-100 text-gold-700 mb-3">
                <Sparkles className="size-5" />
              </span>
              <h3 className="font-serif text-base font-bold text-plum-950">Sanitized Tools &amp; Clean Setup</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                Every appointment uses thoroughly sanitized tools, clean towels, and authentic salon-grade products.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <span className="grid size-10 place-items-center rounded-full bg-rose-100 text-rose-700 mb-3">
                <Check className="size-5" />
              </span>
              <h3 className="font-serif text-base font-bold text-plum-950">10% Advance Security</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                Pay only 10% advance to lock your date and slot. 100% full refund guarantee if the beautician does not reach you.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQs */}
      {displayFaqs.length > 0 && (
        <Section>
          <Container className="max-w-3xl">
            <SectionHeading eyebrow="FAQs" title={`Frequently Asked Questions about ${cat.name}`} />
            <FaqList faqs={displayFaqs} />
          </Container>
        </Section>
      )}

      {/* City Hub Links */}
      {cities.length > 0 && (
        <Section tone="blush" className="py-12">
          <Container className="text-center">
            <h3 className="font-serif text-lg font-bold text-plum-950">
              {cat.name} Doorstep Service Available Across Delhi NCR
            </h3>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {cities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${cat.slug}-at-home-${c.slug}`}
                  className="rounded-full border border-line bg-white px-5 py-2 text-xs sm:text-sm font-medium text-plum-900 shadow-soft transition hover:border-plum-700 hover:bg-blush-50"
                >
                  {cat.name} at home in {c.name}
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </div>
  );
}
