"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

/** Offer text from settings. Dismissible; the dismissal is remembered per message (so a new offer shows again). */
export function AnnouncementBar({ text }: { text: string }) {
  const key = `hg-announce-${[...text].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)}`;
  const [hidden, setHidden] = useState(false);
  useEffect(() => { try { if (localStorage.getItem(key)) setHidden(true); } catch { /* private mode */ } }, [key]);
  if (hidden) return null;
  return (
    <div className="relative bg-plum-800 px-10 py-2 text-center text-sm text-ivory">
      <p className="mx-auto max-w-5xl truncate sm:whitespace-normal"><span aria-hidden className="mr-2 text-gold-400">✦</span>{text}</p>
      <button type="button" aria-label="Dismiss announcement" onClick={() => { setHidden(true); try { localStorage.setItem(key, "1"); } catch { /* ignore */ } }} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ivory/80 hover:bg-white/10 hover:text-ivory"><X className="size-4" /></button>
    </div>
  );
}
