import type { Metadata } from "next";
import { getBlogs, getHomeExtras, getPopularServices, getTestimonials } from "@herrglow/core";
import { ArtistsCarousel, BlogCards, BrandMarquee, CategoryBento, CityCards, FaqSection, FinalCta, HowItWorks, LooksSection, PackagesBand, PopularSlider, ReviewsMarquee, StatsBand } from "@/components/home/sections";
import { HeroSection } from "@/components/home/HeroSection";
import { getCategories, getLiveCities, getMediaKeys, getMegaMenu, getSettings } from "@/lib/data";
import { JsonLd, faqLd, organizationLd, websiteLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { realImage } from "@/lib/media";

export const metadata: Metadata = buildMetadata({
  title: "Makeup Artist & Salon at Home in Delhi NCR",
  description: "Book verified makeup artists and beauticians at home in Delhi, Noida and Greater Noida. Bridal, party and salon services with clear prices.",
  path: "/",
});

const num = (v: unknown) => (v == null ? null : Number(v));
const lowest = (...vals: unknown[]) => { const n = vals.map((v) => (v == null ? NaN : Number(v))).filter((x) => x > 0); return n.length ? Math.min(...n) : null; };

export default async function HomePage() {
  const [s, categories, cities, popular, testimonials, blogs, extras, mega, keys] = await Promise.all([
    getSettings(), getCategories(), getLiveCities(), getPopularServices(10), getTestimonials(10), getBlogs(), getHomeExtras(), getMegaMenu(), getMediaKeys(),
  ]);
  const img = (p: string | null | undefined) => realImage(keys, p);

  // category tiles: photo of the category's top service (real only)
  const catTiles = categories.map((c) => ({ slug: c.slug, name: c.name, count: c._count.services, image: img(mega.categories.find((m) => m.slug === c.slug)?.services[0]?.image) }));

  // popular slider
  const slides = popular.map((p) => ({
    slug: p.slug, title: p.title, image: img(p.image), alt: p.imageAlt || p.title, price: num(p.price), offerPrice: num(p.offerPrice), duration: p.duration,
    category: p.category.name, categorySlug: p.category.slug, popular: p.leadCount >= 5, from: p.priceLabel === "Starting at",
  }));

  // packages (bundle services). The flagship bridal bundle leads and carries the "most popular" badge.
  const FLAGSHIP = "complete-bridal-package";
  const pkgs = [...extras.packages].sort((a, b) => (b.slug === FLAGSHIP ? 1 : 0) - (a.slug === FLAGSHIP ? 1 : 0) || b.leadCount - a.leadCount).slice(0, 4).map((p) => ({
    slug: p.slug, title: p.title, image: img(p.image), price: num(p.price), offerPrice: lowest(p.offerPrice, ...p.variants.map((v) => v.offerPrice)) ?? num(p.offerPrice),
    included: (p.features ?? "").split(/\r?\n|;|•/).map((x) => x.trim()).filter(Boolean), popular: p.slug === FLAGSHIP, href: `/services/${p.slug}`,
  }));

  // looks / before-after: only REAL images. A before/after slider needs images an admin has explicitly paired ("Before: X" + "After: X").
  const gallery = extras.gallery.map((g) => ({ title: g.title, src: img(g.mediaPath), alt: g.alt || g.title })).filter((g): g is { title: string; src: string; alt: string } => !!g.src);
  const before = gallery.find((g) => /^before\s*:/i.test(g.title));
  const after = before ? gallery.find((g) => /^after\s*:/i.test(g.title) && g.title.replace(/^after\s*:\s*/i, "") === before.title.replace(/^before\s*:\s*/i, "")) : undefined;
  const pair = before && after ? { before: before.src, after: after.src, alt: before.title.replace(/^before\s*:\s*/i, "") } : null;
  const looks = gallery.filter((g) => !/^(before|after)\s*:/i.test(g.title));

  // hero stack: real photos only (gallery first, then service photos)
  const heroImages = [...looks.map((g) => ({ src: g.src, alt: g.alt })), ...slides.filter((x) => x.image).map((x) => ({ src: x.image!, alt: x.alt }))].slice(0, 3);

  // artists: real photos first, then most experienced
  const artists = extras.pros
    .map((p) => ({ slug: p.slug, name: p.name, photo: img(p.photo), specialization: p.specialization, years: p.experienceYears, city: p.city, linked: extras.proPageSlugs.has(p.slug), kind: p.providerType === "MAKEOVER_ARTIST" ? "Makeup artist" : "Beautician" }))
    .sort((a, b) => Number(!!b.photo) - Number(!!a.photo) || (b.years ?? 0) - (a.years ?? 0)).slice(0, 10);

  const cityNames = cities.map((c) => c.name);
  const faqs = [
    { question: "How does booking work?", answer: "Choose a service, tell us your area and preferred date, and we confirm that an artist covers your location. We then contact you to finalise the details." },
    { question: "Which areas do you serve?", answer: cityNames.length ? `We currently serve ${cityNames.join(", ")}. Enter your area while booking to confirm coverage.` : "We are expanding across Delhi NCR. Send us your area and we will confirm." },
    { question: "Can I choose a specific artist?", answer: "Yes. You can request an artist from their profile page and we will confirm their availability for your date." },
    { question: "Are the prices final?", answer: "Prices shown are starting prices for each option. The final price is confirmed with you before your booking is finalised." },
    { question: "What if my area is not covered yet?", answer: "Send your request anyway. We save it, and we will let you know as soon as artists are available near you." },
  ];

  return (
    <>
      <JsonLd data={[organizationLd({ email: s.contactEmail, telephone: s.contactPhone ?? s.whatsappNumber, areaServed: cityNames, logo: img(s.raw.site_logo), sameAs: [s.raw.social_instagram, s.raw.social_facebook, s.raw.social_youtube].filter((x): x is string => !!x) }), websiteLd(), faqLd(faqs)!]} />
      <HeroSection cityNames={cityNames} stats={{ artists: extras.stats.artists, cities: extras.stats.cities }} reviews={extras.reviews} images={heroImages} />
      <BrandMarquee />
      <CategoryBento cats={catTiles} />
      <PopularSlider items={slides} />
      <PackagesBand items={pkgs} />
      <HowItWorks />
      <LooksSection pair={pair} looks={looks} />
      <ArtistsCarousel artists={artists} />
      <StatsBand stats={extras.stats} />
      <ReviewsMarquee reviews={testimonials} />
      <CityCards cities={extras.perCity} />
      <BlogCards posts={blogs.slice(0, 3).map((b) => ({ slug: b.slug, title: b.title, excerpt: b.excerpt, image: img(b.image), date: b.publishedAt }))} />
      <FaqSection faqs={faqs} />
      <FinalCta cities={cities} />
    </>
  );
}
