import { prisma } from "@herrglow/db";
import { MIN_PROS_FOR_CITY_HUB, MIN_PROS_FOR_SERVICE_CITY } from "./index";

export const MIN_AREA_LANDMARKS = 3;
export const MIN_PRO_BIO_CHARS = 200;

export interface CityPlan {
  city: string;
  slug: string;
  activePros: number;
  cityHub: boolean;
  /** service×city pairs with ≥ MIN_PROS_FOR_SERVICE_CITY active pros in the city */
  serviceCityByPros: number;
  /** …of which also have city-specific content (ServiceCity.localContent) */
  serviceCityLive: number;
  areasTotal: number;
  /** areas covered by ≥1 active pro, with real local content */
  areaPages: number;
  proPages: number;
}

/** Pure(ish) planner: decides which pages deserve to exist. Used by preview now, Page-model sync + sitemaps later. */
export async function planPages(): Promise<CityPlan[]> {
  const cities = await prisma.city.findMany({
    include: {
      areas: { where: { status: "ACTIVE" }, include: { coverage: { include: { pro: { select: { id: true, status: true } } } } } },
      services: { where: { active: true } },
    },
    orderBy: { name: "asc" },
  });
  const proServices = await prisma.proService.findMany({ where: { pro: { status: "ACTIVE" }, service: { status: "ACTIVE", mergedIntoId: null } }, select: { proId: true, serviceId: true } });
  const servicesByPro = new Map<string, Set<string>>();
  for (const ps of proServices) (servicesByPro.get(ps.proId) ?? servicesByPro.set(ps.proId, new Set()).get(ps.proId)!).add(ps.serviceId);
  const pros = await prisma.pro.findMany({ where: { status: "ACTIVE" }, select: { id: true, photo: true, bio: true } });
  const proOk = new Map(pros.map((p) => [p.id, !!p.photo && (p.bio?.length ?? 0) >= MIN_PRO_BIO_CHARS]));

  const plans: CityPlan[] = [];
  for (const c of cities) {
    const cityPros = new Set<string>();
    for (const a of c.areas) for (const cov of a.coverage) if (cov.pro.status === "ACTIVE") cityPros.add(cov.proId);
    const cityHub = cityPros.size >= MIN_PROS_FOR_CITY_HUB;

    let byPros = 0, live = 0;
    for (const sc of c.services) {
      const n = [...cityPros].filter((p) => servicesByPro.get(p)?.has(sc.serviceId)).length;
      if (n >= MIN_PROS_FOR_SERVICE_CITY) { byPros++; if (sc.localContent && sc.localContent.length > 200) live++; }
    }
    const areaPages = c.areas.filter(
      (a) => a.coverage.some((cv) => cv.pro.status === "ACTIVE") && a.landmarks.length >= MIN_AREA_LANDMARKS && !!a.content,
    ).length;
    plans.push({
      city: c.name, slug: c.slug, activePros: cityPros.size, cityHub,
      serviceCityByPros: cityHub ? byPros : 0, serviceCityLive: cityHub ? live : 0,
      areasTotal: c.areas.length, areaPages: cityHub ? areaPages : 0,
      proPages: [...cityPros].filter((p) => proOk.get(p)).length,
    });
  }
  return plans;
}
