"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { Container, Section, cn } from "@herrglow/ui";
import { ApplyForm } from "@/components/ApplyForm";
import { whatsappLink } from "@/lib/whatsapp";

export interface JoinBeauticianViewProps {
  categories: { slug: string; name: string }[];
  areas?: string[];
  whatsappNumber?: string;
  initialLang?: "en" | "hi";
}

const POINTS_EN = [
  {
    icon: MapPin,
    title: "Bookings in your selected areas",
    desc: "Receive verified appointment requests only in the localities and sectors you choose to operate in.",
  },
  {
    icon: Wallet,
    title: "Guaranteed fair payouts (75% to 80%)",
    desc: "Keep 75% to 80% of your service price with immediate, reliable UPI settlements. Zero hidden cuts.",
  },
  {
    icon: ShieldCheck,
    title: "100% Female & verified clientele",
    desc: "Safety-first protocol. All clients are verified, and you work in safe, respectful home environments.",
  },
  {
    icon: Calendar,
    title: "Complete schedule freedom",
    desc: "Work on your own terms. Accept appointments that match your calendar, family time, and commute preferences.",
  },
];

const POINTS_HI = [
  {
    icon: MapPin,
    title: "Aapke chune hue areas mein bookings",
    desc: "Sirf unhi sectors aur localities mein clients ke orders mileinge jahan aap service dena chahti hain.",
  },
  {
    icon: Wallet,
    title: "Samay par seedhe UPI payments (75% - 80%)",
    desc: "Aapke service price ka 75% se 80% hissa seedhe aapke bank ya UPI par turant transfer hota hai. Koi hidden cut nahi.",
  },
  {
    icon: ShieldCheck,
    title: "100% Female & verified clients",
    desc: "Pehle suraksha. Sabhi clients verified hote hain aur aap safe, respectful mahol mein service deti hain.",
  },
  {
    icon: Calendar,
    title: "Manmarzi ka time aur schedule",
    desc: "Jab chahein tab kaam karein. Apne time aur aane-jaane ki suvidha ke hisaab se orders accept karein.",
  },
];

const FAQS_EN = [
  {
    q: "How much can I earn with HerrGlow?",
    a: "You keep 75% to 80% of every booking price. Active full-time beauticians earn between ₹40,000 to ₹75,000+ monthly, while bridal artists earn up to ₹1,00,000+ during wedding season with direct UPI payouts.",
  },
  {
    q: "Is there any joining fee or security deposit?",
    a: "No! There is absolutely ZERO joining fee, zero security deposit, and zero monthly subscription charges. You only pay a small commission when you actually complete a service.",
  },
  {
    q: "How do cancellations work? Is my travel time protected?",
    a: "Yes! Clients pay a 10% advance deposit to reserve your slot. If a client cancels last-minute without valid notice, your slot is compensated so your time and travel are never wasted.",
  },
  {
    q: "Can I choose my own operating areas and timings?",
    a: "Yes! You select exactly which sectors and localities you cover, and how many kilometers you are willing to travel. You are your own boss.",
  },
];

const FAQS_HI = [
  {
    q: "HerrGlow ke sath judkar main kitna kama sakti hoon?",
    a: "Aapko har booking ka 75% se 80% payout milta hai. Regular kaam karne wali beauticians mahine ka ₹40,000 se ₹75,000+ aasani se kamati hain, aur wedding season mein bridal artists ₹1,00,000+ tak kamati hain.",
  },
  {
    q: "Kya koi joining fee ya security deposit dena hoga?",
    a: "Bilkul nahi! HerrGlow join karne ki ZERO joining fee aur ZERO security deposit hai. Koi hidden charges nahi hain.",
  },
  {
    q: "Agar client aakhri waqt par cancel kar de to kya hoga?",
    a: "Clients booking confirm karne ke liye 10% advance jama karte hain. Isse fake bookings aur aakhri waqt par cancellation se aapka time aur kharcha surakshit rehta hai.",
  },
  {
    q: "Kya main apne manpasand sectors aur time chun sakti hoon?",
    a: "Haan! Form mein aap wahi sectors select karein jahan aap ja sakti hain. Aap apne hisaab se appointments accept kar sakti hain.",
  },
];

export function JoinBeauticianView({
  categories,
  areas = [],
  whatsappNumber,
  initialLang = "en",
}: JoinBeauticianViewProps) {
  const [lang, setLang] = useState<"en" | "hi">(initialLang);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Sync language with URL and localStorage
  const handleLangChange = (newLang: "en" | "hi") => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("herrglow_apply_lang", newLang);
        const url = new URL(window.location.href);
        if (newLang === "hi") {
          url.searchParams.set("lang", "hi");
        } else {
          url.searchParams.delete("lang");
        }
        window.history.replaceState({}, "", url.toString());
      } catch {
        // storage or history restricted
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang");
      if (urlLang === "hi" || urlLang === "en") {
        setLang(urlLang);
      } else {
        const stored = localStorage.getItem("herrglow_apply_lang");
        if (stored === "hi" || stored === "en") {
          setLang(stored);
        }
      }
    }
  }, []);

  const isHi = lang === "hi";
  const points = isHi ? POINTS_HI : POINTS_EN;
  const faqs = isHi ? FAQS_HI : FAQS_EN;

  const waUrl = whatsappLink(
    whatsappNumber,
    isHi
      ? "Namaste HerrGlow! Main ek professional beautician / makeup artist hoon aur HerrGlow ke sath judna chahti hoon. Main apna kaam aur operating areas share karna chahti hoon."
      : "Hi HerrGlow! I am a professional beautician / makeup artist and would like to join HerrGlow. I want to share my work and operating areas."
  );

  return (
    <Section className="pt-4 sm:pt-8 pb-16 sm:pb-24">
      <Container>
        {/* Single Unified Top Bar: Breadcrumbs + Language Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8 pb-3.5 border-b border-line/60">
          <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-ink-soft">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link href="/" className="hover:text-rose-700 hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-gold-500">/</li>
              <li aria-current="page" className="font-medium text-plum-800">
                {isHi ? "Beautician / Artist banein" : "Join as an artist"}
              </li>
            </ol>
          </nav>

          {/* Master Language Switcher */}
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-blush-200 bg-white p-1 text-xs shadow-xs">
            <span className="px-2 text-ink-soft font-medium">Bhasha / Language:</span>
            <button
              type="button"
              onClick={() => handleLangChange("en")}
              className={cn(
                "rounded-lg px-3 py-1.5 font-semibold transition cursor-pointer",
                !isHi
                  ? "bg-plum-700 text-ivory shadow-xs"
                  : "text-ink-soft hover:text-plum-950"
              )}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLangChange("hi")}
              className={cn(
                "rounded-lg px-3 py-1.5 font-semibold transition cursor-pointer flex items-center gap-1.5",
                isHi
                  ? "bg-plum-700 text-ivory shadow-xs font-bold"
                  : "text-ink-soft hover:text-plum-950"
              )}
            >
              <span>हिन्दी</span>
              <span className="text-[0.68rem] opacity-90 font-medium">(Hinglish)</span>
            </button>
          </div>
        </div>

        {/* ───────── RESPONSIVE LAYOUT (Single Unified ApplyForm Instance) ───────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] xl:grid-cols-[460px_1fr] gap-8 xl:gap-12 items-start">
          {/* Column 1: Header, Value Proposition, Metrics & Social Proof */}
          <div className="space-y-5 lg:sticky lg:top-24">
            {/* Hero Heading & Subtitle */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-300/80 bg-blush-50/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-rose-800 shadow-2xs">
                <Sparkles className="size-3 text-gold-600" />
                <span>{isHi ? "HerrGlow Elite Partner Network · Delhi NCR" : "HerrGlow Elite Partner Network · Delhi NCR"}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-[1.95rem] xl:text-[2.2rem] font-bold text-plum-950 leading-[1.22] tracking-tight">
                {isHi ? (
                  <>HerrGlow ke saath apna <span className="text-rose-700">beauty &amp; makeup</span> business badhaiye</>
                ) : (
                  <>Grow your <span className="text-rose-700">beauty &amp; makeup</span> business with HerrGlow</>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                {isHi
                  ? "Delhi NCR ka sabse trusted luxury home salon brand. 75-80% seedha payout, bina kisi joining fee ke, aur poori azaadi."
                  : "Delhi NCR's most trusted luxury doorstep beauty network. Keep 75% to 80% payouts with zero upfront fees."}
              </p>
            </div>

            {/* Quick Trust Chips Grid (2x2 on Mobile, 4x1 on Tablet/Desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 text-xs font-medium text-plum-900">
              <div className="flex items-center gap-2.5 rounded-2xl border border-blush-200 bg-white p-2.5 sm:p-3 shadow-xs">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm">
                  ₹
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-plum-950 truncate">75%–80%</p>
                  <p className="text-[10px] text-ink-soft truncate">{isHi ? "Seedha UPI Payout" : "Direct UPI Payout"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-blush-200 bg-white p-2.5 sm:p-3 shadow-xs">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-800 font-bold text-sm">
                  📍
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-plum-950 truncate">{isHi ? "Aapka Area" : "Your Sectors"}</p>
                  <p className="text-[10px] text-ink-soft truncate">{isHi ? "Sirf paas ke orders" : "Hyperlocal radius"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-blush-200 bg-white p-2.5 sm:p-3 shadow-xs">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-gold-100 text-gold-800 font-bold text-sm">
                  🛡️
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-plum-950 truncate">{isHi ? "100% Female" : "100% Female"}</p>
                  <p className="text-[10px] text-ink-soft truncate">{isHi ? "Verified surakshit ghar" : "Verified clients"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-blush-200 bg-white p-2.5 sm:p-3 shadow-xs">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-plum-100 text-plum-800 font-bold text-sm">
                  ⏰
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-plum-950 truncate">{isHi ? "Azaad Time" : "Own Hours"}</p>
                  <p className="text-[10px] text-ink-soft truncate">{isHi ? "Jab chahein kaam karein" : "Zero penalty"}</p>
                </div>
              </div>
            </div>

            {/* Artist Protection Callout: 10% Advance Deposit by Clients */}
            <div className="rounded-2xl border border-gold-300/60 bg-gradient-to-r from-gold-50/70 via-white to-blush-50/60 p-3.5 sm:p-4 shadow-xs">
              <div className="flex items-start gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-gold-500 text-white font-bold text-xs mt-0.5">
                  ✓
                </span>
                <div className="text-xs text-plum-950 leading-relaxed">
                  <strong className="font-semibold text-rose-800">
                    {isHi ? "Aapke Samay ki Suraksha: " : "Artist Time Protection: "}
                  </strong>
                  {isHi
                    ? "Clients se hum 10% advance deposit lete hain taaki aakhri waqt par order cancel na ho aur aapka aana-jaana bekaar na jaye. Baaki 90% payment service ke turant baad milti hai."
                    : "Clients pay a 10% advance deposit to reserve your slot, eliminating last-minute fake cancellations. Balance 90% is collected immediately upon service completion."}
                </div>
              </div>
            </div>

            {/* Desktop Additional Sidebar Elements (hidden on mobile to keep form near top) */}
            <div className="hidden lg:block space-y-4">
              {/* 4 Luxury Benefit Items */}
              <ul className="space-y-2.5">
                {points.map((p) => (
                  <li key={p.title} className="flex gap-3 rounded-2xl border border-line/60 bg-white/80 p-3 shadow-xs hover:border-plum-300 transition">
                    <span aria-hidden className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-gold-100 text-gold-700 text-xs font-bold">
                      ✦
                    </span>
                    <div>
                      <h2 className="text-xs font-semibold text-plum-950">{p.title}</h2>
                      <p className="text-ink-soft text-[11px] leading-relaxed mt-0.5">{p.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Verified Artist Spotlight Card */}
              <div className="rounded-2xl border border-blush-200 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-rose-700">
                  <Sparkles className="size-3 text-gold-500" />
                  <span>{isHi ? "Verified Partner Story" : "Verified Partner Story"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-gold-300/60 shadow-xs">
                    <Image
                      src="/images/pros/sunita-rawat.jpg"
                      alt="Sunita Rawat"
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-0.5 text-gold-500 text-xs mb-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-3 fill-gold-400 text-gold-400" />
                      ))}
                      <span className="ml-1 text-[11px] font-bold text-plum-950">5.0</span>
                    </div>
                    <h4 className="text-xs font-bold text-plum-950 truncate">Sunita Rawat</h4>
                    <p className="text-[11px] text-ink-soft">Senior Aesthetician · Noida</p>
                  </div>
                </div>
                <p className="text-[11px] text-ink-soft italic leading-relaxed border-t border-line/60 pt-2.5">
                  {isHi
                    ? "“HerrGlow ke saath kaam karke monthly ₹45,000+ kamai ho jaati hai mere hi Noida sectors mein. Direct UPI se payment samay par aati hai.”"
                    : "“I earn ₹45,000+ monthly in my own Noida sectors. Clients are respectful and verified, with direct UPI settlements right on time.”"}
                </p>
              </div>

              {/* Fast-Track WhatsApp Onboarding */}
              {waUrl && (
                <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 p-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
                      <MessageCircle className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-950">
                        {isHi ? "WhatsApp par seedhi Onboarding" : "Fast-Track WhatsApp Onboarding"}
                      </h3>
                      <p className="text-[0.72rem] text-emerald-800">
                        {isHi ? "Hiring Manager se direct baat karein" : "Instant registration & same-day review"}
                      </p>
                    </div>
                  </div>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f8f4e] py-2.5 text-xs font-semibold text-white shadow-soft transition hover:bg-[#187a41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  >
                    <MessageCircle className="size-4" />{" "}
                    {isHi ? "Hiring Manager ko WhatsApp Karein" : "Message Hiring Manager on WhatsApp"}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Application Form (Rendered ONCE for mobile, tablet, and desktop) */}
          <div className="w-full min-w-0">
            <ApplyForm
              categories={categories}
              areas={areas}
              whatsappNumber={whatsappNumber}
              lang={lang}
              onLangChange={handleLangChange}
              hideLangToggle={true}
              hideWhatsAppCard={true}
            />
          </div>
        </div>

        {/* ───────── MOBILE/TABLET SECONDARY SECTIONS (Rendered below Form on < lg) ───────── */}
        <div className="block lg:hidden mt-8 space-y-6">
          {/* Social Proof: Verified Artist Spotlight */}
          <div className="rounded-3xl border border-blush-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700">
              <Sparkles className="size-3.5 text-gold-500" />
              <span>{isHi ? "HerrGlow Verified Beautician" : "Verified Artist Spotlight"}</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-gold-300/60 shadow-xs">
                <Image
                  src="/images/pros/sunita-rawat.jpg"
                  alt="Sunita Rawat"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-gold-500 text-xs mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-gold-400 text-gold-400" />
                  ))}
                  <span className="ml-1 text-[11px] font-bold text-plum-950">5.0</span>
                </div>
                <h4 className="text-sm font-bold text-plum-950 truncate">Sunita Rawat</h4>
                <p className="text-xs text-ink-soft">Senior Aesthetician &amp; Pre-Bridal Pro · Noida</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-ink-soft italic leading-relaxed border-t border-line/60 pt-3">
              {isHi
                ? "“HerrGlow ke saath judne ke baad mujhe door traffic mein nahi jaana padta. Mere hi Noida sectors mein verified clients milte hain aur 75-80% seedha UPI par transfer hota hai bina kisi jhanjhat ke.”"
                : "“Joining HerrGlow gave me complete control over my appointments. I earn ₹45,000+ monthly right in Noida sectors without traveling 2 hours across Delhi. Direct UPI payouts make it completely stress-free.”"}
            </p>
          </div>

          {/* Details & Benefits Cards */}
          <div className="rounded-3xl border border-line bg-gradient-to-b from-blush-50/60 to-white p-5 sm:p-6 space-y-4">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-plum-950">
              {isHi ? "HerrGlow se judne ke mukhy fayde" : "Why Partner with HerrGlow?"}
            </h2>
            <div className="grid gap-3.5 sm:grid-cols-2">
              {points.map((p) => (
                <div key={p.title} className="flex items-start gap-3 rounded-2xl border border-blush-200/70 bg-white p-3.5 shadow-xs">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-gold-100 text-gold-700 font-bold text-xs mt-0.5">
                    ✦
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-plum-900">{p.title}</h3>
                    <p className="text-xs text-ink-soft leading-relaxed mt-0.5">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fast WhatsApp Callout on Mobile */}
          {waUrl && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <MessageCircle className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-emerald-950 truncate">
                    {isHi ? "WhatsApp Onboarding" : "Apply via WhatsApp"}
                  </p>
                  <p className="text-[0.68rem] sm:text-xs text-emerald-800 truncate">
                    {isHi ? "Hiring Manager se direct baat karein" : "Fast-track profile review"}
                  </p>
                </div>
              </div>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#1f8f4e] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#187a41] transition"
              >
                <MessageCircle className="size-3.5" />
                <span>Chat</span>
              </a>
            </div>
          )}
        </div>

        {/* ───────── FULL-WIDTH FAQS (Rendered for all viewports) ───────── */}
        <div className="mt-12 sm:mt-16 rounded-3xl border border-line bg-white p-6 sm:p-8 lg:p-10 space-y-6 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-rose-100 text-rose-800 shadow-2xs">
              <HelpCircle className="size-5" />
            </span>
            <div>
              <h2 className="font-serif text-lg sm:text-2xl font-bold text-plum-950">
                {isHi ? "Aam Taur Par Puchhe Jane Wale Sawal (FAQs)" : "Frequently Asked Questions"}
              </h2>
              <p className="text-xs sm:text-sm text-ink-soft">
                {isHi ? "Earnings, joining process aur terms se jude jawab" : "Everything you need to know about earnings, safety, and schedules"}
              </p>
            </div>
          </div>
          <div className="divide-y divide-line/60">
            {faqs.map((f, idx) => (
              <div key={idx} className="py-3.5 sm:py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between gap-3 text-left font-medium text-xs sm:text-base text-plum-950 hover:text-rose-700 transition cursor-pointer"
                >
                  <span>{f.q}</span>
                  <ChevronDown className={cn("size-4 shrink-0 transition-transform text-ink-soft", openFaq === idx && "rotate-180")} />
                </button>
                {openFaq === idx && (
                  <p className="mt-2.5 text-xs sm:text-sm text-ink-soft leading-relaxed pr-6">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
