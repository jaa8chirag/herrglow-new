"use client";

import { usePathname } from "next/navigation";
import { MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { telLink, whatsappLink } from "@/lib/whatsapp";
import { BookLink } from "./BookLink";

/** Mobile floating dock: Book Now always; WhatsApp / Call only when a number is configured. Suppressed on join-as-beautician & admin. */
export function StickyDock({ whatsapp, phone, waText }: { whatsapp: string | null; phone: string | null; waText?: string | null }) {
  const pathname = usePathname();
  if (
    pathname?.startsWith("/join-as-beautician") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/services/")
  ) {
    return null;
  }

  const wa = whatsappLink(whatsapp, waText ?? undefined), tel = telLink(phone);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      {/* Micro Luxury Trust Indicator */}
      <div
        className="pointer-events-auto mb-1.5 flex max-w-[94vw] items-center justify-center gap-1.5 rounded-full border border-gold-400/40 bg-[#190618] px-3.5 py-1 text-[11px] font-semibold tracking-wide text-[#F5E9C9] shadow-soft backdrop-blur-md"
        style={{ backgroundColor: "#190618", color: "#F5E9C9" }}
      >
        <ShieldCheck className="size-3.5 shrink-0 text-gold-400" />
        <span className="truncate">100% Female Verified · 10% Advance · 100% Refund</span>
      </div>

      <div className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-full border border-line/80 bg-ivory/95 p-2 shadow-lift backdrop-blur-xl">
        <BookLink className="flex-1 min-h-12 text-sm font-bold shadow-xs" label="Book Appointment" />
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Beauty Expert on WhatsApp"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-soft transition hover:bg-[#1f8f4e] active:scale-95"
          >
            <MessageCircle className="size-5" />
          </a>
        )}
        {tel && (
          <a
            href={tel}
            aria-label="Call HerrGlow Salon"
            className="grid size-12 shrink-0 place-items-center rounded-full border border-line bg-white text-plum-900 shadow-soft transition hover:bg-blush-50 active:scale-95"
          >
            <Phone className="size-5" />
          </a>
        )}
      </div>
    </div>
  );
}
