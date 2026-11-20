"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

/** Masonry gallery with a keyboard-accessible lightbox (Esc, ←, →). Only real images are passed in. */
export function PortfolioGallery({ images }: { images: { src: string; alt: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const prev = useCallback(() => setOpen((i) => (i === null ? i : (i + images.length - 1) % images.length)), [images.length]);
  const next = useCallback(() => setOpen((i) => (i === null ? i : (i + 1) % images.length)), [images.length]);

  useEffect(() => {
    if (open === null) return;
    const on = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); };
    window.addEventListener("keydown", on);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", on); document.body.style.overflow = ""; };
  }, [open, prev, next]);

  if (!images.length) return null;
  return (
    <>
      <div className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
        {images.map((im, i) => (
          <button key={im.src} type="button" onClick={() => setOpen(i)} aria-label={`Open image ${i + 1}: ${im.alt}`} className="group relative block w-full overflow-hidden rounded-[1.25rem] bg-blush-100 shadow-soft">
            <Image src={im.src} alt={im.alt} width={600} height={i % 3 === 0 ? 800 : i % 3 === 1 ? 600 : 700} sizes="(min-width: 1024px) 25vw, 50vw" className="h-auto w-full transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          </button>
        ))}
      </div>
      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label="Image viewer" className="fixed inset-0 z-[60] grid place-items-center bg-plum-900/90 p-4 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><X className="size-5" /></button>
          {images.length > 1 && <>
            <button type="button" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronLeft className="size-6" /></button>
            <button type="button" aria-label="Next image" onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronRight className="size-6" /></button>
          </>}
          <div className="relative h-[82dvh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[open]!.src} alt={images[open]!.alt} fill sizes="90vw" className="object-contain" priority />
          </div>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 text-sm text-white">{open + 1} / {images.length}</p>
        </div>
      )}
    </>
  );
}
