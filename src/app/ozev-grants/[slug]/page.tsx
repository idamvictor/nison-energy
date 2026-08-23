import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  ExternalLink,
  FileText,
  ListChecks,
  Phone,
  X,
} from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { HelpSection } from "@/components/shared/help-section";
import { Reveal } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { grantSchemes, getGrantScheme } from "@/lib/grants";

export function generateStaticParams() {
  return grantSchemes.map((scheme) => ({ slug: scheme.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const scheme = getGrantScheme(slug);
  if (!scheme) return {};

  return {
    title: `${scheme.audience} | OZEV Grants | Nison Energy`,
    description: scheme.tagline,
  };
}

export default async function GrantSchemePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scheme = getGrantScheme(slug);

  if (!scheme) notFound();

  const otherSchemes = grantSchemes.filter((s) => s.slug !== scheme.slug);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/ozev-grants" className="hover:text-foreground">
              OZEV Grants
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">{scheme.audience}</span>
          </nav>
        </div>

        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                {scheme.status === "closed" && (
                  <Badge variant="destructive" className="mb-3">
                    Closed to new applications
                  </Badge>
                )}
                <p className="text-sm font-medium tracking-wide text-primary uppercase">
                  {scheme.audience}
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
                  {scheme.title}
                </h1>
                <p className="mt-3 text-muted-foreground">{scheme.tagline}</p>
                <p className="mt-4 text-2xl font-semibold text-primary">
                  {scheme.grantAmount}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                    nativeButton={false}
                    render={<Link href="/contact-us" />}
                  >
                    Request a call back
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2"
                    nativeButton={false}
                    render={<a href="tel:03306330252" />}
                  >
                    <Phone className="size-4" />
                    033 0633 0252
                  </Button>
                </div>
              </div>

              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-secondary">
                <Image
                  src={scheme.image}
                  alt={scheme.audience}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>

          {scheme.status === "closed" && scheme.statusNote && (
            <Reveal>
              <div className="mt-8 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3.5">
                <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-destructive" />
                <p className="text-sm text-foreground/80">{scheme.statusNote}</p>
              </div>
            </Reveal>
          )}
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12">
            <Reveal>
              <div className="flex flex-col gap-4 text-foreground/80">
                {scheme.overview.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {scheme.grantDetails && (
                <ul className="mt-4 flex flex-col gap-2">
                  {scheme.grantDetails.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>

            <Reveal>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Who can apply
                  </h2>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {scheme.eligibility.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Who can&apos;t apply
                  </h2>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {scheme.ineligible.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                        <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            {scheme.requirements && (
              <Reveal>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Requirements
                </h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {scheme.requirements.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {scheme.documentation && (
              <Reveal>
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
                  <FileText className="size-4.5 text-primary" />
                  Documentation you&apos;ll need
                </h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {scheme.documentation.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            <Reveal>
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
                <ListChecks className="size-4.5 text-primary" />
                How to apply
              </h2>
              <ol className="mt-5 flex flex-col gap-5">
                {scheme.applicationSteps.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                    <p className="text-sm text-foreground/80">{step}</p>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Useful links
              </h2>
              <div className="mt-4 flex flex-col gap-2">
                {scheme.resources.map((resource) => (
                  <a
                    key={resource.href}
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="size-3.5 shrink-0" />
                    {resource.label}
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {otherSchemes.length > 0 && (
          <section className="bg-secondary">
            <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
                Other grant schemes
              </h2>
              <div className="mt-6 flex flex-col gap-2">
                {otherSchemes.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/ozev-grants/${s.slug}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-5 py-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div>
                      <p className="font-medium text-foreground">{s.audience}</p>
                      <p className="text-sm text-muted-foreground">{s.tagline}</p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
