import type { Metadata } from "next";
import { Badge, Button, ButtonLink, Card, Container, LiftCard, Price, Reveal, RevealItem, RevealList, Section, SectionHeading } from "@herrglow/ui";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

const swatches = [
  ["ivory", "bg-ivory border border-line"], ["blush-100", "bg-blush-100"], ["blush-300", "bg-blush-300"],
  ["rose-600", "bg-rose-600"], ["plum-700", "bg-plum-700"], ["plum-900", "bg-plum-900"], ["gold-400", "bg-gold-400"], ["ink", "bg-ink"],
];

export default function DesignPage() {
  return (
    <main>
      <Section>
        <Container>
          <SectionHeading as="h1" eyebrow="Design system" title="Glow, made at home." intro="Ivory and blush base, deep plum accent, gold only as a highlight. Fraunces for headings, Inter for body." />
          <div className="flex flex-wrap gap-3">
            <Button>Book now</Button>
            <Button variant="accent">Check availability</Button>
            <Button variant="outline">View services</Button>
            <Button variant="ghost">Learn more</Button>
            <ButtonLink href="#" variant="whatsapp">WhatsApp</ButtonLink>
          </div>
        </Container>
      </Section>

      <Section tone="blush">
        <Container>
          <SectionHeading eyebrow="Palette" title="Colour tokens" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {swatches.map(([n, c]) => (
              <div key={n}><div className={`h-20 rounded-2xl ${c}`} /><p className="mt-2 text-sm text-ink-soft">{n}</p></div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow="Cards and motion" title="Reveal on scroll, lift on hover" align="center" />
          <RevealList className="grid gap-6 sm:grid-cols-3">
            {["HD Bridal Makeup", "Facial at Home", "Nail Extensions"].map((t, i) => (
              <RevealItem key={t}>
                <LiftCard>
                  <Card className="p-6">
                    <Badge tone={i === 0 ? "gold" : "blush"}>{i === 0 ? "Most booked" : "At home"}</Badge>
                    <h3 className="mt-4">{t}</h3>
                    <p className="mt-2 text-ink-soft">Professional artists, premium products, at your doorstep.</p>
                    <div className="mt-4"><Price price={i === 0 ? 19999 : 1499} offerPrice={i === 0 ? 17999 : 1199} /></div>
                  </Card>
                </LiftCard>
              </RevealItem>
            ))}
          </RevealList>
        </Container>
      </Section>

      <Section tone="deep">
        <Container>
          <Reveal><SectionHeading eyebrow="Dark band" title="Trusted by brides across Delhi NCR" intro="Real artists. Real reviews." /></Reveal>
        </Container>
      </Section>
    </main>
  );
}
