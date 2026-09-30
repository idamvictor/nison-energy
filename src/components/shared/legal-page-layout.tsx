import type { LucideIcon } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { PageHero } from "@/components/shared/page-hero";
import { HelpSection } from "@/components/shared/help-section";
import { BlogMarkdown } from "@/components/blog/blog-markdown";
import { LegalToc } from "@/components/shared/legal-toc";

export type LegalSection = { id: string; label: string };

/** Optional "at a glance" cards shown above the document. */
export type LegalHighlight = { icon: LucideIcon; title: string; text: string };

export function LegalPageLayout({
  title,
  subtitle,
  sections,
  content,
  highlights,
}: {
  title: string;
  subtitle: string;
  sections: LegalSection[];
  content: string;
  highlights?: LegalHighlight[];
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <PageHero align="left" eyebrow="Legal" title={title} subtitle={subtitle} />

        <section className="bg-background">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
              <LegalToc sections={sections} />

              <div className="flex min-w-0 flex-col gap-6">
                {highlights && highlights.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      At a glance
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {highlights.map(({ icon: Icon, title, text }) => (
                        <div
                          key={title}
                          className="flex items-start gap-3 rounded-xl border border-foreground/12 bg-secondary/60 p-4"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent-strong">
                            <Icon className="size-4.5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{title}</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="min-w-0 rounded-2xl border border-foreground/15 bg-card p-6 shadow-md sm:p-10">
                  <BlogMarkdown content={content} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
