import { prisma } from "@herrglow/db";
import { MIN_PROS_FOR_SERVICE_CITY } from "./thresholds";

const rupees = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export interface DraftSummary { generated: string[]; skippedBelowThreshold: string[]; keptPublished: string[] }

/**
 * Builds DRAFT service×city content from real data only (pros covering the city, prices, areas covered,
 * demand from leads). Never overwrites PUBLISHED content. Priority: top-N services by lead count × active cities.
 * A human reviews and publishes; nothing here goes live on its own.
 */
export async function generateServiceCityDrafts(topN = 15): Promise<DraftSummary> {
  const out: DraftSummary = { generated: [], skippedBelowThreshold: [], keptPublished: [] };
  const services = await prisma.service.findMany({
    where: { status: "ACTIVE", mergedIntoId: null },
    orderBy: [{ leadCount: "desc" }, { title: "asc" }],
    take: topN,
    include: { variants: { orderBy: { sortOrder: "asc" } } },
  });
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    include: { areas: { where: { status: "ACTIVE" }, include: { coverage: { include: { pro: { select: { id: true, status: true } } } } } } },
  });
  for (const city of cities) {
    const proIds = new Set<string>();
    for (const a of city.areas) for (const cv of a.coverage) if (cv.pro.status === "ACTIVE") proIds.add(cv.proId);

    for (const svc of services) {
      const key = `${svc.slug} × ${city.slug}`;
      const offering = await prisma.proService.findMany({
        where: { serviceId: svc.id, proId: { in: [...proIds] } },
        include: { pro: { select: { experienceYears: true } } },
      });
      if (offering.length < MIN_PROS_FOR_SERVICE_CITY) { out.skippedBelowThreshold.push(`${key} (${offering.length} pro)`); continue; }

      const existing = await prisma.serviceCity.findUnique({ where: { serviceId_cityId: { serviceId: svc.id, cityId: city.id } } });
      if (existing?.contentStatus === "PUBLISHED") { out.keptPublished.push(key); continue; }

      const offeringIds = new Set(offering.map((o) => o.proId));
      const areas = city.areas.filter((a) => a.coverage.some((cv) => offeringIds.has(cv.proId))).map((a) => a.name).sort();
      const shown = areas.slice(0, 14);
      const prices = [
        ...svc.variants.map((v) => Number(v.offerPrice ?? v.price ?? NaN)),
        Number(svc.offerPrice ?? svc.price ?? NaN),
        ...offering.map((o) => Number(o.price ?? NaN)),
        ...(existing?.priceOverride ? [Number(existing.priceOverride)] : []),
      ].filter((n) => Number.isFinite(n) && n > 0);
      const lo = prices.length ? Math.min(...prices) : null;
      const hi = prices.length ? Math.max(...prices) : null;
      const exp = Math.max(0, ...offering.map((o) => o.pro.experienceYears ?? 0));
      const popular = svc.leadCount >= 5;
      const priceText = lo == null ? "" : lo === hi ? rupees(lo) : `${rupees(lo)} to ${rupees(hi!)}`;

      const html = [
        `<p>${esc(svc.title)} at home in ${esc(city.name)}: ${offering.length} verified HerrGlow artists cover ${areas.length} localities across ${esc(city.name)}${exp ? `, with up to ${exp} years of professional experience on the team` : ""}.${popular ? " It is one of the most requested services by our customers." : ""}</p>`,
        priceText
          ? `<h2>${esc(svc.title)} price in ${esc(city.name)}</h2><p>Prices start from ${rupees(lo!)}${hi !== lo ? ` and go up to ${rupees(hi!)} depending on the option you pick` : ""}. ${svc.variants.length ? "Options: " + svc.variants.map((v) => esc(v.name)).join(", ") + "." : ""}</p>`
          : "",
        `<h2>Areas in ${esc(city.name)} where this is available</h2><p>${shown.map(esc).join(", ")}${areas.length > shown.length ? ` and ${areas.length - shown.length} more localities` : ""}.</p>`,
      ].filter(Boolean).join("\n");

      const faqs = [
        { question: `Which areas of ${city.name} do you cover for ${svc.title.toLowerCase()}?`, answer: `Our artists currently cover ${shown.join(", ")}${areas.length > shown.length ? " and more" : ""}. Enter your area or pincode while booking to confirm.` },
        ...(priceText ? [{ question: `How much does ${svc.title.toLowerCase()} cost in ${city.name}?`, answer: `${priceText}. The final price depends on the option selected and is confirmed before your booking.` }] : []),
        { question: `Does the artist come to my home in ${city.name}?`, answer: "Yes. All HerrGlow services are provided at your home or venue in the areas we cover." },
      ];

      await prisma.serviceCity.upsert({
        where: { serviceId_cityId: { serviceId: svc.id, cityId: city.id } },
        update: { localContent: html, faqs, contentStatus: "DRAFT", generatedAt: new Date() },
        create: { serviceId: svc.id, cityId: city.id, localContent: html, faqs, contentStatus: "DRAFT", generatedAt: new Date() },
      });
      out.generated.push(key);
    }
  }
  return out;
}
