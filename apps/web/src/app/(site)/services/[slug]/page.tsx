import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { asFaqs, findPage, getRelatedBlogs, urls } from "@herrglow/core";
import { Badge, Card, Container, Price, Section, SectionHeading } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { Breadcrumbs, FaqList, Html, ServiceCard, stripTags } from "@/components/parts";
import { getLiveCities, getServicePage } from "@/lib/data";
import { JsonLd, faqLd, serviceLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { mediaUrl } from "@/lib/media";

export const revalidate = 600;

export async function generateMetadata(props: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const data = await getServicePage(slug);
  if (!data) return {};
  const { svc } = data;
  const page = await findPage(urls.service(slug));
  const price = svc.offerPrice ?? svc.price;
  return buildMetadata({
    title: svc.seoTitle || `${svc.title} at Home`,
    description: svc.seoDescription || stripTags(svc.shortDescription) || `Book ${svc.title} at home${price ? ` from ₹${Math.round(Number(price)).toLocaleString("en-IN")}` : ""}. Verified artists, doorstep service.`,
    path: urls.service(slug),
    image: mediaUrl(svc.image),
    indexable: page?.isIndexable ?? false,
  });
}

export default async function ServicePage(props: PageProps<"/services/[slug]">) {
  const { slug } = await props.params;
  const [data, cities] = await Promise.all([getServicePage(slug), getLiveCities()]);
  if (!data) notFound();
  const { svc, related, serviceCities, variantLinks } = data;
  const faqs = asFaqs(svc.faqs);
  const path = urls.service(slug);
  const blogs = await getRelatedBlogs(`${svc.title} ${svc.category.name}`, null, 3);
  const features = (svc.features ?? "").split(/\r?\n|;|•/).map((f) => f.trim()).filter(Boolean);
  const nowPrice = svc.offerPrice ?? svc.price;

  return (
    <>
      <JsonLd data={serviceLd({ name: svc.title, description: stripTags(svc.shortDescription) || stripTags(svc.description).slice(0, 300), path, image: mediaUrl(svc.image), category: svc.category.name, price: nowPrice == null ? null : Number(nowPrice), areaServed: cities.map((c) => c.name) })} />
      {faqLd(faqs) && <JsonLd data={faqLd(faqs)!} />}
      <Section className="pb-6">
        <Container>
          <Breadcrumbs items={[{ name: svc.category.name, path: urls.category(svc.category.slug) }, { name: svc.title, path }]} />
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <Badge>{svc.category.name}</Badge>
              <h1 className="mt-4">{svc.title}</h1>
              {svc.shortDescription && <p className="mt-4 text-lg leading-relaxed text-ink-soft">{stripTags(svc.shortDescription)}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Price price={svc.price == null ? null : Number(svc.price)} offerPrice={svc.offerPrice == null ? null : Number(svc.offerPrice)} label={svc.priceLabel} className="text-xl" />
                {svc.duration && <span className="text-sm text-ink-soft">Duration: {svc.duration}</span>}
              </div>

              {svc.variants.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl">Options and prices</h2>
                  <div className="mt-4 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white/80">
                    {svc.variants.map((v) => (
                      <div key={v.id} className="flex items-center justify-between gap-4 p-4">
                        <span className="font-medium text-plum-900">
                          {v.linkedServiceId && variantLinks[v.linkedServiceId] ? <Link className="underline decoration-gold-400 underline-offset-4 hover:text-rose-700" href={urls.service(variantLinks[v.linkedServiceId]!)}>{v.name}</Link> : v.name}
                          {v.duration && <span className="ml-2 text-xs font-normal text-ink-soft">{v.duration}</span>}
                        </span>
                        <Price price={v.price == null ? null : Number(v.price)} offerPrice={v.offerPrice == null ? null : Number(v.offerPrice)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {features.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl">What is included</h2>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {features.map((f) => <li key={f} className="flex gap-2 text-ink-soft"><span aria-hidden className="text-gold-500">✦</span>{f}</li>)}
                  </ul>
                </div>
              )}

              {svc.description && <Html html={svc.description} className="mt-8" />}
            </div>
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <BookingForm cities={cities} sourcePath={path} service={{ slug: svc.slug, title: svc.title, variants: svc.variants.map((v) => ({ name: v.name, price: Number(v.offerPrice ?? v.price ?? 0) || null })), addons: svc.addons.map((a) => ({ name: a.name, price: a.price == null ? null : Number(a.price) })) }} />
            </aside>
          </div>
        </Container>
      </Section>

      {faqs.length > 0 && (
        <Section className="pt-6">
          <Container className="max-w-3xl"><SectionHeading title="Frequently asked questions" /><FaqList faqs={faqs} /></Container>
        </Section>
      )}

      {serviceCities.length > 0 && (
        <Section tone="blush">
          <Container>
            <SectionHeading title={`${svc.title} near you`} />
            <div className="flex flex-wrap gap-3">{serviceCities.map((c) => <Link key={c.slug} href={urls.serviceCity(slug, c.slug)} className="rounded-full border border-plum-700/20 bg-white px-5 py-2.5 text-sm text-plum-800 hover:bg-blush-100">{svc.title} in {c.name}</Link>)}</div>
          </Container>
        </Section>
      )}

      {related.length > 0 && (
        <Section>
          <Container>
            <SectionHeading title={`More in ${svc.category.name}`} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((r) => <ServiceCard key={r.id} s={r} />)}</div>
            {blogs.length > 0 && (
              <div className="mt-10"><h3 className="mb-3">Related guides</h3><ul className="space-y-2">{blogs.map((b) => <li key={b.slug}><Link className="text-rose-700 underline underline-offset-4" href={urls.blog(b.slug)}>{b.title}</Link></li>)}</ul></div>
            )}
          </Container>
        </Section>
      )}
    </>
  );
}
