import type { Metadata } from "next";
import { BentoGrid, Badge, BlurFade, BorderBeam, Button, ButtonLink, Card, Carousel, Container, FallbackArt, GradientText, InfiniteMovingCards, Marquee, NumberTicker, Price, Section, SectionHeading, Spotlight, TiltCard } from "@herrglow/ui";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

const swatches = [["ivory", "bg-ivory border border-line"], ["blush-100", "bg-blush-100"], ["rose-600", "bg-rose-600"], ["plum-700", "bg-plum-700"], ["gold-400", "bg-gold-400"], ["ink", "bg-ink"]];
const kinds = ["makeup", "salon-at-home", "facial-skincare", "nails", "hair", "mehndi", "pre-bridal", "artist"];

export default function DesignPage() {
  return (
    <main>
      <Section>
        <Container>
          <SectionHeading as="h1" eyebrow="Design system" title={<>Glow, <GradientText>made at home.</GradientText></>} intro="Ivory and blush base, deep plum primary, rose accent, gold only as a highlight. Fraunces for headings, Inter for body." />
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="#" variant="shimmer" size="lg">Book now</ButtonLink>
            <Button variant="accent">Accent</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="gold">Gold</Button>
            <ButtonLink href="#" variant="whatsapp">WhatsApp</ButtonLink>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6">{swatches.map(([n, c]) => <div key={n}><div className={`h-16 rounded-2xl ${c}`} /><p className="mt-2 text-xs text-ink-soft">{n}</p></div>)}</div>
        </Container>
      </Section>

      <Section tone="blush">
        <Container>
          <SectionHeading eyebrow="Marquee" title="Products our artists work with" />
          <Marquee duration={30}>{["MAC", "Huda Beauty", "Kryolan", "Estée Lauder", "Lakmé", "Bobbi Brown"].map((b) => <span key={b} className="px-6 font-serif text-3xl text-plum-700/70">{b}</span>)}</Marquee>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow="Fallback art" title="Designed placeholders, never a bare text box" />
          <div className="grid grid-cols-4 gap-3 md:grid-cols-8">{kinds.map((k, i) => <div key={k} className="relative aspect-square overflow-hidden rounded-[1.5rem]"><FallbackArt kind={k} seed={i} /></div>)}</div>
        </Container>
      </Section>

      <Section className="section-dark relative overflow-hidden">
        <Spotlight />
        <Container className="relative">
          <SectionHeading eyebrow="Numbers" title="Number ticker, 3D tilt, border beam" />
          <div className="grid gap-6 sm:grid-cols-3">
            {[[32, "Artists"], [70, "Services"], [125, "Areas covered"]].map(([n, l]) => (
              <div key={l as string}><p className="font-serif text-6xl text-gold-300"><NumberTicker value={n as number} suffix="+" /></p><p className="mt-1 text-blush-100">{l}</p></div>
            ))}
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <TiltCard><Card className="relative h-56 p-6"><BorderBeam /><h3>3D tilt + border beam</h3><p className="mt-2 text-ink-soft">Hover with a mouse.</p></Card></TiltCard>
            <Card className="p-6"><Badge tone="gold">Most popular</Badge><h3 className="mt-3">HD Bridal Makeup</h3><div className="mt-3"><Price price={19999} offerPrice={17999} /></div></Card>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow="Embla" title="Carousel with autoplay" />
          <Carousel autoplay dots>
            {kinds.map((k, i) => <div key={k} className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]"><FallbackArt kind={k} seed={i} /></div>)}
          </Carousel>
          <h3 className="mb-4 mt-14">Bento grid</h3>
          <BentoGrid>
            {[["col-span-2 row-span-2", "makeup"], ["", "hair"], ["", "nails"], ["col-span-2", "salon-at-home"]].map(([c, k], i) => <BlurFade key={i} delay={i * 0.07} className={`relative overflow-hidden rounded-[1.5rem] ${c}`}><FallbackArt kind={k} seed={i} /></BlurFade>)}
          </BentoGrid>
          <h3 className="mb-4 mt-14">Infinite moving cards</h3>
          <InfiniteMovingCards>{["Lovely, on time and professional", "The best bridal look I could ask for", "So convenient, at home"].map((t) => <Card key={t} className="w-72 shrink-0 p-6"><p className="text-gold-500">★★★★★</p><p className="mt-2 text-ink-soft">{t}</p></Card>)}</InfiniteMovingCards>
        </Container>
      </Section>
    </main>
  );
}
