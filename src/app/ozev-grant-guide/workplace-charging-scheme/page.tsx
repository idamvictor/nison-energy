"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
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
import { generateReferenceCode } from "@/lib/reference-code";
import { generateWorkplaceQuotePdf } from "@/lib/generate-workplace-quote-pdf";
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

export default function WorkplaceChargingSchemeGuidePage() {
  const [answers, setAnswers] = useState<Answers>({ orgType: null, parking: null, ownership: null });
  const [charger, setCharger] = useState(chargerModels[0]);
  const [works, setWorks] = useState<WorkRow[]>([{ desc: "", cost: "" }]);
  const [quoteResult, setQuoteResult] = useState<{ netPayable: number; grant: number; sockets: number } | null>(null);

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

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1 bg-linear-to-b from-secondary/80 via-secondary/30 to-background">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <Reveal>
            <SectionKicker />
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
              Could Your Business Save Up To £20,000 On EV Charging?
            </h1>
            <p className="mt-3 text-muted-foreground">
              Answer three quick questions below. If you qualify, we&apos;ll
              walk you through applying for the Workplace Charging Scheme —
              a voucher-based grant, so your installer can&apos;t charge you
              until the grant has been paid.
            </p>
            <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-foreground/80">
              <span className="font-semibold text-accent">!</span>
              <p>
                Note: this guide reflects OZEV&apos;s published Workplace
                Charging Scheme rules. It&apos;s a voucher scheme rather
                than the Find a Grant portal used for residential
                applications — the steps below follow that process
                specifically.
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
                        This scheme requires dedicated off-street parking,
                        clearly associated with your premises and
                        designated for staff or fleet use — without that,
                        this site isn&apos;t eligible for the Workplace
                        Charging Scheme.
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
                        You&apos;ll need to either own the property or get
                        written landlord consent before you can apply. Get
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
                      onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        const sockets = Math.min(
                          parseInt(String(data.get("sockets") ?? "1"), 10) || 1,
                          40
                        );
                        const chargerUnitCost = parseFloat(String(data.get("chargerCost") ?? "0")) || 0;
                        const labourCost = parseFloat(String(data.get("labourCost") ?? "0")) || 0;
                        const workItems = works
                          .filter((w) => w.desc || w.cost)
                          .map((w) => ({ desc: w.desc || "Additional works", cost: parseFloat(w.cost) || 0 }));

                        generateWorkplaceQuotePdf({
                          reference: generateReferenceCode("OCU"),
                          contactName: String(data.get("contactName") ?? ""),
                          email: String(data.get("email") ?? ""),
                          phone: String(data.get("phone") ?? "") || undefined,
                          businessName: String(data.get("business") ?? ""),
                          regNumber: String(data.get("regNo") ?? "") || undefined,
                          billingAddress: String(data.get("billingAddress") ?? ""),
                          siteAddress: String(data.get("site") ?? ""),
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
                        const grantCap = Math.min(500 * sockets, 20000);
                        const grant = Math.min(totalIncVat * 0.75, grantCap);
                        setQuoteResult({ netPayable: totalIncVat - grant, grant, sockets });
                      }}
                    >
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
                        <Field label="Company reg. no. / VAT no. / business rates ref.">
                          <Input name="regNo" placeholder="e.g. 12345678" />
                        </Field>
                        <Field label="Number of sockets requested (max 40)">
                          <Input name="sockets" type="number" min={1} max={40} placeholder="e.g. 6" />
                        </Field>
                        <Field label="Billing address">
                          <Input name="billingAddress" placeholder="e.g. 10 Commercial Way, London, NW10 7LR" />
                        </Field>
                        <Field label="Installation site address">
                          <Input
                            name="site"
                            placeholder="e.g. Woodgreen Logistics, Site 2, Industrial Estate, Watford"
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
                            (after a £{quoteResult.grant.toFixed(2)} voucher
                            deduction across {quoteResult.sockets} socket
                            {quoteResult.sockets === 1 ? "" : "s"}). Keep
                            this copy — you&apos;ll need it for your voucher
                            application.
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
    </div>
  );
}
