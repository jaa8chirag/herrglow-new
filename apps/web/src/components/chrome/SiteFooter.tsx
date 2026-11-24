import { Mail, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { urls } from "@herrglow/core";
import { Container } from "@herrglow/ui";
import { Logo } from "@/components/brand/Logo";
import { NewsletterForm } from "./NewsletterForm";
import { telLink, whatsappLink } from "@/lib/whatsapp";

export interface FooterProps {
  siteName: string;
  categories: { slug: string; name: string }[];
  cities: { slug: string; name: string }[];
  popular: { slug: string; title: string }[];
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  waText?: string | null;
  socials: { label: string; href: string }[];
}

const SocialIcon = ({ label }: { label: string }) => (
  <span
    aria-hidden
    className="grid size-11 place-items-center rounded-full border border-white/20 text-xs font-semibold uppercase text-gold-300 transition group-hover:border-gold-400 group-hover:bg-white/5"
  >
    {label.slice(0, 2)}
  </span>
);

export function SiteFooter({
  siteName,
  categories,
  cities,
  popular,
  whatsapp,
  phone,
  email,
  waText,
  socials,
}: FooterProps) {
  const wa = whatsappLink(whatsapp, waText ?? undefined),
    tel = telLink(phone);
  return (
    <footer className="section-dark relative mt-24 overflow-hidden pb-28 pt-0 text-blush-100 lg:pb-12">
      <div className="gold-rule" />
      <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-[0.06]" />
      <Container className="relative">
        {/* newsletter band */}
        <div className="grid items-center gap-6 border-b border-white/10 py-12 lg:grid-cols-2">
          <div>
            <p className="font-serif text-3xl leading-tight text-ivory sm:text-4xl">
              Beauty tips, <span className="text-gold-300">straight to your inbox.</span>
            </p>
            <p className="mt-2 text-blush-200">
              Bridal timelines, skincare guides and seasonal offers. No spam.
            </p>
          </div>
          <NewsletterForm />
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="dark" size="md" />
            <p className="mt-3 max-w-sm leading-relaxed text-blush-200">
              Verified makeup artists and beauticians who come to you, with clear prices and your
              schedule.
            </p>
            {(wa || tel || email) && (
              <ul className="mt-5 space-y-2.5 text-sm">
                {tel && (
                  <li>
                    <a
                      className="inline-flex items-center gap-2 underline-offset-4 hover:text-gold-300 hover:underline"
                      href={tel}
                    >
                      <Phone className="size-4 text-gold-300 shrink-0" />
                      <span>+91 9319260069</span>
                    </a>
                  </li>
                )}
                {wa && (
                  <li>
                    <a
                      className="inline-flex items-center gap-2 underline-offset-4 hover:text-gold-300 hover:underline"
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-4 text-[#25D366] shrink-0" />
                      <span>WhatsApp: +91 9319260069</span>
                    </a>
                  </li>
                )}
                {email && (
                  <li>
                    <a
                      className="inline-flex items-center gap-2 underline-offset-4 hover:text-gold-300 hover:underline"
                      href={`mailto:${email}`}
                    >
                      <Mail className="size-4 text-gold-300 shrink-0" />
                      <span>{email}</span>
                    </a>
                  </li>
                )}
              </ul>
            )}
            {socials.length > 0 && (
              <div className="mt-6 flex gap-2">
                {socials.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="group"
                  >
                    <SocialIcon label={s.label} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <FooterList
            title="Services"
            items={[
              ...categories.map((c) => ({ href: `/services/${c.slug}`, label: c.name })),
              { href: "/packages", label: "Packages" },
            ]}
          />
          <div>
            <FooterList
              title="Popular"
              items={popular.map((s) => ({ href: `/services/${s.slug}`, label: s.title }))}
            />
          </div>
          <div className="space-y-8">
            {cities.length > 0 && (
              <FooterList
                title="Areas we serve"
                items={cities.map((c) => ({
                  href: urls.cityHub(c.slug),
                  label: `Salon at home in ${c.name}`,
                }))}
              />
            )}
            <FooterList
              title="Company"
              items={[
                { href: "/about", label: "About" },
                { href: "/blog", label: "Blog" },
                { href: "/contact", label: "Contact" },
                { href: "/join-as-beautician", label: "Join as an artist" },
              ]}
            />
          </div>
        </div>

        <div className="gold-rule opacity-50" />
        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-blush-300 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <p className="flex items-center gap-6">
            <Link className="inline-block py-1.5 hover:text-gold-300" href="/privacy-policy">
              Privacy policy
            </Link>
            <Link className="inline-block py-1.5 hover:text-gold-300" href="/terms">
              Terms
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">{title}</p>
      <ul className="mt-4 space-y-1 text-[0.95rem]">
        {items.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              className="inline-block py-1 text-blush-100 transition hover:text-white hover:underline hover:underline-offset-4"
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
