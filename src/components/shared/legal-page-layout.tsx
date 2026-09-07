import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { HelpSection } from "@/components/shared/help-section";
import { BlogMarkdown } from "@/components/blog/blog-markdown";

export type LegalSection = { id: string; label: string };

export function LegalPageLayout({
  title,
  subtitle,
  sections,
  content,
}: {
  title: string;
  subtitle: string;
  sections: LegalSection[];
  content: string;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-primary-foreground/75">{subtitle}</p>
          </div>
        </div>

        <section className="bg-background">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
              <nav className="hidden lg:block">
                <div className="sticky top-24 flex flex-col gap-1 border-l border-foreground/15 pl-4">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    On this page
                  </p>
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="py-1 text-sm text-foreground/70 transition-colors hover:text-primary"
                    >
                      {section.label}
                    </a>
                  ))}
                </div>
              </nav>

              <div className="min-w-0 rounded-2xl border border-foreground/15 bg-card p-6 shadow-md sm:p-10">
                <BlogMarkdown content={content} />
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
