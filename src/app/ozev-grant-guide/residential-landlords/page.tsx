"use client";

import { useRef, useState } from "react";
import Link from "next/link";
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
import {
  SchemeEligibilityQuiz,
  type QuizQuestion,
  type QuizOutcome,
} from "@/components/grant-guide/scheme-eligibility-quiz";
import { StepIndicator } from "@/components/grant-guide/step-indicator";
import { StepHead } from "@/components/grant-guide/step-head";
import { GrantApplicationTracker } from "@/components/grant-guide/grant-application-tracker";
import { LandlordQuoteForm } from "@/components/grant-guide/landlord-quote-form";
import { cn } from "@/lib/utils";

const wizardSteps = [
  { title: "Get Your Quote" },
  { title: "Tell Us You've Applied" },
  { title: "Submit Application" },
  { title: "Authorisation Code" },
];

const questions: QuizQuestion[] = [
  {
    key: "installType",
    label: "Installation type",
    options: [
      { label: "Individual rental house/flat", value: "single" },
      { label: "Multi-unit / block of flats", value: "multi" },
    ],
  },
  {
    key: "parking",
    label: "Parking for tenants",
    options: [
      { label: "Private off-street or designated communal bays", value: "yes" },
      { label: "No qualifying parking", value: "no" },
    ],
  },
  {
    key: "registered",
    label: "Do you have a Companies House registration number or an HMRC VAT number?",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
    ],
  },
];

function evaluate(answers: Record<string, string>): QuizOutcome | null {
  if (answers.parking === "no") {
    return {
      status: "fail",
      message:
        "This scheme requires sockets to serve private, designated off-street residential bays or dedicated communal tenant parking — without that, this property isn't eligible for the landlord grant.",
      actions: (
        <Button variant="outline" nativeButton={false} render={<Link href="/contact-us" />}>
          Ask about installation without the grant
        </Button>
      ),
    };
  }
  if (answers.registered === "no") {
    return {
      status: "warn",
      message:
        "You'll need a Companies House registration number or an HMRC VAT number before you can apply — the portal requires this to verify your entity. Get that in place first, then come back to apply.",
      actions: (
        <Button variant="outline" nativeButton={false} render={<Link href="/contact-us" />}>
          Ask about installation without the grant
        </Button>
      ),
    };
  }
  return { status: "pass" };
}

export default function ResidentialLandlordsGuidePage() {
  const [showGuide, setShowGuide] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteDownloaded, setQuoteDownloaded] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);

  function goToGuide() {
    setShowGuide(true);
    setWizardStep(0);
    requestAnimationFrame(() =>
      guideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
            <SectionKicker tone="invert" />
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Could Your Rental Property Qualify For Up To £500 Per Socket?
            </h1>
            <p className="mt-3 text-primary-foreground/75">
              Answer three quick questions below. If you qualify, we&apos;ll
              walk you through applying for the EV Chargepoint Grant for
              Residential Landlords — with nothing charged until OZEV
              approves your application.
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
              <SchemeEligibilityQuiz questions={questions} evaluate={evaluate} onPass={goToGuide} />
            </Reveal>

            {showGuide && (
              <div ref={guideRef} className="mt-14 scroll-mt-24">
                <Reveal>
                  <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3.5 text-sm">
                    <Zap className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p className="text-foreground/80">
                      <strong className="text-foreground">No payment is due today.</strong>{" "}
                      Your Fully Managed package (chargers, installation, and
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
                  <StepIndicator current={wizardStep} steps={wizardSteps} />
                </Reveal>

                <Reveal>
                  <Card className="mt-6">
                    <CardContent>
                      {wizardStep === 0 && (
                        <>
                          <StepHead number={1} title="Get Your Quote" />
                          <p className="text-sm text-foreground/80">
                            Complete your business, site, and itemised costs
                            to download a compliant, pre-filled quote —
                            itemised in the format OZEV expects for your
                            Residential Landlord grant application.
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
                              Confirm your socket count and property details
                              carefully before you apply. Changing your mind
                              after submitting your grant application means
                              restarting the whole process for that property.
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
                          <StepHead number={3} title="Submit Your Grant Application" />
                          <p className="text-sm text-foreground/80">
                            Before you apply, make sure you have these ready.
                            Requirements differ slightly depending on whether
                            this is a single rental property or a multi-unit
                            block:
                          </p>
                          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border border-border p-4">
                              <p className="mb-2 font-heading text-sm font-semibold text-primary">
                                Single Tenancy Rental
                              </p>
                              <ul className="flex flex-col gap-1.5">
                                {[
                                  "Companies House or VAT registration number",
                                  "Land Registry Title Deed for the property",
                                  "Itemised quote from Ocunio showing the £500 grant deduction",
                                  "Clear photo of the private driveway or tenant parking bay",
                                ].map((item) => (
                                  <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="rounded-lg border border-border p-4">
                              <p className="mb-2 font-heading text-sm font-semibold text-primary">
                                Multi-Unit / Block of Flats
                              </p>
                              <ul className="flex flex-col gap-1.5">
                                {[
                                  "Companies House or VAT registration number",
                                  "Freehold title, or RTM/management company minutes confirming authority over the parking areas",
                                  "Itemised quote from Ocunio showing all socket deductions (£500 per socket)",
                                  "Site layout diagram or photos of the marked tenant/communal bays",
                                ].map((item) => (
                                  <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-foreground/80">
                            <span className="font-semibold text-accent">!</span>
                            <p>
                              This grant isn&apos;t available if installing a
                              chargepoint here is a mandatory requirement —
                              for example, a new-build planning condition.
                            </p>
                          </div>

                          <p className="mt-4 text-sm text-foreground/80">
                            Once your documents are ready, here&apos;s what
                            the GOV.UK Find a Grant portal will ask for:
                          </p>
                          <ul className="mt-2 flex flex-col gap-1.5">
                            <li className="flex items-start gap-2 text-sm text-foreground/80">
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                              <span>
                                <strong className="text-foreground">Organisation &amp; identity:</strong> your
                                Companies House registration number or HMRC VAT number, plus your registered
                                contact and company address
                              </span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-foreground/80">
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                              <span>
                                <strong className="text-foreground">Site &amp; sockets:</strong> installation
                                type, the full site address, and the total number of sockets you&apos;re
                                applying for
                              </span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-foreground/80">
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                              <span>
                                <strong className="text-foreground">Installer assignment:</strong> Nison
                                Limited, OZEV Installer No. 13528, info@ocunioenergy.com
                              </span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-foreground/80">
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                              <span>
                                <strong className="text-foreground">Evidence upload:</strong> the documents
                                listed above
                              </span>
                            </li>
                          </ul>
                          <p className="mt-4 text-sm text-foreground/80">
                            OZEV reviews your application and notifies you
                            and Ocunio Energy by email once approved. One
                            thing to keep in mind: scheme rules mean we
                            can&apos;t book your installation until your
                            grant has been pre-approved.
                          </p>

                          <Button
                            className="mt-4 gap-1.5"
                            nativeButton={false}
                            render={
                              <a
                                href="https://www.find-government-grants.service.gov.uk/"
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            }
                          >
                            Apply for Your Landlord Grant
                            <ExternalLink className="size-4" />
                          </Button>
                        </>
                      )}

                      {wizardStep === 3 && (
                        <>
                          <StepHead number={4} title="Once Your Authorisation Code Arrives" />
                          <p className="mb-4 text-sm text-foreground/80">
                            As soon as OZEV issues your authorisation code,
                            we move things forward in three steps:
                          </p>
                          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-primary/25 bg-primary/5 px-3.5 py-3 text-sm text-foreground/80">
                            <Video className="mt-0.5 size-4 shrink-0 text-primary" />
                            <p>
                              We send you a link to start the site survey
                              through our{" "}
                              <Link
                                href="/virtual-survey"
                                className="font-medium text-primary underline underline-offset-2"
                              >
                                OpenQuote system
                              </Link>
                              , confirming your chargepoints, any additional
                              works required across the site, and the
                              grant-adjusted price.
                            </p>
                          </div>
                          <Button
                            className="mb-5 gap-1.5"
                            nativeButton={false}
                            render={<Link href="/virtual-survey" />}
                          >
                            Start Virtual Survey
                            <Video className="size-4" />
                          </Button>
                          <ul className="flex flex-col gap-2">
                            <li className="flex items-start gap-2 text-sm text-foreground/80">
                              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-primary" />
                              We issue an invoice for a deposit of at least
                              50% of the total — or full payment, if required
                              — to secure your installation slot(s)
                            </li>
                            <li className="flex items-start gap-2 text-sm text-foreground/80">
                              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-primary" />
                              The remaining balance is due and must clear
                              before our engineers arrive on site
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
                  Timescales are a guide only. Since this scheme covers up to
                  200 sockets a year across a whole portfolio, larger
                  applications may take longer to process — apply for each
                  property or block as early as you can.
                </p>
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
              Complete your business, site, and itemised costs to download a
              compliant, pre-filled quote.
            </DialogDescription>
          </DialogHeader>
          <LandlordQuoteForm
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
