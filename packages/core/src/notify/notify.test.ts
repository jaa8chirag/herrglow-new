/**
 * Notification tests (integration: need Postgres from `pnpm infra:up`). Channels are faked; nothing is really sent.
 *   pnpm --filter @herrglow/core test:notify
 */
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { prisma } from "@herrglow/db";
import { sendWhatsApp, type Channels } from "./channels";
import { buildDigest, findUnnotifiedLeads, processCustomerConfirmation, processDailyDigest, processNewLead } from "./process";

const TAG = `zz-notify-${Date.now()}`;
process.env.OWNER_EMAIL = "owner@test.local";
process.env.NEXT_PUBLIC_SITE_URL = "https://herrglow.com";

const mkLead = (o: { name: string; email?: string; tags?: string[]; ageMs?: number; status?: "NEW" | "CONTACTED" }) =>
  prisma.lead.create({ data: { name: `${TAG} ${o.name}`, phone: "9000000000", email: o.email, locationText: o.tags?.length ? "Outside service area" : "Gaur City 1, Greater Noida", tags: o.tags ?? [], status: o.status ?? "NEW", createdAt: new Date(Date.now() - (o.ageMs ?? 0)), bookingRef: `T${Math.random().toString(36).slice(2, 7)}`.toUpperCase() } });

function fake(over: Partial<Channels> = {}) {
  const calls = { email: [] as { to: string; subject: string; text: string }[], telegram: [] as string[], whatsapp: [] as unknown[] };
  const ch: Channels = {
    email: async (m) => { calls.email.push(m); return { status: "SENT" }; },
    telegram: async (t) => { calls.telegram.push(t); return { status: "SENT" }; },
    whatsapp: async (m) => { calls.whatsapp.push(m); return { status: "SENT" }; },
    ...over,
  };
  return { ch, calls };
}

after(async () => {
  const ids = (await prisma.lead.findMany({ where: { name: { startsWith: TAG } }, select: { id: true } })).map((l) => l.id);
  await prisma.notificationLog.deleteMany({ where: { OR: [{ refId: { in: ids } }, { kind: "daily-digest", refId: { startsWith: "2099" } }] } });
  await prisma.lead.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
});

test("new lead: owner gets email AND Telegram with service, area, admin link; notifiedAt is set", async () => {
  const l = await mkLead({ name: "Asha" });
  await prisma.leadService.create({ data: { leadId: l.id, serviceId: (await prisma.service.findFirstOrThrow({ where: { slug: "hd-bridal-makeup" } })).id } });
  const { ch, calls } = fake();
  await processNewLead(l.id, ch);
  assert.equal(calls.email.length, 1); assert.equal(calls.telegram.length, 1);
  assert.equal(calls.email[0]!.to, "owner@test.local");
  for (const t of [calls.email[0]!.text, calls.telegram[0]!]) {
    assert.match(t, /HD Bridal Makeup/); assert.match(t, /Gaur City 1, Greater Noida/); assert.match(t, new RegExp(`https://herrglow.com/admin/leads/${l.id}`));
    assert.doesNotMatch(t, /OUT OF AREA/);
  }
  assert.ok((await prisma.lead.findUniqueOrThrow({ where: { id: l.id } })).notifiedAt);
});

test("out_of_area leads are clearly flagged", async () => {
  const l = await mkLead({ name: "Bela", tags: ["out_of_area"] });
  const { ch, calls } = fake();
  await processNewLead(l.id, ch);
  assert.match(calls.telegram[0]!, /^OUT OF AREA lead/);
  assert.match(calls.email[0]!.subject, /^\[Out of area\]/);
});

test("retries are idempotent: a failed channel is retried, a channel that already SENT is never re-sent", async () => {
  const l = await mkLead({ name: "Chitra" });
  let tgFails = 1;
  const { ch, calls } = fake({ telegram: async (t) => { if (tgFails-- > 0) throw new Error("telegram 500"); calls.telegram.push(t); return { status: "SENT" }; } });
  await assert.rejects(() => processNewLead(l.id, ch), /telegram 500/); // job would be retried by the queue
  assert.equal(calls.email.length, 1, "email went out on attempt 1");
  await processNewLead(l.id, ch); // attempt 2
  assert.equal(calls.email.length, 1, "email NOT duplicated on retry");
  assert.equal(calls.telegram.length, 1, "telegram delivered on retry");
  await processNewLead(l.id, ch); // attempt 3 (e.g. sweep): nothing more to do
  assert.equal(calls.email.length + calls.telegram.length, 2);
});

test("not-configured channels are SKIPPED, not failures, and do not block the job", async () => {
  const l = await mkLead({ name: "Dev" });
  const { ch } = fake({ telegram: async () => ({ status: "SKIPPED", detail: "Telegram not configured" }) });
  await processNewLead(l.id, ch); // must not throw
  const log = await prisma.notificationLog.findUniqueOrThrow({ where: { kind_refId_channel: { kind: "new-lead", refId: l.id, channel: "telegram" } } });
  assert.equal(log.status, "SKIPPED");
});

test("customer confirmation: only with an email; out-of-area wording differs; WhatsApp stays off unless enabled", async () => {
  const withMail = await mkLead({ name: "Esha", email: "esha@example.com" });
  const noMail = await mkLead({ name: "Farah" });
  const oa = await mkLead({ name: "Gita", email: "gita@example.com", tags: ["out_of_area"] });
  delete process.env.WHATSAPP_ENABLED;
  const a = fake(); await processCustomerConfirmation(withMail.id, a.ch);
  assert.equal(a.calls.email.length, 1); assert.equal(a.calls.email[0]!.to, "esha@example.com"); assert.match(a.calls.email[0]!.text, /we have received your (appointment )?request/i);
  assert.equal(a.calls.whatsapp.length, 0, "WhatsApp disabled");
  const b = fake(); await processCustomerConfirmation(noMail.id, b.ch);
  assert.equal(b.calls.email.length, 0);
  const c = fake(); await processCustomerConfirmation(oa.id, c.ch);
  assert.match(c.calls.email[0]!.text, /do not serve your area yet/i); assert.doesNotMatch(c.calls.email[0]!.text, /will contact you/i);
  process.env.WHATSAPP_ENABLED = "true";
  const d = fake(); await processCustomerConfirmation(noMail.id, d.ch);
  assert.equal(d.calls.whatsapp.length, 1, "WhatsApp used once enabled");
  delete process.env.WHATSAPP_ENABLED;
});

test("daily digest: lists NEW leads older than 2h, ignores fresh and handled ones, sends once per day", async () => {
  const old = await mkLead({ name: "Old", ageMs: 3 * 3_600_000 });
  const fresh = await mkLead({ name: "Fresh", ageMs: 30 * 60_000 });
  const handled = await mkLead({ name: "Handled", ageMs: 5 * 3_600_000, status: "CONTACTED" });
  const d = await buildDigest();
  const names = d.unattended.map((u) => u.name);
  assert.ok(names.includes(`${TAG} Old`)); assert.ok(!names.includes(`${TAG} Fresh`)); assert.ok(!names.includes(`${TAG} Handled`));
  assert.ok(d.totalUnattended >= 1 && d.newLast24h >= 3);
  const { ch, calls } = fake();
  const day = new Date("2099-01-01T04:00:00Z");
  await processDailyDigest(ch, day); await processDailyDigest(ch, day);
  assert.equal(calls.telegram.length, 1, "once per day");
  assert.match(calls.telegram[0]!, /Unattended > 2h/); assert.match(calls.telegram[0]!, new RegExp(`/admin/leads/${old.id}`));
  void fresh; void handled;
});

test("sweep finds leads never notified (older than 2 min), not brand-new or already-notified ones", async () => {
  const missed = await mkLead({ name: "Missed", ageMs: 5 * 60_000 });
  const brand = await mkLead({ name: "Brand", ageMs: 10_000 });
  const done = await mkLead({ name: "Done", ageMs: 5 * 60_000 });
  await prisma.lead.update({ where: { id: done.id }, data: { notifiedAt: new Date() } });
  const ids = (await findUnnotifiedLeads()).map((l) => l.id);
  assert.ok(ids.includes(missed.id)); assert.ok(!ids.includes(brand.id)); assert.ok(!ids.includes(done.id));
});

test("WhatsApp adapter: OFF by default; when enabled sends a normalised Cloud API request; failures throw", async () => {
  const realFetch = globalThis.fetch;
  let seen: { url: string; init: RequestInit } | null = null;
  globalThis.fetch = (async (url: string, init: RequestInit) => { seen = { url, init }; return new Response("{}", { status: seen && process.env.WA_FAIL ? 500 : 200 }); }) as typeof fetch;
  try {
    delete process.env.WHATSAPP_ENABLED;
    assert.deepEqual(await sendWhatsApp({ to: "9876543210", text: "hi" }), { status: "SKIPPED", detail: "WHATSAPP_ENABLED is not true" });
    assert.equal(seen, null, "no network call when disabled");
    process.env.WHATSAPP_ENABLED = "true"; process.env.WHATSAPP_PHONE_ID = "123"; process.env.WHATSAPP_TOKEN = "tok";
    assert.equal((await sendWhatsApp({ to: "98765 43210", text: "hello" })).status, "SENT");
    const body = JSON.parse(String(seen!.init.body));
    assert.equal(body.to, "919876543210"); assert.equal(body.text.body, "hello"); assert.equal((seen!.init.headers as Record<string, string>).Authorization, "Bearer tok");
    assert.match(seen!.url, /\/123\/messages$/);
    await sendWhatsApp({ to: "9876543210", template: { name: "lead_confirm", params: ["Asha"] } });
    assert.equal(JSON.parse(String(seen!.init.body)).type, "template");
    process.env.WA_FAIL = "1";
    await assert.rejects(() => sendWhatsApp({ to: "9876543210", text: "x" }), /WhatsApp 500/);
  } finally {
    globalThis.fetch = realFetch; delete process.env.WA_FAIL; delete process.env.WHATSAPP_ENABLED; delete process.env.WHATSAPP_PHONE_ID; delete process.env.WHATSAPP_TOKEN;
  }
});
