import { ArrowRight, MapPin, ShieldCheck, Sparkles, Star, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { Rise, GradientText, buttonStyles, cn } from "@herrglow/ui";
import { BookLink } from "@/components/chrome/BookLink";
import { HeroCarousel } from "./HeroCarousel";

interface HeroProps {
  cityNames: string[];
  stats: { artists: number; cities: number };
  reviews: { avg: number | null; count: number };
  /** up to 3 REAL image URLs (gallery / services) */
  images?: { src: string; alt: string }[];
}

  export function HeroSection({ cityNames, stats, reviews }: HeroProps) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-blush-100 via-blush-50 to-ivory pt-28 sm:pt-32">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-gold-300/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-32 top-1/2 size-[28rem] rounded-full bg-rose-600/10 blur-3xl" />
        <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24">
          <div>
            <Rise>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/50 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-plum-800 backdrop-blur">
                <Sparkles className="size-3.5 text-gold-500" /> Makeup &amp; salon, at your home
              </span>
            </Rise>
            <Rise delay={0.05} soft>
              <h1 className="mt-6">Look and feel your best, <GradientText>without leaving home.</GradientText></h1>
            </Rise>
            <Rise delay={0.12}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
                Verified makeup artists and beauticians for bridal, party and everyday glam across {cityNames.length ? cityNames.join(", ") : "Delhi NCR"}. Clear prices. Your schedule.
              </p>
            </Rise>
            <Rise delay={0.18} className="mt-9 flex flex-wrap gap-3">
              <BookLink className="min-h-13 px-9 text-base" label="Book Now" />
              <Link href="/services" className={cn(buttonStyles({ variant: "outline", size: "lg" }), "bg-white/60 backdrop-blur")}>View Services <ArrowRight className="size-4" /></Link>
            </Rise>
            <Rise delay={0.22} className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-medium text-emerald-800">
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-emerald-600" /> 100% Female Verified Artists</span>
              <span className="flex items-center gap-1.5"><Wallet className="size-4 text-emerald-600" /> Pay After Service</span>
              <span className="flex items-center gap-1.5"><Sparkles className="size-4 text-emerald-600" /> Zero Hidden Travel Fees</span>
            </Rise>
            <Rise delay={0.26} className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-ink-soft">
              {reviews.avg != null && reviews.count > 0 && <span className="flex items-center gap-2"><Star className="size-4 fill-gold-400 text-gold-400" /><strong className="text-plum-800">{reviews.avg.toFixed(1)}</strong> from {reviews.count} customer reviews</span>}
              <span className="flex items-center gap-2"><Users className="size-4 text-rose-600" /><strong className="text-plum-800">{stats.artists}</strong> verified female artists</span>
              <span className="flex items-center gap-2"><MapPin className="size-4 text-rose-600" /><strong className="text-plum-800">{stats.cities}</strong> cities</span>
            </Rise>
          </div>

            {/* Dynamic Beauty Carousel showcasing real bridal, party & salon transformations */}
            <Rise delay={0.1} className="w-full">
              <HeroCarousel />
            </Rise>
        </div>
      </section>
    );
  }
