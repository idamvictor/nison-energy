"use client";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { OpenQuoteEmbed } from "@/components/shared/openquote-embed";
import { useNotifications } from "@/hooks/use-notifications";

const OPENQUOTE_URL = "https://app.openquote.net/company/ocunioenergy?category=EV";

export function VirtualSurveyView() {
  const pushNotification = useNotifications((s) => s.push);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Start Your Virtual Survey
            </h1>
            <p className="mt-3 text-primary-foreground/75">
              Confirm your charger, any additional work required, and the
              grant-adjusted price — through our OpenQuote system.
            </p>
          </div>
        </div>

        <section className="bg-background">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <OpenQuoteEmbed
              src={OPENQUOTE_URL}
              onComplete={() =>
                pushNotification(
                  "grant",
                  "Virtual survey completed",
                  "We'll confirm your installation slot and send a deposit invoice."
                )
              }
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
