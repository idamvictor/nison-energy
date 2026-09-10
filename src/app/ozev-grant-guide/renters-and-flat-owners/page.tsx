"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  Download,
  FileCheck2,
  Video,
  X,
  Zap,
} from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reveal } from "@/components/shared/reveal";
import { SectionKicker } from "@/components/shared/section-kicker";
import { WorksRowsField, type WorkRow } from "@/components/grant-guide/works-rows-field";
import { getGrantScheme } from "@/lib/content/grant-schemes";
import { generateRentersQuotePdf } from "@/lib/pdf/renters-quote";
import { cn } from "@/lib/utils";

const scheme = getGrantScheme("renters-and-flat-owners")!;

const chargerModels = [
  "Ocunio Home 7kW Tethered",
  "Ocunio Home 7kW Untethered",
  "Ocunio Home 22kW Tethered (three-phase)",
];

type Answers = { property: string | null; parking: string | null; ev: string | null };

const questions: { key: keyof Answers; label: string; options: { label: string; value: string }[] }[] = [
  {
    key: "property",
    label: "Property status",
    options: [
      { label: "Own a flat", value: "own-flat" },
      { label: "Own a house", value: "own-house" },
      { label: "Renting", value: "rent" },
    ],
  },
  {
    key: "parking",
    label: "Parking",
    options: [
      { label: "Off-street", value: "off" },
      { label: "On-street", value: "on" },
    ],
  },
  {
    key: "ev",
    label: "EV status",
    options: [
      { label: "Own an EV", value: "has" },
      { label: "Ordered / on order", value: "ordered" },
    ],
  },
];

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(0,98,122,0.5)]"
          : "border-foreground/25 bg-card text-foreground/80 shadow-xs hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm"
      )}
    >
      {label}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

export default function RentersFlatOwnersGuidePage() {
  const [answers, setAnswers] = useState<Answers>({ property: null, parking: null, ev: null });
  const [charger, setCharger] = useState(chargerModels[0]);
  const [chargerCost, setChargerCost] = useState("");
  const [labourCost, setLabourCost] = useState("");
  const [works, setWorks] = useState<WorkRow[]>([{ desc: "", cost: "" }]);
  const [quoteResult, setQuoteResult] = useState<{ netPayable: number; grant: number } | null>(null);

  const guideRef = useRef<HTMLDivElement>(null);

  const allAnswered = answers.property && answers.parking && answers.ev;
  const ineligible = answers.parking === "off" && answers.property === "own-house";
  const outcome = !allAnswered ? null : ineligible ? "fail" : answers.parking === "on" ? "warn" : "pass";

  useEffect(() => {
    if (outcome === "pass") {
      requestAnimationFrame(() =>
        guideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  }, [outcome]);

  function handleAnswer(key: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const chargerCostNum = parseFloat(chargerCost) || 0;
  const labourCostNum = parseFloat(labourCost) || 0;
  const worksCostNum = works.reduce((sum, w) => sum + (parseFloat(w.cost) || 0), 0);
  const previewSubtotal = chargerCostNum + labourCostNum + worksCostNum;
  const previewVat = previewSubtotal * 0.2;
  const previewTotal = previewSubtotal + previewVat;
  const previewGrant = Math.min(previewTotal * 0.75, 500);
  const previewNet = previewTotal - previewGrant;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1 bg-linear-to-b from-secondary/80 via-secondary/30 to-background">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <Reveal>
            <SectionKicker />
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
              Do You Qualify For The £500 EV Chargepoint Grant?
            </h1>
            <p className="mt-3 text-muted-foreground">
              Answer three quick questions below. If you qualify, we&apos;ll
              walk you through applying for the Renters &amp; Flat Owners
              grant — with nothing charged until OZEV approves your
              application.
            </p>
          </Reveal>

          <Reveal>
            <h2 className="mt-12 mb-5 font-heading text-lg font-semibold text-foreground">
              <span className="mr-2 text-primary">01</span>
              Check Your Eligibility
            </h2>
            <Card className="border border-foreground/18 shadow-md">
              <CardContent className="flex flex-col gap-5">
                {questions.map((question) => (
                  <div key={question.key}>
                    <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {question.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {question.options.map((option) => (
                        <Pill
                          key={option.value}
                          label={option.label}
                          active={answers[question.key] === option.value}
                          onClick={() => handleAnswer(question.key, option.value)}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {outcome === "fail" && (
                  <>
                    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3.5 text-sm">
                      <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                      <p className="text-foreground/80">
                        Standalone house owners with off-street parking
                        aren&apos;t eligible for this grant — only flat
                        owners and renters of any residential property
                        qualify. Professional installation is still available
                        without the grant.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                        nativeButton={false}
                        render={<Link href="/checkout" />}
                      >
                        Return to the checkout to continue shopping →
                      </Button>
                    </div>
                  </>
                )}

                {outcome === "warn" && (
                  <>
                    <div className="flex flex-col gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3.5 text-sm">
                      <p className="text-foreground/80">
                        Likely eligible — but under the On-Street Parking
                        Grant, which requires local highways authority
                        consent for a cross-pavement solution before
                        applying.
                      </p>
                      <p className="text-foreground/80">
                        You&apos;ll need permission from your local council
                        to install a cross-pavement charging solution, where
                        the cable runs across the pavement between your home
                        and your on-street parking space. A council-approved
                        cross-pavement solution must be installed before a
                        grant application can be submitted. Once approved,
                        we&apos;ll initiate the chargepoint installation.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button nativeButton={false} render={<Link href="/ozev-grants" />}>
                        Check the requirements
                      </Button>
                    </div>
                  </>
                )}

                {outcome === "pass" && (
                  <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <p className="text-foreground/80">
                      Likely eligible for the Renters &amp; Flat Owners
                      grant. Follow the guide below — nothing is charged
                      until OZEV approves.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Reveal>

          {outcome === "pass" && (
            <div ref={guideRef} className="mt-14 scroll-mt-24">
              <Reveal>
                <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3.5 text-sm">
                  <Zap className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="text-foreground/80">
                    <strong className="text-foreground">No payment is due today.</strong>{" "}
                    Your Fully Managed package (charger, installation, and
                    OZEV support) is only charged once OZEV has approved your
                    application.
                  </p>
                </div>
              </Reveal>

              <Reveal>
                <h2 className="mt-12 mb-5 font-heading text-lg font-semibold text-foreground">
                  <span className="mr-2 text-primary">02</span>
                  Your Step-by-Step Guide
                </h2>
              </Reveal>

              {/* Step 1 */}
              <Reveal>
                <Card className="mb-5 border border-foreground/18 shadow-md">
                  <CardContent>
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        1
                      </span>
                      <p className="font-heading text-base font-semibold text-foreground">
                        Get Your Quote
                      </p>
                    </div>
                    <p className="text-sm text-foreground/80">
                      Complete the form below with your details and itemised
                      costs, then choose &quot;Generate My Quote&quot; to
                      download a compliant, pre-filled quote — itemised in
                      the format OZEV expects for your Renters &amp; Flat
                      Owners grant application.
                    </p>

                    <form
                      className="mt-4 flex flex-col gap-4 rounded-lg border border-border bg-secondary/40 p-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        const workItems = works
                          .filter((w) => w.desc || w.cost)
                          .map((w) => ({ desc: w.desc || "Additional works", cost: parseFloat(w.cost) || 0 }));

                        generateRentersQuotePdf({
                          reference: `NSE-${Date.now().toString().slice(-8)}`,
                          fullName: String(data.get("fullName") ?? ""),
                          email: String(data.get("email") ?? ""),
                          phone: String(data.get("phone") ?? "") || undefined,
                          address: String(data.get("address") ?? ""),
                          chargerModel: charger,
                          chargerUnitCost: chargerCostNum,
                          labourCost: labourCostNum,
                          works: workItems,
                        });

                        setQuoteResult({ netPayable: previewNet, grant: previewGrant });
                      }}
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Full name">
                          <Input name="fullName" required placeholder="Jane Doe" />
                        </Field>
                        <Field label="Email">
                          <Input name="email" required type="email" placeholder="jane@email.com" />
                        </Field>
                        <Field label="Phone">
                          <Input name="phone" type="tel" placeholder="07…" />
                        </Field>
                        <Field label="Installation address">
                          <Input name="address" placeholder="Street, city, postcode" />
                        </Field>
                        <Field label="Charger model">
                          <Select value={charger} onValueChange={(v) => setCharger(v ?? charger)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {chargerModels.map((m) => (
                                <SelectItem key={m} value={m}>
                                  {m}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field
                          label="EV chargepoint unit cost (£, ex VAT)"
                          hint="Enter the cost before VAT — e.g. £399 ex VAT becomes £478.80 inc VAT automatically."
                        >
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="e.g. 399"
                            value={chargerCost}
                            onChange={(e) => setChargerCost(e.target.value)}
                          />
                        </Field>
                        <Field
                          label="Standard installation labour cost (£, ex VAT)"
                          hint="Also ex VAT — VAT is added for you in the summary below."
                        >
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="e.g. 250"
                            value={labourCost}
                            onChange={(e) => setLabourCost(e.target.value)}
                          />
                        </Field>
                      </div>

                      <WorksRowsField rows={works} onChange={setWorks} />

                      <div className="rounded-lg border border-border bg-card p-4">
                        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          Estimated cost summary
                        </p>
                        <div className="flex flex-col divide-y divide-border text-sm">
                          <div className="flex justify-between py-1.5">
                            <span className="text-foreground/80">Subtotal (ex. VAT)</span>
                            <span className="text-foreground">£{previewSubtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-1.5">
                            <span className="text-foreground/80">VAT (20%)</span>
                            <span className="text-foreground">£{previewVat.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-1.5 font-semibold">
                            <span className="text-foreground">Total (inc. VAT)</span>
                            <span className="text-foreground">£{previewTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-1.5">
                            <span className="text-primary">Less: OZEV grant (75% of total, capped at £500)</span>
                            <span className="text-primary">− £{previewGrant.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-1.5 font-semibold">
                            <span className="text-foreground">Net payable</span>
                            <span className="text-foreground">£{previewNet.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <Button type="submit" className="w-fit gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
                        Generate My Quote →
                      </Button>

                      {quoteResult && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/5 px-3.5 py-3 text-sm text-foreground/80">
                          <Check className="mt-0.5 size-4 shrink-0 text-success" />
                          <p>
                            Your pre-filled quote has downloaded as a PDF.
                            Net payable: £{quoteResult.netPayable.toFixed(2)}{" "}
                            (after a £{quoteResult.grant.toFixed(2)} grant
                            deduction). Keep this copy — you&apos;ll need it
                            for your grant application.
                          </p>
                        </div>
                      )}
                    </form>

                    <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-foreground/80">
                      <span className="font-semibold text-accent">!</span>
                      <p>
                        Pick your charger carefully before you apply. If you
                        change your mind after submitting your grant
                        application, you&apos;ll need to restart the whole
                        process.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Step 2 */}
              <Reveal>
                <Card className="mb-5 border border-foreground/18 shadow-md">
                  <CardContent>
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        2
                      </span>
                      <p className="font-heading text-base font-semibold text-foreground">
                        Submit Your Grant Application
                      </p>
                    </div>

                    <p className="text-sm text-foreground/80">
                      Before you apply, make sure you have these documents
                      ready:
                    </p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {scheme.documentation?.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <p className="mt-4 text-sm text-foreground/80">
                      <strong className="text-foreground">Important points to note:</strong>
                    </p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        Normal turnaround: pre-approval within 10 working
                        days, but due to demand, pre-approval can take
                        longer than 10 working days
                      </li>
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        Our advice — apply sooner rather than later
                      </li>
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        Scheme rules mean we would not book your
                        installation until your grant has been approved
                      </li>
                    </ul>

                    <a
                      href="/documents/landlord-consent-form.pdf"
                      download
                      className="mt-4 flex w-full items-center gap-2.5 rounded-lg border border-dashed border-border px-3.5 py-3 text-left text-sm text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Download className="size-4 shrink-0" />
                      <span className="flex-1 font-medium">
                        Landlord / freeholder permission letter template
                      </span>
                      <span className="text-xs text-muted-foreground">PDF</span>
                    </a>

                    <p className="mt-4 text-sm text-foreground/80">
                      Download our free OZEV Application Guide — a quick
                      walkthrough of the Government portal so you know
                      exactly what to expect before you start.
                    </p>
                    <a
                      href="/documents/ozev-grant-application-guide.pdf"
                      download
                      className="mt-2 flex w-full items-center gap-2.5 rounded-lg border border-dashed border-border px-3.5 py-3 text-left text-sm text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Download className="size-4 shrink-0" />
                      <span className="flex-1 font-medium">OZEV Application Guide</span>
                      <span className="text-xs text-muted-foreground">PDF</span>
                    </a>

                    <p className="mt-4 text-sm text-foreground/80">
                      Once your documents are ready, here&apos;s what the
                      GOV.UK Find a Grant portal will ask for:
                    </p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>
                          <strong className="text-foreground">Section 1 — Basic Applicant Details:</strong>{" "}
                          sign in or create a Find a Grant account, then
                          enter your full name, address, contact number and
                          email
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>
                          <strong className="text-foreground">Section 2 — Property &amp; Tenancy Status:</strong>{" "}
                          confirm whether you&apos;re a tenant or flat
                          owner-occupier, confirm your dedicated private
                          off-street parking, and give the full installation
                          address
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>
                          <strong className="text-foreground">Section 3 — Installer Assignment:</strong>{" "}
                          enter Ocunio&apos;s details — business name Nison
                          Limited, OZEV Installer Number 13528, primary email
                          nisonenergy@gmail.com, secondary email
                          info@ocunioenergy.com
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>
                          <strong className="text-foreground">Section 4 — Evidence Upload:</strong>{" "}
                          the documents listed above
                        </span>
                      </li>
                    </ul>

                    <Button
                      className="mt-4 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                      nativeButton={false}
                      render={
                        <a
                          href="https://find-government-grants.service.gov.uk/"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      Apply for Your £500 Grant →
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Step 3 */}
              <Reveal>
                <Card className="mb-5 border border-foreground/18 shadow-md">
                  <CardContent>
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        3
                      </span>
                      <p className="font-heading text-base font-semibold text-foreground">
                        Once Your Authorisation Code Arrives
                      </p>
                    </div>
                    <p className="mb-3 text-sm text-foreground/80">
                      As soon as OZEV issues your authorisation code, we move
                      things forward in three steps:
                    </p>
                    <ul className="flex flex-col gap-2">
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <Video className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>
                          We send you a link to start the home survey
                          through our{" "}
                          <Link
                            href="/virtual-survey"
                            className="font-medium text-primary underline underline-offset-2"
                          >
                            OpenQuote system
                          </Link>
                          , confirming your charger, any additional work
                          required, and the grant-adjusted price
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <FileCheck2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        We&apos;ll then send you an invoice for a deposit of
                        at least 50% of the total — or full payment, if
                        required — to secure your installation slot
                      </li>
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <FileCheck2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        The remaining balance is due and must clear before
                        our engineer arrives on site
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Reveal>

              <p className="mt-6 text-xs text-muted-foreground italic">
                Timescales are a guide only and depend on how quickly grants
                are being pre-approved, which is currently slower than usual
                due to high demand.
              </p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
