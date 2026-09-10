// Shared HTML sanitiser for blog bodies. Plain module (no "server-only") so it
// can be imported by both src/lib/blog/queries.ts and the prisma seed script.
import sanitizeHtml from "sanitize-html";

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2",
    "h3",
    "h4",
    "p",
    "strong",
    "em",
    "s",
    "u",
    "a",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "hr",
    "br",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

/** Strip everything not on the allow-list. Run on every write. */
export function cleanBodyHtml(dirty: string): string {
  return sanitizeHtml(dirty, OPTIONS).trim();
}

/** Plain-text content of an HTML string — used to check a body isn't empty. */
export function htmlToText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
