import { getPopularServices } from "@herrglow/core";
import { MotionProvider, SmoothScroll, Toaster } from "@herrglow/ui";
import { BackToTop } from "@/components/chrome/BackToTop";
import { AnnouncementBar } from "@/components/chrome/AnnouncementBar";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteHeader, type MenuCat } from "@/components/chrome/SiteHeader";
import { StickyDock } from "@/components/chrome/StickyDock";
import { getCategories, getLiveCities, getMediaKeys, getMegaMenu, getSettings } from "@/lib/data";
import { realImage } from "@/lib/media";

// Rendered per request (Cloudflare caches the HTML at the edge). This keeps `next build` independent of the database,
// so the same build works in Docker, Vercel and CI.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, cities, s, mega, popular, keys] = await Promise.all([
    getCategories(),
    getLiveCities(),
    getSettings(),
    getMegaMenu(),
    getPopularServices(6),
    getMediaKeys(),
  ]);

  // Category items for mega-menu
  const toCat = (
    slug: string,
    name: string,
    href: string,
    svcs: { slug: string; title: string; image: string | null }[]
  ): MenuCat => {
    const isMakeup = slug === "makeup" || slug.includes("bridal") || slug.includes("party");
    if (isMakeup) {
      const isPartyOrFamily = (title: string, sSlug: string) => {
        const t = `${title} ${sSlug}`.toLowerCase();
        // If it specifically targets family, bridesmaids, sisters, or guests, it is non-bridal
        const isFamilyOrGuest =
          t.includes("bridesmaid") ||
          t.includes("sister") ||
          t.includes("mother") ||
          t.includes("family") ||
          t.includes("group") ||
          t.includes("guest");
        if (isFamilyOrGuest) return true;

        // Otherwise, if it mentions bridal/bride, it belongs to the bride
        if (t.includes("bridal") || t.includes("bride")) return false;

        // General party, sangeet, cocktail, non-bridal hair styling, and general draping
        return (
          t.includes("party") ||
          t.includes("sangeet") ||
          t.includes("cocktail") ||
          t.includes("draping") ||
          t.includes("hair")
        );
      };

      // Exclude localized landing slugs/titles (e.g., " in Gaur City") from top navigation
      const validSvcs = svcs.filter((s) => !s.title.includes(" in "));

      const bridal = validSvcs.filter((s) => !isPartyOrFamily(s.title, s.slug));
      const nonBridal = validSvcs.filter((s) => isPartyOrFamily(s.title, s.slug));

      // Curated ranking for bridal navigation: Complete signature bridal first, then HD, then Airbrush, then Bridal trial/artist
      const bridalPriority = (sSlug: string) => {
        if (sSlug.includes("complete-bridal")) return 1;
        if (sSlug.includes("hd-bridal")) return 2;
        if (sSlug.includes("airbrush-bridal")) return 3;
        if (sSlug.includes("bridal-makeup-artist")) return 4;
        if (sSlug.includes("trial")) return 5;
        return 10;
      };
      const sortedBridal = [...bridal].sort(
        (a, b) => bridalPriority(a.slug) - bridalPriority(b.slug)
      );

      // Curated ranking for non-bridal navigation: Party makeup & hair, then bridesmaid & family, then sangeet & glam, then draping
      const nonBridalPriority = (sSlug: string) => {
        if (sSlug === "party-makeup-and-hair") return 1;
        if (sSlug.includes("bridesmaid")) return 2;
        if (sSlug.includes("sangeet") || sSlug.includes("family-glam")) return 3;
        if (sSlug.includes("saree") || sSlug.includes("draping")) return 4;
        if (sSlug === "hd-party-makeup") return 5;
        return 10;
      };
      const sortedNonBridal = [...nonBridal].sort(
        (a, b) => nonBridalPriority(a.slug) - nonBridalPriority(b.slug)
      );

      const services = [
        ...sortedBridal
          .slice(0, 4)
          .map((x) => ({ slug: x.slug, title: x.title, group: "👰 For The Bride (Bridal)" })),
        ...sortedNonBridal
          .slice(0, 4)
          .map((x) => ({
            slug: x.slug,
            title: x.title,
            group: "✨ Non-Bridal (Bridesmaids, Mother & Sister)",
          })),
      ];

      return {
        slug,
        name,
        href,
        services,
        featured: svcs[0]
          ? { slug: svcs[0].slug, title: svcs[0].title, image: realImage(keys, svcs[0].image) }
          : null,
      };
    }

    return {
      slug,
      name,
      href,
      services: svcs.slice(0, 5).map((x) => ({ slug: x.slug, title: x.title })),
      featured: svcs[0]
        ? { slug: svcs[0].slug, title: svcs[0].title, image: realImage(keys, svcs[0].image) }
        : null,
    };
  };
  const menu = mega.categories.map((c) => toCat(c.slug, c.name, `/services/${c.slug}`, c.services));

  // Luxury trust tagline banner (shown by default or replaced by custom offer from admin settings)
  const strip =
    s.raw.offer_strip_enabled === "1" && s.raw.offer_strip_text?.trim()
      ? s.raw.offer_strip_text.trim()
      : "Delhi NCR's Most Trusted Luxury Doorstep Salon & Bridal Artistry · 100% Female Verified · 100% Authentic Products · 10% Advance (100% Refund Guarantee)";
  const socials = [
    ["Instagram", s.raw.social_instagram],
    ["Facebook", s.raw.social_facebook],
    ["YouTube", s.raw.social_youtube],
  ]
    .filter((x): x is [string, string] => !!x[1]?.trim())
    .map(([label, href]) => ({ label, href }));
  const logo = realImage(keys, s.raw.site_logo);

  return (
    <MotionProvider>
      <SmoothScroll />
      <Toaster />
      {strip && <AnnouncementBar text={strip} />}
      <SiteHeader siteName={s.siteName} logo={logo} menu={menu} cities={cities} />
      <main>{children}</main>
      <SiteFooter
        siteName={s.siteName}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        cities={cities}
        popular={popular.map((p) => ({ slug: p.slug, title: p.title }))}
        whatsapp={s.whatsappNumber}
        phone={s.contactPhone}
        email={s.contactEmail}
        waText={s.raw.whatsapp_prefill_text}
        socials={socials}
      />
      <BackToTop />
      <StickyDock
        whatsapp={s.whatsappNumber}
        phone={s.contactPhone}
        waText={s.raw.whatsapp_prefill_text}
      />
    </MotionProvider>
  );
}
