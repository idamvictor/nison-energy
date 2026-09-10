// Renders a blog post body. The HTML is sanitised at write time
// (src/lib/blog/sanitize.ts) — every path that stores `bodyHtml` runs it through
// `cleanBodyHtml` first, so this is safe to inject. Styling lives in the
// `.blog-content` block in globals.css.
export function RichContent({ html }: { html: string }) {
  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
