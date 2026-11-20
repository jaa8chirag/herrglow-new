"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const HeroGlow = dynamic(() => import("./HeroGlow"), { ssr: false });

/**
 * Gate for the 3D element. It loads ONLY when all of these hold, so it can never hurt LCP or mobile performance:
 *  - desktop width (≥ 1024px) and a fine pointer
 *  - no prefers-reduced-motion, no data-saver
 *  - after the page has loaded and the browser is idle
 * and it is paused (frameloop "never") whenever it is scrolled off-screen or the tab is hidden.
 * Mobile and everyone else keep the static gradient + image behind it.
 */
export function HeroGlowLazy({ className }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const ok = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      && !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!ok) return;
    const start = () => ("requestIdleCallback" in window ? (window as Window & { requestIdleCallback: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback(() => setEnabled(true), { timeout: 2500 }) : setTimeout(() => setEnabled(true), 1500));
    if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });
  }, []);

  useEffect(() => {
    if (!enabled || !box.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting && !document.hidden), { threshold: 0.05 });
    io.observe(box.current);
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, [enabled]);

  return <div ref={box} aria-hidden className={className}>{enabled && <HeroGlow active={visible} />}</div>;
}
