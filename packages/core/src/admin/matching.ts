import { prisma } from "@herrglow/db";
import { whatsappLink } from "../site/whatsapp";

export interface MatchedBeautician {
  id: string;
  name: string;
  slug: string;
  photo: string | null;
  phone: string;
  email: string | null;
  bio: string | null;
  landmark: string | null;
  pincode: string | null;
  travelRadius: number | null;
  basePrice: number | null;
  providerType: string | null;
  specialization: string | null;
  experienceYears: number | null;
  baseAddress: string | null;

  // Proximity & Distance
  distanceKm: number | null;
  distanceLabel: string;
  isHyperlocal: boolean;
  coversAreaDirectly: boolean;
  coverageAreas: string[];

  // Service & Capabilities
  serviceMatch: boolean;
  matchingServiceTitles: string[];
  allServiceTitles: string[];

  // Availability & Conflicts
  isAvailable: boolean;
  hasConflict: boolean;
  conflictDetails: string | null;
  existingBookingCountOnDate: number;

  // Score & Status
  matchScore: number;
  matchReasons: string[];
  badge: "TOP_RECOMMENDED" | "NEAREST" | "AVAILABLE" | "OUT_OF_RADIUS";
  isAssigned: boolean;

  // 1-Click WhatsApp Dispatch link
  dispatchWhatsAppUrl: string;
}

export interface LeadMatchingResult {
  lead: {
    id: string;
    bookingRef: string | null;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    locationText: string | null;
    areaName: string | null;
    latitude: number | null;
    longitude: number | null;
    eventDate: Date | null;
    timeSlot: string | null;
    serviceTitle: string;
    serviceSlug: string | null;
    status: string;
    proId: string | null;
    amount: number | null;
    finalAmount: number | null;
  };
  matches: MatchedBeautician[];
  assignedPro: MatchedBeautician | null;
}

/**
 * Calculates distance in kilometers between two coordinates using the Haversine formula.
 * Returns distance rounded to 1 decimal place.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const DEFAULT_COORDS: Record<string, { lat: number; lng: number }> = {
  "62": { lat: 28.6271, lng: 77.3725 },
  "18": { lat: 28.5708, lng: 77.326 },
  "50": { lat: 28.5729, lng: 77.3686 },
  "76": { lat: 28.567, lng: 77.382 },
  "137": { lat: 28.513, lng: 77.4042 },
  "gaur city": { lat: 28.608, lng: 77.429 },
  "dwarka": { lat: 28.5921, lng: 77.046 },
  "rohini": { lat: 28.7495, lng: 77.0565 },
  "south delhi": { lat: 28.5244, lng: 77.2167 },
  "saket": { lat: 28.5244, lng: 77.2167 },
  "vasant kunj": { lat: 28.5293, lng: 77.1539 },
  "lajpat nagar": { lat: 28.5677, lng: 77.2433 },
  "indirapuram": { lat: 28.6415, lng: 77.3713 },
  "vaishali": { lat: 28.6445, lng: 77.34 },
  "vasundhara": { lat: 28.6603, lng: 77.3729 },
  "gurgaon": { lat: 28.4817, lng: 77.089 },
};

function resolveEstimatedCoords(text: string): { lat: number; lng: number } | null {
  const lower = text.toLowerCase();
  for (const [key, coords] of Object.entries(DEFAULT_COORDS)) {
    if (lower.includes(key)) {
      return coords;
    }
  }
  return null;
}

/**
 * Finds all active beauticians matching customer requirement for a lead,
 * computing Haversine distance, direct coverage match, skill capabilities,
 * and date/time availability.
 */
export async function findMatchingBeauticiansForLead(
  leadId: string
): Promise<LeadMatchingResult | null> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      services: { include: { service: { select: { id: true, title: true, slug: true } } } },
      package: { select: { id: true, title: true, slug: true } },
      pro: {
        select: {
          id: true,
          name: true,
          slug: true,
          photo: true,
          specialization: true,
          experienceYears: true,
          private: true,
        },
      },
    },
  });

  if (!lead) return null;

  // Resolve lead location & coords
  let leadLat = lead.latitude ? Number(lead.latitude) : null;
  let leadLng = lead.longitude ? Number(lead.longitude) : null;
  const leadLocationText = [lead.locationText, lead.address].filter(Boolean).join(" ");

  if ((leadLat == null || leadLng == null) && lead.areaId) {
    const area = await prisma.area.findUnique({
      where: { id: lead.areaId },
      select: { latitude: true, longitude: true, name: true },
    });
    if (area?.latitude && area?.longitude) {
      leadLat = Number(area.latitude);
      leadLng = Number(area.longitude);
    }
  }

  if (leadLat == null || leadLng == null) {
    const est = resolveEstimatedCoords(leadLocationText);
    if (est) {
      leadLat = est.lat;
      leadLng = est.lng;
    }
  }

  // Requested services / package
  const requestedServiceSlugs = new Set<string>();
  const requestedServiceTitles: string[] = [];

  if (lead.package) {
    requestedServiceTitles.push(lead.package.title);
    requestedServiceSlugs.add(lead.package.slug);
  }
  for (const s of lead.services) {
    requestedServiceTitles.push(s.service.title);
    requestedServiceSlugs.add(s.service.slug);
  }

  const primaryServiceTitle =
    lead.package?.title ||
    requestedServiceTitles.join(", ") ||
    "Beauty & Makeup Service";

  // Query all active pros with coverage, offered services, and private contact
  const pros = await prisma.pro.findMany({
    where: { status: "ACTIVE" },
    include: {
      private: true,
      coverage: {
        include: {
          area: {
            select: { id: true, name: true, slug: true, latitude: true, longitude: true },
          },
        },
      },
      services: {
        include: {
          service: {
            select: { id: true, title: true, slug: true },
          },
        },
      },
      leads: {
        where: {
          ...(lead.eventDate ? { eventDate: lead.eventDate } : {}),
          status: { in: ["BOOKED", "COMPLETED", "QUOTED"] },
          id: { not: lead.id },
        },
        select: { id: true, bookingRef: true, timeSlot: true, eventDate: true },
      },
    },
  });

  const matches: MatchedBeautician[] = [];

  for (const p of pros) {
    // 1. Calculate distance
    let proLat = p.private?.latitude ? Number(p.private.latitude) : null;
    let proLng = p.private?.longitude ? Number(p.private.longitude) : null;

    // Fallback: use first covered area coords
    if (proLat == null || proLng == null) {
      const areaWithCoords = p.coverage.find((c) => c.area.latitude && c.area.longitude);
      if (areaWithCoords?.area.latitude && areaWithCoords.area.longitude) {
        proLat = Number(areaWithCoords.area.latitude);
        proLng = Number(areaWithCoords.area.longitude);
      }
    }

    let distanceKm: number | null = null;
    if (leadLat != null && leadLng != null && proLat != null && proLng != null) {
      distanceKm = haversineDistanceKm(leadLat, leadLng, proLat, proLng);
    }

    // 2. Direct Area Coverage
    const coverageAreaNames = p.coverage.map((c) => c.area.name);
    const coversAreaDirectly = Boolean(
      (lead.areaId && p.coverage.some((c) => c.area.id === lead.areaId)) ||
        p.coverage.some((c) => {
          const aName = c.area.name.toLowerCase();
          const aSlug = c.area.slug.toLowerCase();
          return (
            leadLocationText.toLowerCase().includes(aName) ||
            leadLocationText.toLowerCase().includes(aSlug.replace(/-/g, " "))
          );
        })
    );

    // 3. Service / Skill Capabilities
    const proServiceSlugs = new Set(p.services.map((s) => s.service.slug));
    const proServiceTitles = p.services.map((s) => s.service.title);

    const matchingTitles = p.services
      .filter((s) => requestedServiceSlugs.has(s.service.slug))
      .map((s) => s.service.title);

    let serviceMatch = matchingTitles.length > 0;
    // Keyword match on specialization if package or general title
    if (!serviceMatch && p.specialization) {
      const specLower = p.specialization.toLowerCase();
      const primaryLower = primaryServiceTitle.toLowerCase();
      if (
        (primaryLower.includes("bridal") && specLower.includes("bridal")) ||
        (primaryLower.includes("facial") && (specLower.includes("facial") || specLower.includes("skincare"))) ||
        (primaryLower.includes("hair") && specLower.includes("hair")) ||
        (primaryLower.includes("nail") && specLower.includes("nail")) ||
        (primaryLower.includes("wax") && specLower.includes("wax"))
      ) {
        serviceMatch = true;
      }
    }

    // 4. Availability & Conflicts on Lead Date / Slot
    const sameDayBookings = p.leads;
    let hasConflict = false;
    let conflictDetails: string | null = null;

    if (lead.eventDate && sameDayBookings.length > 0) {
      if (lead.timeSlot) {
        const slotConflict = sameDayBookings.find(
          (b) => b.timeSlot && b.timeSlot.toLowerCase() === lead.timeSlot?.toLowerCase()
        );
        if (slotConflict) {
          hasConflict = true;
          conflictDetails = `Has booking #${slotConflict.bookingRef ?? slotConflict.id.slice(0, 6)} at ${slotConflict.timeSlot}`;
        }
      }
    }

    // 5. Match Scoring
    let score = 50;
    const matchReasons: string[] = [];

    // Distance scoring
    if (distanceKm != null) {
      if (distanceKm <= 3) {
        score += 35;
        matchReasons.push(`Hyperlocal (~${distanceKm} km away)`);
      } else if (distanceKm <= 7) {
        score += 25;
        matchReasons.push(`Very close (~${distanceKm} km away)`);
      } else if (distanceKm <= 12) {
        score += 15;
        matchReasons.push(`Within commute radius (~${distanceKm} km)`);
      } else if (distanceKm > 20) {
        score -= 20;
        matchReasons.push(`Long distance (~${distanceKm} km)`);
      }
    }

    // Coverage scoring
    if (coversAreaDirectly) {
      score += 25;
      matchReasons.push("Directly covers customer's sector");
    }

    // Service scoring
    if (serviceMatch) {
      score += 25;
      matchReasons.push("Exact service specialty match");
    } else {
      score -= 10;
    }

    // Availability scoring
    if (hasConflict) {
      score -= 30;
      matchReasons.push("Time slot conflict warning");
    } else if (lead.eventDate) {
      score += 10;
      matchReasons.push("Available on appointment date");
    }

    // Clamp score 10 - 99
    score = Math.max(15, Math.min(99, score));

    // Distance label
    let distanceLabel = "Delhi NCR";
    if (distanceKm != null) {
      distanceLabel = `${distanceKm} km away`;
    } else if (coversAreaDirectly) {
      distanceLabel = "Covers this sector";
    }

    // WhatsApp Dispatch link
    const proPhone = p.private?.phone || "9319260069";
    const dateStr = lead.eventDate
      ? lead.eventDate.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })
      : "To be confirmed";

    const dispatchText = [
      `*HerrGlow Salon — New Booking Assignment* ✨`,
      `Hi ${p.name}, an appointment is assigned to you:`,
      ``,
      `📋 *Booking ID:* #${lead.bookingRef || lead.id.slice(0, 8)}`,
      `👤 *Client:* ${lead.name}`,
      `📍 *Address:* ${leadLocationText || "Delhi NCR"}`,
      distanceKm != null ? `🚗 *Distance:* ~${distanceKm} km from your base` : null,
      `📅 *Date:* ${dateStr}`,
      lead.timeSlot ? `⏰ *Time Slot:* ${lead.timeSlot}` : null,
      `💆‍♀️ *Service:* ${primaryServiceTitle}`,
      lead.finalAmount || lead.amount
        ? `💰 *Total Amount:* ₹${lead.finalAmount ?? lead.amount} (10% advance deposit secured)`
        : null,
      ``,
      `Please reply *CONFIRM* to lock your slot.`,
    ]
      .filter(Boolean)
      .join("\n");

    const dispatchWhatsAppUrl = whatsappLink(proPhone, dispatchText);

    matches.push({
      id: p.id,
      name: p.name,
      slug: p.slug,
      photo: p.photo,
      phone: proPhone,
      email: p.private?.email || null,
      bio: p.bio,
      landmark: p.private?.landmark || null,
      pincode: p.private?.pincode || null,
      travelRadius: p.private?.travelRadius || 10,
      basePrice: p.basePrice ? Number(p.basePrice) : null,
      providerType: p.providerType,
      specialization: p.specialization,
      experienceYears: p.experienceYears,
      baseAddress: p.private?.addressLine || null,
      distanceKm,
      distanceLabel,
      isHyperlocal: distanceKm != null && distanceKm <= 5,
      coversAreaDirectly,
      coverageAreas: coverageAreaNames,
      serviceMatch,
      matchingServiceTitles: matchingTitles,
      allServiceTitles: proServiceTitles,
      isAvailable: !hasConflict,
      hasConflict,
      conflictDetails,
      existingBookingCountOnDate: sameDayBookings.length,
      matchScore: score,
      matchReasons,
      badge: "AVAILABLE",
      isAssigned: lead.proId === p.id,
      dispatchWhatsAppUrl,
    });
  }

  // Sort matches by matchScore descending (and distance ascending on tie)
  matches.sort((a, b) => {
    // Current assigned pro always at top if assigned
    if (a.isAssigned) return -1;
    if (b.isAssigned) return 1;

    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    if (a.distanceKm != null && b.distanceKm != null) {
      return a.distanceKm - b.distanceKm;
    }
    return 0;
  });

  // Assign badges
  if (matches.length > 0 && matches[0] && !matches[0].isAssigned) {
    matches[0].badge = "TOP_RECOMMENDED";
  }

  // Find nearest
  const withDistance = matches.filter(
    (m): m is MatchedBeautician & { distanceKm: number } => m.distanceKm != null
  );
  withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  const nearest = withDistance[0];

  if (nearest && nearest.badge !== "TOP_RECOMMENDED" && !nearest.isAssigned) {
    nearest.badge = "NEAREST";
  }

  const assignedPro = matches.find((m) => m.isAssigned) || null;

  return {
    lead: {
      id: lead.id,
      bookingRef: lead.bookingRef,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      locationText: lead.locationText,
      areaName: null,
      latitude: leadLat,
      longitude: leadLng,
      eventDate: lead.eventDate,
      timeSlot: lead.timeSlot,
      serviceTitle: primaryServiceTitle,
      serviceSlug: lead.package?.slug || lead.services[0]?.service.slug || null,
      status: lead.status,
      proId: lead.proId,
      amount: lead.amount ? Number(lead.amount) : null,
      finalAmount: lead.finalAmount ? Number(lead.finalAmount) : null,
    },
    matches,
    assignedPro,
  };
}
