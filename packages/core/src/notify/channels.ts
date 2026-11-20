import nodemailer from "nodemailer";

/**
 * Delivery channels. Each returns SENT or SKIPPED (not configured / disabled) and THROWS on a real failure,
 * so the queue retries only the channels that actually failed (see process.ts).
 */
export type ChannelResult = { status: "SENT" | "SKIPPED"; detail?: string };

const env = (k: string) => (process.env[k] ?? "").trim();
export const siteUrl = () => (env("NEXT_PUBLIC_SITE_URL") || "https://herrglow.com").replace(/\/$/, "");
export const adminLeadUrl = (id: string) => `${siteUrl()}/admin/leads/${id}`;

/* ───────── Email (SMTP). EMAIL_TRANSPORT=console logs instead of sending (dev). ───────── */
type Mailer = ReturnType<typeof nodemailer.createTransport>;
let transport: Mailer | null = null;
function mailer(): Mailer | null {
  if (transport) return transport;
  if (env("EMAIL_TRANSPORT") === "console") return (transport = nodemailer.createTransport({ jsonTransport: true }));
  if (!env("SMTP_HOST")) return null;
  const port = Number(env("SMTP_PORT") || 587);
  return (transport = nodemailer.createTransport({ host: env("SMTP_HOST"), port, secure: port === 465, auth: env("SMTP_USER") ? { user: env("SMTP_USER"), pass: env("SMTP_PASS") } : undefined }));
}

export async function sendEmail(m: { to: string; subject: string; text: string; html?: string }): Promise<ChannelResult> {
  const t = mailer();
  if (!t) return { status: "SKIPPED", detail: "SMTP not configured" };
  const info = await t.sendMail({ from: env("SMTP_FROM") || "HerrGlow <no-reply@herrglow.com>", to: m.to, subject: m.subject, text: m.text, html: m.html });
  if (env("EMAIL_TRANSPORT") === "console") console.log(`[email → ${m.to}] ${m.subject}`);
  return { status: "SENT", detail: String((info as { messageId?: string }).messageId ?? "") };
}

/* ───────── Telegram bot ───────── */
export async function sendTelegram(text: string): Promise<ChannelResult> {
  const token = env("TELEGRAM_BOT_TOKEN"), chat = env("TELEGRAM_CHAT_ID");
  if (!token || !chat) return { status: "SKIPPED", detail: "Telegram not configured" };
  const base = env("TELEGRAM_API_BASE") || "https://api.telegram.org";
  const res = await fetch(`${base}/bot${token}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }), signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return { status: "SENT" };
}

/* ───────── WhatsApp Cloud API: built, OFF until WHATSAPP_ENABLED=true and a number exists ───────── */
export const whatsappEnabled = () => env("WHATSAPP_ENABLED") === "true";

export async function sendWhatsApp(m: { to: string; text?: string; template?: { name: string; lang?: string; params?: string[] } }): Promise<ChannelResult> {
  if (!whatsappEnabled()) return { status: "SKIPPED", detail: "WHATSAPP_ENABLED is not true" };
  const phoneId = env("WHATSAPP_PHONE_ID"), token = env("WHATSAPP_TOKEN");
  if (!phoneId || !token) return { status: "SKIPPED", detail: "WhatsApp credentials missing" };
  const digits = m.to.replace(/\D/g, "");
  const to = digits.length === 10 ? `91${digits}` : digits;
  // outside the 24h customer-service window WhatsApp only allows approved TEMPLATES; use one when provided
  const body = m.template
    ? { messaging_product: "whatsapp", to, type: "template", template: { name: m.template.name, language: { code: m.template.lang ?? "en" }, components: m.template.params?.length ? [{ type: "body", parameters: m.template.params.map((p) => ({ type: "text", text: p })) }] : [] } }
    : { messaging_product: "whatsapp", to, type: "text", text: { body: m.text ?? "" } };
  const base = env("WHATSAPP_API_BASE") || "https://graph.facebook.com/v21.0";
  const res = await fetch(`${base}/${phoneId}/messages`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`WhatsApp ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return { status: "SENT" };
}

/** Injectable so tests (and the worker) can swap real delivery for fakes. */
export interface Channels { email: typeof sendEmail; telegram: typeof sendTelegram; whatsapp: typeof sendWhatsApp }
export const realChannels: Channels = { email: sendEmail, telegram: sendTelegram, whatsapp: sendWhatsApp };
export const ownerEmail = () => env("OWNER_EMAIL");
