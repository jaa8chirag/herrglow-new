"use client";

import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "motion/react";
import type { ReactNode } from "react";

/** Motion presets: 200–600 ms, ease-out, stagger 60–80 ms. Never blocks reading; respects prefers-reduced-motion. */
export const ease = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};
export const fade: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4, ease } } };
export const stagger = (gap = 0.07): Variants => ({ hidden: {}, show: { transition: { staggerChildren: gap } } });
export const hoverLift = { y: -4, transition: { duration: 0.25, ease } };

/** Blur + fade + rise on scroll into view (Magic UI "blur fade"). Content stays in the server-rendered HTML. */
export function BlurFade({ children, delay = 0, className, y = 14, ...rest }: { children: ReactNode; delay?: number; className?: string; y?: number } & Omit<HTMLMotionProps<"div">, "children">) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export const Reveal = BlurFade;

export function RevealList({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={stagger()} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return <motion.div className={className} variants={fadeUp}>{children}</motion.div>;
}

export function LiftCard({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} whileHover={reduce ? undefined : hoverLift}>
      {children}
    </motion.div>
  );
}
