import { prisma } from "@herrglow/db";
import type { LeadStatus } from "@herrglow/db";
import { OUT_OF_AREA } from "../site/leads";

/** Pipeline order. FOLLOW_UP is a legacy status kept visible so no lead is hidden. */
export const PIPELINE: LeadStatus[] = ["NEW", "CONTACTED", "FOLLOW_UP", "QUOTED", "BOOKED", "COMPLETED", "LOST"];
export const STATUS_LABEL: Record<LeadStatus, string> = { NEW: "New", CONTACTED: "Contacted", FOLLOW_UP: "Follow-up", QUOTED: "Quoted", BOOKED: "Booked", COMPLETED: "Completed", LOST: "Lost" };

export interface LeadFilter { status?: LeadStatus; outOfArea?: boolean; unassigned?: boolean; q?: string; page?: number }
const PAGE = 40;

export async function leadCounts() {
  const [byStatus, outOfArea, unassigned, total] = await Promise.all([
    prisma.lead.groupBy({ by: ["status"], _count: true }),
    prisma.lead.count({ where: { tags: { has: OUT_OF_AREA } } }),
    prisma.lead.count({ where: { proId: null, status: { in: ["NEW", "BOOKED", "CONTACTED", "FOLLOW_UP", "QUOTED"] as LeadStatus[] } } }),
    prisma.lead.count(),
  ]);
  return { byStatus: Object.fromEntries(byStatus.map((b) => [b.status, b._count])) as Partial<Record<LeadStatus, number>>, outOfArea, unassigned, total };
}

const where = (f: LeadFilter) => ({
  ...(f.status ? { status: f.status } : {}),
  ...(f.outOfArea ? { tags: { has: OUT_OF_AREA } } : {}),
  ...(f.unassigned ? { proId: null, status: { in: ["NEW", "BOOKED", "CONTACTED", "FOLLOW_UP", "QUOTED"] as LeadStatus[] } } : {}),
  ...(f.q
    ? {
        OR: [
          { name: { contains: f.q, mode: "insensitive" as const } },
          { phone: { contains: f.q } },
          { bookingRef: { contains: f.q, mode: "insensitive" as const } },
          { locationText: { contains: f.q, mode: "insensitive" as const } },
        ],
      }
    : {}),
});

const row = {
  id: true,
  bookingRef: true,
  name: true,
  phone: true,
  status: true,
  tags: true,
  locationText: true,
  source: true,
  createdAt: true,
  eventDate: true,
  timeSlot: true,
  amount: true,
  finalAmount: true,
  services: { select: { service: { select: { title: true } } } },
  package: { select: { title: true, slug: true } },
  pro: { select: { name: true } },
} as const;

export async function listLeads(f: LeadFilter) {
  const page = Math.max(1, f.page ?? 1);
  const [items, total] = await Promise.all([
    prisma.lead.findMany({ where: where(f), orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE, select: row }),
    prisma.lead.count({ where: where(f) }),
  ]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE)) };
}

/** Board view: latest 25 per column plus the true column totals. */
export async function leadBoard(f: Omit<LeadFilter, "status" | "page">) {
  return Promise.all(
    PIPELINE.map(async (status) => ({
      status,
      total: await prisma.lead.count({ where: where({ ...f, status }) }),
      items: await prisma.lead.findMany({ where: where({ ...f, status }), orderBy: { createdAt: "desc" }, take: 25, select: row }),
    })),
  );
}

export async function getLead(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      services: { include: { service: { select: { title: true, slug: true, price: true } } } },
      package: { select: { id: true, title: true, slug: true, price: true } },
      pro: { select: { id: true, name: true } },
    },
  });
}

export async function leadProOptions() {
  return prisma.pro.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" }, select: { id: true, name: true } });
}

export interface LeadUpdate { status?: LeadStatus; adminNote?: string | null; proId?: string | null; amount?: number | null; discount?: number | null; finalAmount?: number | null }

export async function updateLead(id: string, u: LeadUpdate) {
  const data: Record<string, unknown> = {};
  if (u.status) data.status = u.status;
  if (u.adminNote !== undefined) data.adminNote = u.adminNote?.slice(0, 2000) || null;
  if (u.proId !== undefined) data.proId = u.proId || null;
  for (const k of ["amount", "discount", "finalAmount"] as const) if (u[k] !== undefined) data[k] = u[k];
  return prisma.lead.update({ where: { id }, data });
}
