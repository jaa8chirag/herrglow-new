import { prisma } from "@herrglow/db";
import { whatsappLink } from "../site/whatsapp";

export interface ScheduledBooking {
  id: string;
  bookingRef: string | null;
  clientName: string;
  clientPhone: string;
  address: string;
  timeSlot: string | null;
  status: string;
  serviceTitle: string;
  amount: number | null;
  finalAmount: number | null;
  whatsappClientUrl: string;
}

export interface BeauticianDaySchedule {
  id: string;
  name: string;
  slug: string;
  photo: string | null;
  phone: string;
  specialization: string | null;
  experienceYears: number | null;
  baseAddress: string | null;
  coverageAreas: string[];
  allServices: string[];
  slots: {
    morning: { isBooked: boolean; booking: ScheduledBooking | null };
    afternoon: { isBooked: boolean; booking: ScheduledBooking | null };
    evening: { isBooked: boolean; booking: ScheduledBooking | null };
    custom: ScheduledBooking[];
  };
  totalBookings: number;
  isAvailable: boolean;
  dayWhatsAppSummaryUrl: string;
}

export interface DayScheduleResult {
  targetDateStr: string;
  displayDate: string;
  previousDateStr: string;
  nextDateStr: string;
  isToday: boolean;
  summary: {
    totalPros: number;
    busyPros: number;
    freePros: number;
    totalBookings: number;
  };
  beauticians: BeauticianDaySchedule[];
}

export async function getBeauticianSchedule(dateStr?: string): Promise<DayScheduleResult> {
  // Normalize date or fallback to today
  const targetDate = dateStr && !isNaN(Date.parse(dateStr)) ? new Date(dateStr) : new Date();

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const prevDate = new Date(startOfDay);
  prevDate.setDate(prevDate.getDate() - 1);

  const nextDate = new Date(startOfDay);
  nextDate.setDate(nextDate.getDate() + 1);

  const toYMD = (d: Date) => d.toISOString().slice(0, 10);
  const targetDateStr = toYMD(startOfDay);
  const previousDateStr = toYMD(prevDate);
  const nextDateStr = toYMD(nextDate);

  const todayStr = toYMD(new Date());
  const isToday = targetDateStr === todayStr;

  // Query all active beauticians with their coverage, services, and bookings on target date
  const pros = await prisma.pro.findMany({
    where: { status: "ACTIVE" },
    include: {
      private: true,
      coverage: {
        include: {
          area: {
            select: { name: true },
          },
        },
      },
      services: {
        include: {
          service: {
            select: { title: true },
          },
        },
      },
      leads: {
        where: {
          eventDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: { notIn: ["LOST"] },
        },
        include: {
          services: {
            include: {
              service: { select: { title: true } },
            },
          },
          package: {
            select: { title: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  let totalBookingsCount = 0;
  let busyProsCount = 0;

  const beauticians: BeauticianDaySchedule[] = pros.map((p) => {
    const proPhone = p.private?.phone || "9319260069";
    const coverageAreas = p.coverage.map((c) => c.area.name);
    const allServices = p.services.map((s) => s.service.title);

    const scheduledBookings: ScheduledBooking[] = p.leads.map((l) => {
      const serviceTitle =
        l.package?.title ??
        (l.services.map((s) => s.service.title).join(", ") || "Doorstep Beauty Service");

      const waClient = whatsappLink(
        l.phone,
        `Hi ${l.name}! This is HerrGlow Salon regarding your appointment #${l.bookingRef ?? ""}. Your assigned beautician is ${p.name}.`
      );

      return {
        id: l.id,
        bookingRef: l.bookingRef,
        clientName: l.name,
        clientPhone: l.phone,
        address: l.address || l.locationText || "Delhi NCR",
        timeSlot: l.timeSlot,
        status: l.status,
        serviceTitle,
        amount: l.amount ? Number(l.amount) : null,
        finalAmount: l.finalAmount ? Number(l.finalAmount) : null,
        whatsappClientUrl: waClient || "",
      };
    });

    totalBookingsCount += scheduledBookings.length;
    if (scheduledBookings.length > 0) {
      busyProsCount++;
    }

    // Map into morning, afternoon, evening slots
    let morningBooking: ScheduledBooking | null = null;
    let afternoonBooking: ScheduledBooking | null = null;
    let eveningBooking: ScheduledBooking | null = null;
    const customBookings: ScheduledBooking[] = [];

    for (const b of scheduledBookings) {
      const slot = (b.timeSlot || "").toLowerCase();
      if (slot.includes("morn") || slot.includes("9am") || slot.includes("10am") || slot.includes("11am")) {
        if (!morningBooking) morningBooking = b;
        else customBookings.push(b);
      } else if (slot.includes("after") || slot.includes("12pm") || slot.includes("1pm") || slot.includes("2pm") || slot.includes("3pm")) {
        if (!afternoonBooking) afternoonBooking = b;
        else customBookings.push(b);
      } else if (slot.includes("even") || slot.includes("4pm") || slot.includes("5pm") || slot.includes("6pm") || slot.includes("7pm") || slot.includes("8pm")) {
        if (!eveningBooking) eveningBooking = b;
        else customBookings.push(b);
      } else {
        if (!morningBooking) morningBooking = b;
        else customBookings.push(b);
      }
    }

    // Generate formatted WhatsApp day schedule for this beautician
    const displayDateStr = startOfDay.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const dispatchLines = [
      `*HerrGlow Salon — Daily Schedule Brief* 🗓️`,
      `Hi ${p.name}! Here is your appointment roster for *${displayDateStr}*:`,
      ``,
    ];

    if (scheduledBookings.length === 0) {
      dispatchLines.push(`✅ No appointments assigned for today yet. You are currently on standby.`);
    } else {
      scheduledBookings.forEach((b, idx) => {
        dispatchLines.push(
          `*${idx + 1}. [${b.timeSlot || "Time Slot TBC"}]*`,
          `👤 Client: ${b.clientName} (${b.clientPhone})`,
          `📍 Address: ${b.address}`,
          `💆‍♀️ Service: ${b.serviceTitle}`,
          b.finalAmount ? `💰 Amount: ₹${b.finalAmount} (Collect balance on-site)` : ``,
          ``
        );
      });
      dispatchLines.push(`Please carry your sanitized sealed single-use kit and reach 10 mins prior to ETA.`);
    }

    const dayWhatsAppSummaryUrl = whatsappLink(proPhone, dispatchLines.filter(Boolean).join("\n")) || "";

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      photo: p.photo,
      phone: proPhone,
      specialization: p.specialization,
      experienceYears: p.experienceYears,
      baseAddress: p.private?.addressLine || null,
      coverageAreas,
      allServices,
      slots: {
        morning: { isBooked: Boolean(morningBooking), booking: morningBooking },
        afternoon: { isBooked: Boolean(afternoonBooking), booking: afternoonBooking },
        evening: { isBooked: Boolean(eveningBooking), booking: eveningBooking },
        custom: customBookings,
      },
      totalBookings: scheduledBookings.length,
      isAvailable: scheduledBookings.length < 3,
      dayWhatsAppSummaryUrl,
    };
  });

  return {
    targetDateStr,
    displayDate: startOfDay.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    previousDateStr,
    nextDateStr,
    isToday,
    summary: {
      totalPros: pros.length,
      busyPros: busyProsCount,
      freePros: pros.length - busyProsCount,
      totalBookings: totalBookingsCount,
    },
    beauticians,
  };
}
