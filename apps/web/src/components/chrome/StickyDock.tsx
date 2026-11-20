import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { telLink, whatsappLink } from "@/lib/whatsapp";
import { BookLink } from "./BookLink";

/** Mobile floating dock: Book Now always; WhatsApp / Call only when a number is configured. */
export function StickyDock({ whatsapp, phone, waText }: { whatsapp: string | null; phone: string | null; waText?: string | null }) {
  const wa = whatsappLink(whatsapp, waText ?? undefined), tel = telLink(phone);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-full border border-line bg-ivory/90 p-2 shadow-lift backdrop-blur-xl">
        <BookLink className="flex-1" />
        {wa && <Link href={wa} aria-label="WhatsApp" className="grid size-12 shrink-0 place-items-center rounded-full bg-[#1f8f4e] text-white"><MessageCircle className="size-5" /></Link>}
        {tel && <Link href={tel} aria-label="Call" className="grid size-12 shrink-0 place-items-center rounded-full border border-line bg-white text-plum-800"><Phone className="size-5" /></Link>}
      </div>
    </div>
  );
}
