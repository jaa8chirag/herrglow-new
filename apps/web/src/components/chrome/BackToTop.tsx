"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

/** Appears after scrolling down; sits above the mobile dock. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
      className={`fixed bottom-28 right-4 z-20 grid size-11 place-items-center rounded-full border border-line bg-white/95 text-plum-800 shadow-lift backdrop-blur transition duration-300 hover:bg-white lg:bottom-6 lg:right-6 ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
    >
      <ArrowUp className="size-4" />
    </button>
  );
}
