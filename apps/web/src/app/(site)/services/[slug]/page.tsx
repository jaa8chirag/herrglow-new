import { Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { asFaqs, findPage, getRelatedBlogs, getReviewsFor, getServiceArtists, urls } from "@herrglow/core";
import { Badge, Card, Carousel, Container, Section, SectionHeading } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { ArtistCard } from "@/components/page/ArtistCard";
import { Breadcrumbs, FaqList, Html, ServiceCard, stripTags } from "@/components/parts";
import { Photo } from "@/components/Photo";
import { PriceBox } from "@/components/services/PriceBox";
import { Included, ProcessSteps, ProductsUsed } from "@/components/services/blocks";
import { getLiveCities, getMediaKeys, getServicePage } from "@/lib/data";
import { realImage } from "@/lib/media";
import { JsonLd, faqLd, serviceLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(props: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const data = await getServicePage(slug);
  if (!data) return {};
  const { svc } = data;
  const page = await findPage(urls.service(slug));
  const price = svc.offerPrice ?? svc.price;
  const keys = await getMediaKeys();
  return buildMetadata({
    title: svc.seoTitle || `${svc.title} at Home`,
    description: svc.seoDescription || stripTags(svc.shortDescription) || `Book ${svc.title} at home${price ? ` from ₹${Math.round(Number(price)).toLocaleString("en-IN")}` : ""}. Verified artists, doorstep service.`,
    path: urls.service(slug),
    image: realImage(keys, svc.image),
    indexable: page?.isIndexable ?? false,
  });
}

const num = (v: unknown) => (v == null ? null : Number(v));
const PRODUCT_CATS = new Set(["makeup", "facial-skincare", "hair", "pre-bridal"]);

export default async function ServicePage(props: PageProps<"/services/[slug]">) {
  const { slug } = await props.params;
  const [data, cities, keys] = await Promise.all([getServicePage(slug), getLiveCities(), getMediaKeys()]);
  if (!data) notFound();
  const { svc, related, serviceCities, variantLinks } = data;
  const [artists, reviews, blogs] = await Promise.all([getServiceArtists(svc.id), getReviewsFor(svc.title), getRelatedBlogs(`${svc.title} ${svc.category.name}`, null, 3)]);
  const faqs = asFaqs(svc.faqs);
  const path = urls.service(slug);
  const features = (svc.features ?? "").split(/\r?\n|;|•/).map((f) => f.trim()).filter(Boolean);
  const nowPrice = svc.offerPrice ?? svc.price;
  const image = realImage(keys, svc.image);
  const options = svc.variants.map((v) => ({ name: v.name, price: num(v.price), offerPrice: num(v.offerPrice), duration: v.duration }));
  const relatedCards = related.map((r) => r);

  return (
    <div className="pb-28 lg:pb-0">
      <JsonLd data={serviceLd({ name: svc.title, description: stripTags(svc.shortDescription) || stripTags(svc.description).slice(0, 300), path, image, category: svc.category.name, price: nowPrice == null ? null : Number(nowPrice), areaServed: cities.map((c) => c.name) })} />
      {faqLd(faqs) && <JsonLd data={faqLd(faqs)!} />}

      <section className="bg-gradient-to-b from-blush-100 via-blush-50 to-ivory">
        <Container className="pb-12 pt-8">
          <Breadcrumbs items={[{ name: svc.category.name, path: urls.category(svc.category.slug) }, { name: svc.title, path }]} />
          <div className="grid items-start gap-8 lg:grid-cols-[1.35fr_1fr]">
            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border-4 border-ivory shadow-lift">
                <Photo src={image} alt={svc.imageAlt || svc.title} kind={svc.category.slug} seedKey={svc.slug} priority sizes="(min-width: 1024px) 55vw, 100vw" />
                {svc.isPackage && <Badge tone="plum" className="absolute left-4 top-4">Package</Badge>}
              </div>
              <div className="mt-7">
                <Badge>{svc.category.name}</Badge>
                <h1 className="mt-3 !text-[clamp(2rem,4.5vw,3.5rem)]">{svc.title}</h1>
                {svc.shortDescription && <p className="mt-4 text-lg leading-relaxed text-ink-soft">{stripTags(svc.shortDescription)}</p>}
                {svc.duration && <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm text-plum-800"><Clock className="size-4" />{svc.duration}</p>}
              </div>
            </div>
            <aside className="lg:sticky lg:top-28">
              <PriceBox title={svc.title} options={options} price={num(svc.price)} offerPrice={num(svc.offerPrice)} label={svc.priceLabel && !/d/.test(svc.priceLabel) ? svc.priceLabel : null} duration={svc.duration} />
              {options.some((o) => o.name && variantLinks && svc.variants.find((v) => v.name === o.name)?.linkedServiceId) && (
                <p className="mt-4 hidden text-sm text-ink-soft lg:block">More detail: {svc.variants.filter((v) => v.linkedServiceId && variantLinks[v.linkedServiceId]).map((v, i) => <span key={v.id}>{i > 0 && " · "}<Link className="text-rose-700 underline underline-offset-4" href={urls.service(variantLinks[v.linkedServiceId!]!)}>{v.name} page</Link></span>)}</p>
              )}
            </aside>
          </div>
        </Container>
      </section>

      <Section className="py-12">
        <Container className="max-w-4xl">
          <div className="space-y-12">
            <Included items={features} />
            {svc.description && <div><h2 className="mb-2 !text-2xl sm:!text-3xl">About this service</h2><Html html={svc.description} /></div>}
            {PRODUCT_CATS.has(svc.category.slug) && <ProductsUsed />}
          </div>
        </Container>
      </Section>

      <ProcessSteps />

      {artists.length > 0 && (
        <Section>
          <Container>
            <SectionHeading eyebrow="Your artists" title={`Artists who offer ${svc.title}`} />
            <Carousel dots label="Artists" itemClassName="basis-[72%] sm:basis-1/3 lg:basis-1/4">
              {artists.map((a) => <ArtistCard key={a.slug} a={{ slug: a.slug, name: a.name, photo: realImage(keys, a.photo), specialization: a.specialization, years: a.experienceYears, city: a.city, linked: a.linked, kind: a.providerType === "MAKEOVER_ARTIST" ? "Makeup artist" : "Beautician" }} />)}
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
                <Card key={t.id} className="p-6"><p aria-label={`${t.rating} out of 5`} className="text-gold-500">{"★".repeat(t.rating)}</p><p className="mt-3 leading-relaxed text-ink-soft">&ldquo;{t.review}&rdquo;</p><p className="mt-4 text-sm font-medium text-plum-800">{t.name}{t.location ? `, ${t.location}` : ""}</p></Card>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {faqs.length > 0 && <Section><Container className="max-w-3xl"><SectionHeading eyebrow="FAQ" title="Frequently asked questions" /><FaqList faqs={faqs} /></Container></Section>}

      {serviceCities.length > 0 && (
        <Section tone="blush"><Container><SectionHeading title={`${svc.title} near you`} /><div className="flex flex-wrap gap-3">{serviceCities.map((c) => <Link key={c.slug} href={urls.serviceCity(slug, c.slug)} className="rounded-full border border-plum-700/20 bg-white px-5 py-2.5 text-sm text-plum-800 hover:bg-blush-100">{svc.title} in {c.name}</Link>)}</div></Container></Section>
      )}

      {related.length > 0 && (
        <Section>
          <Container>
            <SectionHeading eyebrow="You may also like" title={`More in ${svc.category.name}`} />
            <Carousel dots label="Related services" itemClassName="basis-[82%] sm:basis-1/2 lg:basis-1/3">
              {relatedCards.map((r) => <ServiceCard key={r.id} s={{ ...r, category: null }} />)}
            </Carousel>
            {blogs.length > 0 && <div className="mt-10"><h3 className="mb-3">Related guides</h3><ul className="space-y-2">{blogs.map((b) => <li key={b.slug}><Link className="text-rose-700 underline underline-offset-4" href={urls.blog(b.slug)}>{b.title}</Link></li>)}</ul></div>}
          </Container>
        </Section>
      )}

      <section className="section-dark relative overflow-hidden py-16 sm:py-20">
        <Container className="relative grid items-center gap-10 lg:grid-cols-2">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Book now</p><h2 className="mt-3 text-ivory">Ready for {svc.title}?</h2><div className="gold-rule my-5 w-24" /><p className="max-w-md text-lg text-blush-100">Four quick steps. We confirm your artist and the price before anything is final.</p></div>
          <BookingForm cities={cities} sourcePath={path} service={{ slug: svc.slug, title: svc.title, variants: svc.variants.map((v) => ({ name: v.name, price: num(v.offerPrice ?? v.price) })), addons: svc.addons.map((a) => ({ name: a.name, price: num(a.price) })) }} />
        </Container>
      </section>
    </div>
  );
}
