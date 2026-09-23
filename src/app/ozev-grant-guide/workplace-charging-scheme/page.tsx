"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  Download,
  ExternalLink,
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
import { generateWorkplaceQuoteDoc } from "@/lib/pdf/workplace-quote";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

const chargerModels = [
  "Ocunio Fleet 7kW Tethered",
  "Ocunio Fleet 7kW Untethered",
  "Ocunio Fleet 22kW Tethered (three-phase)",
];

type Answers = { orgType: string | null; parking: string | null; ownership: string | null };

const questions: { key: keyof Answers; label: string; options: { label: string; value: string }[] }[] = [
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

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(4,180,225,0.5)]"
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

export default function WorkplaceChargingSchemeGuidePage() {
  const { data: session } = authClient.useSession();
  const [answers, setAnswers] = useState<Answers>({ orgType: null, parking: null, ownership: null });
  const [charger, setCharger] = useState(chargerModels[0]);
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

  const allAnswered = answers.orgType && answers.parking && answers.ownership;
  const outcome = !allAnswered
    ? null
    : answers.parking === "no"
      ? "fail"
      : answers.ownership === "neither"
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
  const socketsNum = Math.min(parseInt(sockets, 10) || 1, 40);
  const chargerCostNum = parseFloat(chargerCost) || 0;
  const labourCostNum = parseFloat(labourCost) || 0;
  const worksCostNum = works.reduce((sum, w) => sum + (parseFloat(w.cost) || 0), 0);
  const previewSubtotal = chargerCostNum + labourCostNum + worksCostNum;
  const previewVat = previewSubtotal * 0.2;
  const previewTotal = previewSubtotal + previewVat;
  const previewGrantCap = Math.min(500 * socketsNum, 20000);
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
              Your Business Could Save Up To £20,000 On EV Charging?
            </h1>
            <p className="mt-3 text-muted-foreground">
              Answer three quick questions below. If you qualify, we&apos;ll
              walk you through applying for the Workplace Charging Scheme —
              a voucher-based grant, so your installer can&apos;t charge you
              until the grant has been paid.
            </p>
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
                        This scheme requires dedicated off-street parking,
                        clearly associated with your premises and
                        designated for staff or fleet use — without that,
                        this site isn&apos;t eligible for the Workplace
                        Charging Scheme.
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
                        You&apos;ll need to either own the property or get
                        written landlord consent before you can apply. Get
                        that in place first, then come back to apply.
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
                      Likely eligible for the Workplace Charging Scheme.
                      Follow the guide below — your installer can&apos;t
                      charge you until the grant has been paid.
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
                        Arrange Your Site Survey
                      </p>
                    </div>
                    <p className="text-sm text-foreground/80">
                      Unlike the residential schemes, the Workplace
                      Charging Scheme asks you to arrange a site survey
                      with your installer <strong className="text-foreground">before</strong> you
                      apply. Complete the form below with your business,
                      site, and itemised costs, then choose &quot;Generate
                      My Quote&quot; to download a compliant, pre-filled
                      quote — itemised in the format OZEV expects for your
                      voucher application.
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
                          const businessName = String(data.get("business") ?? "");
                          const contactName = String(data.get("contactName") ?? "");
                          const input = {
                            reference,
                            contactName,
                            email: String(data.get("email") ?? ""),
                            phone: String(data.get("phone") ?? "") || undefined,
                            businessName,
                            regNumber: String(data.get("regNo") ?? "") || undefined,
                            vatNumber: vatDigits ? `GB${vatDigits}` : undefined,
                            siteAddress: String(data.get("site") ?? ""),
                            chargepoints: chargepointsNum,
                            sockets: socketsNum,
                            chargerModel: charger,
                            chargerCost: chargerCostNum,
                            labourCost: labourCostNum,
                            works: workItems,
                          };

                          const html = generateWorkplaceQuoteDoc(input);
                          const fileName = `OZEV-WCS-Quote-${(businessName || contactName).replace(/\s+/g, "-")}.doc`;
                          const blob = new Blob(["﻿", html], { type: "application/msword" });

                          const body = new FormData();
                          body.append("scheme", "WorkplaceChargingScheme");
                          body.append("reference", reference);
                          body.append("fileName", fileName);
                          body.append("file", blob, fileName);
                          body.append("input", JSON.stringify(input));
                          body.append("company_website", String(data.get("company_website") ?? ""));

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
                      {/* Honeypot — hidden from users, tempting to bots. */}
                      <input
                        type="text"
                        name="company_website"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden
                        className="absolute -left-[9999px] h-0 w-0 opacity-0"
                      />

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Contact name">
                          <Input name="contactName" required placeholder="Jane Doe" />
                        </Field>
                        <Field label="Email">
                          <Input name="email" required type="email" placeholder="jane@business.com" />
                        </Field>
                        <Field label="Phone">
                          <Input name="phone" type="tel" placeholder="07…" />
                        </Field>
                        <Field label="Business / organisation name">
                          <Input name="business" placeholder="e.g. Woodgreen Logistics Ltd" />
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
                        <Field label="Installation site address">
                          <Input
                            name="site"
                            placeholder="e.g. Woodgreen Logistics, Site 2, Industrial Estate, Watford"
                          />
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
                        <Field label="Number of sockets requested (max 40)">
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="e.g. 6"
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
                              Less: OZEV voucher ({socketsNum} socket{socketsNum === 1 ? "" : "s"}, up to £500/socket, max £20,000)
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
                        Confirm your socket count and site details
                        carefully before you apply — the grant covers up to
                        £500 per socket, up to 40 sockets (£20,000 max) per
                        applicant.
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
                        Apply for Your Voucher
                      </p>
                    </div>

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
                        chargepoint here is a mandatory requirement — for
                        example, under Part S building regulations or a
                        planning condition.
                      </p>
                    </div>
                    <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-foreground/80">
                      <span className="font-semibold text-accent">!</span>
                      <p>
                        Home workers can also apply, provided your address
                        is registered as a place of business and you
                        install an eligible dual-use (residential/commercial)
                        chargepoint.
                      </p>
                    </div>

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
                      Once you have your documents ready, apply online —
                      approval and your voucher are normally issued within
                      5 working days.
                    </p>

                    <Button
                      className="mt-4 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                      nativeButton={false}
                      render={
                        <a
                          href="https://apply-workplace-chargepoint-grant.service.gov.uk"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      Apply for Your Workplace Voucher
                      <ExternalLink className="size-4" />
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
                        We Claim Your Grant
                      </p>
                    </div>
                    <p className="text-sm text-foreground/80">
                      Once installation is complete, Ocunio claims the
                      voucher value on your behalf and deducts it directly
                      from your invoice — as an OZEV-authorised installer,
                      we&apos;re not permitted to charge you until the
                      grant has been paid, so there&apos;s nothing to
                      settle upfront on the grant-covered portion.
                    </p>

                    <p className="mt-4 text-sm text-foreground/80">
                      Download our Installation Guide for what to expect
                      on the day — access requirements, how long it takes,
                      and how to get your charger set up afterwards.
                    </p>
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-border px-3.5 py-2.5 text-xs text-muted-foreground">
                      <span className="size-1.5 shrink-0 rounded-full bg-accent" />
                      Installation Guide — attachment not provided
                      (original draft: File 2)
                    </div>

                    <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-foreground/80">
                      <span className="font-semibold text-accent">!</span>
                      <p>
                        Tax benefit: employees using workplace EV charging
                        aren&apos;t taxed on the electricity provided, and
                        your business can claim 100% of the installation
                        cost as a capital allowance in the year of
                        installation — some expenditure may qualify for
                        further enhanced deductions. Combined with the WCS
                        grant, this can substantially reduce your net cost.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              <p className="mt-6 text-xs text-muted-foreground italic">
                Timescales are a guide only. Since this scheme covers up to
                40 sockets per applicant, larger sites may need multiple
                site surveys — get in touch early if you&apos;re planning
                several installations.
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
