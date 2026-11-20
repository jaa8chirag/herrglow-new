import type { Metadata } from "next";
import { Container, Section, SectionHeading } from "@herrglow/ui";
import { ApplyForm } from "@/components/ApplyForm";
import { Breadcrumbs } from "@/components/parts";
import { getCategories, getLiveCities } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: "Join HerrGlow as a Beautician or Makeup Artist",
  description: "Are you a professional beautician or makeup artist in Delhi NCR? Apply to join HerrGlow and receive booking requests from customers near you.",
  path: "/join-as-beautician",
});

const POINTS = [
  ["Customers come to you", "Booking requests from people in the areas you choose to serve."],
  ["Your own profile", "A public page with your work, services and the areas you cover."],
  ["Your schedule", "Accept the bookings that suit you. We handle the enquiries."],
];

export default async function JoinPage() {
  const [categories, cities] = await Promise.all([getCategories(), getLiveCities()]);
  return (
    <Section>
      <Container>
        <Breadcrumbs items={[{ name: "Join as an artist", path: "/join-as-beautician" }]} />
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHeading as="h1" eyebrow="Careers" title="Grow your beauty business with HerrGlow" intro="We are looking for skilled, reliable beauticians and makeup artists across Delhi NCR." />
            <ul className="space-y-5">{POINTS.map(([t, d]) => <li key={t} className="flex gap-3"><span aria-hidden className="mt-1 text-gold-500">✦</span><div><h2 className="!text-lg">{t}</h2><p className="text-ink-soft">{d}</p></div></li>)}</ul>
          </div>
          <ApplyForm categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} cities={cities} />
        </div>
      </Container>
    </Section>
  );
}
