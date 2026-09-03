"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";

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
import { WorkplaceQuoteForm } from "@/components/grant-guide/workplace-quote-form";
import { cn } from "@/lib/utils";

const wizardSteps = [
  { title: "Site Survey" },
  { title: "Tell Us You've Applied" },
  { title: "Apply for Voucher" },
  { title: "We Claim Your Grant" },
];

const questions: QuizQuestion[] = [
  {
    key: "orgType",
    label: "Organisation type",
    options: [
      { label: "Business", value: "business" },
      { label: "Charity / public sector", value: "charity" },
      { label: "Home worker", value: "home" },
    ],
  },
  {
    key: "parking",
    label: "Off-street parking for staff or fleet",
    options: [
      { label: "Yes, dedicated off-street parking", value: "yes" },
      { label: "No qualifying parking", value: "no" },
    ],
  },
  {
    key: "ownership",
    label: "Property ownership",
    options: [
      { label: "Own the property", value: "own" },
      { label: "Have written landlord consent", value: "consent" },
      { label: "Neither yet", value: "neither" },
    ],
  },
];

function evaluate(answers: Record<string, string>): QuizOutcome | null {
  if (answers.parking === "no") {
    return {
      status: "fail",
      message:
        "This scheme requires dedicated off-street parking, clearly associated with your premises and designated for staff or fleet use — without that, this site isn't eligible for the Workplace Charging Scheme.",
      actions: (
        <Button variant="outline" nativeButton={false} render={<Link href="/contact-us" />}>
          Ask about installation without the grant
        </Button>
      ),
    };
  }
  if (answers.ownership === "neither") {
    return {
      status: "warn",
      message:
        "You'll need to either own the property or get written landlord consent before you can apply. Get that in place first, then come back to apply.",
      actions: (
        <Button variant="outline" nativeButton={false} render={<Link href="/contact-us" />}>
          Ask about installation without the grant
        </Button>
      ),
    };
  }
  return { status: "pass" };
}

export default function WorkplaceChargingSchemeGuidePage() {
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
              Could Your Business Save Up To £20,000 On EV Charging?
            </h1>
            <p className="mt-3 text-primary-foreground/75">
              Answer three quick questions below. If you qualify, we&apos;ll
              walk you through applying for the Workplace Charging Scheme —
              a voucher-based grant, so your installer can&apos;t charge you
              until the grant has been paid.
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
                  <h2 className="mb-5 font-heading text-lg font-semibold text-foreground">
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
                          <StepHead number={1} title="Arrange Your Site Survey" />
                          <p className="text-sm text-foreground/80">
                            Unlike the residential schemes, the Workplace
                            Charging Scheme asks you to arrange a site survey
                            with your installer before you apply. Complete
                            your business, site, and itemised costs to
                            download a compliant, pre-filled quote —
                            itemised in the format OZEV expects for your
                            voucher application.
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
                              Confirm your socket count and site details
                              carefully before you apply — the grant covers
                              up to £500 per socket, up to 40 sockets
                              (£20,000 max) per applicant.
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
                            charged until your voucher has been paid.
                          </p>
                          <GrantApplicationTracker />
                        </>
                      )}

                      {wizardStep === 2 && (
                        <>
                          <StepHead number={3} title="Apply for Your Voucher" />
                          <p className="text-sm text-foreground/80">
                            Before you apply, make sure you have these ready:
                          </p>
                          <ul className="mt-2 flex flex-col gap-1.5">
                            {[
                              "Your dated site survey quote from Step 1",
                              "A company registration number, VAT number, or business rates bill (or equivalent evidence for charities, NHS surgeries and schools)",
                              "Written landlord consent, if you don't own the property",
                              "Confirmation of dedicated off-street parking, clearly associated with your premises and designated for staff or fleet use",
                            ].map((item) => (
                              <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                                {item}
                              </li>
                            ))}
                          </ul>

                          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-foreground/80">
                            <span className="font-semibold text-accent">!</span>
                            <p>
                              This grant isn&apos;t available if installing a
                              chargepoint here is a mandatory requirement —
                              for example, under Part S building regulations
                              or a planning condition.
                            </p>
                          </div>
                          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-foreground/80">
                            <span className="font-semibold text-accent">!</span>
                            <p>
                              Home workers can also apply, provided your
                              address is registered as a place of business
                              and you install an eligible dual-use
                              (residential/commercial) chargepoint.
                            </p>
                          </div>

                          <p className="mt-4 text-sm text-foreground/80">
                            Once you have your documents ready, apply online
                            — approval and your voucher are normally issued
                            within 5 working days.
                          </p>

                          <Button
                            className="mt-4 gap-1.5"
                            nativeButton={false}
                            render={
                              <a
                                href="https://apply-workplace-chargepoint-grant.service.gov.uk/"
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            }
                          >
                            Apply for Your Workplace Voucher
                            <ExternalLink className="size-4" />
                          </Button>
                        </>
                      )}

                      {wizardStep === 3 && (
                        <>
                          <StepHead number={4} title="We Claim Your Grant" />
                          <p className="text-sm text-foreground/80">
                            Once installation is complete, Ocunio Energy
                            claims the voucher value on your behalf and
                            deducts it directly from your invoice — as an
                            OZEV-authorised installer, we&apos;re not
                            permitted to charge you until the grant has been
                            paid, so there&apos;s nothing to settle upfront
                            on the grant-covered portion.
                          </p>
                          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-foreground/80">
                            <span className="font-semibold text-accent">!</span>
                            <p>
                              Tax benefit: employees using workplace EV
                              charging aren&apos;t taxed on the electricity
                              provided, and your business can claim 100% of
                              the installation cost as a capital allowance in
                              the year of installation — some expenditure may
                              qualify for further enhanced deductions.
                              Combined with the WCS grant, this can
                              substantially reduce your net cost.
                            </p>
                          </div>
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
                  40 sockets per applicant, larger sites may need multiple
                  site surveys — get in touch early if you&apos;re planning
                  several installations.
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
          <WorkplaceQuoteForm
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
