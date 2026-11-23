import { Check, ClipboardCheck, Home, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { BlurFade, Container, Section, SectionHeading } from "@herrglow/ui";
import { BRANDS } from "@/components/home/brands";

/** "What's Included": clean, concise checklist with icons */
export function Included({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-3xl border border-line/80 bg-white p-6 sm:p-7 shadow-soft">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <ShieldCheck className="size-3.5 text-emerald-700" /> Transparency
          </span>
          <h2 className="mt-2 font-serif text-2xl font-bold text-plum-950">
            What&apos;s Included
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-ink-soft">
            100% genuine products, single-use disposables &amp; sanitized tools.
          </p>
        </div>
      </div>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {items.map((f, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-xl border border-line/50 bg-blush-50/40 px-3.5 py-3 transition-colors hover:bg-white hover:border-gold-300"
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-600 text-white shadow-xs">
              <Check className="size-3 stroke-[2.5]" />
            </span>
            <span className="text-sm font-medium text-plum-950 leading-snug">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const STEPS = [
  { icon: ClipboardCheck, t: "You book", d: "Choose your option and share your area and date." },
  { icon: UserCheck, t: "We confirm", d: "We match an artist who covers your location and confirm the details." },
  { icon: Home, t: "Artist arrives", d: "They arrive on time and set up clean, sanitized tools at home." },
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

/** Home Safety & Hygiene Promise for female clients */
export function SafetyHygienePromise() {
  const points = [
    {
      title: "100% Female Verified Professionals",
      desc: "Every beautician undergoes police background verification and practical skills testing before home visits.",
    },
    {
      title: "Clean & Sanitized Setup",
      desc: "Sanitized tools, clean towels, and careful hygiene standards maintained at your home.",
    },
    {
      title: "Sanitized Implements & Brushes",
      desc: "All metal tools and makeup brushes are sterilized and sanitized before every appointment.",
    },
    {
      title: "Authentic Luxury Brands",
      desc: "Zero diluted salon dupes. We use authentic branded products from MAC, Kryolan, Huda, Rica, and O3+.",
    },
  ];

  return (
    <div className="rounded-3xl border border-line bg-blush-50/70 p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-rose-600 text-white shadow-soft">
          <ShieldCheck className="size-6" />
        </span>
        <div>
          <h2 className="!text-xl sm:!text-2xl font-serif text-plum-900">Our Home Safety &amp; Hygiene Promise</h2>
          <p className="text-xs sm:text-sm text-ink-soft">Your safety, privacy, and hygiene at home are our top priorities.</p>
        </div>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        {points.map((p) => (
          <div key={p.title} className="rounded-2xl border border-line/70 bg-white p-4">
            <h4 className="text-sm font-semibold text-plum-900">{p.title}</h4>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** What our artist brings vs what the customer needs at home */
export function HomeSetupGuide() {
  return (
    <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
      <h2 className="mb-2 !text-xl sm:!text-2xl font-serif text-plum-900">What to Expect at Home</h2>
      <p className="mb-6 text-sm text-ink-soft">Zero stress preparation. Here is how we ensure a seamless salon experience in your living space:</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-600/20 bg-emerald-50/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">What Our Artist Brings</p>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-emerald-950">
            <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Complete professional product kit and sanitized tools</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Fresh disposable bedsheet, gown &amp; towels</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Professional ring light &amp; power extension board</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-700 font-bold">✓</span><span>Post-service cleanup and disposable waste bag</span></li>
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-blush-50/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-plum-800">What You Provide</p>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-ink-soft">
            <li className="flex items-start gap-2"><span>•</span><span>A normal comfortable chair near a mirror</span></li>
            <li className="flex items-start gap-2"><span>•</span><span>Access to a standard electrical power socket</span></li>
            <li className="flex items-start gap-2"><span>•</span><span>Clean running water (warm water for facials/pedicures)</span></li>
            <li className="flex items-start gap-2"><span>•</span><span>A well-lit, comfortable room for your privacy</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
