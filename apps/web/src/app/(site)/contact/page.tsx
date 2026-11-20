import type { Metadata } from "next";
import { Container, Section, SectionHeading } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { Breadcrumbs } from "@/components/parts";
import { getLiveCities, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";
import { telLink, whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = buildMetadata({
  title: "Contact HerrGlow",
  description: "Get in touch to book a makeup artist or beautician at home in Delhi, Noida or Greater Noida. Send an enquiry and we will get back to you.",
  path: "/contact",
});

export default async function ContactPage() {
  const [cities, s] = await Promise.all([getLiveCities(), getSettings()]);
  const wa = whatsappLink(s.whatsappNumber), tel = telLink(s.contactPhone);
  return (
    <Section>
      <Container>
        <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} />
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading as="h1" eyebrow="Contact" title="Let us plan your look" intro="Tell us what you need and where. We will confirm availability in your area." />
            <ul className="space-y-3 text-ink-soft">
              {s.contactEmail && <li>Email: <a className="text-rose-700 underline" href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></li>}
              {wa && <li>WhatsApp: <a className="text-rose-700 underline" href={wa}>Message us</a></li>}
              {tel && <li>Phone: <a className="text-rose-700 underline" href={tel}>Call us</a></li>}
              <li>We serve {cities.map((c) => c.name).join(", ")}.</li>
            </ul>
          </div>
          <BookingForm cities={cities} sourcePath="/contact" enquiry />
        </div>
      </Container>
    </Section>
  );
}
