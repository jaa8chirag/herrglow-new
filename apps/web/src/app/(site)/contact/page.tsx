import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { prisma } from "@herrglow/db";
import { Container, Section, SectionHeading } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { Breadcrumbs } from "@/components/parts";
import { getLiveCities, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";
import { telLink, whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = buildMetadata({
  title: "Contact HerrGlow",
  description:
    "Get in touch to book a makeup artist or beautician at home in Delhi, Noida or Greater Noida. Send an enquiry and we will get back to you.",
  path: "/contact",
});

export default async function ContactPage(props: PageProps<"/contact">) {
  const sp = await props.searchParams;
  const serviceSlug = Array.isArray(sp.service) ? sp.service[0] : sp.service;

  const [cities, s, preselectedSvc] = await Promise.all([
    getLiveCities(),
    getSettings(),
    serviceSlug
      ? prisma.service.findFirst({
          where: { slug: serviceSlug, status: "ACTIVE" },
          select: { slug: true, title: true },
        })
      : null,
  ]);

  const wa = whatsappLink(s.whatsappNumber),
    tel = telLink(s.contactPhone);
  return (
    <Section>
      <Container>
        <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} />
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              as="h1"
              eyebrow="Contact"
              title="Let us plan your look"
              intro="Tell us what you need and where. We will confirm availability in your area."
            />
            <ul className="space-y-3.5 text-sm text-ink-soft">
              {tel && (
                <li className="flex items-center gap-2.5">
                  <Phone className="size-4.5 text-rose-700 shrink-0" />
                  <span>
                    Call:{" "}
                    <a
                      className="text-plum-950 font-semibold underline hover:text-rose-700"
                      href={tel}
                    >
                      +91 9319260069
                    </a>
                  </span>
                </li>
              )}
              {wa && (
                <li className="flex items-center gap-2.5">
                  <MessageCircle className="size-4.5 text-emerald-600 shrink-0" />
                  <span>
                    WhatsApp:{" "}
                    <a
                      className="text-emerald-700 font-semibold underline hover:text-emerald-800"
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      +91 9319260069
                    </a>
                  </span>
                </li>
              )}
              {s.contactEmail && (
                <li className="flex items-center gap-2.5">
                  <Mail className="size-4.5 text-rose-700 shrink-0" />
                  <span>
                    Email:{" "}
                    <a
                      className="text-plum-950 font-semibold underline hover:text-rose-700"
                      href={`mailto:${s.contactEmail}`}
                    >
                      {s.contactEmail}
                    </a>
                  </span>
                </li>
              )}
              <li className="pt-2 text-xs text-ink-soft">
                We serve {cities.map((c) => c.name).join(", ")}.
              </li>
            </ul>
          </div>
          <div id="book">
            <BookingForm
              cities={cities}
              sourcePath="/contact"
              service={preselectedSvc ?? undefined}
              enquiry
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
