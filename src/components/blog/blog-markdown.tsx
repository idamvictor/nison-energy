import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-10 mb-4 font-heading text-xl font-semibold text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 font-heading text-lg font-semibold text-foreground">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-[0.95rem] leading-relaxed text-foreground/80">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 flex flex-col gap-1.5 pl-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 flex flex-col gap-1.5 pl-5 [counter-reset:item]">{children}</ol>
  ),
  li: ({ children, ...props }) => {
    const ordered = "ordered" in props && (props as { ordered?: boolean }).ordered;
    return (
      <li
        className={
          ordered
            ? "list-decimal text-[0.95rem] leading-relaxed text-foreground/80 marker:font-medium marker:text-primary"
            : "flex items-start gap-2 text-[0.95rem] leading-relaxed text-foreground/80"
        }
      >
        {!ordered && <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />}
        <span>{children}</span>
      </li>
    );
  },
  a: ({ href, children }) => {
    if (!href) return <>{children}</>;
    const internal = href.startsWith("/");
    return internal ? (
      <Link href={href} className="font-medium text-primary underline underline-offset-2">
        {children}
      </Link>
    ) : (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-2"
      >
        {children}
      </a>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="my-5 rounded-r-lg border-l-4 border-primary/40 bg-primary/5 px-4 py-3 text-[0.95rem] text-foreground/80 [&_p]:mb-0">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="mb-5 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-secondary/60">{children}</thead>,
  th: ({ children }) => (
    <th className="px-3.5 py-2.5 font-heading text-xs font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-t border-border px-3.5 py-2.5 text-foreground/80">{children}</td>
  ),
  hr: () => <hr className="my-8 border-border" />,
};

export function BlogMarkdown({ content }: { content: string }) {
  return (
    <div>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
