"use client";

import { LazyMotion, m, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "./utils";

/** Motion presets: 200–600 ms, ease-out, stagger 60–80 ms. Never blocks reading; respects prefers-reduced-motion. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={() => import("./motion-features").then((x) => x.default)}>
      {children}
    </LazyMotion>
  );
}

export const ease = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease } },
};
export const stagger = (gap = 0.07): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap } },
});
export const hoverLift = { y: -4, transition: { duration: 0.25, ease } };

/**
 * Blur + fade + rise on scroll into view (Magic UI "blur fade"), implemented with CSS + ONE shared IntersectionObserver
 * instead of a motion component per element: roughly 50 on the home page, so this removes a lot of hydration work.
 * Content is in the server HTML; it is only hidden once JavaScript has marked <html class="js"> (no-JS users see everything).
 */
let observer: IntersectionObserver | null = null;
function observe(el: Element) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        if (e.isIntersecting) {
          e.target.classList.add("bf-in");
          observer?.unobserve(e.target);
        }
    },
    { rootMargin: "0px 0px 100px 0px" }
  );
  observer.observe(el);
}
export function BlurFade({
  children,
  delay = 0,
  className,
  y = 14,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("bf-in");
      return;
    }
    observe(el);
    return () => observer?.unobserve(el);
  }, []);
  return (
    <div
      ref={ref}
      className={cn("bf", className)}
      style={{ ["--bf-delay" as string]: `${delay}s`, ["--bf-y" as string]: `${y}px` }}
    >
      {children}
    </div>
  );
}

export const Reveal = BlurFade;

export function RevealList({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <m.div
      className={className}
      variants={stagger()}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </m.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div className={className} variants={fadeUp}>
      {children}
    </m.div>
  );
}

export function LiftCard({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <m.div className={className} whileHover={reduce ? undefined : hoverLift}>
      {children}
    </m.div>
  );
}
