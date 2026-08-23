"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { products } from "@/lib/products";
import { commercialProducts } from "@/lib/commercial-products";
import { generateReferenceCode } from "@/lib/reference-code";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});
const GRANT_AMOUNT = 500;

const quoteCovers = [
  "Your selected charger unit",
  "Installation carried out by OZEV-certified electricians",
  "Cable run of up to 15m, including standard fixings",
  "Complete testing, commissioning, and app configuration",
  "Certification and installation documentation",
];

export default function GetAQuotePage() {
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const selected =
    products.find((p) => p.id === selectedId) ??
    commercialProducts.find((p) => p.id === selectedId);
  const grossPrice = selected?.price ?? null;
  const netPrice =
    grossPrice != null ? Math.max(grossPrice - GRANT_AMOUNT, 0) : null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Request Your Quote
            </h1>
            <p className="mt-3 max-w-lg text-primary-foreground/75">
              Tell us about your property and we&apos;ll size the right
              OZEV-approved charger for it.
            </p>
          </div>
        </div>

        <section className="bg-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            {submitted ? (
              <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-border bg-secondary px-6 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-success/15">
                  <CheckCircle2 className="size-6 text-success" />
                </span>
                <p className="font-heading text-lg font-semibold text-foreground">
                  Thanks — we&apos;ve got your quote request
                </p>
                <p className="text-sm text-muted-foreground">
                  Your reference
                </p>
                <p className="font-heading text-2xl font-semibold text-primary">
                  {reference}
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  A quote is sent by email within one working day. If it&apos;s
                  urgent, call us on 033 0633 0252.
                </p>
                <Button nativeButton={false} render={<Link href="/" />}>
                  Back to home
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
                <form
                  className="flex flex-col gap-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setReference(generateReferenceCode("NIS"));
                    setSubmitted(true);
                  }}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Full name">
                      <Input required placeholder="Full name" />
                    </Field>
                    <Field label="Email address">
                      <Input required type="email" placeholder="Email address" />
                    </Field>
                    <Field label="Address line 1" className="sm:col-span-2">
                      <Input required placeholder="Address line 1" />
                    </Field>
                    <Field label="Address line 2 (optional)" className="sm:col-span-2">
                      <Input placeholder="Address line 2" />
                    </Field>
                    <Field label="Town / city">
                      <Input required placeholder="Town / city" />
                    </Field>
                    <Field label="Postcode">
                      <Input required placeholder="Postcode" />
                    </Field>
                    <Field label="Select your charger" className="sm:col-span-2">
                      <Select
                        value={selectedId}
                        onValueChange={(value) => setSelectedId(value ?? "")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose your Nison Energy charger" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Residential Chargers</SelectLabel>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} — {product.colour}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Commercial Chargers</SelectLabel>
                            {commercialProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} — {product.colour}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <p className="mt-1.5 text-xs font-normal text-muted-foreground">
                        All chargers are OZEV-approved and eligible for grant
                        support where applicable.
                      </p>
                    </Field>
                    <Field
                      label="Anything else we should know? (optional)"
                      className="sm:col-span-2"
                    >
                      <Textarea rows={4} placeholder="Tell us a bit more" />
                    </Field>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 w-full bg-accent text-base text-accent-foreground hover:bg-accent/90 sm:w-auto"
                  >
                    Request my quote
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll never share your details. A quote is sent by
                    email within one working day.
                  </p>
                </form>

                <Card className="h-fit">
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4.5 text-primary" />
                      <h2 className="font-heading text-lg font-semibold text-foreground">
                        What your quote will include
                      </h2>
                    </div>

                    {selected && grossPrice != null && netPrice != null ? (
                      <div className="flex flex-col gap-1 rounded-lg bg-secondary px-4 py-3">
                        <div className="flex items-center justify-between text-sm">
                          <p className="text-muted-foreground">
                            {selected.name} (inc. VAT)
                          </p>
                          <p className="font-medium text-foreground">
                            {currency.format(grossPrice)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <p className="text-muted-foreground">
                            OZEV grant award
                          </p>
                          <p className="font-medium text-success">
                            -{currency.format(GRANT_AMOUNT)}
                          </p>
                        </div>
                        <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
                          <p className="text-sm font-medium text-foreground">
                            Quote inc. VAT (after grant)
                          </p>
                          <p className="font-heading text-lg font-semibold text-primary">
                            {currency.format(netPrice)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Select a charger to see an indicative price after the
                        OZEV grant.
                      </p>
                    )}

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        This quote covers
                      </p>
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {quoteCovers.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-sm text-foreground/80"
                          >
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Indicative quote only — subject to site survey. Grant
                      subject to eligibility and OZEV approval. Installation
                      carried out by Nison Limited, OZEV Installer No. 13528,
                      in compliance with The Electric Vehicles (Smart Charge
                      Points) Regulations 2021.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`flex flex-col gap-1.5 text-sm font-medium text-foreground ${className ?? ""}`}
    >
      {label}
      {children}
    </label>
  );
}
