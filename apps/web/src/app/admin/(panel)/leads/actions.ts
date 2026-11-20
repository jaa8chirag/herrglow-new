"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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
}
