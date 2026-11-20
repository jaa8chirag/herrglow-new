import type { Metadata } from "next";
import { Container, Section, SectionHeading } from "@herrglow/ui";
import { Breadcrumbs } from "@/components/parts";
import { getLiveCities } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About HerrGlow",
  description: "HerrGlow connects you with verified makeup artists and beauticians who work at your home in Delhi NCR. Learn how we choose and support our artists.",
  path: "/about",
});

export default async function AboutPage() {
  const cities = await getLiveCities();
  return (
    <Section>
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ name: "About", path: "/about" }]} />
        <SectionHeading as="h1" eyebrow="About us" title="Beauty that comes to you" />
        <div className="prose-herr">
          <p>HerrGlow connects customers with independent makeup artists and beauticians who work at your home or venue. You choose a service, share where you are, and we match you with an artist who covers your area.</p>
          <h2>How we work with artists</h2>
          <p>Every artist on HerrGlow has a profile with their specialisations, experience and the areas they cover. We list only the areas an artist actually serves, so what you book is what you get.</p>
          <h2>Where we are</h2>
          <p>{cities.length ? `We currently serve ${cities.map((c) => c.name).join(", ")}.` : "We are expanding across Delhi NCR."} If you are outside these areas, send us an enquiry and we will let you know when we arrive.</p>
        </div>
      </Container>
    </Section>
  );
}
