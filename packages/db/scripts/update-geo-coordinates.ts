import { prisma } from "../src";

const AREA_COORDINATES: Record<
  string,
  { lat: number; lng: number; sector?: string; radiusKm?: number }
> = {
  "sector-62-noida": { lat: 28.6271, lng: 77.3725, sector: "Sector 62", radiusKm: 6 },
  "sector-18-noida": { lat: 28.5708, lng: 77.326, sector: "Sector 18", radiusKm: 6 },
  "sector-50-noida": { lat: 28.5729, lng: 77.3686, sector: "Sector 50", radiusKm: 6 },
  "sector-76-noida": { lat: 28.567, lng: 77.382, sector: "Sector 76", radiusKm: 6 },
  "sector-137-noida": { lat: 28.513, lng: 77.4042, sector: "Sector 137", radiusKm: 8 },
  "gaur-city-1": { lat: 28.608, lng: 77.429, sector: "Gaur City 1", radiusKm: 5 },
  "gaur-city-2": { lat: 28.614, lng: 77.442, sector: "Gaur City 2", radiusKm: 5 },
  "sector-1": { lat: 28.591, lng: 77.448, sector: "Sector 1", radiusKm: 5 },
  "pari-chowk": { lat: 28.4682, lng: 77.51, sector: "Pari Chowk", radiusKm: 10 },
  "south-delhi": { lat: 28.5244, lng: 77.2167, sector: "South Delhi", radiusKm: 12 },
  "vasant-kunj": { lat: 28.5293, lng: 77.1539, sector: "Vasant Kunj", radiusKm: 8 },
  "lajpat-nagar": { lat: 28.5677, lng: 77.2433, sector: "Lajpat Nagar", radiusKm: 7 },
  dwarka: { lat: 28.5921, lng: 77.046, sector: "Dwarka", radiusKm: 10 },
  rohini: { lat: 28.7495, lng: 77.0565, sector: "Rohini", radiusKm: 10 },
};

const PRO_LOCATIONS: Record<
  string,
  { lat: number; lng: number; radiusKm: number; address: string; phone: string }
> = {
  "sunita-rawat": {
    lat: 28.6271,
    lng: 77.3725,
    radiusKm: 12,
    address: "Block B, Sector 62, Noida",
    phone: "9876543211",
  },
  "priyanka-verma": {
    lat: 28.5708,
    lng: 77.326,
    radiusKm: 15,
    address: "Atta Market, Sector 18, Noida",
    phone: "9876543210",
  },
  "neha-bisht": {
    lat: 28.5729,
    lng: 77.3686,
    radiusKm: 10,
    address: "Sector 50, Noida",
    phone: "9876543212",
  },
  "mehak-khurana": {
    lat: 28.5244,
    lng: 77.2167,
    radiusKm: 16,
    address: "Saket & South Delhi",
    phone: "9876543213",
  },
  "kritika-sharma": {
    lat: 28.5921,
    lng: 77.046,
    radiusKm: 15,
    address: "Sector 11, Dwarka, New Delhi",
    phone: "9876543214",
  },
};

async function main() {
  console.log("Updating Area coordinates...");
  for (const [slug, coords] of Object.entries(AREA_COORDINATES)) {
    const area = await prisma.area.findFirst({
      where: {
        OR: [
          { slug },
          { slug: { contains: slug.replace("-noida", "") } },
          { name: { contains: slug.replace(/-/g, " "), mode: "insensitive" } },
        ],
      },
    });

    if (area) {
      await prisma.area.update({
        where: { id: area.id },
        data: {
          latitude: coords.lat,
          longitude: coords.lng,
          sector: coords.sector ?? area.sector,
          radiusKm: coords.radiusKm ?? area.radiusKm,
        },
      });
      console.log(`✓ Updated Area: ${area.name} -> lat: ${coords.lat}, lng: ${coords.lng}`);
    } else {
      console.log(`- Area slug not found: ${slug}`);
    }
  }

  console.log("\nUpdating Pro coordinates and private locations...");
  for (const [slug, info] of Object.entries(PRO_LOCATIONS)) {
    const pro = await prisma.pro.findUnique({
      where: { slug },
      include: { private: true },
    });

    if (pro) {
      await prisma.proPrivate.upsert({
        where: { proId: pro.id },
        update: {
          latitude: info.lat,
          longitude: info.lng,
          travelRadius: info.radiusKm,
          addressLine: info.address,
          phone: info.phone,
        },
        create: {
          proId: pro.id,
          latitude: info.lat,
          longitude: info.lng,
          travelRadius: info.radiusKm,
          addressLine: info.address,
          phone: info.phone,
        },
      });
      console.log(`✓ Updated Pro: ${pro.name} -> base: ${info.address} (${info.lat}, ${info.lng})`);
    } else {
      console.log(`- Pro not found: ${slug}`);
    }
  }

  // Also update existing leads with coordinates based on their locationText if missing
  console.log("\nUpdating leads with coordinates...");
  const leads = await prisma.lead.findMany({
    where: { latitude: null },
  });

  for (const l of leads) {
    const text = (l.locationText || l.address || "").toLowerCase();
    let matchedCoords: { lat: number; lng: number } | null = null;
    let matchedAreaId: string | null = null;

    if (text.includes("62")) {
      matchedCoords = AREA_COORDINATES["sector-62-noida"];
    } else if (text.includes("gaur city")) {
      matchedCoords = AREA_COORDINATES["gaur-city-1"];
    } else if (text.includes("18")) {
      matchedCoords = AREA_COORDINATES["sector-18-noida"];
    } else if (text.includes("50")) {
      matchedCoords = AREA_COORDINATES["sector-50-noida"];
    } else if (text.includes("76")) {
      matchedCoords = AREA_COORDINATES["sector-76-noida"];
    } else if (text.includes("dwarka")) {
      matchedCoords = AREA_COORDINATES["dwarka"];
    } else if (text.includes("delhi") || text.includes("saket")) {
      matchedCoords = AREA_COORDINATES["south-delhi"];
    }

    if (matchedCoords) {
      const area = await prisma.area.findFirst({
        where: {
          latitude: matchedCoords.lat,
          longitude: matchedCoords.lng,
        },
      });
      matchedAreaId = area?.id ?? null;

      await prisma.lead.update({
        where: { id: l.id },
        data: {
          latitude: matchedCoords.lat,
          longitude: matchedCoords.lng,
          areaId: matchedAreaId ?? l.areaId,
        },
      });
      console.log(
        `✓ Updated Lead ${l.id} (${l.name}): matched coords (${matchedCoords.lat}, ${matchedCoords.lng})`
      );
    }
  }

  console.log("\nDone updating geo coordinates!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
