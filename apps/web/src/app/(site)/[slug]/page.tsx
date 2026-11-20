import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { asFaqs, findPage, getCategoryExtras, urls, type Faq } from "@herrglow/core";
import { Badge, ButtonLink, Card, Container, Section, SectionHeading } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { Breadcrumbs, FaqList, Html, ProCard, ServiceCard, stripTags } from "@/components/parts";
import { CATEGORY_COPY } from "@/lib/copy";
import { getAreaPage, getCategoryPage, getCityHub, getLiveCities, getMediaKeys, getServiceCity } from "@/lib/data";
import { realImage } from "@/lib/media";
import { CategoryView } from "@/components/services/CategoryView";
import { JsonLd, faqLd, serviceLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

/**
 * One root route for every top-level URL. The Page table (synced from the planner) is the source of truth:
 * if there is no Page row the URL does not exist (404). Types: CATEGORY, CITY, AREA, SERVICE_CITY.
 */
async function resolve(slug: string) {
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
    const hub = await getCityHub(page.entityId!);
    if (!hub) notFound();
    const { city, pros, services, areaPageSlugs, proPageSlugs, serviceCityPageSlugs } = hub;
    const withPage = city.areas.filter((a) => areaPageSlugs.has(a.slug));
    const textOnly = city.areas.filter((a) => !areaPageSlugs.has(a.slug) && a.slug !== city.slug);
    const faqs: Faq[] = [
      { question: `Do you offer makeup artists at home in ${city.name}?`, answer: `Yes. ${pros.length} verified artists and beauticians currently cover ${city.areas.length} areas of ${city.name}, and they come to your home or venue.` },
      { question: `Which areas of ${city.name} do you serve?`, answer: `We serve ${city.areas.slice(0, 12).map((a) => a.name).join(", ")}${city.areas.length > 12 ? ` and ${city.areas.length - 12} more areas` : ""}. Enter your area while booking to confirm coverage.` },
      { question: `How do I book in ${city.name}?`, answer: "Choose a service, share your area and preferred date, and we confirm an available artist near you." },
    ];
    const path = urls.cityHub(city.slug);
    return (
      <>
        <JsonLd data={faqLd(faqs)!} />
        <Section className="pb-6">
          <Container>
            <Breadcrumbs items={[{ name: city.name, path }]} />
            <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <Badge tone="gold">{pros.length} verified artists · {city.areas.length} areas</Badge>
                <h1 className="mt-4">Makeup Artist at Home in {city.name}</h1>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">Bridal, party and salon services at your doorstep in {city.name}. Pick a service, see clear prices and book an artist who covers your area.</p>
                <ButtonLink href="#book" className="mt-6" size="lg">Book in {city.name}</ButtonLink>
              </div>
              <BookingForm cities={cities} defaultCity={city.slug} sourcePath={path} enquiry heading={`Book in ${city.name}`} />
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <SectionHeading title={`Services available in ${city.name}`} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 12).map((s) => (
                <div key={s.id}>
                  <ServiceCard s={s} />
                  {serviceCityPageSlugs.has(s.slug) && <Link className="mt-2 inline-block text-sm text-rose-700 underline underline-offset-4" href={urls.serviceCity(s.slug, city.slug)}>{s.title} in {city.name}</Link>}
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {pros.length > 0 && (
          <Section tone="blush">
            <Container>
              <SectionHeading title={`Artists covering ${city.name}`} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{pros.slice(0, 12).map((p) => <ProCard key={p.id} p={p} href={proPageSlugs.has(p.slug) ? urls.pro(p.slug) : undefined} />)}</div>
            </Container>
          </Section>
        )}

        <Section>
          <Container>
            <SectionHeading title={`Areas we serve in ${city.name}`} />
            {withPage.length > 0 && <div className="mb-6 flex flex-wrap gap-2">{withPage.map((a) => <Link key={a.slug} href={urls.area(a.slug)} className="rounded-full border border-plum-700/20 bg-white px-4 py-2 text-sm text-plum-800 hover:bg-blush-100">{a.name}</Link>)}</div>}
            {textOnly.length > 0 && <p className="leading-relaxed text-ink-soft"><span className="font-medium text-plum-900">Also covering: </span>{textOnly.map((a) => a.name).join(", ")}.</p>}
          </Container>
        </Section>
        <Section tone="blush"><Container className="max-w-3xl"><SectionHeading title={`${city.name} FAQs`} /><FaqList faqs={faqs} /></Container></Section>
      </>
    );
  }

  /* ───────── Service × city ───────── */
  if (page.type === "SERVICE_CITY") {
    const [svcSlug, citySlug] = page.entityId!.split("|");
    const d = await getServiceCity(svcSlug!, citySlug!);
    if (!d) notFound();
    const { row, pros, proPageSlugs } = d;
    const faqs = asFaqs(row.faqs);
    const svc = row.service;
    const prices = [svc.offerPrice ?? svc.price, ...svc.variants.map((v) => v.offerPrice ?? v.price)].map((n) => (n == null ? NaN : Number(n))).filter((n) => n > 0);
    return (
      <>
        <JsonLd data={serviceLd({ name: `${svc.title} in ${row.city.name}`, description: stripTags(row.localContent).slice(0, 300), path, category: svc.category.name, price: prices.length ? Math.min(...prices) : null, areaServed: [row.city.name] })} />
        {faqLd(faqs) && <JsonLd data={faqLd(faqs)!} />}
        <Section className="pb-6">
          <Container>
            <Breadcrumbs items={[{ name: row.city.name, path: urls.cityHub(row.city.slug) }, { name: `${svc.title} in ${row.city.name}`, path }]} />
            <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h1>{svc.title} in {row.city.name}</h1>
                <Html html={row.localContent ?? ""} className="mt-6" />
                <p className="mt-6"><Link className="text-rose-700 underline underline-offset-4" href={urls.service(svc.slug)}>Full details and options for {svc.title}</Link> · <Link className="text-rose-700 underline underline-offset-4" href={urls.cityHub(row.city.slug)}>All services in {row.city.name}</Link></p>
              </div>
              <BookingForm cities={cities} defaultCity={row.city.slug} sourcePath={path} service={{ slug: svc.slug, title: svc.title, variants: svc.variants.map((v) => ({ name: v.name, price: Number(v.offerPrice ?? v.price ?? 0) || null })) }} />
            </div>
          </Container>
        </Section>
        {pros.length > 0 && <Section tone="blush"><Container><SectionHeading title={`Artists offering ${svc.title} in ${row.city.name}`} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{pros.map((p) => <ProCard key={p.id} p={p} href={proPageSlugs.has(p.slug) ? urls.pro(p.slug) : undefined} />)}</div></Container></Section>}
        {faqs.length > 0 && <Section><Container className="max-w-3xl"><SectionHeading title="Frequently asked questions" /><FaqList faqs={faqs} /></Container></Section>}
      </>
    );
  }

  /* ───────── Area ───────── */
  if (page.type === "AREA") {
    const a = await getAreaPage(page.entityId!);
    if (!a) notFound();
    const { area, pros, services, nearby, areaPageSlugs, proPageSlugs } = a;
    const faqs = asFaqs(area.faqs);
    return (
      <>
        {faqLd(faqs) && <JsonLd data={faqLd(faqs)!} />}
        <Section className="pb-6">
          <Container>
            <Breadcrumbs items={[{ name: area.city.name, path: urls.cityHub(area.city.slug) }, { name: area.name, path }]} />
            <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <h1>Makeup Artist in {area.name}, {area.city.name}</h1>
                {area.content ? <Html html={area.content} className="mt-6" /> : <p className="mt-4 text-lg text-ink-soft">Makeup artists and beauticians who come to you in {area.name}.</p>}
                {area.landmarks.length > 0 && <div className="mt-6"><h2 className="text-2xl">Near {area.name}</h2><p className="mt-2 text-ink-soft">We serve homes around {area.landmarks.join(", ")}.</p></div>}
              </div>
              <BookingForm cities={cities} defaultCity={area.city.slug} sourcePath={path} enquiry heading={`Book in ${area.name}`} />
            </div>
          </Container>
        </Section>
        {services.length > 0 && <Section><Container><SectionHeading title={`Popular services in ${area.name}`} /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{services.slice(0, 4).map((s) => <ServiceCard key={s.id} s={{ ...s, category: null }} />)}</div></Container></Section>}
        {pros.length > 0 && <Section tone="blush"><Container><SectionHeading title={`Artists covering ${area.name}`} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{pros.map((p) => <ProCard key={p.id} p={p} href={proPageSlugs.has(p.slug) ? urls.pro(p.slug) : undefined} />)}</div></Container></Section>}
        {nearby.length > 0 && <Section><Container><SectionHeading title="Nearby areas" /><div className="flex flex-wrap gap-2">{nearby.map((n) => areaPageSlugs.has(n.slug) ? <Link key={n.slug} href={urls.area(n.slug)} className="rounded-full border border-plum-700/20 bg-white px-4 py-2 text-sm text-plum-800 hover:bg-blush-100">{n.name}</Link> : <span key={n.slug} className="rounded-full bg-blush-50 px-4 py-2 text-sm text-ink-soft">{n.name}</span>)}</div></Container></Section>}
        {faqs.length > 0 && <Section tone="blush"><Container className="max-w-3xl"><SectionHeading title="Frequently asked questions" /><FaqList faqs={faqs} /></Container></Section>}
      </>
    );
  }

  notFound();
}
