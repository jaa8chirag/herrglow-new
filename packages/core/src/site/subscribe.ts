import { prisma } from "@herrglow/db";
import { z } from "zod";

const email = z.string().trim().toLowerCase().email().max(120);

/** Footer newsletter signup. Idempotent; a honeypot value pretends success without storing. */
export async function subscribe(raw: string, honeypot?: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (honeypot) return { ok: true };
  const p = email.safeParse(raw);
  if (!p.success) return { ok: false, error: "Please enter a valid email address" };
  await prisma.subscriber.upsert({ where: { email: p.data }, update: {}, create: { email: p.data } });
  return { ok: true };
}
