"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

/** Offer text from settings. Dismissible; the dismissal is remembered per message (so a new offer shows again). */
export function AnnouncementBar({ text }: { text: string }) {
  const key = `hg-announce-${[...text].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)}`;
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(key)) setHidden(true);
    } catch {
      /* private mode */
    }
  }, [key]);
  if (hidden) return null;
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 px-8 py-2 text-center text-xs font-medium text-ivory tracking-wide border-b border-gold-400/20 shadow-xs">
      <div className="mx-auto flex max-w-[1400px] items-center justify-center gap-2 truncate text-ellipsis overflow-hidden">
        <span aria-hidden className="text-gold-400 font-bold">
          ✦
        </span>
        <span>{text}</span>
      </div>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => {
          setHidden(true);
          try {
            localStorage.setItem(key, "1");
          } catch {
            /* ignore */
          }
        }}
        className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-ivory/70 hover:bg-white/10 hover:text-ivory"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
