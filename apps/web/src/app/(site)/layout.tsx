import { getPopularServices } from "@herrglow/core";
import { SmoothScroll, Toaster } from "@herrglow/ui";
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
  const [categories, cities, s, mega, popular, keys] = await Promise.all([getCategories(), getLiveCities(), getSettings(), getMegaMenu(), getPopularServices(6), getMediaKeys()]);

  // menu order: Makeup, Bridal (virtual group of bridal services), then the remaining categories
  const toCat = (slug: string, name: string, href: string, svcs: typeof mega.bridal): MenuCat => ({
    slug, name, href, services: svcs.slice(0, 5).map((x) => ({ slug: x.slug, title: x.title })),
    featured: svcs[0] ? { slug: svcs[0].slug, title: svcs[0].title, image: realImage(keys, svcs[0].image) } : null,
  });
  const cats = mega.categories.map((c) => toCat(c.slug, c.name, `/${c.slug}`, c.services));
  const makeup = cats.find((c) => c.slug === "makeup");
  const menu = [...(makeup ? [makeup] : []), ...(mega.bridal.length ? [toCat("bridal", "Bridal", "/makeup", mega.bridal)] : []), ...cats.filter((c) => c.slug !== "makeup")];

  // opt-in only: legacy offer text from the old site is stored but never shown unless an admin enables the strip
  const strip = s.raw.offer_strip_enabled === "1" && s.raw.offer_strip_text?.trim() ? s.raw.offer_strip_text.trim() : null;
  const socials = [["Instagram", s.raw.social_instagram], ["Facebook", s.raw.social_facebook], ["YouTube", s.raw.social_youtube]].filter((x): x is [string, string] => !!x[1]?.trim()).map(([label, href]) => ({ label, href }));
  const logo = realImage(keys, s.raw.site_logo);

  return (
    <>
      <SmoothScroll />
      <Toaster />
      {strip && <AnnouncementBar text={strip} />}
      <SiteHeader siteName={s.siteName} logo={logo} menu={menu} cities={cities} />
      <main>{children}</main>
      <SiteFooter siteName={s.siteName} categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} cities={cities} popular={popular.map((p) => ({ slug: p.slug, title: p.title }))} whatsapp={s.whatsappNumber} phone={s.contactPhone} email={s.contactEmail} waText={s.raw.whatsapp_prefill_text} socials={socials} />
      <StickyDock whatsapp={s.whatsappNumber} phone={s.contactPhone} waText={s.raw.whatsapp_prefill_text} />
    </>
  );
}
