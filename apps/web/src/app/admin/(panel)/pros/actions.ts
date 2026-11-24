"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  addPortfolioItem,
  removePortfolioItem,
  savePrivate,
  saveProProfile,
  setProCoverageForCity,
  setProPhoto,
  setProServices,
} from "@herrglow/core";
import { log, requireAdmin } from "@/lib/admin";

const num = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? Number(v) : null))
  .refine((n) => n === null || (Number.isFinite(n) && n >= 0), "Invalid number");
const profile = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  providerType: z.enum(["BEAUTICIAN", "MAKEOVER_ARTIST", "BOTH"]),
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]),
  specialization: z.string().max(200).optional(),
  experienceYears: num,
  basePrice: num,
  bio: z.string().max(20000).optional(),
  seoTitle: z.string().max(120).optional(),
  seoDescription: z.string().max(300).optional(),
});

const done = (id: string, msg: string): never => {
  revalidatePath("/", "layout");
  redirect(`/admin/pros/${id}?ok=${encodeURIComponent(msg)}`);
};

export async function saveProfileAction(fd: FormData) {
  const me = await requireAdmin("pros");
  const d = profile.parse(Object.fromEntries(fd));
  await saveProProfile(d.id, d);
  await log(me, "pro.profile", "Pro", d.id);
  done(d.id, "Profile saved");
}

export async function savePrivateAction(fd: FormData) {
  const me = await requireAdmin("pros");
  const id = String(fd.get("id"));
  await savePrivate(id, {
    phone: String(fd.get("phone") ?? ""),
    email: String(fd.get("email") ?? ""),
    addressLine: String(fd.get("addressLine") ?? ""),
    pincode: String(fd.get("pincode") ?? ""),
  });
  await log(me, "pro.private", "Pro", id);
  done(id, "Private details saved");
}

export async function saveServicesAction(fd: FormData) {
  const me = await requireAdmin("pros");
  const id = String(fd.get("id"));
  await setProServices(id, fd.getAll("serviceId").map(String));
  await log(me, "pro.services", "Pro", id);
  done(id, "Services saved");
}

export async function saveCoverageAction(fd: FormData) {
  const me = await requireAdmin("pros");
  const id = String(fd.get("id")),
    city = String(fd.get("city"));
  await setProCoverageForCity(id, city, fd.getAll("areaId").map(String));
  await log(me, "pro.coverage", "Pro", id, { city });
  revalidatePath("/", "layout");
  redirect(`/admin/pros/${id}?city=${city}&ok=${encodeURIComponent("Coverage saved for " + city)}`);
}

/** Called by the upload widget after a file is stored. */
export async function attachPhoto(proId: string, key: string) {
  const me = await requireAdmin("pros");
  await setProPhoto(proId, key);
  await log(me, "pro.photo", "Pro", proId, { key });
  revalidatePath("/", "layout");
}
export async function attachPortfolio(proId: string, key: string, alt: string) {
  const me = await requireAdmin("pros");
  await addPortfolioItem(proId, { path: key, alt });
  await log(me, "pro.portfolio.add", "Pro", proId, { key });
  revalidatePath("/", "layout");
}
export async function removePortfolioAction(fd: FormData) {
  const me = await requireAdmin("pros");
  const id = String(fd.get("id"));
  await removePortfolioItem(id, String(fd.get("path")));
  await log(me, "pro.portfolio.remove", "Pro", id);
  done(id, "Portfolio image removed");
}
export async function removePhotoAction(fd: FormData) {
  const me = await requireAdmin("pros");
  const id = String(fd.get("id"));
  await setProPhoto(id, null);
  await log(me, "pro.photo.remove", "Pro", id);
  done(id, "Photo removed");
}
