"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Heart, ArrowRight } from "lucide-react";
import { cn } from "@herrglow/ui";

export interface HeroSlide {
  id: string;
  src: string;
  alt: string;
  tag: string;
  tagIcon: "sparkles" | "shield" | "heart";
  title: string;
  subtitle: string;
  highlight: string;
  href: string;
  buttonText: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "bridal",
    src: "/hero/bridal-glam.jpg",
    alt: "Royal Indian bridal makeup with polki jewelry and golden radiant glow",
    tag: "Signature Bridal",
    tagIcon: "sparkles",
    title: "Heritage Bridal Glam",
    subtitle: "Calibrated for Indian undertones & 16-hr sweat-proof finish",
    highlight: "Zero Flashback Under Cameras",
    href: "/services/makeup",
    buttonText: "Explore Bridal",
  },
  {
    id: "party",
    src: "/hero/party-glam.jpg",
    alt: "Sangeet and cocktail party glam with bronze smoky eyes and glass skin",
    tag: "Cocktail & Sangeet",
    tagIcon: "heart",
    title: "Party & Reception Glam",
    subtitle: "Soft metallic lids, dewy glass-skin & voluminous Hollywood waves",
    highlight: "Featherweight & Non-Cakey",
    href: "/services",
    buttonText: "View Party Looks",
  },
  {
    id: "salon",
    src: "/hero/doorstep-salon.jpg",
    alt: "Female beautician providing salon treatments at client's home",
    tag: "At-Home Salon",
    tagIcon: "shield",
    title: "Doorstep Salon & Pampering",
    subtitle: "Premium salon pampering delivered directly to your living room",
    highlight: "100% Verified Female Beauticians",
    href: "/contact#book",
    buttonText: "Book At-Home Visit",
  },
];

export function HeroCarousel({ slides = DEFAULT_SLIDES }: { slides?: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduce = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = slides.length;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  // Auto-play timer (5 seconds), paused on hover or focus
  useEffect(() => {
    if (isPaused || reduce) return;
    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, isPaused, reduce]);

  const slide = slides[current] ?? slides[0];
  if (!slide) return null;

  return (
    <div
      className="relative mx-auto w-full max-w-[30rem] lg:max-w-[34rem]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Beauty Transformations"
    >
      {/* Outer ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-3.5 rounded-[2.25rem] bg-gradient-to-tr from-gold-300/25 via-rose-500/15 to-plum-700/20 blur-xl transition-all duration-700"
      />

      {/* Main card viewport */}
      <div className="relative aspect-[4/4.8] sm:aspect-[1/1.08] max-h-[540px] overflow-hidden rounded-[2.25rem] border-4 border-ivory/95 bg-plum-950 shadow-lift">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(min-width: 1024px) 25vw, 80vw"
              priority={true}
              quality={80}
              className="object-cover object-center"
            />

            {/* Gradient overlay for readability and luxury tone */}
            <div className="absolute inset-0 bg-gradient-to-t from-plum-950/90 via-plum-950/30 to-black/20" />

            {/* Top Badge */}
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-ivory/90 px-3 py-1 text-xs font-semibold text-plum-900 shadow-soft backdrop-blur-md">
              {slide.tagIcon === "sparkles" && <Sparkles className="size-3 text-gold-500" />}
              {slide.tagIcon === "shield" && <ShieldCheck className="size-3 text-emerald-600" />}
              {slide.tagIcon === "heart" && (
                <Heart className="size-3 text-rose-600 fill-rose-600" />
              )}
              <span>{slide.tag}</span>
            </div>

            {/* Highlight pill top-right */}
            <div className="absolute right-3 top-3 z-10 hidden sm:flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-0.5 text-[0.65rem] font-medium text-ivory backdrop-blur-md border border-white/10">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {slide.highlight}
            </div>

            {/* Bottom Content Card */}
            <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5 text-ivory">
              <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-gold-300">
                HerrGlow Signature
              </p>
              <h3 className="mt-1 text-xl sm:text-2xl font-serif text-ivory font-normal leading-tight">
                {slide.title}
              </h3>
              <p className="mt-1.5 text-xs text-blush-100/90 leading-relaxed max-w-xs line-clamp-2">
                {slide.subtitle}
              </p>

              <div className="mt-3 flex items-center gap-2.5">
                <Link
                  href={slide.href}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ivory px-3.5 py-1.5 text-xs font-semibold text-plum-900 shadow-soft hover:bg-gold-50 transition"
                >
                  {slide.buttonText}
                  <ArrowRight className="size-3 text-rose-600" />
                </Link>
                <span className="text-[0.65rem] text-blush-200/80 hidden sm:inline">
                  At-home across Delhi NCR
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Previous / Next Navigation Arrows */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous transformation"
          className="group absolute left-2.5 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-plum-900/40 text-ivory backdrop-blur-md border border-white/10 transition hover:bg-plum-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <ChevronLeft className="size-4.5 transition group-hover:-translate-x-0.5" />
        </button>

        <button
          type="button"
          onClick={next}
          aria-label="Next transformation"
          className="group absolute right-2.5 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-plum-900/40 text-ivory backdrop-blur-md border border-white/10 transition hover:bg-plum-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <ChevronRight className="size-4.5 transition group-hover:translate-x-0.5" />
        </button>

        {/* Carousel indicators & progress bar */}
        <div
          className="absolute bottom-2 right-4 z-20 flex items-center gap-1"
          role="tablist"
          aria-label="Carousel slide selectors"
        >
          {slides.map((s, idx) => (
            <button
              type="button"
              key={s.id}
              role="tab"
              aria-selected={current === idx}
              aria-label={`Go to slide ${idx + 1}: ${s.title}`}
              onClick={() => setCurrent(idx)}
              className="p-2 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-full"
            >
              <span
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 block",
                  current === idx ? "w-6 bg-gold-400" : "w-1.5 bg-white/40 hover:bg-white/70"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Trust pill below carousel */}
      <div className="mt-3.5 flex items-center justify-center gap-2 text-center text-xs text-ink-soft">
        <Sparkles className="size-3.5 text-gold-500" />
        <span>
          100% Real Transformations · Verified Female Artists · 10% Advance (100% Refund Guarantee)
        </span>
      </div>
    </div>
  );
}
