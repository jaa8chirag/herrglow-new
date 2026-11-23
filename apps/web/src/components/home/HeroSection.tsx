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
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/50 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-plum-900 backdrop-blur shadow-xs">
                <Sparkles className="size-3.5 text-gold-500" /> Delhi NCR&apos;s Most Trusted Doorstep Salon
              </span>
            </Rise>
            <Rise delay={0.05} soft>
              <h1 className="mt-5 font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-plum-950 leading-[1.12]">
                Salon Luxury &amp; Bridal Artistry, <GradientText>Delivered to Your Doorstep.</GradientText>
              </h1>
            </Rise>
            <Rise delay={0.12}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
                Experience five-star bridal glam and luxury salon pampering in the comfort and privacy of your home. 100% background-verified female beauticians, sanitized equipment &amp; authentic products, and transparent prices across {cityNames.length ? cityNames.join(", ") : "Delhi, Noida & Greater Noida"}.
              </p>
            </Rise>
            <Rise delay={0.18} className="mt-8 flex flex-col sm:flex-row gap-3.5">
              <BookLink className="min-h-12 w-full sm:w-auto px-8 text-sm sm:text-base font-semibold shadow-soft" label="Book Appointment" />
              <Link href="/services" className={cn(buttonStyles({ variant: "outline", size: "lg" }), "min-h-12 w-full sm:w-auto bg-white/70 backdrop-blur font-semibold")}>View 8 Categories &amp; Prices <ArrowRight className="size-4" /></Link>
            </Rise>
            <Rise delay={0.22} className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 text-xs font-semibold text-plum-900">
              <span className="flex items-center gap-1.5 rounded-lg bg-white/70 p-1.5 sm:p-0"><ShieldCheck className="size-4 text-emerald-600 shrink-0" /> 100% Female Verified</span>
              <span className="flex items-center gap-1.5 rounded-lg bg-white/70 p-1.5 sm:p-0"><Sparkles className="size-4 text-gold-600 shrink-0" /> 100% Authentic Products</span>
              <span className="flex items-center gap-1.5 rounded-lg bg-white/70 p-1.5 sm:p-0"><Wallet className="size-4 text-emerald-600 shrink-0" /> 10% Advance (100% Refund Guarantee)</span>
              <span className="flex items-center gap-1.5 rounded-lg bg-white/70 p-1.5 sm:p-0"><ShieldCheck className="size-4 text-plum-600 shrink-0" /> Zero Hidden Charges</span>
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
