"use client";

import {
  animate,
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "./utils";

/* ───────── Marquee (Magic UI): pure CSS, pauses on hover, stops for reduced motion ───────── */
export function Marquee({
  children,
  className,
  duration = 40,
  reverse = false,
  pauseOnHover = true,
  gap = "1rem",
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  gap?: string;
}) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]",
        className
      )}
      style={{ ["--gap" as string]: gap, ["--duration" as string]: `${duration}s`, gap }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className={cn(
            "flex shrink-0 animate-marquee items-center",
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
          style={{ gap, animationDirection: reverse ? "reverse" : "normal" }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

/* ───────── Number ticker (Magic UI). The final number is in the server HTML; it only animates once in view ───────── */
export function NumberTicker({
  value,
  className,
  suffix = "",
}: {
  value: number;
  className?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView || reduce || !ref.current) return;
    const el = ref.current;
    const c = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = Math.round(v).toLocaleString("en-IN") + suffix;
      },
    });
    return () => c.stop();
  }, [inView, reduce, value, suffix]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {value.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ───────── Animated gradient text (Magic UI) ───────── */
export function GradientText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "animate-gradient-x bg-gradient-to-r from-rose-600 via-gold-400 to-plum-700 bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ───────── Border beam (Magic UI): a light that travels around the card edge ───────── */
export function BorderBeam({
  className,
  duration = 8,
  size = 90,
}: {
  className?: string;
  duration?: number;
  size?: number;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] [border:1.5px_solid_transparent] [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <div
        className={cn(
          "absolute aspect-square bg-gradient-to-l from-gold-400 via-rose-600 to-transparent [offset-anchor:90%_50%] [offset-path:rect(0_auto_auto_0_round_var(--size))]",
          className
        )}
        style={{
          width: size,
          ["--size" as string]: `${size}px`,
          animation: `border-beam ${duration}s linear infinite`,
        }}
      />
    </div>
  );
}

/* ───────── 3D tilt card (Aceternity "3D card effect"). Mouse only; off on touch and for reduced motion ───────── */
export function TiltCard({
  children,
  className,
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 180, damping: 18 });

  if (reduce) return <div className={cn("size-full", className)}>{children}</div>;
  return (
    <div className={cn("[perspective:900px]", className)}>
      <m.div
        ref={ref}
        className="size-full"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          x.set((e.clientX - r.left) / r.width - 0.5);
          y.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          x.set(0);
          y.set(0);
        }}
      >
        {children}
      </m.div>
    </div>
  );
}

/* ───────── Spotlight (Aceternity): soft light cone for ONE dark band ───────── */
export function Spotlight({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -top-40 left-0 h-[140%] w-[140%] md:-top-20 md:left-60",
        className
      )}
    >
      <div className="absolute inset-0 -rotate-45 bg-[radial-gradient(ellipse_at_center,rgb(200_161_90/0.28),transparent_60%)]" />
    </div>
  );
}
