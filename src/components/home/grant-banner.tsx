import Link from "next/link";
import { ClipboardCheck, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";

export function GrantBanner() {
  return (
    <section id="grants" className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <SectionKicker center tone="invert" />
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Are You Eligible For £500 Off?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/75">
              Most homes and workplaces qualify. Run a free eligibility
              check below — it takes under two minutes.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                className="h-11 gap-2 bg-accent px-5 text-accent-foreground hover:bg-accent/90"
                nativeButton={false}
                render={<Link href="/ozev-grants" />}
              >
                <ShieldCheck className="size-4" />
                OZEV eligibility checker
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 border-white/25 bg-transparent px-5 text-primary-foreground hover:bg-white/10"
                nativeButton={false}
                render={<Link href="/ozev-grants/workplace-charging-scheme" />}
              >
                <ClipboardCheck className="size-4" />
                Workplace eligibility checker
              </Button>
            </div>

            <div className="mx-auto mt-8 max-w-md border-t border-white/15 pt-6">
              <Button
                variant="outline"
                className="h-11 w-full border-white/25 bg-transparent text-sm text-primary-foreground hover:bg-white/10"
                nativeButton={false}
                render={<Link href="/contact-us" />}
              >
                Start your home survey · pick a charger · claim your £500 grant
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
