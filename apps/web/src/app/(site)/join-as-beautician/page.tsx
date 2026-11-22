import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Container, Section, SectionHeading, cn } from "@herrglow/ui";
import { ApplyForm } from "@/components/ApplyForm";
import { Breadcrumbs } from "@/components/parts";
import { getCategories, getLiveAreas, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: "Join HerrGlow as a Beautician or Makeup Artist",
  description: "Are you a professional beautician or makeup artist in Delhi NCR? Apply to join HerrGlow and receive booking requests from customers near you.",
  path: "/join-as-beautician",
});

const POINTS_EN = [
  ["Bookings in your selected areas", "Receive verified appointment requests only in the localities you choose to operate in."],
  ["Guaranteed fair payouts", "Keep 75% to 80% of your service price with immediate, reliable UPI settlements."],
  ["Dedicated artist profile", "A luxury public profile showcasing your real work, verified badges, and client reviews."],
  ["Flexible schedule", "Work on your terms. Accept appointments that match your calendar and commute preferences."],
];

const POINTS_HI = [
  ["Aapke chune hue areas mein bookings", "Sirf unhi sectors aur localities mein clients ke orders mileinge jahan aap service dena chahti hain."],
  ["Samay par seedhe UPI payments", "Aapke service price ka 75% se 80% hissa seedhe aapke account mein turant transfer hota hai."],
  ["Aapka apna verified artist profile", "Aapki luxury online profile jahan aapka real kaam, verified badge aur customer reviews dikhenge."],
  ["Manmarzi ka time aur schedule", "Jab chahein tab kaam karein. Apne time aur aane-jaane ki suvidha ke hisaab se orders accept karein."],
];

export interface JoinPageProps {
  searchParams?: Promise<{ lang?: string }>;
}

export default async function JoinPage(props: JoinPageProps) {
  const sp = (await props.searchParams) ?? {};
  const isHi = sp.lang === "hi";

  const [categories, areas, settings] = await Promise.all([
    getCategories(),
    getLiveAreas(),
    getSettings(),
  ]);

  const waUrl = whatsappLink(
    settings.whatsappNumber || settings.contactPhone,
    isHi
      ? "Namaste HerrGlow! Main ek professional beautician / makeup artist hoon aur HerrGlow ke sath judna chahti hoon. Main apna kaam aur operating areas share karna chahti hoon."
      : "Hi HerrGlow! I am a professional beautician / makeup artist and would like to join HerrGlow. I want to share my work and operating areas."
  );

  const points = isHi ? POINTS_HI : POINTS_EN;

  return (
    <Section>
      <Container className="max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Breadcrumbs
            items={[
              {
                name: isHi ? "Beautician / Makeup Artist banein" : "Join as an artist",
                path: isHi ? "/join-as-beautician?lang=hi" : "/join-as-beautician",
              },
            ]}
          />
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-blush-200 bg-white p-1 text-xs shadow-xs">
            <span className="px-2 text-ink-soft font-medium">Bhasha / Language:</span>
            <Link
              href="/join-as-beautician"
              scroll={false}
              className={cn(
                "rounded-lg px-2.5 py-1 font-semibold transition",
                !isHi ? "bg-plum-700 text-ivory shadow-xs" : "text-ink-soft hover:text-plum-950"
              )}
            >
              English
            </Link>
            <Link
              href="/join-as-beautician?lang=hi"
              scroll={false}
              className={cn(
                "rounded-lg px-2.5 py-1 font-semibold transition",
                isHi ? "bg-plum-700 text-ivory shadow-xs" : "text-ink-soft hover:text-plum-950"
              )}
            >
              हिन्दी (Hinglish)
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[380px_1fr] xl:grid-cols-[400px_1fr] items-start">
          <div className="lg:sticky lg:top-24 space-y-6">
            <SectionHeading
              as="h1"
              eyebrow={isHi ? "HerrGlow Elite Partner Network" : "Join Our Elite Network"}
              title={
                isHi
                  ? "HerrGlow ke saath apna beauty & makeup business aage badhaiye"
                  : "Grow your beauty & makeup business with HerrGlow"
              }
              intro={
                isHi
                  ? "Delhi NCR ke sabse trusted luxury home salon brand se judiaye. Achhi kamai, bina kisi joining fee ke, aur poori azaadi."
                  : "Join Delhi NCR's most trusted luxury doorstep beauty brand. High-paying clients, zero upfront fee, and complete schedule freedom."
              }
            />
            <ul className="space-y-5">
              {points.map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <span aria-hidden className="mt-1 text-gold-500">✦</span>
                  <div>
                    <h2 className="!text-lg font-medium text-plum-900">{t}</h2>
                    <p className="text-ink-soft text-sm">{d}</p>
                  </div>
                </li>
              ))}
            </ul>

            {waUrl && (
              <div className="mt-8 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 p-5 shadow-soft">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <MessageCircle className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-emerald-950">
                      {isHi ? "WhatsApp par seedhi Onboarding" : "Fast-Track WhatsApp Onboarding"}
                    </h3>
                    <p className="text-xs text-emerald-800">
                      {isHi
                        ? "Turant registration aur same-day document check"
                        : "Instant registration & same-day document review"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                  {isHi
                    ? "Form bharne ke badle WhatsApp pasand hai? Hamari Hiring Coordinator ko seedhe WhatsApp par message karein."
                    : "Prefer WhatsApp over filling online forms? Message our Artist Hiring Coordinator directly with your location and experience."}
                </p>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f8f4e] py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-[#187a41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <MessageCircle className="size-4" />{" "}
                  {isHi ? "Hiring Manager ko WhatsApp Karein" : "Message Hiring Manager on WhatsApp"}
                </a>
              </div>
            )}
          </div>
          <div className="w-full min-w-0">
            <ApplyForm
              categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
              areas={areas.map((a) => a.name)}
              whatsappNumber={settings.whatsappNumber || settings.contactPhone || undefined}
              initialLang={isHi ? "hi" : "en"}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
