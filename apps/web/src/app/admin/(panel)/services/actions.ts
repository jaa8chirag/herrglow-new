"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { saveAddons, saveService, saveVariants } from "@herrglow/core";
import { log, requireAdmin } from "@/lib/admin";

const num = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? Number(v) : null))
  .refine((n) => n === null || (Number.isFinite(n) && n >= 0), "Invalid number");
const schema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160),
  categoryId: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  providerType: z.enum(["BEAUTICIAN", "MAKEOVER_ARTIST", "BOTH"]),
  price: num,
  offerPrice: num,
  priceLabel: z.string().max(60).optional(),
  duration: z.string().max(60).optional(),
  sort: z
    .string()
    .optional()
    .transform((v) => Number(v ?? 0) || 0),
});

const back = (id: string, k: "ok" | "err", m: string): never => {
  revalidatePath("/", "layout");
  redirect(`/admin/services/${id}?${k}=${encodeURIComponent(m)}`);
};

export async function saveServiceAction(fd: FormData) {
  const me = await requireAdmin("catalog");
  const d = schema.parse(Object.fromEntries(fd));
  const res = await saveService(d.id, { ...d, featured: fd.get("featured") === "on" });
  await log(me, "service.save", "Service", d.id, { slug: d.slug });
  if (!res.ok) back(d.id, "err", res.error);
  back(d.id, "ok", "Service saved");
}

const money = (v: FormDataEntryValue | undefined) => {
  const n = Number(String(v ?? "").trim());
  return String(v ?? "").trim() && Number.isFinite(n) && n >= 0 ? n : null;
};

export async function saveVariantsAction(fd: FormData) {
  const me = await requireAdmin("catalog");
  const id = String(fd.get("id"));
  const names = fd.getAll("vName"),
    price = fd.getAll("vPrice"),
    offer = fd.getAll("vOffer"),
    dur = fd.getAll("vDuration");
  await saveVariants(
    id,
    names.map((n, i) => ({
      name: String(n),
      price: money(price[i]),
      offerPrice: money(offer[i]),
      duration: String(dur[i] ?? ""),
    }))
  );
  await log(me, "service.variants", "Service", id);
  back(id, "ok", "Options saved");
}

export async function saveAddonsAction(fd: FormData) {
  const me = await requireAdmin("catalog");
  const id = String(fd.get("id"));
  const names = fd.getAll("aName"),
    price = fd.getAll("aPrice");
  await saveAddons(
    id,
    names.map((n, i) => ({ name: String(n), price: money(price[i]) }))
  );
  await log(me, "service.addons", "Service", id);
  back(id, "ok", "Add-ons saved");
}
