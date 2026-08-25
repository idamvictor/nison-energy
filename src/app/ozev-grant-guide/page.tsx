"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  FileCheck2,
  Video,
  Zap,
} from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";
import { EligibilityQuiz } from "@/components/grant-guide/eligibility-quiz";
import { GrantApplicationTracker } from "@/components/grant-guide/grant-application-tracker";
import { OnStreetIntakeForm } from "@/components/grant-guide/on-street-intake-form";
import { QuoteRequestForm } from "@/components/shared/quote-request-form";
import { cn } from "@/lib/utils";

const OPENQUOTE_URL = "https://app.openquote.net/company/ocunioenergy?category=EV";

const wizardSteps = [
  { title: "Get Your Quote" },
  { title: "Tell Us You've Applied" },
  { title: "Authorisation Code" },
];

export default function OzevGrantGuidePage() {
  const [showGuide, setShowGuide] = useState(false);
  const [showOnStreetForm, setShowOnStreetForm] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteDownloaded, setQuoteDownloaded] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);
  const onStreetRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
            <SectionKicker tone="invert" />
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Do You Qualify For The £500 EV Chargepoint Grant?
            </h1>
            <p className="mt-3 text-primary-foreground/75">
              Answer three quick questions below. If you qualify, we&apos;ll
              walk you through applying for the Renters &amp; Flat Owners
              grant — with nothing charged until OZEV approves your
              application.
            </p>
          </div>
        </div>

        <section className="bg-background">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="mb-5 font-heading text-lg font-semibold text-foreground">
                <span className="mr-2 text-primary">01</span>
                Check Your Eligibility
              </h2>
              <EligibilityQuiz
                onPass={() => {
                  setShowGuide(true);
                  setShowOnStreetForm(false);
                  setWizardStep(0);
                  requestAnimationFrame(() =>
                    guideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  );
                }}
                onShowOnStreetForm={() => {
                  setShowOnStreetForm(true);
                  setShowGuide(false);
                  requestAnimationFrame(() =>
                    onStreetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  );
                }}
                onGetQuote={() => setQuoteOpen(true)}
                onReset={() => {
                  setShowGuide(false);
                  setShowOnStreetForm(false);
                }}
              />
            </Reveal>

            {showGuide && (
              <div ref={guideRef} className="mt-14 scroll-mt-24">
                <Reveal>
                  <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3.5 text-sm">
                    <Zap className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p className="text-foreground/80">
                      <strong className="text-foreground">No payment is due today.</strong>{" "}
                      Your Fully Managed package (charger, installation, and
                      OZEV support) is only charged once OZEV has approved
                      your application.
                    </p>
                  </div>
                </Reveal>

                <Reveal>
                  <h2 className="mt-12 mb-5 font-heading text-lg font-semibold text-foreground">
                    <span className="mr-2 text-primary">02</span>
                    Your Step-by-Step Guide
                  </h2>
                </Reveal>

                <Reveal>
                  <StepIndicator
                    current={wizardStep}
                    steps={wizardSteps}
                    onSelect={setWizardStep}
                  />
                </Reveal>

                <Reveal>
                  <Card className="mt-6">
                    <CardContent>
                      {wizardStep === 0 && (
                        <>
                          <StepHead number={1} title="Get Your Quote" />
                          <p className="text-sm text-foreground/80">
                            Select your charger and download your PDF quote —
                            you&apos;ll need this copy for your own records
                            and to submit with your grant application.
                          </p>
                          <Button
                            className="mt-4 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                            onClick={() => setQuoteOpen(true)}
                          >
                            Get My Quote
                            <ArrowRight className="size-4" />
                          </Button>
                          {quoteDownloaded && (
                            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-success">
                              <Check className="size-3.5" /> Quote downloaded
                            </p>
                          )}
                          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-foreground/80">
                            <span className="font-semibold text-accent">!</span>
                            <p>
                              Pick your charger carefully before you apply. If
                              you change your mind after submitting your grant
                              application, you&apos;ll need to restart the
                              whole process.
                            </p>
                          </div>
                        </>
                      )}

                      {wizardStep === 1 && (
                        <>
                          <StepHead number={2} title="Tell Us You've Applied" />
                          <p className="mb-5 text-sm text-foreground/80">
                            Once your application is submitted, let us know
                            so we&apos;re ready on our end. You can come back
                            and update your status at any point — nothing is
                            charged until your authorisation code arrives.
                          </p>
                          <GrantApplicationTracker />
                        </>
                      )}

                      {wizardStep === 2 && (
                        <>
                          <StepHead number={3} title="Once Your Authorisation Code Arrives" />
                          <p className="mb-4 text-sm text-foreground/80">
                            As soon as OZEV issues your authorisation code,
                            we move things forward in three steps:
                          </p>
                          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-primary/25 bg-primary/5 px-3.5 py-3 text-sm text-foreground/80">
                            <Video className="mt-0.5 size-4 shrink-0 text-primary" />
                            <p>
                              We send you a link to start the home survey
                              through our{" "}
                              <a
                                href={OPENQUOTE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-primary underline underline-offset-2"
                              >
                                OpenQuote system
                              </a>
                              , confirming your charger, any additional work
                              required, and the grant-adjusted price.
                            </p>
                          </div>
                          <Button
                            className="mb-5 gap-1.5"
                            nativeButton={false}
                            render={
                              <a href={OPENQUOTE_URL} target="_blank" rel="noopener noreferrer" />
                            }
                          >
                            Start Virtual Survey
                            <ExternalLink className="size-4" />
                          </Button>
                          <ul className="flex flex-col gap-2">
                            <li className="flex items-start gap-2 text-sm text-foreground/80">
                              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-primary" />
                              We invoice a deposit of at least 50% of the total
                              to secure your installation slot
                            </li>
                            <li className="flex items-start gap-2 text-sm text-foreground/80">
                              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-primary" />
                              The remaining balance is due and must clear
                              before our engineer arrives on site
                            </li>
                          </ul>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Reveal>

                <div className="mt-5 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setWizardStep((s) => Math.max(0, s - 1))}
                    className={cn("gap-1.5", wizardStep === 0 && "invisible")}
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  {wizardStep < wizardSteps.length - 1 && (
                    <Button
                      onClick={() => setWizardStep((s) => Math.min(wizardSteps.length - 1, s + 1))}
                      className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Next
                      <ArrowRight className="size-4" />
                    </Button>
                  )}
                </div>

                <p className="mt-6 text-xs text-muted-foreground italic">
                  Timescales are a guide only and depend on how quickly grants
                  are being pre-approved, which is currently slower than
                  usual due to high demand.
                </p>
              </div>
            )}

            {showOnStreetForm && (
              <div ref={onStreetRef} className="mt-14 scroll-mt-24">
                <Reveal>
                  <h2 className="mb-5 font-heading text-lg font-semibold text-foreground">
                    On-Street Parking Grant — Customer Intake
                  </h2>
                  <OnStreetIntakeForm />
                </Reveal>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />

      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Your Quote</DialogTitle>
            <DialogDescription>
              Select your charger and download your PDF quote — you&apos;ll
              need this for your grant application.
            </DialogDescription>
          </DialogHeader>
          <QuoteRequestForm
            showComplianceFooter={false}
            done={{
              label: "Done",
              onClick: () => {
                setQuoteOpen(false);
                setQuoteDownloaded(true);
              },
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StepIndicator({
  current,
  steps,
  onSelect,
}: {
  current: number;
  steps: { title: string }[];
  onSelect: (index: number) => void;
}) {
  return (
    <ol className="flex items-center">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.title} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={() => onSelect(index)}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full font-heading text-sm font-semibold transition-colors",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-accent text-accent-foreground",
                  !done && !active && "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  "max-w-24 text-xs leading-tight",
                  active ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </button>
            {index < steps.length - 1 && (
              <span
                className={cn("mx-2 h-0.5 flex-1 rounded-full", done ? "bg-primary" : "bg-muted")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StepHead({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground">
        {number}
      </span>
      <p className="font-heading text-base font-semibold text-foreground">{title}</p>
    </div>
  );
}
