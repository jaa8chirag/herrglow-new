import type { Metadata } from "next";
import { Suspense } from "react";
import { GridSkeleton } from "@/components/GridSkeleton";
import { getAllServicesForExplorer } from "@herrglow/core";
import { Container, Section } from "@herrglow/ui";
import { PageHero } from "@/components/page/PageHero";
import { ServiceExplorer } from "@/components/services/ServiceExplorer";
import { getCategories, getLiveCities, getMediaKeys } from "@/lib/data";
import { realImage } from "@/lib/media";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "All Services: Makeup, Salon, Facial, Nails & More at Home",
  description: "Browse every HerrGlow service: bridal and party makeup, salon, facials, nails, hair, mehndi and pre-bridal packages at your home.",
  path: "/services",
});

const num = (v: unknown) => (v == null ? null : Number(v));

async function ServicesGrid() {
  const [cats, all, keys, cities] = await Promise.all([
    getCategories(),
    getAllServicesForExplorer(),
    getMediaKeys(),
    getLiveCities(),
  ]);
  const items = all.map((s) => {
    const prices = [s.offerPrice ?? s.price, ...s.variants.map((v) => v.offerPrice ?? v.price)].map((n) => (n == null ? NaN : Number(n))).filter((n) => n > 0);
    return {
      slug: s.slug,
      title: s.title,
      short: s.shortDescription,
      category: s.category.name,
      categorySlug: s.category.slug,
      image: realImage(keys, s.image),
      alt: s.imageAlt || s.title,
      price: prices.length ? Math.min(...prices) : num(s.price),
      offerPrice: null,
      from: s.variants.length > 1 || s.priceLabel === "Starting at",
      duration: s.duration,
      popular: s.leadCount >= 5,
      isPackage: s.isPackage,
      variants: s.variants.map((v) => ({ name: v.name, price: num(v.offerPrice ?? v.price) })),
    };
  });
  return (
    <Section className="pt-6">
      <Container>
        <ServiceExplorer
          items={items}
          categories={cats.map((c) => ({ slug: c.slug, name: c.name }))}
          cities={cities.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </Container>
    </Section>
  );
}

export default function ServicesIndex() {
  return (
    <>
      <PageHero crumbs={[{ name: "Services", path: "/services" }]} eyebrow="Services" title="Everything we offer, at your home" intro="Bridal and party makeup, salon, facials, nails, hair, mehndi and packages. Filter by category or search by name." />
      <Suspense fallback={<GridSkeleton />}><ServicesGrid /></Suspense>
    </>
  );
}
