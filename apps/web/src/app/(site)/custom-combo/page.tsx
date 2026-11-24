import type { Metadata } from "next";
import { Container, Section } from "@herrglow/ui";
import { Breadcrumbs } from "@/components/parts";
import { CustomComboBuilder } from "@/components/services/CustomComboBuilder";
import { getLiveCities } from "@/lib/data";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Make Your Own Combo | Custom Doorstep Salon Package | HerrGlow",
  description:
    "Build your custom doorstep salon package. Choose from eyebrow threading, waxing, facial cleanups, and mani-pedi spa. Minimum order ₹499 with 100% Free Doorstep Travel across Delhi NCR.",
  path: "/custom-combo",
});

export default async function CustomComboPage() {
  const cities = await getLiveCities();

  return (
    <div className="bg-gradient-to-b from-blush-50/50 via-white to-ivory min-h-dvh pt-24 sm:pt-28 pb-16">
      <Container className="space-y-6">
        <Breadcrumbs
          items={[
            { name: "Packages", path: "/packages" },
            { name: "Make Your Own Combo", path: "/custom-combo" },
          ]}
        />

        <CustomComboBuilder cities={cities} />
      </Container>
    </div>
  );
}
