import { prisma } from "@herrglow/db";
import { realChannels, ownerEmail, whatsappEnabled, type ChannelResult, type Channels } from "./channels";
import { applicationText, customerEmail, customerWhatsAppText, digestText, ownerLeadSubject, ownerLeadText, type Digest, type LeadView } from "./messages";

/**
 * Idempotent per (kind, ref, channel): a retry skips channels that already SENT and only re-attempts the ones that
 * failed or were skipped. After trying every channel, any failure is rethrown so the queue retries with backoff.
 */
async function once(kind: string, refId: string, channel: string, fn: () => Promise<ChannelResult>): Promise<{ sent: boolean; error?: Error }> {
  const key = { kind_refId_channel: { kind, refId, channel } };
  const prev = await prisma.notificationLog.findUnique({ where: key });
  if (prev?.status === "SENT") return { sent: true };
  try {
    const r = await fn();
    await prisma.notificationLog.upsert({ where: key, update: { status: r.status, error: r.detail ?? null }, create: { kind, refId, channel, status: r.status, error: r.detail ?? null } });
    return { sent: r.status === "SENT" };
  } catch (e) {
    const err = e as Error;
    await prisma.notificationLog.upsert({ where: key, update: { status: "FAILED", error: err.message.slice(0, 500) }, create: { kind, refId, channel, status: "FAILED", error: err.message.slice(0, 500) } });
    return { sent: false, error: err };
  }
}

const failIf = (results: { error?: Error }[], what: string) => {
  const errs = results.filter((r) => r.error).map((r) => r.error!.message);
  if (errs.length) throw new Error(`${what}: ${errs.join(" | ")}`);
};

export async function loadLeadView(id: string): Promise<LeadView | null> {
  const l = await prisma.lead.findUnique({ where: { id }, include: { services: { include: { service: { select: { title: true } } } } } });
  if (!l) return null;
  return { id: l.id, bookingRef: l.bookingRef, name: l.name, phone: l.phone, email: l.email, locationText: l.locationText, eventDate: l.eventDate, message: l.message, tags: l.tags, createdAt: l.createdAt, services: l.services.map((s) => s.service.title), variant: (l.meta as { variant?: string } | null)?.variant };
}

/** Owner alert: email + Telegram (+ WhatsApp to the owner is intentionally not sent; owner uses Telegram). */
export async function processNewLead(leadId: string, ch: Channels = realChannels) {
  const l = await loadLeadView(leadId);
  if (!l) return { skipped: "lead not found" };
  const email = ownerEmail();
  const results = await Promise.all([
    once("new-lead", leadId, "email", async () => (email ? ch.email({ to: email, subject: ownerLeadSubject(l), text: ownerLeadText(l) }) : { status: "SKIPPED", detail: "OWNER_EMAIL not set" })),
    once("new-lead", leadId, "telegram", () => ch.telegram(ownerLeadText(l))),
  ]);
  if (results.some((r) => r.sent)) await prisma.lead.update({ where: { id: leadId }, data: { notifiedAt: new Date() } });
  failIf(results, "owner notification");
  return { sent: results.map((r) => r.sent) };
}

/** Customer confirmation: email when they gave one; WhatsApp only when the adapter is enabled. */
export async function processCustomerConfirmation(leadId: string, ch: Channels = realChannels) {
  const l = await loadLeadView(leadId);
  if (!l) return { skipped: "lead not found" };
  const results = await Promise.all([
    once("customer-confirmation", leadId, "email", async () => {
      if (!l.email) return { status: "SKIPPED", detail: "no customer email" };
      const m = customerEmail(l);
      return ch.email({ to: l.email, ...m });
    }),
    once("customer-confirmation", leadId, "whatsapp", async () => (whatsappEnabled() ? ch.whatsapp({ to: l.phone, text: customerWhatsAppText(l) }) : { status: "SKIPPED", detail: "WhatsApp disabled" })),
  ]);
  failIf(results, "customer confirmation");
  return { sent: results.map((r) => r.sent) };
}

export async function processNewApplication(id: string, ch: Channels = realChannels) {
  const a = await prisma.proApplication.findUnique({ where: { id } });
  if (!a) return { skipped: "application not found" };
  const text = applicationText(a);
  const email = ownerEmail();
  const results = await Promise.all([
    once("new-application", id, "email", async () => (email ? ch.email({ to: email, subject: `New artist application: ${a.name} (${a.city})`, text }) : { status: "SKIPPED", detail: "OWNER_EMAIL not set" })),
    once("new-application", id, "telegram", () => ch.telegram(text)),
  ]);
  failIf(results, "application notification");
  return { sent: results.map((r) => r.sent) };
}

const UNATTENDED_AFTER_MS = 2 * 3_600_000;

export async function buildDigest(now = new Date()): Promise<Digest> {
  const since = new Date(now.getTime() - 86_400_000);
  const cutoff = new Date(now.getTime() - UNATTENDED_AFTER_MS);
  const where = { status: "NEW" as const, createdAt: { lt: cutoff } };
  const [newLast24h, outOfArea24h, totalUnattended, rows] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gt: since } } }),
    prisma.lead.count({ where: { createdAt: { gt: since }, tags: { has: "out_of_area" } } }),
    prisma.lead.count({ where }),
    prisma.lead.findMany({ where, orderBy: { createdAt: "asc" }, take: 15, include: { services: { include: { service: { select: { title: true } } } } } }),
  ]);
  return {
    newLast24h, outOfArea24h, totalUnattended,
    unattended: rows.map((r) => ({ id: r.id, name: r.name, service: r.services[0]?.service.title ?? "enquiry", where: r.locationText ?? "?", ageHours: (now.getTime() - r.createdAt.getTime()) / 3_600_000 })),
  };
}

/** 9am summary: new leads in 24h and everything still unattended after 2 hours. Date-stamped so it sends once per day. */
export async function processDailyDigest(ch: Channels = realChannels, now = new Date()) {
  const d = await buildDigest(now);
  const text = digestText(d);
  const ref = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const email = ownerEmail();
  const results = await Promise.all([
    once("daily-digest", ref, "email", async () => (email ? ch.email({ to: email, subject: `HerrGlow summary: ${d.totalUnattended} unattended, ${d.newLast24h} new`, text }) : { status: "SKIPPED", detail: "OWNER_EMAIL not set" })),
    once("daily-digest", ref, "telegram", () => ch.telegram(text)),
  ]);
  failIf(results, "daily digest");
  return { digest: d };
}

/** Safety net: leads whose owner notification never went out (Redis was down, worker was off) get re-queued. */
export async function findUnnotifiedLeads(now = new Date()) {
  return prisma.lead.findMany({ where: { notifiedAt: null, createdAt: { gt: new Date(now.getTime() - 86_400_000), lt: new Date(now.getTime() - 120_000) } }, select: { id: true }, take: 50 });
}
