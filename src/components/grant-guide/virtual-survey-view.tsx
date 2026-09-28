import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { PageHero } from "@/components/shared/page-hero";
import { OpenQuoteEmbed } from "@/components/shared/openquote-embed";

const OPENQUOTE_URL = "https://app.openquote.net/company/ocunioenergy?category=EV";

export function VirtualSurveyView() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <PageHero
          eyebrow="Virtual survey"
          title="Start Your Virtual Survey"
          subtitle="Confirm your charger, any additional work required, and the grant-adjusted price — through our OpenQuote system."
        />

        <section className="bg-background">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <OpenQuoteEmbed src={OPENQUOTE_URL} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
