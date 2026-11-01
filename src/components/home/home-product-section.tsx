import { Children, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";
import { Button } from "@/components/ui/button";

/**
 * A home page product row: heading, up to three cards per row, and one or
 * more "view all" buttons. Renders nothing when there are no cards.
 */
export function HomeProductSection({
  title,
  subtitle,
  tone = "plain",
  links,
  children,
}: {
  title: string;
  subtitle: string;
  tone?: "plain" | "tinted";
  links: { href: string; label: string }[];
  children: ReactNode;
}) {
  const cards = Children.toArray(children);
  if (cards.length === 0) return null;

  return (
    <section className={tone === "tinted" ? "bg-secondary" : "bg-background"}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <SectionKicker center />
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">{title}</h2>
            <p className="mt-3 text-muted-foreground">{subtitle}</p>
          </div>
        </Reveal>

        <div className="mt-8 flex flex-wrap justify-center gap-7">
          {cards.map((card, index) => (
            <Reveal
              key={index}
              delay={(index % 3) * 75}
              className="w-full sm:w-[calc((100%-1.75rem)/2)] lg:w-[calc((100%-3.5rem)/3)]"
            >
              {card}
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {links.map((link) => (
              <Button
                key={link.href}
                size="lg"
                variant="outline"
                nativeButton={false}
                className="gap-2"
                render={<Link href={link.href} />}
              >
                {link.label}
                <ArrowRight className="size-4" />
              </Button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
