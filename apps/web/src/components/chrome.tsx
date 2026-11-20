import Link from "next/link";
import { ButtonLink } from "@herrglow/ui";
import { telLink, whatsappLink } from "@/lib/whatsapp";

interface Common {
  categories: { slug: string; name: string }[];
  cities: { slug: string; name: string }[];
  whatsapp: string | null;
  phone: string | null;
  siteName: string;
  waText?: string | null;
}

export function SiteHeader({ categories, cities, siteName }: Pick<Common, "categories" | "cities" | "siteName">) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-tight text-plum-800">{siteName}</Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm text-ink-soft lg:flex">
          {categories.slice(0, 5).map((c) => <Link key={c.slug} href={`/${c.slug}`} className="hover:text-rose-700">{c.name}</Link>)}
          <Link href="/blog" className="hover:text-rose-700">Blog</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink href="#book" size="sm" className="hidden sm:inline-flex">Book now</ButtonLink>
          <details className="relative lg:hidden">
            <summary aria-label="Menu" className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-line text-plum-800">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </summary>
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-line bg-ivory p-4 shadow-lift">
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-rose-700">Services</p>
              {categories.map((c) => <Link key={c.slug} href={`/${c.slug}`} className="block rounded-lg px-2 py-2.5 text-ink hover:bg-blush-100">{c.name}</Link>)}
              {cities.length > 0 && <p className="mt-2 px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-rose-700">Cities</p>}
              {cities.map((c) => <Link key={c.slug} href={`/makeup-artist-in-${c.slug}`} className="block rounded-lg px-2 py-2.5 text-ink hover:bg-blush-100">{c.name}</Link>)}
              <Link href="/blog" className="mt-2 block rounded-lg px-2 py-2.5 text-ink hover:bg-blush-100">Blog</Link>
              <Link href="/contact" className="block rounded-lg px-2 py-2.5 text-ink hover:bg-blush-100">Contact</Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ categories, cities, siteName, whatsapp, phone, waText }: Common) {
  const wa = whatsappLink(whatsapp, waText ?? undefined);
  const tel = telLink(phone);
  return (
    <footer className="mt-20 bg-plum-900 pb-24 pt-14 text-blush-100 lg:pb-14">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 sm:px-8 md:grid-cols-4">
        <div>
          <p className="font-serif text-2xl text-ivory">{siteName}</p>
          <p className="mt-3 text-sm leading-relaxed text-blush-200">Verified makeup artists and beauticians who come to you.</p>
          {(wa || tel) && (
            <p className="mt-4 flex flex-wrap gap-4 text-sm">
              {wa && <a href={wa} className="underline underline-offset-4">WhatsApp us</a>}
              {tel && <a href={tel} className="underline underline-offset-4">Call us</a>}
            </p>
          )}
        </div>
        <FooterList title="Services" items={categories.map((c) => ({ href: `/${c.slug}`, label: c.name }))} />
        {cities.length > 0 && <FooterList title="Areas we serve" items={cities.map((c) => ({ href: `/makeup-artist-in-${c.slug}`, label: `Makeup artist in ${c.name}` }))} />}
        <FooterList title="Company" items={[{ href: "/about", label: "About" }, { href: "/blog", label: "Blog" }, { href: "/contact", label: "Contact" }, { href: "/privacy-policy", label: "Privacy policy" }, { href: "/terms", label: "Terms" }]} />
      </div>
      <p className="mx-auto mt-12 w-full max-w-6xl px-5 text-xs text-blush-300 sm:px-8">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-gold-300">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {items.map((i) => <li key={i.href}><Link href={i.href} className="text-blush-100 hover:text-white hover:underline">{i.label}</Link></li>)}
      </ul>
    </div>
  );
}

/** Mobile sticky bar. Book always; WhatsApp / Call only when a number is configured. */
export function StickyBar({ whatsapp, phone, waText }: Pick<Common, "whatsapp" | "phone" | "waText">) {
  const wa = whatsappLink(whatsapp, waText ?? undefined);
  const tel = telLink(phone);
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-ivory/95 p-3 backdrop-blur lg:hidden">
      <ButtonLink href="#book" className="flex-1">Book now</ButtonLink>
      {wa && <ButtonLink href={wa} variant="whatsapp" className="flex-1">WhatsApp</ButtonLink>}
      {tel && <ButtonLink href={tel} variant="outline" className="flex-1">Call</ButtonLink>}
    </div>
  );
}
