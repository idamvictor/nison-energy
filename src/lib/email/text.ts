/**
 * Plain-text alternative for an HTML email. Sending both parts (multipart)
 * scores better with spam filters than HTML-only mail, and is what text-only
 * clients show. Links keep their URL: "label (https://…)".
 */
export function htmlToText(html: string): string {
  return (
    html
      // Drop non-content blocks entirely.
      .replace(/<(head|style|script)[\s\S]*?<\/\1>/gi, "")
      // Links → "label (url)"; skip the URL when the label already is it.
      .replace(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href: string, label: string) => {
        const text = label.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
        return !text || text === href || href.startsWith("mailto:") ? text || href : `${text} (${href})`;
      })
      // Images → their alt text (e.g. the logo becomes "Ocunio Energy").
      .replace(/<img\s[^>]*alt="([^"]*)"[^>]*>/gi, "$1")
      // Block-level breaks become newlines.
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, "\n")
      .replace(/<\/td>/gi, " ")
      .replace(/<[^>]+>/g, "")
      // Entities used by the templates.
      .replace(/&nbsp;/g, " ")
      .replace(/&times;/g, "×")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      // Tidy whitespace: trim lines, max one blank line between blocks.
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}
