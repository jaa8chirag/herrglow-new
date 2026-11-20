import { SiteFooter, SiteHeader, StickyBar } from "@/components/chrome";
import { getCategories, getLiveCities, getSettings } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, cities, s] = await Promise.all([getCategories(), getLiveCities(), getSettings()]);
  const common = { categories, cities, siteName: s.siteName, whatsapp: s.whatsappNumber, phone: s.contactPhone, waText: s.raw.whatsapp_prefill_text };
  // opt-in only: legacy offer text from the old site is stored but never shown unless an admin enables the strip
  const strip = s.raw.offer_strip_enabled === "1" && s.raw.offer_strip_text?.trim() ? s.raw.offer_strip_text.trim() : null;
  return (
    <>
      {strip && <p className="bg-plum-800 px-4 py-2 text-center text-sm text-ivory">{strip}</p>}
      <SiteHeader {...common} />
      <main>{children}</main>
      <SiteFooter {...common} />
      <StickyBar {...common} />
    </>
  );
}
