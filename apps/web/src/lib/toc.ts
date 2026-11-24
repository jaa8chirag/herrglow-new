/** Adds ids to h2/h3 headings and returns a table of contents. Pure string work: runs on the server. */
export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&[a-z]+;/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

export function withToc(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Set<string>();
  const out = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_m, lvl: string, attrs: string, inner: string) => {
      const text = inner
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .trim();
      let id = slug(text) || `section-${toc.length + 1}`;
      while (used.has(id)) id += "-2";
      used.add(id);
      toc.push({ id, text, level: Number(lvl) as 2 | 3 });
      return `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`;
    }
  );
  return { html: out, toc };
}

export const readingMinutes = (html: string) =>
  Math.max(
    1,
    Math.round(
      html
        .replace(/<[^>]+>/g, " ")
        .split(/\s+/)
        .filter(Boolean).length / 200
    )
  );

/** Simple topic buckets for the blog filter chips (derived from the title; no extra data needed). */
export const topicOf = (title: string) => {
  const t = title.toLowerCase();
  if (/raksha|karva|festive|diwali|festival/.test(t)) return "Festive";
  if (/skin|facial|glow|detox|care/.test(t)) return "Skincare";
  if (/hair|nail/.test(t)) return "Hair & Nails";
  if (/bridal|bride|wedding|makeup/.test(t)) return "Bridal & Makeup";
  return "Guides";
};
