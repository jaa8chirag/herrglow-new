"use client";

import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/** Motion presets. Subtle, never delays content (LCP): opacity+small translate, once, respects reduced-motion. */
export const ease = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};
export const fade: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4, ease } } };
export const stagger = (gap = 0.08): Variants => ({ hidden: {}, show: { transition: { staggerChildren: gap } } });
export const hoverLift = { y: -4, transition: { duration: 0.25, ease } };

export function Reveal({ children, delay = 0, className, ...rest }: { children: ReactNode; delay?: number; className?: string } & Omit<HTMLMotionProps<"div">, "children">) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

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
