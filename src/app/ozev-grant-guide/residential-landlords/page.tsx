"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  Download,
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
import { SignInRequiredDialog } from "@/components/grant-guide/sign-in-required-dialog";
import { generateLandlordQuotePdf } from "@/lib/pdf/landlord-quote";
import { authClient } from "@/lib/auth/client";
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
    label: "Do you have a Companies House Reg No or VAT No?",
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

const cardClass = "border border-foreground/18 shadow-md";

export default function ResidentialLandlordsGuidePage() {
  const { data: session } = authClient.useSession();
  const [answers, setAnswers] = useState<Answers>({ installType: null, parking: null, registered: null });
  const [charger, setCharger] = useState(chargerModels[0]);
  const [installType, setInstallType] = useState("Single Tenancy Rental");
  const [chargepoints, setChargepoints] = useState("");
  const [sockets, setSockets] = useState("");
  const [chargerCost, setChargerCost] = useState("");
  const [labourCost, setLabourCost] = useState("");
  const [works, setWorks] = useState<WorkRow[]>([{ desc: "", cost: "" }]);
  const [submitted, setSubmitted] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const chargepointsNum = Math.max(parseInt(chargepoints, 10) || 1, 1);
  const socketsNum = parseInt(sockets, 10) || 1;
  const chargerCostNum = parseFloat(chargerCost) || 0;
  const labourCostNum = parseFloat(labourCost) || 0;
  const worksCostNum = works.reduce((sum, w) => sum + (parseFloat(w.cost) || 0), 0);
  const previewSubtotal = chargerCostNum + labourCostNum + worksCostNum;
  const previewVat = previewSubtotal * 0.2;
  const previewTotal = previewSubtotal + previewVat;
  const previewGrantCap = 500 * socketsNum;
  const previewGrant = Math.min(previewTotal * 0.75, previewGrantCap);
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
              Your Rental Property Could Be Eligible For Up To £500 Per
              Socket In EV Grant Funding.
            </h1>
            <p className="mt-3 text-muted-foreground">
              Answer three quick questions below. If you qualify, we&apos;ll
              walk you through applying for the EV Chargepoint Grant for
              Residential Landlords — with nothing charged until OZEV
              approves your application.
            </p>
          </Reveal>

          <Reveal>
            <Card className={cn("mt-6", cardClass)}>
              <CardContent>
                <p className="mb-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Grant Value &amp; Annual Caps
                </p>
                <ul className="flex flex-col gap-2">
                  <li className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <strong className="text-foreground">Contribution Rate:</strong>{" "}
                      Covers up to 75% of the eligible purchase and
                      installation costs.
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <strong className="text-foreground">Cap Per Socket:</strong>{" "}
                      Capped at £500 per socket.
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <strong className="text-foreground">Annual Allocation:</strong>{" "}
                      Eligible landlords can claim up to 200 grant sockets
                      per financial year — across multiple properties or
                      concentrated in a single multi-unit development.
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <strong className="text-foreground">Common Ownership Limit:</strong>{" "}
                      If your organisation is part of a wider group (linked
                      entities, shared directorships, or parent/holding
                      companies), the 200-socket limit applies to the
                      entire group combined, not per company.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
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
                      <Button
                        className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                        nativeButton={false}
                        render={<Link href="/checkout" />}
                      >
                        Return to checkout to continue shopping →
                      </Button>
                    </div>
                  </>
                )}

                {outcome === "warn" && (
                  <>
                    <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3.5 text-sm">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" />
                      <p className="text-foreground/80">
                        You&apos;ll need a Companies House Reg No or VAT No
                        before you can apply — the portal requires this to
                        verify your entity. Get that in place first, then
                        come back to apply.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                        nativeButton={false}
                        render={<Link href="/checkout" />}
                      >
                        Return to checkout to continue shopping →
                      </Button>
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
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!session) {
                          setShowSignIn(true);
                          return;
                        }

                        setSubmitError(null);
                        setSubmitting(true);
                        try {
                          const data = new FormData(e.currentTarget);
                          const workItems = works
                            .filter((w) => w.desc || w.cost)
                            .map((w) => ({ desc: w.desc || "Additional works", cost: parseFloat(w.cost) || 0 }));

                          const reference = `NSE-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
                          const vatDigits = String(data.get("vatNo") ?? "").trim();
                          const input = {
                            reference,
                            contactName: String(data.get("contactName") ?? ""),
                            email: String(data.get("email") ?? ""),
                            phone: String(data.get("phone") ?? "") || undefined,
                            businessName: String(data.get("business") ?? ""),
                            regNumber: String(data.get("regNo") ?? "") || undefined,
                            vatNumber: vatDigits ? `GB${vatDigits}` : undefined,
                            billingAddress: String(data.get("billingAddress") ?? ""),
                            siteAddress: String(data.get("site") ?? ""),
                            installType,
                            chargepoints: chargepointsNum,
                            sockets: socketsNum,
                            chargerModel: charger,
                            chargerCost: chargerCostNum,
                            labourCost: labourCostNum,
                            works: workItems,
                          };

                          const bytes = generateLandlordQuotePdf(input);
                          const fileName = `ocunio-energy-landlord-quote-${reference}.pdf`;

                          const body = new FormData();
                          body.append("scheme", "ResidentialLandlords");
                          body.append("reference", reference);
                          body.append("fileName", fileName);
                          body.append("file", new Blob([bytes], { type: "application/pdf" }), fileName);
                          body.append("input", JSON.stringify(input));

                          const res = await fetch("/api/quotes", { method: "POST", body });
                          const resData = (await res.json()) as { error?: string };
                          if (!res.ok) {
                            setSubmitError(resData.error ?? "Something went wrong. Please try again.");
                            return;
                          }

                          // Needs admin review before it can be downloaded.
                          setSubmitted(true);
                        } finally {
                          setSubmitting(false);
                        }
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
                        <Field label="Companies House Registration No.">
                          <Input name="regNo" placeholder="e.g. 12345678" />
                        </Field>
                        <Field label="VAT No.">
                          <div className="flex items-stretch">
                            <span className="flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-2.5 text-sm text-muted-foreground">
                              GB
                            </span>
                            <Input name="vatNo" className="rounded-l-none" placeholder="123456789" />
                          </div>
                        </Field>
                        <Field label="Billing address">
                          <Input name="billingAddress" placeholder="e.g. 10 Commercial Way, London, NW10 7LR" />
                        </Field>
                        <Field label="Installation site address">
                          <Input name="site" placeholder="e.g. Woodgreen Court, Block A, Woodgreen Road, London" />
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
                        <Field label="Number of chargepoints">
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="e.g. 1"
                            value={chargepoints}
                            onChange={(e) => setChargepoints(e.target.value)}
                          />
                        </Field>
                        <Field label="Number of sockets requested">
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="e.g. 4"
                            value={sockets}
                            onChange={(e) => setSockets(e.target.value)}
                          />
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
                          label="EV chargepoint cost — total for this order (£, ex VAT)"
                          hint="The total you're paying for the chargepoint hardware, whatever the socket count."
                        >
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="e.g. 850"
                            value={chargerCost}
                            onChange={(e) => setChargerCost(e.target.value)}
                          />
                        </Field>
                        <Field
                          label="Standard installation cost (£, ex VAT)"
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
                            <span className="text-primary">
                              Less: OZEV grant ({socketsNum} socket{socketsNum === 1 ? "" : "s"}, up to £500/socket)
                            </span>
                            <span className="text-primary">− £{previewGrant.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-1.5 font-semibold">
                            <span className="text-foreground">Net payable</span>
                            <span className="text-foreground">£{previewNet.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-fit gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        {submitting ? "Submitting…" : "Generate My Quote →"}
                      </Button>

                      {submitError && (
                        <p className="text-sm font-medium text-destructive">{submitError}</p>
                      )}

                      {submitted && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/5 px-3.5 py-3 text-sm text-foreground/80">
                          <Check className="mt-0.5 size-4 shrink-0 text-success" />
                          <p>
                            Your quote has been submitted for review.
                            We&apos;ll check it over and notify you (in your
                            account and by email) once it&apos;s approved and
                            ready to download — find it anytime under
                            Account → Quotes.
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
                            "Companies House Reg No or VAT No",
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
                            "Companies House Reg No or VAT No",
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
                      Download our free OZEV Application Guide — a quick
                      walkthrough of the Government portal so you know
                      exactly what to expect before you start.
                    </p>
                    <a
                      href="/documents/ozev-application-guide-residential-landlords.pdf"
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
                          <strong className="text-foreground">Section 1 — Organisation &amp; Identity:</strong>{" "}
                          your Companies House Reg No or VAT No, plus your
                          registered contact and company address
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
      <SignInRequiredDialog open={showSignIn} onOpenChange={setShowSignIn} />
    </div>
  );
}
