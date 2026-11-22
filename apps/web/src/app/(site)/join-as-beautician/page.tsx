import type { Metadata } from "next";
import { JoinBeauticianView } from "@/components/JoinBeauticianView";
import { getCategories, getLiveAreas, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: "Join HerrGlow as a Beautician or Makeup Artist",
  description: "Are you a professional beautician or makeup artist in Delhi NCR? Apply to join HerrGlow and receive booking requests from customers near you.",
  path: "/join-as-beautician",
});

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

  return (
    <JoinBeauticianView
      categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      areas={areas.map((a) => a.name)}
      whatsappNumber={settings.whatsappNumber || settings.contactPhone || undefined}
      initialLang={isHi ? "hi" : "en"}
    />
  );
}
