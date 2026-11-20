"use client";

import { useEffect, useState } from "react";

/** Thin gold bar under the header showing how far through the article you are. */
export function ReadingProgress({ targetId = "article" }: { targetId?: string }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = document.getElementById(targetId);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setP(Math.min(1, Math.max(0, -r.top / Math.max(1, total))));
    };
    on(); window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, [targetId]);
  return <div aria-hidden className="fixed inset-x-0 top-20 z-30 h-1 bg-transparent"><div className="h-full origin-left bg-gradient-to-r from-rose-600 to-gold-400" style={{ transform: `scaleX(${p})` }} /></div>;
}
