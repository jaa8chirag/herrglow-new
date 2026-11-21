import { adminLeadUrl, siteUrl } from "./channels";

const when = (d: Date) => d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const day = (d: Date | null | undefined) => (d ? d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }) : null);

export interface LeadView {
  id: string;
  bookingRef: string | null;
  name: string;
  phone: string;
  email: string | null;
  locationText: string | null;
  eventDate: Date | null;
  message: string | null;
  tags: string[];
  createdAt: Date;
  services: string[];
  packageName?: string | null;
  variant?: string;
  amount?: number | null;
}

export const isOutOfArea = (l: Pick<LeadView, "tags">) => l.tags.includes("out_of_area");

/** Owner alert: short, scannable, with the admin link. */
export function ownerLeadText(l: LeadView): string {
  const serviceLabel = l.services.length
    ? l.services.join(", ")
    : (l.packageName ? `Package: ${l.packageName}` : "General enquiry");

  return [
    isOutOfArea(l) ? "OUT OF AREA lead" : "New booking request",
    l.bookingRef ? `Booking ID: ${l.bookingRef}` : null,
    "",
    `${l.name} · +91 ${l.phone}`,
    `Service: ${serviceLabel}${l.variant ? ` (${l.variant})` : ""}`,
    l.amount ? `Estimated Amount: ₹${Math.round(l.amount).toLocaleString("en-IN")}` : null,
    `Where: ${l.locationText ?? "not given"}`,
    day(l.eventDate) ? `Date: ${day(l.eventDate)}` : null,
    l.message ? `Note: ${l.message.slice(0, 200)}` : null,
    `Received: ${when(l.createdAt)}`,
    "",
    adminLeadUrl(l.id),
  ].filter((x) => x !== null).join("\n");
}

export const ownerLeadSubject = (l: LeadView) =>
  `${isOutOfArea(l) ? "[Out of area] " : ""}Booking ${l.bookingRef ?? ""}: ${l.name}, ${l.services[0] ?? l.packageName ?? "enquiry"}${l.locationText ? ` (${l.locationText})` : ""}`;

/** Customer confirmation. Honest about what happens next: no invented time promises. */
export function customerEmail(l: LeadView, siteName = "HerrGlow") {
  const first = l.name.split(" ")[0];
  const out = isOutOfArea(l);
  const serviceLabel = l.services.length
    ? l.services.join(", ")
    : (l.packageName ? `Package: ${l.packageName}` : "appointment");

  const lines = out
    ? [`Hi ${first},`, "", `Thank you for your interest in ${siteName}. We do not serve your area yet, but we have saved your request and will let you know as soon as artists are available near you.`]
    : [
        `Hi ${first},`,
        "",
        `Thank you for booking with ${siteName}! We have received your appointment request for ${serviceLabel}.`,
        "",
        l.bookingRef ? `Booking ID: ${l.bookingRef}` : "",
        l.amount ? `Estimated Total: ₹${Math.round(l.amount).toLocaleString("en-IN")} (Pay after service)` : "",
        day(l.eventDate) ? `Requested date: ${day(l.eventDate)}` : "",
        l.locationText ? `Location: ${l.locationText}` : "",
      ].filter((x) => x !== undefined);
  const text = [...lines, "", `If anything above is wrong, just reply to this email.`, "", `${siteName}`, siteUrl()].join("\n");
  const html = `<div style="font-family:system-ui,sans-serif;line-height:1.6;color:#2a1f24;max-width:520px">${lines.map((x) => (x ? `<p>${esc(x)}</p>` : "")).join("")}<p style="color:#5e4f55">If anything above is wrong, just reply to this email.</p><p><strong>${esc(siteName)}</strong><br><a href="${siteUrl()}">${siteUrl()}</a></p></div>`;
  return { subject: out ? `We have noted your request, ${first}` : `Booking Confirmed: ${l.bookingRef ?? first} · ${siteName}`, text, html };
}
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function customerWhatsAppText(l: LeadView) {
  return isOutOfArea(l)
    ? `Hi ${l.name.split(" ")[0]}, thanks for contacting HerrGlow. We are not in your area yet but have noted your request and will message you when we are.`
    : `Hi ${l.name.split(" ")[0]}, thanks for contacting HerrGlow. We received your request${l.bookingRef ? ` (${l.bookingRef})` : ""} and will confirm the details shortly.`;
}

export interface Digest { newLast24h: number; outOfArea24h: number; unattended: { id: string; name: string; service: string; where: string; ageHours: number }[]; totalUnattended: number }

export function digestText(d: Digest): string {
  const head = [`HerrGlow daily summary`, `New leads (24h): ${d.newLast24h}${d.outOfArea24h ? ` (${d.outOfArea24h} out of area)` : ""}`, `Unattended > 2h: ${d.totalUnattended}`];
  if (!d.unattended.length) return [...head, "", "Nothing is waiting. All recent leads were handled."].join("\n");
  const rows = d.unattended.map((u) => `• ${u.name} · ${u.service} · ${u.where} · ${u.ageHours >= 48 ? `${Math.round(u.ageHours / 24)}d` : `${Math.round(u.ageHours)}h`} ago\n  ${adminLeadUrl(u.id)}`);
  return [...head, "", ...rows, d.totalUnattended > d.unattended.length ? `…and ${d.totalUnattended - d.unattended.length} more: ${siteUrl()}/admin/leads?status=NEW` : ""].filter(Boolean).join("\n");
}

export function applicationText(a: { id: string; name: string; phone: string; city: string; categories: string[]; experienceYears: number | null }) {
  return [`New artist application`, "", `${a.name} · ${a.phone}`, `City: ${a.city}`, a.categories.length ? `Offers: ${a.categories.join(", ")}` : null, a.experienceYears != null ? `Experience: ${a.experienceYears} years` : null, "", `${siteUrl()}/admin/applications/${a.id}`].filter((x) => x !== null).join("\n");
}
