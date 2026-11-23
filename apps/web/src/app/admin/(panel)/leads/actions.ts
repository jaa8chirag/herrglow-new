"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@herrglow/db";
import { PIPELINE, updateLead } from "@herrglow/core";
import { log, requireAdmin } from "@/lib/admin";

const num = z.string().trim().optional().transform((v) => (v ? Number(v) : null)).refine((n) => n === null || (Number.isFinite(n) && n >= 0), "Invalid amount");
const schema = z.object({
  id: z.string().min(1),
  status: z.enum(PIPELINE as [string, ...string[]]).optional(),
  adminNote: z.string().max(2000).optional(),
  proId: z.string().optional(),
  amount: num, discount: num, finalAmount: num,
});

/** Full edit from the lead detail page. */
export async function saveLead(fd: FormData) {
  const me = await requireAdmin("leads");
  const d = schema.parse(Object.fromEntries(fd));
  await updateLead(d.id, { status: d.status as never, adminNote: d.adminNote ?? null, proId: d.proId || null, amount: d.amount, discount: d.discount, finalAmount: d.finalAmount });
  await log(me, "lead.update", "Lead", d.id, { status: d.status });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${d.id}`);
}

/** One-click move from list/board. */
export async function moveLead(fd: FormData) {
  const me = await requireAdmin("leads");
  const id = String(fd.get("id")), status = String(fd.get("status"));
  if (!PIPELINE.includes(status as never)) throw new Error("Bad status");
  await updateLead(id, { status: status as never });
  await log(me, "lead.move", "Lead", id, { status });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
}

/** 1-Click assign nearest / recommended beautician to customer booking */
export async function assignNearestPro(leadId: string, proId: string) {
  const me = await requireAdmin("leads");
  if (!leadId || !proId) throw new Error("Missing leadId or proId");
  const lead = await updateLead(leadId, {
    proId,
    status: "BOOKED",
  });
  await log(me, "lead.assign_pro", "Lead", leadId, { proId, status: "BOOKED" });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin");
  return { success: true, lead };
}

/** 1-Click unassign pro from lead */
export async function unassignPro(leadId: string) {
  const me = await requireAdmin("leads");
  if (!leadId) throw new Error("Missing leadId");
  const lead = await updateLead(leadId, { proId: null });
  await log(me, "lead.unassign_pro", "Lead", leadId, {});
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin");
  return { success: true, lead };
}

/** Lightweight snapshot of latest incoming lead for real-time admin dispatch radar */
export async function getLatestLeadSnapshot() {
  await requireAdmin("leads");
  const latest = await prisma.lead.findFirst({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      bookingRef: true,
      name: true,
      createdAt: true,
      phone: true,
      locationText: true,
      amount: true,
      finalAmount: true,
      status: true,
    },
  });
  const total = await prisma.lead.count();
  return {
    latest: latest
      ? {
          id: latest.id,
          bookingRef: latest.bookingRef,
          name: latest.name,
          createdAt: latest.createdAt.toISOString(),
          location: latest.locationText || "Delhi NCR",
          amount: Number(latest.finalAmount ?? latest.amount) || null,
        }
      : null,
    total,
  };
}
