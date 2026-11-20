import { ArrowRight, MapPin, Sparkles, Star, Users } from "lucide-react";
import Link from "next/link";
import { BlurFade, FallbackArt, GradientText, buttonStyles, cn } from "@herrglow/ui";
import { BookLink } from "@/components/chrome/BookLink";
import { Photo } from "@/components/Photo";
import { HeroGlowLazy } from "@/components/hero/HeroGlowLazy";

interface HeroProps {
  cityNames: string[];
  stats: { artists: number; cities: number };
  reviews: { avg: number | null; count: number };
  /** up to 3 REAL image URLs (gallery / services). Missing slots use the designed fallback. */
  images: { src: string; alt: string }[];
}

const TILES: { kind: string; label: string; cls: string }[] = [
  { kind: "bridal", label: "Bridal", cls: "left-0 top-10 w-[58%] rotate-[-5deg]" },
  { kind: "makeup", label: "Party", cls: "right-0 top-0 w-[52%] rotate-[4deg]" },
  { kind: "hair", label: "Glow", cls: "bottom-0 left-[22%] w-[50%] rotate-[-1deg]" },
];

export function HeroSection({ cityNames, stats, reviews, images }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blush-100 via-blush-50 to-ivory pt-28 sm:pt-32">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-gold-300/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-32 top-1/2 size-[28rem] rounded-full bg-rose-600/10 blur-3xl" />
      <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24">
        <div>
          <BlurFade>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/50 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-plum-800 backdrop-blur">
              <Sparkles className="size-3.5 text-gold-500" /> Makeup &amp; salon, at your home
            </span>
          </BlurFade>
          <BlurFade delay={0.08}>
            <h1 className="mt-6">Look and feel your best, <GradientText>without leaving home.</GradientText></h1>
          </BlurFade>
          <BlurFade delay={0.16}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
              Verified makeup artists and beauticians for bridal, party and everyday glam across {cityNames.length ? cityNames.join(", ") : "Delhi NCR"}. Clear prices. Your schedule.
            </p>
          </BlurFade>
          <BlurFade delay={0.24} className="mt-9 flex flex-wrap gap-3">
            <BookLink className="min-h-13 px-9 text-base" label="Book Now" />
            <Link href="/services" className={cn(buttonStyles({ variant: "outline", size: "lg" }), "bg-white/60 backdrop-blur")}>View Services <ArrowRight className="size-4" /></Link>
          </BlurFade>
          <BlurFade delay={0.32} className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-ink-soft">
            {reviews.avg != null && reviews.count > 0 && <span className="flex items-center gap-2"><Star className="size-4 fill-gold-400 text-gold-400" /><strong className="text-plum-800">{reviews.avg.toFixed(1)}</strong> from {reviews.count} customer reviews</span>}
            <span className="flex items-center gap-2"><Users className="size-4 text-rose-600" /><strong className="text-plum-800">{stats.artists}</strong> verified artists</span>
            <span className="flex items-center gap-2"><MapPin className="size-4 text-rose-600" /><strong className="text-plum-800">{stats.cities}</strong> cities</span>
          </BlurFade>
        </div>

        {/* overlapping image stack (real photos when they exist, designed fallbacks otherwise) + lazy 3D glow (desktop only) */}
        <BlurFade delay={0.2} className="relative mx-auto aspect-[5/6] w-full max-w-[34rem]">
          <HeroGlowLazy className="pointer-events-none absolute -inset-10 z-20" />
          {TILES.map((t, i) => {
            const img = images[i];
            return (
              <div key={t.kind} className={cn("group absolute aspect-[4/5] overflow-hidden rounded-[1.75rem] border-4 border-ivory shadow-lift", t.cls)} style={{ zIndex: i + 1 }}>
                {img ? <Photo src={img.src} alt={img.alt} priority={i === 0} sizes="(min-width: 1024px) 20vw, 50vw" /> : <FallbackArt kind={t.kind} seed={i + 1} />}
                <span className="absolute bottom-3 left-3 rounded-full bg-ivory/90 px-3 py-1 text-xs font-semibold text-plum-800 backdrop-blur">{t.label}</span>
              </div>
            );
          })}
        </BlurFade>
      </div>
    </section>
  );
}
