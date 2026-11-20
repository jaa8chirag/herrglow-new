"use client";

import Lenis from "lenis";
import { Drawer as VaulDrawer } from "vaul";
import { Toaster as Sonner } from "sonner";
import { useEffect, type ReactNode } from "react";
import { cn } from "./utils";

/* ───────── Bento grid (Magic UI) ───────── */
export const BentoGrid = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("grid auto-rows-[15rem] grid-cols-2 gap-3 md:auto-rows-[17rem] md:grid-cols-4 md:gap-4", className)}>{children}</div>
);

/* ───────── Lenis smooth scroll: only mounted on the public site, off for reduced motion and touch ───────── */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // native momentum scrolling on touch is better
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);
  return null;
}

/* ───────── Toasts (sonner) ───────── */
export const Toaster = () => (
  <Sonner position="top-center" toastOptions={{ classNames: { toast: "!rounded-2xl !border-line !bg-white !text-ink !shadow-lift", description: "!text-ink-soft" } }} />
);

/* ───────── Drawer (vaul): mobile menu and booking sheet ───────── */
export const Drawer = VaulDrawer;
export function DrawerShell({ children, title, direction = "bottom", className }: { children: ReactNode; title: string; direction?: "bottom" | "right" | "left" | "top"; className?: string }) {
  return (
    <VaulDrawer.Portal>
      <VaulDrawer.Overlay className="fixed inset-0 z-50 bg-plum-900/50 backdrop-blur-sm" />
      <VaulDrawer.Content className={cn("fixed z-50 flex flex-col bg-ivory outline-none", direction === "bottom" && "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[1.75rem]", direction === "right" && "inset-y-0 right-0 w-full", className)}>
        <VaulDrawer.Title className="sr-only">{title}</VaulDrawer.Title>
        {direction === "bottom" && <div aria-hidden className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-plum-700/20" />}
        {children}
      </VaulDrawer.Content>
    </VaulDrawer.Portal>
  );
}
