"use client";

import { ArrowRight, ChevronDown, Menu, MapPin, X, ShieldCheck, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Drawer, DrawerShell, FallbackArt, buttonStyles, categoryIcon, cn } from "@herrglow/ui";
import { Logo } from "@/components/brand/Logo";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";

const cityHubUrl = (slug: string) => `/salon-at-home-${slug}`;

export interface MenuCat {
  slug: string;
  name: string;
  href: string;
  services: { slug: string; title: string; group?: string }[];
  featured: { slug: string; title: string; image: string | null } | null;
}
export interface HeaderProps {
  siteName: string;
  logo: string | null;
  menu: MenuCat[];
  cities: { slug: string; name: string }[];
}

const NAV = [
  { href: "/", label: "Home" },
  { href: "/packages", label: "Packages" },
  { href: "/custom-combo", label: "Make a Combo" },
  { href: "/blog", label: "Blogs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Scrolls to the on-page booking form when there is one, otherwise goes to the contact page's form. */
function useBook() {
  const router = useRouter();
  return (e: React.MouseEvent) => {
    const el = document.getElementById("book");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(
        () =>
          el.querySelector<HTMLElement>("input,select,textarea")?.focus({ preventScroll: true }),
        600
      );
    } else {
      e.preventDefault();
      router.push("/contact#book");
    }
  };
}

export function SiteHeader({ siteName, logo, menu, cities }: HeaderProps) {
  const path = usePathname();
  const isHome = path === "/";
  const book = useBook();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [city, setCity] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [active, setActive] = useState(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    setMega(false);
    setCity(false);
  }, [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMega(false);
        setCity(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-city-menu]")) setCity(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, []);

  const solid = scrolled || !isHome || mega;
  const open = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(true);
  };
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setMega(false), 140);
  };
  const cur = menu[active] ?? menu[0];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background,box-shadow,border-color] duration-300",
        isHome && "-mb-20",
        solid
          ? "border-b border-line bg-ivory/85 shadow-soft backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
      onMouseLeave={closeSoon}
    >
      <div className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8">
        {logo ? (
          <Link href="/" aria-label={`${siteName} home`} className="flex shrink-0 items-center">
            <Image
              src={logo}
              alt={siteName}
              width={180}
              height={44}
              className="h-9 sm:h-10 w-auto"
              priority
            />
          </Link>
        ) : (
          <Logo size="md" />
        )}

        <nav aria-label="Main" className="hidden items-center gap-1 text-[0.95rem] lg:flex">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-ink-soft transition hover:bg-blush-100 hover:text-plum-800"
          >
            Home
          </Link>
          <div onMouseEnter={open}>
            <button
              type="button"
              aria-expanded={mega}
              aria-haspopup="true"
              onClick={() => setMega((m) => !m)}
              onFocus={open}
              className={cn(
                "flex items-center gap-1 rounded-full px-4 py-2 transition hover:bg-blush-100 hover:text-plum-800",
                mega ? "bg-blush-100 text-plum-800" : "text-ink-soft"
              )}
            >
              Services{" "}
              <ChevronDown className={cn("size-4 transition-transform", mega && "rotate-180")} />
            </button>
          </div>
          {NAV.slice(1).map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-4 py-2 text-ink-soft transition hover:bg-blush-100 hover:text-plum-800"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop Search Trigger */}
          <button
            type="button"
            data-search-trigger
            onClick={() => setSearchOpen(true)}
            aria-label="Search services"
            className="hidden sm:flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-2 text-sm text-ink-soft transition hover:border-plum-400 hover:bg-white hover:text-plum-900 shadow-xs active:scale-95 cursor-pointer"
          >
            <Search className="size-4 text-rose-600" />
            <span className="hidden xl:inline text-xs font-medium text-ink-soft">
              Search services...
            </span>
            <kbd className="hidden xl:inline-flex items-center rounded border border-line/70 bg-blush-50 px-1.5 py-0.5 text-[10px] font-semibold text-plum-800">
              ⌘K
            </kbd>
          </button>

          {/* Mobile Search Button */}
          <button
            type="button"
            data-search-trigger
            onClick={() => setSearchOpen(true)}
            aria-label="Search services"
            className="grid size-12 place-items-center rounded-full border border-line bg-white/80 text-plum-900 lg:hidden shadow-xs hover:bg-blush-50 active:scale-95 cursor-pointer"
          >
            <Search className="size-5 text-rose-600" />
          </button>

          {cities.length > 0 && (
            <div className="relative hidden md:block" data-city-menu>
              <button
                type="button"
                aria-expanded={city}
                onClick={() => setCity((c) => !c)}
                className="flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-3.5 py-2 text-sm text-plum-800 transition hover:bg-white"
              >
                <MapPin className="size-4 text-rose-600" /> Delhi NCR{" "}
                <ChevronDown className="size-3.5" />
              </button>
              {city && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-ivory p-2 shadow-lift">
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-rose-700">
                    Choose your city
                  </p>
                  {cities.map((c) => (
                    <Link
                      key={c.slug}
                      href={cityHubUrl(c.slug)}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-ink hover:bg-blush-100"
                    >
                      {c.name}
                      <ArrowRight className="size-4 text-rose-600" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          <Link
            href="/contact#book"
            onClick={book}
            className={cn(
              buttonStyles({ variant: "shimmer", size: "sm" }),
              "hidden sm:inline-flex"
            )}
          >
            Book Now
          </Link>

          {/* mobile: full-screen drawer */}
          <Drawer.Root direction="right">
            <Drawer.Trigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="grid size-12 place-items-center rounded-full border border-line bg-white/80 text-plum-900 lg:hidden shadow-xs hover:bg-blush-50 active:scale-95"
              >
                <Menu className="size-5" />
              </button>
            </Drawer.Trigger>
            <DrawerShell title="Menu" direction="right">
              <div className="flex h-full flex-col overflow-y-auto">
                <div className="flex h-20 shrink-0 items-center justify-between px-5">
                  <Logo size="sm" withLink={false} />
                  <Drawer.Close asChild>
                    <button
                      type="button"
                      aria-label="Close menu"
                      className="grid size-12 place-items-center rounded-full border border-line text-plum-900 hover:bg-blush-50"
                    >
                      <X className="size-5" />
                    </button>
                  </Drawer.Close>
                </div>
                <div className="gold-rule mx-5" />
                <div className="mx-5 my-3 flex items-center gap-2 rounded-xl border border-emerald-300/60 bg-emerald-50/70 p-2.5 text-xs text-emerald-900 font-medium">
                  <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                  <span>100% Female Verified · 10% Advance · 100% Refund Guarantee</span>
                </div>
                {/* Search Bar inside Drawer */}
                <div className="mx-5 mb-2">
                  <Drawer.Close asChild>
                    <button
                      type="button"
                      onClick={() => setSearchOpen(true)}
                      className="flex w-full items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-2.5 text-left text-sm text-ink-soft shadow-xs hover:border-plum-400 hover:bg-blush-50 transition cursor-pointer"
                    >
                      <Search className="size-4 text-rose-600 shrink-0" />
                      <span className="text-xs">Search Rica wax, facial, bridal...</span>
                    </button>
                  </Drawer.Close>
                </div>
                <nav className="flex-1 space-y-1 p-5" aria-label="Mobile">
                  <Drawer.Close asChild>
                    <Link
                      href="/"
                      className="flex items-center min-h-[48px] rounded-xl px-3 py-3 font-serif text-2xl text-plum-800"
                    >
                      Home
                    </Link>
                  </Drawer.Close>
                  <details className="group rounded-xl">
                    <summary className="flex cursor-pointer list-none items-center justify-between min-h-[48px] rounded-xl px-3 py-3 font-serif text-2xl text-plum-800">
                      Services{" "}
                      <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-1 space-y-1 pb-2 pl-2">
                      {menu.map((c) => {
                        const Icon = categoryIcon(c.slug);
                        const hasGroups = c.services.some((s) => !!s.group);
                        const groups = hasGroups
                          ? Array.from(new Set(c.services.map((s) => s.group || "Services"))).map(
                              (g) => ({
                                title: g,
                                items: c.services.filter((s) => (s.group || "Services") === g),
                              })
                            )
                          : [];

                        return (
                          <details key={c.slug} className="group/c rounded-xl bg-blush-50">
                            <summary className="flex cursor-pointer list-none items-center gap-3 min-h-[44px] px-3 py-2.5 text-base font-medium text-plum-800">
                              <Icon className="size-5 text-rose-600" />
                              {c.name}
                              <ChevronDown className="ml-auto size-4 transition-transform group-open/c:rotate-180" />
                            </summary>
                            {hasGroups ? (
                              <div className="space-y-3 px-3 pb-3">
                                {groups.map((grp) => (
                                  <div key={grp.title} className="space-y-0.5">
                                    <p className="px-2 pt-1 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-700">
                                      {grp.title}
                                    </p>
                                    <ul className="space-y-0.5">
                                      {grp.items.map((s) => (
                                        <li key={s.slug}>
                                          <Drawer.Close asChild>
                                            <Link
                                              href={`/services/${s.slug}`}
                                              className="flex items-center min-h-[40px] rounded-lg px-2.5 py-1.5 text-sm text-ink-soft hover:bg-white active:bg-white"
                                            >
                                              {s.title}
                                            </Link>
                                          </Drawer.Close>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                                <div className="pt-1.5 border-t border-blush-200/70">
                                  <Drawer.Close asChild>
                                    <Link
                                      href={c.href}
                                      className="flex items-center min-h-[40px] rounded-lg px-2.5 py-2 font-medium text-rose-700 hover:bg-white"
                                    >
                                      View all {c.name.toLowerCase()} →
                                    </Link>
                                  </Drawer.Close>
                                </div>
                              </div>
                            ) : (
                              <ul className="space-y-0.5 px-3 pb-3">
                                {c.services.map((s) => (
                                  <li key={s.slug}>
                                    <Drawer.Close asChild>
                                      <Link
                                        href={`/services/${s.slug}`}
                                        className="flex items-center min-h-[40px] rounded-lg px-3 py-2 text-ink-soft hover:bg-white"
                                      >
                                        {s.title}
                                      </Link>
                                    </Drawer.Close>
                                  </li>
                                ))}
                                <li>
                                  <Drawer.Close asChild>
                                    <Link
                                      href={c.href}
                                      className="flex items-center min-h-[40px] rounded-lg px-3 py-2 font-medium text-rose-700"
                                    >
                                      View all {c.name.toLowerCase()} →
                                    </Link>
                                  </Drawer.Close>
                                </li>
                              </ul>
                            )}
                          </details>
                        );
                      })}
                    </div>
                  </details>
                  {NAV.slice(1).map((n) => (
                    <Drawer.Close key={n.href} asChild>
                      <Link
                        href={n.href}
                        className="flex items-center min-h-[48px] rounded-xl px-3 py-3 font-serif text-2xl text-plum-800"
                      >
                        {n.label}
                      </Link>
                    </Drawer.Close>
                  ))}
                  {cities.length > 0 && (
                    <div className="pt-4">
                      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-rose-700">
                        Service Cities
                      </p>
                      <div className="flex flex-wrap gap-2 px-1">
                        {cities.map((c) => (
                          <Drawer.Close key={c.slug} asChild>
                            <Link
                              href={cityHubUrl(c.slug)}
                              className="flex items-center min-h-[44px] rounded-full border border-line bg-white px-4 py-2 text-sm text-plum-800"
                            >
                              {c.name}
                            </Link>
                          </Drawer.Close>
                        ))}
                      </div>
                    </div>
                  )}
                </nav>
                <div className="mx-5 mb-2 rounded-2xl border border-blush-200 bg-blush-50/70 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-plum-950 font-medium">
                    <span>Call / WhatsApp:</span>
                    <a
                      href="tel:+919319260069"
                      className="font-bold text-rose-700 underline hover:text-rose-800"
                    >
                      +91 9319260069
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-plum-950 font-medium">
                    <span>Email:</span>
                    <a
                      href="mailto:herrglow77@gmail.com"
                      className="font-bold text-rose-700 underline hover:text-rose-800"
                    >
                      herrglow77@gmail.com
                    </a>
                  </div>
                </div>
                <div className="shrink-0 p-5 pt-0">
                  <Drawer.Close asChild>
                    <Link
                      href="/contact#book"
                      onClick={book}
                      className={cn(
                        buttonStyles({ variant: "shimmer", size: "lg" }),
                        "w-full min-h-12 text-base font-bold"
                      )}
                    >
                      Book Appointment
                    </Link>
                  </Drawer.Close>
                </div>
              </div>
            </DrawerShell>
          </Drawer.Root>
        </div>
      </div>

      {/* mega menu (desktop) */}
      {mega && cur && (
        <div
          className="absolute inset-x-0 top-full hidden border-b border-line bg-ivory shadow-lift lg:block"
          onMouseEnter={open}
          role="region"
          aria-label="Services menu"
        >
          <div className="mx-auto grid max-w-[1400px] grid-cols-[260px_1fr_320px] gap-8 px-8 py-8">
            <ul className="space-y-1">
              {menu.map((c, i) => {
                const Icon = categoryIcon(c.slug);
                return (
                  <li key={c.slug}>
                    <Link
                      href={c.href}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 transition",
                        i === active
                          ? "bg-blush-100 text-plum-800"
                          : "text-ink-soft hover:bg-blush-50"
                      )}
                    >
                      <Icon className="size-5 text-rose-600" strokeWidth={1.5} />{" "}
                      <span className="font-medium">{c.name}</span>{" "}
                      <ArrowRight
                        className={cn(
                          "ml-auto size-4 transition",
                          i === active ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Popular in {cur.name}
              </p>
              {cur.services.some((s) => !!s.group) ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from(new Set(cur.services.map((s) => s.group || "Services"))).map(
                    (grpName) => {
                      const items = cur.services.filter((s) => (s.group || "Services") === grpName);
                      return (
                        <div key={grpName} className="space-y-1">
                          <p className="border-b border-blush-200/80 px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-plum-900">
                            {grpName}
                          </p>
                          <ul className="space-y-0.5">
                            {items.map((s) => (
                              <li key={s.slug}>
                                <Link
                                  href={`/services/${s.slug}`}
                                  className="group flex items-center justify-between rounded-xl px-2.5 py-1.5 text-sm text-ink hover:bg-blush-50"
                                >
                                  <span className="line-clamp-1">{s.title}</span>
                                  <ArrowRight className="size-3.5 -translate-x-1 text-rose-600 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 shrink-0" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <ul className="space-y-1">
                  {cur.services.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-ink hover:bg-blush-50"
                      >
                        <span>{s.title}</span>
                        <ArrowRight className="size-4 -translate-x-1 text-rose-600 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={cur.href}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-rose-700 underline-offset-4 hover:underline"
              >
                View all {cur.name.toLowerCase()} <ArrowRight className="size-4" />
              </Link>
            </div>
            {cur.featured && (
              <Link
                href={`/services/${cur.featured.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-[1.5rem]"
              >
                {cur.featured.image ? (
                  <Image
                    src={cur.featured.image}
                    alt={cur.featured.title}
                    fill
                    sizes="320px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <FallbackArt kind={cur.slug} seed={active} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-plum-900/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <span className="rounded-full bg-gold-400 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-plum-900">
                    Featured
                  </span>
                  <p className="mt-2 font-serif text-xl leading-tight text-ivory">
                    {cur.featured.title}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Global Search Spotlight Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
