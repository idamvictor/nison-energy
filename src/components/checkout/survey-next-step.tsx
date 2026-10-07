import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OPENQUOTE_SURVEY_URL } from "@/lib/content/openquote";

/**
 * Shown under the order confirmation when the order includes installation:
 * the virtual survey is the customer's next step, so point them straight to it.
 */
export function SurveyNextStep() {
  return (
    <section className="mx-auto mt-8 flex w-full max-w-3xl flex-col items-start gap-3 rounded-2xl border-2 border-primary bg-card p-5 shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">Next step</p>
        <h2 className="mt-1.5 font-heading text-xl font-semibold text-foreground">
          Complete your virtual survey
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          It takes about 5 minutes — a few photos and questions about where your charger is going.
          Our team reviews it before booking your installation.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Or open the survey directly:{" "}
          <a
            href={OPENQUOTE_SURVEY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium break-all text-primary-ink underline underline-offset-2 hover:text-foreground"
          >
            app.openquote.net/company/ocunioenergy
          </a>
        </p>
      </div>
      <Button
        size="lg"
        variant="cta"
        className="shrink-0 gap-1.5"
        nativeButton={false}
        render={<Link href="/virtual-survey" />}
      >
        Start your survey
        <ArrowRight className="size-4" />
      </Button>
    </section>
  );
}
