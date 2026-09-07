"use client";

import type { LegalSection } from "@/components/shared/legal-page-layout";

export function LegalToc({ sections }: { sections: LegalSection[] }) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav className="hidden lg:block">
      <div className="sticky top-24 flex flex-col gap-1 border-l border-foreground/15 pl-4">
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          On this page
        </p>
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => handleClick(e, section.id)}
            className="py-1 text-sm text-foreground/70 transition-colors hover:text-primary"
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
