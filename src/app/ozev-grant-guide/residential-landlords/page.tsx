"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  FileCheck2,
  Video,
  X,
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
import { generateReferenceCode } from "@/lib/reference-code";
import { generateLandlordQuotePdf } from "@/lib/generate-landlord-quote-pdf";
import { cn } from "@/lib/utils";

const chargerModels = [
  "Ocunio Home 7kW Tethered",
  "Ocunio Home 7kW Untethered",
  "Ocunio Home 22kW Tethered (three-phase)",
];

type Answers = { installType: string | null; parking: string | null; registered: string | null };

const questions: { key: keyof Answers; label: string; options: { label: string; value: string }[] }[] = [
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

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(0,98,122,0.5)]"
          : "border-border bg-card text-foreground/80 shadow-xs hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm"
      )}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      {label}
      {children}
    </label>
  );
}

const cardClass = "border border-border shadow-lg shadow-primary/5 ring-primary/10";

export default function ResidentialLandlordsGuidePage() {
  const [answers, setAnswers] = useState<Answers>({ installType: null, parking: null, registered: null });
  const [charger, setCharger] = useState(chargerModels[0]);
  const [installType, setInstallType] = useState("Single Tenancy Rental");
  const [works, setWorks] = useState<WorkRow[]>([{ desc: "", cost: "" }]);
  const [quoteResult, setQuoteResult] = useState<{ netPayable: number; grant: number; sockets: number } | null>(null);

  const guideRef = useRef<HTMLDivElement>(null);

  const allAnswered = answers.installType && answers.parking && answers.registered;
  const outcome = !allAnswered
    ? null
    : answers.parking === "no"
      ? "fail"
      : answers.registered === "no"
        ? "warn"
        : "pass";

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

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1 bg-linear-to-b from-secondary/80 via-secondary/30 to-background">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <Reveal>
            <SectionKicker />
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
              Could Your Rental Property Qualify For Up To £500 Per Socket?
            </h1>
            <p className="mt-3 text-muted-foreground">
              Answer three quick questions below. If you qualify, we&apos;ll
              walk you through applying for the EV Chargepoint Grant for
              Residential Landlords — with nothing charged until OZEV
              approves your application.
            </p>
            <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-foreground/80">
              <span className="font-semibold text-accent">!</span>
              <p>
                Note: this guide now reflects OZEV&apos;s confirmed portal
                steps and document checklist for residential landlords. OZEV
                hasn&apos;t published a full &quot;not eligible if&quot; list
                beyond the parking, registration, and mandatory-install
                rules checked below, so that part isn&apos;t guessed at
                further.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <h2 className="mt-12 mb-5 font-heading text-lg font-semibold text-foreground">
              <span className="mr-2 text-primary">01</span>
              Check Your Eligibility
            </h2>
            <Card className={cardClass}>
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
                        This scheme requires sockets to serve private,
                        designated off-street residential bays or dedicated
                        communal tenant parking — without that, this
                        property isn&apos;t eligible for the landlord grant.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline">Ask about installation without the grant</Button>
                    </div>
                  </>
                )}

                {outcome === "warn" && (
                  <>
                    <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3.5 text-sm">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" />
                      <p className="text-foreground/80">
                        You&apos;ll need a Companies House registration
                        number or an HMRC VAT number before you can apply —
                        the portal requires this to verify your entity. Get
                        that in place first, then come back to apply.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline">Ask about installation without the grant</Button>
                    </div>
                  </>
                )}

                {outcome === "pass" && (
                  <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-3.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <p className="text-foreground/80">
                      Likely eligible for the Residential Landlord grant.
                      Follow the guide below — nothing is charged until OZEV
                      approves.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Reveal>

          {outcome === "pass" && (
            <div ref={guideRef} className="mt-14 scroll-mt-24">
              <Reveal>
                <h2 className="mb-5 font-heading text-lg font-semibold text-foreground">
                  <span className="mr-2 text-primary">02</span>
                  Your Step-by-Step Guide
                </h2>
              </Reveal>

              {/* Step 1 */}
              <Reveal>
                <Card className={cn("mb-5", cardClass)}>
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
                      Complete the form below with your business, site, and
                      itemised costs, then choose &quot;Generate My
                      Quote&quot; to download a compliant, pre-filled quote —
                      itemised in the format OZEV expects for your
                      Residential Landlord grant application.
                    </p>

                    <form
                      className="mt-4 flex flex-col gap-4 rounded-lg border border-border bg-secondary/40 p-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        const sockets = parseInt(String(data.get("sockets") ?? "1"), 10) || 1;
                        const chargerUnitCost = parseFloat(String(data.get("chargerCost") ?? "0")) || 0;
                        const labourCost = parseFloat(String(data.get("labourCost") ?? "0")) || 0;
                        const workItems = works
                          .filter((w) => w.desc || w.cost)
                          .map((w) => ({ desc: w.desc || "Additional works", cost: parseFloat(w.cost) || 0 }));

                        generateLandlordQuotePdf({
                          reference: generateReferenceCode("OCU"),
                          contactName: String(data.get("contactName") ?? ""),
                          email: String(data.get("email") ?? ""),
                          phone: String(data.get("phone") ?? "") || undefined,
                          businessName: String(data.get("business") ?? ""),
                          regNumber: String(data.get("regNo") ?? "") || undefined,
                          billingAddress: String(data.get("billingAddress") ?? ""),
                          siteAddress: String(data.get("site") ?? ""),
                          installType,
                          sockets,
                          chargerModel: charger,
                          chargerUnitCost,
                          labourCost,
                          works: workItems,
                        });

                        const chargerTotal = chargerUnitCost * sockets;
                        const labourTotal = labourCost * sockets;
                        const worksTotal = workItems.reduce((sum, w) => sum + w.cost, 0);
                        const subtotal = chargerTotal + labourTotal + worksTotal;
                        const totalIncVat = subtotal * 1.2;
                        const grant = Math.min(totalIncVat * 0.75, 500 * sockets);
                        setQuoteResult({ netPayable: totalIncVat - grant, grant, sockets });
                      }}
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Contact name">
                          <Input name="contactName" required placeholder="Jane Doe" />
                        </Field>
                        <Field label="Email">
                          <Input name="email" required type="email" placeholder="jane@email.com" />
                        </Field>
                        <Field label="Phone">
                          <Input name="phone" type="tel" placeholder="07…" />
                        </Field>
                        <Field label="Business / organisation name">
                          <Input name="business" placeholder="e.g. Woodgreen Property Ltd" />
                        </Field>
                        <Field label="Companies House reg. no. / HMRC VAT no.">
                          <Input name="regNo" placeholder="e.g. 12345678" />
                        </Field>
                        <Field label="Installation type">
                          <Select value={installType} onValueChange={(v) => setInstallType(v ?? installType)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Single Tenancy Rental">Single Tenancy Rental</SelectItem>
                              <SelectItem value="Multi-Unit Block">Multi-Unit / Block of Flats</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Billing address">
                          <Input name="billingAddress" placeholder="e.g. 10 Commercial Way, London, NW10 7LR" />
                        </Field>
                        <Field label="Installation site address">
                          <Input name="site" placeholder="e.g. Woodgreen Court, Block A, Woodgreen Road, London" />
                        </Field>
                        <Field label="Number of sockets requested">
                          <Input name="sockets" type="number" min={1} placeholder="e.g. 4" />
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
                        <Field label="EV chargepoint unit cost per socket (£, ex VAT)">
                          <Input name="chargerCost" type="text" inputMode="decimal" placeholder="e.g. 399" />
                        </Field>
                        <Field label="Installation labour cost per socket (£, ex VAT)">
                          <Input name="labourCost" type="text" inputMode="decimal" placeholder="e.g. 250" />
                        </Field>
                      </div>

                      <WorksRowsField rows={works} onChange={setWorks} />

                      <Button type="submit" className="w-fit gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
                        Generate My Quote →
                      </Button>

                      {quoteResult && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/5 px-3.5 py-3 text-sm text-foreground/80">
                          <Check className="mt-0.5 size-4 shrink-0 text-success" />
                          <p>
                            Your pre-filled quote has downloaded as a PDF.
                            Net amount due: £{quoteResult.netPayable.toFixed(2)}{" "}
                            (after a £{quoteResult.grant.toFixed(2)} grant
                            deduction across {quoteResult.sockets} socket
                            {quoteResult.sockets === 1 ? "" : "s"}). Keep
                            this copy — you&apos;ll need it for your grant
                            application.
                          </p>
                        </div>
                      )}
                    </form>

                    <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-foreground/80">
                      <span className="font-semibold text-accent">!</span>
                      <p>
                        Confirm your socket count and property details
                        carefully before you apply. Changing your mind
                        after submitting your grant application means
                        restarting the whole process for that property.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Step 2 */}
              <Reveal>
                <Card className={cn("mb-5", cardClass)}>
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
                      Before you apply, make sure you have these ready.
                      Requirements differ slightly depending on whether this
                      is a single rental property or a multi-unit block:
                    </p>

                    <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      <div className="rounded-lg border border-border bg-secondary/40 p-4">
                        <p className="mb-2 font-heading text-sm font-semibold text-primary">
                          Single Tenancy Rental
                        </p>
                        <ul className="flex flex-col gap-1.5">
                          {[
                            "Companies House or VAT registration number",
                            "Land Registry Title Deed for the property",
                            "Itemised quote from Ocunio (Nison Limited) showing the £500 grant deduction",
                            "Clear photo of the private driveway or tenant parking bay",
                          ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-xs text-foreground/80">
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg border border-border bg-secondary/40 p-4">
                        <p className="mb-2 font-heading text-sm font-semibold text-primary">
                          Multi-Unit / Block of Flats
                        </p>
                        <ul className="flex flex-col gap-1.5">
                          {[
                            "Companies House or VAT registration number",
                            "Freehold title, or RTM/management company minutes confirming authority over the parking areas",
                            "Itemised quote from Ocunio (Nison Limited) showing all socket deductions (£500 per socket)",
                            "Site layout diagram or photos of the marked tenant/communal bays",
                          ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-xs text-foreground/80">
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
                        chargepoint here is a mandatory requirement — for
                        example, a new-build planning condition.
                      </p>
                    </div>

                    <p className="mt-4 text-sm text-foreground/80">
                      Once your documents are ready, here&apos;s what the
                      GOV.UK Find a Grant portal will ask for:
                    </p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>
                          <strong className="text-foreground">Section 1 — Organisation &amp; Identity:</strong>{" "}
                          your Companies House registration number or HMRC
                          VAT number, plus your registered contact and
                          company address
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>
                          <strong className="text-foreground">Section 2 — Site &amp; Sockets:</strong>{" "}
                          installation type, the full site address, and the
                          total number of sockets you&apos;re applying for
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

                    <p className="mt-4 text-sm text-foreground/80">
                      OZEV reviews your application and notifies you and
                      Ocunio by email once approved. One thing to keep in
                      mind: scheme rules mean we can&apos;t book your
                      installation until your grant has been pre-approved.
                    </p>

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
                      Apply for Your Landlord Grant →
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Step 3 */}
              <Reveal>
                <Card className={cn("mb-5", cardClass)}>
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
                      As soon as OZEV issues your authorisation code, we
                      move things forward in three steps:
                    </p>
                    <ul className="flex flex-col gap-2">
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <Video className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>
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
                          grant-adjusted price
                        </span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <FileCheck2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        We&apos;ll then issue a company invoice for a
                        deposit of at least 50% of the total — or full
                        payment, if required — to secure your installation
                        slot(s)
                      </li>
                      <li className="flex items-start gap-2 text-sm text-foreground/80">
                        <FileCheck2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        The remaining balance is due and must clear before
                        our engineers arrive on site, in line with the
                        payment terms agreed with your business
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </Reveal>

              <p className="mt-6 text-xs text-muted-foreground italic">
                Timescales are a guide only. Since this scheme covers up to
                200 sockets a year across a whole portfolio, larger
                applications may take longer to process — apply for each
                property or block as early as you can.
              </p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
