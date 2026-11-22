import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { Container, Section, SectionHeading } from "@herrglow/ui";
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

const POINTS = [
  ["Bookings in your selected areas", "Receive verified appointment requests only in the localities you choose to operate in."],
  ["Guaranteed fair payouts", "Keep 75% to 80% of your service price with immediate, reliable UPI settlements."],
  ["Dedicated artist profile", "A luxury public profile showcasing your real work, verified badges, and client reviews."],
  ["Flexible schedule", "Work on your terms. Accept appointments that match your calendar and commute preferences."],
];

export default async function JoinPage() {
  const [categories, areas, settings] = await Promise.all([
    getCategories(),
    getLiveAreas(),
    getSettings(),
  ]);

  const waUrl = whatsappLink(
    settings.whatsappNumber || settings.contactPhone,
    "Hi HerrGlow! I am a professional beautician / makeup artist and would like to join HerrGlow. I want to share my work and operating areas."
  );

  return (
    <Section>
      <Container>
        <Breadcrumbs items={[{ name: "Join as an artist", path: "/join-as-beautician" }]} />
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHeading
              as="h1"
              eyebrow="Join Our Elite Network"
              title="Grow your beauty & makeup business with HerrGlow"
              intro="Join Delhi NCR's most trusted luxury doorstep beauty brand. High-paying clients, zero upfront fee, and complete schedule freedom."
            />
            <ul className="space-y-5">
              {POINTS.map(([t, d]) => (
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
                    <h3 className="text-base font-semibold text-emerald-950">Fast-Track WhatsApp Onboarding</h3>
                    <p className="text-xs text-emerald-800">Instant registration &amp; same-day document review</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                  Prefer WhatsApp over filling online forms? Message our Artist Hiring Coordinator directly with your location and experience.
                </p>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f8f4e] py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-[#187a41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <MessageCircle className="size-4" /> Message Hiring Manager on WhatsApp
                </a>
              </div>
            )}
          </div>
          <ApplyForm
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            areas={areas.map((a) => a.name)}
            whatsappNumber={settings.whatsappNumber || settings.contactPhone || undefined}
          />
        </div>
      </Container>
    </Section>
  );
}
