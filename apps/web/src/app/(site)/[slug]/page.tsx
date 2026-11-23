import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { asFaqs, findPage, getCategoryExtras, urls, type Faq } from "@herrglow/core";
import { Carousel, Container, Section, SectionHeading } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { Breadcrumbs, FaqList, Html, ProCard, ServiceCard, stripTags } from "@/components/parts";
import { CATEGORY_COPY } from "@/lib/copy";
import { getAreaPage, getCategoryPage, getCityHub, getLiveCities, getMediaKeys, getServiceCity } from "@/lib/data";
import { realImage } from "@/lib/media";
import { CategoryView } from "@/components/services/CategoryView";
import { AreaView, CityHubView } from "@/components/location/views";
import { PageHero } from "@/components/page/PageHero";
import { ArtistCard } from "@/components/page/ArtistCard";
import { JsonLd, faqLd, serviceLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

/**
 * One root route for every top-level URL. The Page table (synced from the planner) is the source of truth:
 * if there is no Page row the URL does not exist (404). Types: CATEGORY, CITY, AREA, SERVICE_CITY.
 */
async function resolve(slug: string) {
  const cat = await getCategoryPage(slug);
  if (cat) {
    redirect(`/services/${slug}`);
  }
  const page = await findPage(`/${slug}`);
  if (!page) return null;
  return page;
}

export async function generateMetadata(props: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await resolve(slug);
  if (!page) return {};
  const path = `/${slug}`;
  const indexable = page.isIndexable;

  if (page.type === "CATEGORY") {
    const copy = CATEGORY_COPY[slug];
    const cat = await getCategoryPage(slug);
    if (!cat) return {};
    return buildMetadata({ title: copy?.title ?? `${cat.name} at Home`, description: copy?.description ?? `Book ${cat.name.toLowerCase()} services at home.`, path, indexable });
  }
  if (page.type === "CITY") {
    const hub = await getCityHub(page.entityId!);
    if (!hub) return {};
    const n = hub.pros.length;
    return buildMetadata({ title: `Makeup Artist at Home in ${hub.city.name}`, description: `Book one of ${n} verified makeup artists and beauticians at home in ${hub.city.name}. Bridal, party and salon services across ${hub.city.areas.length} areas.`, path, indexable });
  }
  if (page.type === "AREA") {
    const a = await getAreaPage(page.entityId!);
    if (!a) return {};
    return buildMetadata({ title: a.area.seoTitle || `Makeup Artist in ${a.area.name}, ${a.area.city.name}`, description: a.area.seoDescription || `Makeup artists and beauticians at home in ${a.area.name}, ${a.area.city.name}. Bridal, party and salon services near ${a.area.landmarks.slice(0, 2).join(" and ")}.`, path, indexable });
  }
  if (page.type === "SERVICE_CITY") {
    const [svcSlug, citySlug] = page.entityId!.split("|");
    const d = await getServiceCity(svcSlug!, citySlug!);
    if (!d) return {};
    return buildMetadata({ title: `${d.row.service.title} in ${d.row.city.name}`, description: `${d.row.service.title} at home in ${d.row.city.name} by ${d.pros.length} verified artists. See prices, areas covered and book online.`, path, indexable });
  }
  return {};
}

export default async function RootSlugPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const page = await resolve(slug);
  if (!page) notFound();
  const cities = await getLiveCities();
  const path = `/${slug}`;

  /* ───────── Category ───────── */
  if (page.type === "CATEGORY") {
    const cat = await getCategoryPage(slug);
    if (!cat) notFound();
    const copy = CATEGORY_COPY[slug];
    const [keys, extras] = await Promise.all([getMediaKeys(), getCategoryExtras(cat.id)]);
    const prices = cat.services.flatMap((x) => [x.offerPrice ?? x.price, ...x.variants.map((v) => v.offerPrice ?? v.price)]).map((n) => (n == null ? NaN : Number(n))).filter((n) => n > 0);
    return (
      <CategoryView path={path} slug={slug} name={cat.name} h1={copy?.h1 ?? `${cat.name} at Home`} intro={copy?.intro} cities={cities}
        heroImage={realImage(keys, cat.services.find((x) => realImage(keys, x.image))?.image)}
        services={cat.services.map((x) => ({ ...x, category: { name: cat.name, slug: cat.slug } }))}
        packages={extras.packages.map((p) => ({ slug: p.slug, title: p.title, image: realImage(keys, p.image), price: p.price == null ? null : Number(p.price), offerPrice: p.offerPrice == null ? null : Number(p.offerPrice), short: p.shortDescription }))}
        priceRange={prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null} />
    );
  }

  /* ───────── City hub ───────── */
  if (page.type === "CITY") {
    const [hub, keys] = await Promise.all([getCityHub(page.entityId!), getMediaKeys()]);
    if (!hub) notFound();
    const { city, pros, services, areaPageSlugs, proPageSlugs, serviceCityPageSlugs } = hub;
    const withPage = city.areas.filter((a) => areaPageSlugs.has(a.slug));
    const textOnly = city.areas.filter((a) => !areaPageSlugs.has(a.slug) && a.slug !== city.slug);
    const faqs: Faq[] = [
      { question: `Do you offer makeup artists at home in ${city.name}?`, answer: `Yes. ${pros.length} verified artists and beauticians currently cover ${city.areas.length} areas of ${city.name}, and they come to your home or venue.` },
      { question: `Which areas of ${city.name} do you serve?`, answer: `We serve ${city.areas.slice(0, 12).map((a) => a.name).join(", ")}${city.areas.length > 12 ? ` and ${city.areas.length - 12} more areas` : ""}. Enter your area while booking to confirm coverage.` },
      { question: `How do I book in ${city.name}?`, answer: "Choose a service, share your area and preferred date, and we confirm an available artist near you." },
    ];
    return <CityHubView city={{ slug: city.slug, name: city.name }} path={urls.cityHub(city.slug)} cities={cities} faqs={faqs} areaCount={city.areas.length}
      services={services.map((x) => ({ ...x, category: x.category }))} withPage={withPage} textOnly={textOnly} serviceCityPages={serviceCityPageSlugs}
      artists={pros.map((p) => ({ slug: p.slug, name: p.name, photo: realImage(keys, p.photo), specialization: p.specialization, years: p.experienceYears, city: city.name, linked: proPageSlugs.has(p.slug), kind: p.providerType === "MAKEOVER_ARTIST" ? "Makeup artist" : "Beautician" }))} />;
  }

  /* ───────── Service × city ───────── */
  if (page.type === "SERVICE_CITY") {
    const [svcSlug, citySlug] = page.entityId!.split("|");
    const [d, keys] = await Promise.all([getServiceCity(svcSlug!, citySlug!), getMediaKeys()]);
    if (!d) notFound();
    const { row, pros, proPageSlugs } = d;
    const faqs = asFaqs(row.faqs);
    const svc = row.service;
    const prices = [svc.offerPrice ?? svc.price, ...svc.variants.map((v) => v.offerPrice ?? v.price)].map((n) => (n == null ? NaN : Number(n))).filter((n) => n > 0);
    return (
      <>
        <JsonLd data={serviceLd({ name: `${svc.title} in ${row.city.name}`, description: stripTags(row.localContent).slice(0, 300), path, category: svc.category.name, price: prices.length ? Math.min(...prices) : null, areaServed: [row.city.name] })} />
        {faqLd(faqs) && <JsonLd data={faqLd(faqs)!} />}
        <PageHero crumbs={[{ name: row.city.name, path: urls.cityHub(row.city.slug) }, { name: `${svc.title} in ${row.city.name}`, path }]} eyebrow={row.city.name} title={<>{svc.title} in {row.city.name}</>} image={{ src: realImage(keys, svc.image), alt: svc.title, kind: svc.category.slug, seedKey: svc.slug }} />
        <Section className="py-10">
          <Container className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <Html html={row.localContent ?? ""} />
              <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2"><Link className="text-rose-700 underline underline-offset-4" href={urls.service(svc.slug)}>Full details and options for {svc.title}</Link><Link className="text-rose-700 underline underline-offset-4" href={urls.cityHub(row.city.slug)}>All services in {row.city.name}</Link></p>
            </div>
            <div className="lg:sticky lg:top-28 lg:self-start"><BookingForm cities={cities} defaultCity={row.city.slug} sourcePath={path} service={{ slug: svc.slug, title: svc.title, price: Number(svc.offerPrice ?? svc.price ?? 0) || null, variants: svc.variants.map((v) => ({ name: v.name, price: Number(v.offerPrice ?? v.price ?? 0) || null })) }} /></div>
          </Container>
        </Section>
        {pros.length > 0 && <Section tone="blush"><Container><SectionHeading eyebrow="Artists" title={`Artists offering ${svc.title} in ${row.city.name}`} /><Carousel dots label="Artists" itemClassName="basis-[72%] sm:basis-1/3 lg:basis-1/4">{pros.map((p) => <ArtistCard key={p.id} a={{ slug: p.slug, name: p.name, photo: realImage(keys, p.photo), specialization: p.specialization, years: p.experienceYears, city: row.city.name, linked: proPageSlugs.has(p.slug), kind: p.providerType === "MAKEOVER_ARTIST" ? "Makeup artist" : "Beautician" }} />)}</Carousel></Container></Section>}
        {faqs.length > 0 && <Section><Container className="max-w-3xl"><SectionHeading eyebrow="FAQ" title="Frequently asked questions" /><FaqList faqs={faqs} /></Container></Section>}
      </>
    );
  }

  /* ───────── Area ───────── */
  if (page.type === "AREA") {
    const [a, keys] = await Promise.all([getAreaPage(page.entityId!), getMediaKeys()]);
    if (!a) notFound();
    const { area, pros, services, nearby, areaPageSlugs, proPageSlugs } = a;
    return <AreaView area={{ name: area.name, slug: area.slug }} city={{ slug: area.city.slug, name: area.city.name }} path={path} cities={cities} content={area.content} landmarks={area.landmarks}
      services={services.map((x) => ({ ...x, category: null }))} nearby={nearby} areaPageSlugs={areaPageSlugs} faqs={asFaqs(area.faqs)}
      geo={area.latitude != null && area.longitude != null ? { lat: Number(area.latitude), lng: Number(area.longitude) } : null}
      artists={pros.map((p) => ({ slug: p.slug, name: p.name, photo: realImage(keys, p.photo), specialization: p.specialization, years: p.experienceYears, city: area.city.name, linked: proPageSlugs.has(p.slug), kind: p.providerType === "MAKEOVER_ARTIST" ? "Makeup artist" : "Beautician" }))} />;
  }

  notFound();
}
