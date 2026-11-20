import { SiteFooter, SiteHeader, StickyBar } from "@/components/chrome";
import { getCategories, getLiveCities, getSettings } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, cities, s] = await Promise.all([getCategories(), getLiveCities(), getSettings()]);
  const common = { categories, cities, siteName: s.siteName, whatsapp: s.whatsappNumber, phone: s.contactPhone, waText: s.raw.whatsapp_prefill_text };
  return (
    <>
      <SiteHeader {...common} />
      <main>{children}</main>
      <SiteFooter {...common} />
      <StickyBar {...common} />
    </>
  );
}
