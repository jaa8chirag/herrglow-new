"use server";

import path from "node:path";
import { headers } from "next/headers";
import { createApplication } from "@herrglow/core";

export type ApplyState =
  { status: "idle" } | { status: "error"; errors: Record<string, string> } | { status: "done" };

// 3 applications / hour / IP (per server instance)
const hits = new Map<string, number[]>();
const limited = (ip: string) => {
  const now = Date.now();
  const r = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  r.push(now);
  hits.set(ip, r);
  return r.length > 3;
};

export async function submitApplication(_prev: ApplyState, fd: FormData): Promise<ApplyState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip))
    return { status: "error", errors: { form: "Too many submissions. Please try again later." } };
  const s = (k: string) => (fd.get(k) as string | null) ?? undefined;

  if (!s("latitude") || !s("longitude")) {
    return {
      status: "error",
      errors: {
        location: "Live GPS location is mandatory. Please click 'Share Live Location (GPS)' above.",
      },
    };
  }

  const file = fd.get("photo");
  const photo =
    file instanceof File && file.size > 0
      ? { body: Buffer.from(await file.arrayBuffer()), filename: file.name }
      : null;
  const idFile = fd.get("idProof");
  const idProof =
    idFile instanceof File && idFile.size > 0
      ? { body: Buffer.from(await idFile.arrayBuffer()), filename: idFile.name }
      : null;
  const res = await createApplication(
    {
      name: s("name") ?? "",
      phone: s("phone") ?? "",
      email: s("email"),
      artistType: (s("artistType") === "PARLOUR_OWNER" ? "PARLOUR_OWNER" : "FREELANCER") as
        "FREELANCER" | "PARLOUR_OWNER",
      parlourName: s("parlourName"),
      parlourAddress: s("parlourAddress"),
      area: s("area") ?? s("city") ?? "",
      operatingAreas: s("operatingAreas") ?? "",
      city: s("area") ?? s("city") ?? "",
      latitude: s("latitude") ? Number(s("latitude")) : undefined,
      longitude: s("longitude") ? Number(s("longitude")) : undefined,
      travelRadius: s("travelRadius") ? Number(s("travelRadius")) : 10,
      categories: fd.getAll("categories").map(String),
      servicesText: s("servicesText"),
      experienceYears: s("experienceYears"),
      portfolioUrl: s("portfolioUrl"),
      message: s("message"),
      website: s("website"),
    },
    photo,
    idProof,
    path.join(process.cwd(), "public", "media")
  );
  return res.ok ? { status: "done" } : { status: "error", errors: res.errors };
}
