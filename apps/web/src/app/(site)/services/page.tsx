import Link from "next/link";
import type { Metadata } from "next";
import { getCategoryPage } from "@/lib/data";
import { getCategories } from "@/lib/data";
import { Container, Section, SectionHeading } from "@herrglow/ui";
import { Breadcrumbs, ServiceCard } from "@/components/parts";
import { CATEGORY_COPY } from "@/lib/copy";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: "All Services: Makeup, Salon, Facial, Nails & More at Home",
  description: "Browse every HerrGlow service: bridal and party makeup, salon, facials, nails, hair, mehndi and pre-bridal packages at your home.",
  path: "/services",
});

export default async function ServicesIndex() {
  const cats = await getCategories();
  const full = await Promise.all(cats.map((c) => getCategoryPage(c.slug)));
  return (
    <Section>
      <Container>
        <Breadcrumbs items={[{ name: "Services", path: "/services" }]} />
        <SectionHeading as="h1" eyebrow="Services" title="Everything we offer, at your home" intro="Pick a category to compare options and prices." />
        <div className="space-y-14">
          {full.filter((c) => !!c).map((c) => (
            <div key={c!.slug}>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-2xl"><Link className="hover:text-rose-700" href={`/${c!.slug}`}>{CATEGORY_COPY[c!.slug]?.h1 ?? c!.name}</Link></h2>
                <Link className="text-sm text-rose-700 underline underline-offset-4" href={`/${c!.slug}`}>View all {c!.name.toLowerCase()}</Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{c!.services.slice(0, 6).map((s) => <ServiceCard key={s.id} s={s} />)}</div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
