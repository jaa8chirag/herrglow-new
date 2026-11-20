import { prisma } from "@herrglow/db";

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  tagline: string | null;
  /** Empty by default. When empty the UI hides call/WhatsApp and JSON-LD omits `telephone`. */
  whatsappNumber: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  raw: Record<string, string | null>;
}

let cache: { at: number; value: SiteSettings } | null = null;

export async function getSettings(): Promise<SiteSettings> {
  if (cache && Date.now() - cache.at < 60_000) return cache.value;
  const rows = await prisma.siteSetting.findMany();
  const raw = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const clean = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);
  const value: SiteSettings = {
    siteName: clean(raw.site_name) ?? "HerrGlow",
    siteUrl: clean(raw.site_url) ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://herrglow.com",
    tagline: clean(raw.site_tagline),
    whatsappNumber: clean(raw.whatsapp_number),
    contactPhone: clean(raw.contact_phone),
    contactEmail: clean(raw.contact_email),
    raw,
  };
  cache = { at: Date.now(), value };
  return value;
}

/** WhatsApp/call UI is shown only when a number is configured. */
export const hasContactNumber = (s: SiteSettings) => !!(s.whatsappNumber || s.contactPhone);
