import { Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findPage, getPackagePage, urls } from "@herrglow/core";
import { Container, Price, Section, buttonStyles, cn } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { PageHero } from "@/components/page/PageHero";
import { Html, stripTags } from "@/components/parts";
import { getLiveCities, getMediaKeys } from "@/lib/data";
import { realImage } from "@/lib/media";
import { JsonLd, serviceLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(props: PageProps<"/packages/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getPackagePage(slug);
  if (!p) return {};
  const page = await findPage(urls.package(slug));
  const keys = await getMediaKeys();
  return buildMetadata({
    title: `${p.title} at Home`, description: stripTags(p.shortDescription) || `${p.title}: everything included in one booking, at your home.`,
    path: urls.package(slug), image: realImage(keys, p.image), indexable: page?.isIndexable ?? false,
  });
}

export default async function PackagePage(props: PageProps<"/packages/[slug]">) {
  const { slug } = await props.params;
  const [p, cities, keys] = await Promise.all([getPackagePage(slug), getLiveCities(), getMediaKeys()]);
  if (!p) notFound();
  const path = urls.package(slug);
  const price = p.offerPrice ?? p.price;
  return (
    <>
      <JsonLd data={serviceLd({ name: p.title, description: stripTags(p.shortDescription) || stripTags(p.description).slice(0, 300), path, image: realImage(keys, p.image), category: "Package", price: price == null ? null : Number(price) })} />
      <PageHero crumbs={[{ name: "Packages", path: "/packages" }, { name: p.title, path }]} eyebrow="Package" title={p.title} intro={stripTags(p.shortDescription)} image={{ src: realImage(keys, p.image), alt: p.title, kind: "package", seedKey: p.slug }}>
        <div className="flex flex-wrap items-center gap-5"><Price price={p.price == null ? null : Number(p.price)} offerPrice={p.offerPrice == null ? null : Number(p.offerPrice)} className="text-xl" /><Link href="#book" className={cn(buttonStyles({ variant: "shimmer", size: "lg" }))}>Book this package</Link></div>
      </PageHero>
      <Section className="py-12">
        <Container className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-10">
            {p.services.length > 0 && (
              <div><h2 className="mb-4 !text-2xl sm:!text-3xl">What is included</h2>
                <ul className="grid gap-3 sm:grid-cols-2">{p.services.map((x) => <li key={x.service.slug}><Link href={urls.service(x.service.slug)} className="flex items-center gap-3 rounded-2xl border border-line bg-white/80 p-4 text-plum-800 hover:bg-blush-50"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check className="size-3.5" /></span>{x.service.title}</Link></li>)}</ul></div>
            )}
            {p.description && <div><h2 className="mb-2 !text-2xl sm:!text-3xl">About this package</h2><Html html={p.description} /></div>}
          </div>
        </Container>
      </Section>
      <section className="section-dark py-16 sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Book now</p><h2 className="mt-3 text-ivory">Book {p.title}</h2><div className="gold-rule my-5 w-24" /><p className="max-w-md text-lg text-blush-100">We confirm your artist team and the price before anything is final.</p></div>
          <BookingForm
            cities={cities}
            sourcePath={path}
            packageItem={{ slug: p.slug, title: p.title, price: Number(p.offerPrice ?? p.price) }}
            heading={`Book ${p.title}`}
          />
        </Container>
      </section>
    </>
  );
}
