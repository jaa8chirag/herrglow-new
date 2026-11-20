import { Check } from "lucide-react";
import Link from "next/link";
import { Card, Container, Price, Section, SectionHeading } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { PageHero } from "@/components/page/PageHero";
import { FaqList, ServiceCard } from "@/components/parts";
import { Photo } from "@/components/Photo";
import { JsonLd, faqLd } from "@/lib/seo/jsonld";

type Svc = Parameters<typeof ServiceCard>[0]["s"] & { id: string };
export interface CategoryViewProps {
  path: string; slug: string; name: string; h1: string; intro?: string;
  heroImage: string | null; services: Svc[]; cities: { slug: string; name: string }[];
  packages: { slug: string; title: string; image: string | null; price: number | null; offerPrice: number | null; short: string | null }[];
  priceRange: { min: number; max: number } | null;
}

export function CategoryView({ path, slug, name, h1, intro, heroImage, services, cities, packages, priceRange }: CategoryViewProps) {
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
  // FAQs are built from real data only (prices and areas), and are visible on the page
  const faqs = [
    ...(priceRange ? [{ question: `How much does ${name.toLowerCase()} at home cost?`, answer: `Prices start from ${fmt(priceRange.min)}${priceRange.max > priceRange.min ? ` and go up to ${fmt(priceRange.max)}` : ""}, depending on the service and option you choose. The final price is confirmed before your booking.` }] : []),
    { question: `Do the artists come to my home?`, answer: "Yes. All services are provided at your home or venue in the areas we cover." },
    ...(cities.length ? [{ question: `Where is ${name.toLowerCase()} available?`, answer: `We currently serve ${cities.map((c) => c.name).join(", ")}. Enter your area while booking to confirm coverage.` }] : []),
  ];
  return (
    <>
      <JsonLd data={faqLd(faqs)!} />
      <PageHero crumbs={[{ name, path }]} eyebrow="Services" title={h1} intro={intro} image={{ src: heroImage, alt: `${name} at home`, kind: slug, seedKey: slug }} />
      <Section className="pt-8">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{services.map((s) => <ServiceCard key={s.id} s={s} />)}</div>
        </Container>
      </Section>

      {packages.length > 0 && (
        <Section tone="blush">
          <Container>
            <SectionHeading eyebrow="Related packages" title="Save with a package" />
            <div className="grid gap-5 md:grid-cols-3">
              {packages.map((p) => (
                <Link key={p.slug} href={`/services/${p.slug}`} className="group block">
                  <Card className="flex h-full flex-col overflow-hidden transition-transform group-hover:-translate-y-1">
                    <div className="relative aspect-[16/10]"><Photo src={p.image} alt={p.title} kind="package" seedKey={p.slug} sizes="33vw" /></div>
                    <div className="flex flex-1 flex-col p-5"><h3 className="group-hover:text-rose-700">{p.title}</h3>{p.short && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{p.short}</p>}<div className="mt-auto flex items-center justify-between pt-4"><Price price={p.price} offerPrice={p.offerPrice} /><span className="flex items-center gap-1 text-sm text-rose-700"><Check className="size-4" />View</span></div></div>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section><Container className="max-w-3xl"><SectionHeading eyebrow="FAQ" title={`${name}: your questions`} /><FaqList faqs={faqs} /></Container></Section>

      <section className="section-dark py-16 sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Book now</p><h2 className="mt-3 text-ivory">Enquire about {name.toLowerCase()}</h2><div className="gold-rule my-5 w-24" /><p className="max-w-md text-lg text-blush-100">Tell us what you need and where. We confirm an artist near you.</p></div>
          <BookingForm cities={cities} sourcePath={path} enquiry heading={`Book ${name.toLowerCase()}`} />
        </Container>
      </section>
    </>
  );
}
