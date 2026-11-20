import { prisma } from "@herrglow/db";
import { sanitizeRichHtml, wordCount } from "./html";
import { syncPages } from "../seo/pages";
import { asFaqs, type Faq } from "../site/queries";

export type ReviewKind = "service-city" | "service" | "blog";
export const THIN_SERVICE_WORDS = 80;
export const THIN_BLOG_WORDS = 350;
export const MIN_PUBLISH_WORDS = 60;

export interface ReviewItem { kind: ReviewKind; id: string; title: string; label: string; reason: string; words: number }

/** "Question || Answer" per line  ↔  Faq[]  (simple, paste-friendly editor format) */
export const faqsToText = (v: unknown) => asFaqs(v).map((f) => `${f.question} || ${f.answer}`).join("\n");
export const textToFaqs = (t: string): Faq[] =>
  t.split(/\r?\n/).map((l) => l.split("||").map((x) => x.trim())).filter((p) => p.length >= 2 && p[0] && p[1]).map(([question, answer]) => ({ question: question!, answer: answer! }));

export async function listReviewQueue(): Promise<ReviewItem[]> {
  const [drafts, services, blogs] = await Promise.all([
    prisma.serviceCity.findMany({ where: { contentStatus: "DRAFT", localContent: { not: null }, service: { status: "ACTIVE", mergedIntoId: null }, city: { isActive: true } }, include: { service: { select: { title: true } }, city: { select: { name: true } } }, orderBy: { generatedAt: "desc" } }),
    prisma.service.findMany({ where: { status: "ACTIVE", mergedIntoId: null }, select: { id: true, title: true, description: true } }),
    prisma.blog.findMany({ where: { status: "ACTIVE" }, select: { id: true, title: true, content: true } }),
  ]);
  const items: ReviewItem[] = drafts.map((d) => ({
    kind: "service-city", id: `${d.serviceId}|${d.cityId}`, title: `${d.service.title} in ${d.city.name}`, label: "Service × city draft",
    reason: "Generated from real data; needs review before publishing", words: wordCount(d.localContent),
  }));
  for (const s of services) { const w = wordCount(s.description); if (w < THIN_SERVICE_WORDS) items.push({ kind: "service", id: s.id, title: s.title, label: "Thin service", reason: `Description ${w}/${THIN_SERVICE_WORDS} words: noindex until fixed`, words: w }); }
  for (const b of blogs) { const w = wordCount(b.content); if (w < THIN_BLOG_WORDS) items.push({ kind: "blog", id: b.id, title: b.title, label: "Thin blog", reason: `${w}/${THIN_BLOG_WORDS} words: noindex until rewritten`, words: w }); }
  return items;
}

export async function getReviewItem(kind: ReviewKind, id: string) {
  if (kind === "service-city") {
    const [serviceId, cityId] = id.split("|");
    const row = await prisma.serviceCity.findUnique({ where: { serviceId_cityId: { serviceId: serviceId!, cityId: cityId! } }, include: { service: { select: { title: true, slug: true } }, city: { select: { name: true, slug: true } } } });
    return row && { kind, id, title: `${row.service.title} in ${row.city.name}`, status: row.contentStatus, fields: { localContent: row.localContent ?? "", faqs: faqsToText(row.faqs) }, publicPath: `/${row.service.slug}-in-${row.city.slug}` };
  }
  if (kind === "service") {
    const s = await prisma.service.findUnique({ where: { id } });
    return s && { kind, id, title: s.title, status: s.status, fields: { description: s.description ?? "", shortDescription: s.shortDescription ?? "", features: s.features ?? "", seoTitle: s.seoTitle ?? "", seoDescription: s.seoDescription ?? "", faqs: faqsToText(s.faqs) }, publicPath: `/services/${s.slug}` };
  }
  const b = await prisma.blog.findUnique({ where: { id } });
  return b && { kind, id, title: b.title, status: b.status, fields: { content: b.content ?? "", excerpt: b.excerpt ?? "", seoTitle: b.seoTitle ?? "", seoDescription: b.seoDescription ?? "" }, publicPath: `/blog/${b.slug}` };
}

export type ReviewResult = { ok: true; message: string } | { ok: false; error: string };

/** Saves edits (HTML is sanitised) and optionally publishes a service×city draft. Re-runs the page sync so index flags update immediately. */
export async function saveReviewItem(kind: ReviewKind, id: string, f: Record<string, string>, publish: boolean): Promise<ReviewResult> {
  if (kind === "service-city") {
    const [serviceId, cityId] = id.split("|");
    const localContent = sanitizeRichHtml(f.localContent ?? "");
    const faqs = textToFaqs(f.faqs ?? "");
    if (publish && wordCount(localContent) < MIN_PUBLISH_WORDS) return { ok: false, error: `Needs at least ${MIN_PUBLISH_WORDS} words to publish (has ${wordCount(localContent)}).` };
    if (publish && faqs.length === 0) return { ok: false, error: "Add at least one FAQ (format: Question || Answer) before publishing." };
    await prisma.serviceCity.update({ where: { serviceId_cityId: { serviceId: serviceId!, cityId: cityId! } }, data: { localContent, faqs, ...(publish ? { contentStatus: "PUBLISHED", generatedAt: new Date() } : {}) } });
  } else if (kind === "service") {
    await prisma.service.update({ where: { id }, data: { description: sanitizeRichHtml(f.description ?? ""), shortDescription: (f.shortDescription ?? "").trim() || null, features: (f.features ?? "").trim() || null, seoTitle: (f.seoTitle ?? "").trim() || null, seoDescription: (f.seoDescription ?? "").trim() || null, faqs: textToFaqs(f.faqs ?? "") } });
  } else {
    await prisma.blog.update({ where: { id }, data: { content: sanitizeRichHtml(f.content ?? ""), excerpt: (f.excerpt ?? "").trim() || null, seoTitle: (f.seoTitle ?? "").trim() || null, seoDescription: (f.seoDescription ?? "").trim() || null } });
  }
  const sync = await syncPages();
  return { ok: true, message: publish ? `Published. ${sync.upserted} pages re-checked.` : `Saved. ${sync.upserted} pages re-checked.` };
}

/** Pull a published service×city page back to draft (removes it from the site and sitemap). */
export async function unpublishServiceCity(id: string) {
  const [serviceId, cityId] = id.split("|");
  await prisma.serviceCity.update({ where: { serviceId_cityId: { serviceId: serviceId!, cityId: cityId! } }, data: { contentStatus: "DRAFT" } });
  await syncPages();
}
