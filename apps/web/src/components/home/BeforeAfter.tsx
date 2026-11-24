"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@herrglow/ui";

/**
 * Drag handle comparison. Keyboard accessible (arrow keys on the handle). `before` and `after` must be real images;
 * the page only renders this when an admin has actually paired them.
 */
export function BeforeAfter({
  before,
  after,
  alt,
  className,
}: {
  before: string;
  after: string;
  alt: string;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (r) setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={box}
      className={cn(
        "relative aspect-[4/5] w-full select-none overflow-hidden rounded-[1.75rem] bg-blush-100 shadow-lift touch-pan-y",
        className
      )}
      onPointerMove={(e) => {
        if (e.buttons === 1 || e.pointerType === "touch") move(e.clientX);
      }}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        move(e.clientX);
      }}
    >
      <Image
        src={after}
        alt={`${alt}: after`}
        fill
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="pointer-events-none object-cover"
        draggable={false}
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <Image
          src={before}
          alt={`${alt}: before`}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="pointer-events-none object-cover"
          draggable={false}
        />
      </div>
      <span className="absolute left-4 top-4 rounded-full bg-plum-900/70 px-3 py-1 text-xs font-medium text-ivory backdrop-blur">
        Before
      </span>
      <span className="absolute right-4 top-4 rounded-full bg-gold-400 px-3 py-1 text-xs font-semibold text-plum-900">
        After
      </span>
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_12px_rgb(0_0_0/0.3)]"
        style={{ left: `${pos}%` }}
      />
      <button
        type="button"
        role="slider"
        aria-label="Drag to compare before and after"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
          if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
        }}
        className="absolute top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full border-2 border-white bg-plum-700 text-ivory shadow-lift"
        style={{ left: `${pos}%` }}
      >
        <span aria-hidden className="text-lg leading-none">
          ⇆
        </span>
      </button>
    </div>
  );
}
