import { Check, ClipboardCheck, Home, Sparkles, UserCheck } from "lucide-react";
import { BlurFade, Container, Section, SectionHeading } from "@herrglow/ui";
import { BRANDS } from "@/components/home/brands";

/** "What is included": checklist with icons (from the service's own feature lines). */
export function Included({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 className="mb-4 !text-2xl sm:!text-3xl">What is included</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((f) => <li key={f} className="flex items-start gap-3 rounded-2xl border border-line bg-white/80 p-4 text-ink-soft"><span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check className="size-3.5" /></span>{f}</li>)}
      </ul>
    </div>
  );
}

const STEPS = [
  { icon: ClipboardCheck, t: "You book", d: "Choose your option and share your area and date." },
  { icon: UserCheck, t: "We confirm", d: "We match an artist who covers your location and confirm the details." },
  { icon: Home, t: "Artist arrives", d: "They set up at your home with a clean, complete kit." },
  { icon: Sparkles, t: "You glow", d: "Enjoy the result, without travelling anywhere." },
];
export function ProcessSteps() {
  return (
    <Section tone="blush">
      <Container>
        <SectionHeading eyebrow="The process" title="How it works" />
        <ol className="grid gap-5 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <BlurFade delay={i * 0.08} className="h-full">
                <div className="h-full rounded-[1.5rem] border border-line bg-white/80 p-6"><span className="grid size-12 place-items-center rounded-full bg-plum-700 text-ivory"><s.icon className="size-5" strokeWidth={1.5} /></span><h3 className="mt-4">{i + 1}. {s.t}</h3><p className="mt-1.5 text-sm text-ink-soft">{s.d}</p></div>
              </BlurFade>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

/** Only for categories where products matter. Wordmarks only; see components/home/brands.ts (owner to confirm). */
export function ProductsUsed() {
  return (
    <div>
      <h2 className="mb-4 !text-2xl sm:!text-3xl">Products our artists work with</h2>
      <div className="flex flex-wrap gap-2">{BRANDS.slice(0, 6).map((b) => <span key={b} className="rounded-full border border-line bg-white px-4 py-2 font-serif text-lg text-plum-700/80">{b}</span>)}</div>
    </div>
  );
}
