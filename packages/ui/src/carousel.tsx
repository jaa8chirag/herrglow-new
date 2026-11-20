"use client";

import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "./utils";

/**
 * Embla carousel (shadcn "carousel" pattern) with autoplay + fade plugins.
 * All slides are in the server-rendered HTML (SEO), swiping works without JS-driven layout, and autoplay is disabled
 * for prefers-reduced-motion.
 *   <Carousel itemClassName="basis-[85%] sm:basis-1/2 lg:basis-1/3" autoplay>…children…</Carousel>
 */
export function Carousel({ children, className, itemClassName = "basis-[85%] sm:basis-1/2 lg:basis-1/3", autoplay = false, delay = 4500, fade = false, loop = false, arrows = true, dots = false, label = "Carousel" }: {
  children: ReactNode; className?: string; itemClassName?: string; autoplay?: boolean; delay?: number; fade?: boolean; loop?: boolean; arrows?: boolean; dots?: boolean; label?: string;
}) {
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const plugins = [...(autoplay && !reduce ? [Autoplay({ delay, stopOnInteraction: true, stopOnMouseEnter: true })] : []), ...(fade ? [Fade()] : [])];
  const [ref, api] = useEmblaCarousel({ loop, align: "start", containScroll: "trimSnaps", dragFree: false }, plugins);
  const [state, setState] = useState({ prev: false, next: false, index: 0, count: 0 });
  const sync = useCallback(() => {
    if (!api) return;
    setState({ prev: api.canScrollPrev(), next: api.canScrollNext(), index: api.selectedScrollSnap(), count: api.scrollSnapList().length });
  }, [api]);
  useEffect(() => {
    if (!api) return;
    sync(); api.on("select", sync).on("reInit", sync);
    return () => { api.off("select", sync).off("reInit", sync); };
  }, [api, sync]);

  return (
    <div className={cn("relative", className)} role="region" aria-roledescription="carousel" aria-label={label}>
      <div ref={ref} className="overflow-hidden">
        <div className={cn("flex", fade ? "" : "-ml-4")}>
          {Children.map(children, (c, i) => (
            <div key={i} role="group" aria-roledescription="slide" className={cn("min-w-0 shrink-0 grow-0 pl-4", fade ? "basis-full pl-0" : itemClassName)}>{c}</div>
          ))}
        </div>
      </div>
      {arrows && (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-1 md:flex">
          <button type="button" aria-label="Previous" disabled={!state.prev} onClick={() => api?.scrollPrev()} className="pointer-events-auto grid size-11 -translate-x-3 place-items-center rounded-full border border-line bg-white/95 text-plum-800 shadow-soft transition hover:bg-blush-100 disabled:opacity-0"><ChevronLeft className="size-5" /></button>
          <button type="button" aria-label="Next" disabled={!state.next} onClick={() => api?.scrollNext()} className="pointer-events-auto grid size-11 translate-x-3 place-items-center rounded-full border border-line bg-white/95 text-plum-800 shadow-soft transition hover:bg-blush-100 disabled:opacity-0"><ChevronRight className="size-5" /></button>
        </div>
      )}
      {dots && state.count > 1 && (
        <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="Slides">
          {Array.from({ length: state.count }, (_, i) => (
            <button key={i} type="button" role="tab" aria-selected={i === state.index} aria-label={`Slide ${i + 1}`} onClick={() => api?.scrollTo(i)} className={cn("h-2 rounded-full transition-all", i === state.index ? "w-6 bg-plum-700" : "w-2 bg-plum-700/25")} />
          ))}
        </div>
      )}
    </div>
  );
}
