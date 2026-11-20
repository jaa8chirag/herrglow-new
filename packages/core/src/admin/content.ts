import { prisma } from "@herrglow/db";
import type { Status } from "@herrglow/db";
import { sanitizeRichHtml, wordCount } from "./html";
import { syncPages } from "../seo/pages";
import { relatedServicesForText } from "../site/queries";
import { resetSettingsCache } from "../settings";

const slugify = (s: string) => s.toLowerCase().trim().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ───────────── Blogs ───────────── */
export async function listBlogsAdmin() {
  const [blogs, pages] = await Promise.all([
    prisma.blog.findMany({ orderBy: { publishedAt: "desc" }, select: { id: true, title: true, slug: true, status: true, content: true, publishedAt: true, updatedAt: true } }),
    prisma.page.findMany({ where: { type: "BLOG" }, select: { entityId: true, isIndexable: true } }),
  ]);
  const idx = new Map(pages.map((p) => [p.entityId, p.isIndexable]));
  return blogs.map((b) => ({ ...b, words: wordCount(b.content), internalLinks: (b.content?.match(/href="\//g) ?? []).length, indexable: idx.get(b.id) ?? false }));
}

export async function getBlogAdmin(id: string) {
  return prisma.blog.findUnique({ where: { id } });
}

export interface BlogInput { id?: string; title: string; slug?: string; excerpt?: string; content: string; status: Status; authorName?: string; seoTitle?: string; seoDescription?: string; image?: string; imageAlt?: string }
export type BlogResult = { ok: true; id: string; links: number } | { ok: false; error: string };

/** Create or update. A changed slug keeps the old URL alive with a 301. Content is sanitised. */
export async function saveBlog(i: BlogInput): Promise<BlogResult> {
  const title = i.title.trim();
  if (title.length < 5) return { ok: false, error: "Title is too short" };
  const slug = slugify(i.slug?.trim() || title);
  if (!slug) return { ok: false, error: "Slug is required" };
  const clash = await prisma.blog.findFirst({ where: { slug, ...(i.id ? { id: { not: i.id } } : {}) } });
  if (clash) return { ok: false, error: "Another post already uses that slug" };
  if (i.image && !i.imageAlt?.trim()) return { ok: false, error: "Alt text is required when a cover image is set" };
  const data = {
    title, slug, excerpt: i.excerpt?.trim() || null, content: sanitizeRichHtml(i.content), status: i.status, authorName: i.authorName?.trim() || null,
    seoTitle: i.seoTitle?.trim() || null, seoDescription: i.seoDescription?.trim() || null, image: i.image || null, imageAlt: i.imageAlt?.trim() || null,
  };
  let id = i.id;
  if (id) {
    const cur = await prisma.blog.findUnique({ where: { id }, select: { slug: true } });
    await prisma.blog.update({ where: { id }, data });
    if (cur && cur.slug !== slug) {
      const row = { fromPath: `/blog/${cur.slug}`, toPath: `/blog/${slug}`, code: "MOVED_301" as const, note: "blog slug changed in admin" };
      await prisma.redirect.upsert({ where: { fromPath: row.fromPath }, update: row, create: row });
      await prisma.redirect.deleteMany({ where: { fromPath: row.toPath } });
    }
  } else id = (await prisma.blog.create({ data })).id;
  await syncPages();
  return { ok: true, id: id!, links: (data.content.match(/href="\//g) ?? []).length };
}

/** Internal-link suggestions for a draft: services whose names appear in the text + live city hubs. */
export async function suggestBlogLinks(html: string) {
  const text = html.replace(/<[^>]+>/g, " ");
  const [services, cities] = await Promise.all([
    relatedServicesForText(text, 8),
    prisma.page.findMany({ where: { type: "CITY", isIndexable: true }, select: { url: true, entityId: true } }),
  ]);
  const have = new Set([...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]!));
  const out = [
    ...services.map((s) => ({ label: s.title, href: `/services/${s.slug}` })),
    ...cities.map((c) => ({ label: `Makeup artist in ${c.entityId}`, href: c.url })),
  ];
  return { suggestions: out.filter((s) => !have.has(s.href)), existing: have.size };
}

/* ───────────── Settings ───────────── */
export interface SettingField { key: string; label: string; hint?: string; type?: "text" | "textarea" | "bool" | "phone" | "email" | "percent" | "url" }
export const SETTING_GROUPS: { title: string; fields: SettingField[] }[] = [
  {
    title: "Business & contact",
    fields: [
      { key: "site_name", label: "Business name" },
      { key: "contact_email", label: "Contact email", type: "email", hint: "shown on the contact page and in structured data. Leave empty to hide" },
      { key: "whatsapp_number", label: "WhatsApp number", type: "phone", hint: "10-digit Indian number or with country code. Empty hides ALL WhatsApp buttons" },
      { key: "contact_phone", label: "Call number", type: "phone", hint: "empty hides call buttons. When set it is also published as the business telephone in structured data" },
      { key: "whatsapp_prefill_text", label: "WhatsApp pre-filled message", type: "textarea" },
    ],
  },
  {
    title: "Social links",
    fields: [
      { key: "social_instagram", label: "Instagram URL", type: "url", hint: "shown in the footer and in structured data (sameAs). Empty hides" },
      { key: "social_facebook", label: "Facebook URL", type: "url" },
      { key: "social_youtube", label: "YouTube URL", type: "url" },
    ],
  },
  {
    title: "Banner & offers",
    fields: [
      { key: "offer_strip_enabled", label: "Show offer strip at the top of the site", type: "bool", hint: "off by default" },
      { key: "offer_strip_text", label: "Offer strip text", type: "textarea" },
      { key: "site_tagline", label: "Tagline" },
    ],
  },
];

export async function getSettingsAdmin() {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""])) as Record<string, string>;
}

export type SettingsResult = { ok: true } | { ok: false; errors: Record<string, string> };

export async function saveSettings(values: Record<string, string>): Promise<SettingsResult> {
  const errors: Record<string, string> = {};
  const fields = SETTING_GROUPS.flatMap((g) => g.fields);
  const clean: Record<string, string | null> = {};
  for (const f of fields) {
    if (!(f.key in values)) continue;
    let v = (values[f.key] ?? "").trim();
    if (f.type === "bool") v = values[f.key] === "1" ? "1" : "0";
    if (f.type === "phone" && v) { const d = v.replace(/[^\d+]/g, ""); if (!/^\+?\d{10,13}$/.test(d)) errors[f.key] = "Enter a valid phone number (10 to 13 digits)"; else v = d; }
    if (f.type === "url" && v && !/^https:\/\/\S+\.\S+$/.test(v)) errors[f.key] = "Enter a full link starting with https://";
    if (f.type === "email" && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) errors[f.key] = "Enter a valid email address";
    if (f.key === "site_name" && !v) errors[f.key] = "Business name is required";
    clean[f.key] = v || null;
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  for (const [key, value] of Object.entries(clean)) await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  resetSettingsCache();
  return { ok: true };
}
