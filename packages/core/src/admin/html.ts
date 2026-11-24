import sanitize from "sanitize-html";

/** Everything an admin saves as rich text goes through this; public pages render it with dangerouslySetInnerHTML. */
export const sanitizeRichHtml = (html: string) =>
  sanitize(html, {
    allowedTags: [
      "p",
      "br",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "strong",
      "em",
      "b",
      "i",
      "a",
      "blockquote",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "img",
      "hr",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
  });

export const wordCount = (html: string | null | undefined) =>
  html
    ? html
        .replace(/<[^>]+>/g, " ")
        .split(/\s+/)
        .filter(Boolean).length
    : 0;
