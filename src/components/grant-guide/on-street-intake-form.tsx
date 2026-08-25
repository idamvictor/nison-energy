"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PostcodeInput } from "@/components/shared/postcode-input";
import { AddressAutocomplete } from "@/components/shared/address-autocomplete";
import { generateReferenceCode } from "@/lib/reference-code";

function SectionHeading({ number, title, sub }: { number: number; title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary text-xs font-semibold text-primary">
          {number}
        </span>
        <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
      </div>
      {sub && <p className="mt-1 pl-8.5 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium text-foreground ${className ?? ""}`}>
      {label} {required && <span className="text-accent">*</span>}
      {children}
    </label>
  );
}

function CheckRow({
  id,
  required,
  children,
}: {
  id: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-2.5 border-b border-border py-2.5 text-sm text-foreground/80 last:border-0">
      <input type="checkbox" id={id} required={required} className="mt-0.5 size-4 shrink-0 accent-primary" />
      <span>
        {children} {required && <span className="text-accent">*</span>}
      </span>
    </label>
  );
}

function RadioGroup({
  name,
  options,
}: {
  name: string;
  options: string[];
}) {
  return (
    <div className="flex flex-wrap gap-4 pt-1">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-1.5 text-sm text-foreground/80">
          <input type="radio" name={name} value={option} className="size-4 accent-primary" />
          {option}
        </label>
      ))}
    </div>
  );
}

export function OnStreetIntakeForm() {
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-success/30 bg-success/5 px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="size-6 text-success" />
        </span>
        <p className="font-heading text-lg font-semibold text-foreground">
          Thanks — your details are in
        </p>
        <p className="text-sm text-muted-foreground">Your reference</p>
        <p className="font-heading text-2xl font-semibold text-primary">
          {reference}
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          A member of the Nison Energy team will review your submission and
          be in touch to confirm next steps, including your site survey and
          local highways authority consent guidance.
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setReference(generateReferenceCode("NIS"));
        setSubmitted(true);
      }}
    >
      <Card>
        <CardContent>
          <SectionHeading number={1} title="Your contact details" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <Input required placeholder="Full name" />
            </Field>
            <Field label="Phone number" required>
              <Input required type="tel" placeholder="Phone number" />
            </Field>
            <Field label="Email address" required className="sm:col-span-2">
              <Input required type="email" placeholder="Email address" />
            </Field>
            <Field label="Property address" required className="sm:col-span-2">
              <AddressAutocomplete required />
            </Field>
            <Field label="Postcode" required>
              <PostcodeInput required />
            </Field>
            <Field label="Do you own or rent this property?" required>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="own">Own</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionHeading
            number={2}
            title="Third-party permission"
            sub="Only needed if the property or parking is managed by a landlord, freeholder, managing agent or private road owner."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Does anyone else need to give permission for the works?" className="sm:col-span-2">
              <RadioGroup name="thirdPartyNeeded" options={["Yes", "No"]} />
            </Field>
            <Field label="Name of landlord / freeholder / agent">
              <Input placeholder="Optional" />
            </Field>
            <Field label="Their contact details">
              <Input placeholder="Optional" />
            </Field>
            <Field label="Written permission obtained?" className="sm:col-span-2">
              <RadioGroup
                name="thirdPartyPermission"
                options={["Yes, in hand", "In progress", "Not started", "Not applicable"]}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionHeading number={3} title="On-street parking details" />
          <div className="flex flex-col gap-4">
            <Field label="Where is the on-street parking located relative to your home?" required>
              <Textarea
                required
                rows={2}
                placeholder="e.g. directly outside the property, opposite side of the road, nearest lamppost"
              />
            </Field>
            <CheckRow id="noOffStreet" required>
              I confirm I do <strong>not</strong> have private, exclusive off-street parking (driveway, garage or residential car park) at this property.
            </CheckRow>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionHeading number={4} title="Vehicle details" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Vehicle make and model" required>
              <Input required placeholder="e.g. Kia Niro EV" />
            </Field>
            <Field label="Registration number">
              <Input placeholder="Optional" />
            </Field>
            <Field label="How is the vehicle held?" required className="sm:col-span-2">
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Registered owner (new or used)</SelectItem>
                  <SelectItem value="lease">Leaseholder (min. 6 months)</SelectItem>
                  <SelectItem value="company">Company car / named primary user</SelectItem>
                  <SelectItem value="ordered">Vehicle on order</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="If on order, expected delivery date">
              <Input type="date" />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionHeading
            number={5}
            title="Local highways authority (LHA)"
            sub="The cross-pavement solution needs LHA consent before you apply — this is mandatory evidence for the grant."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name of your local council / highways authority" required className="sm:col-span-2">
              <Input required placeholder="e.g. Hertfordshire County Council" />
            </Field>
            <Field label="Status of your LHA consent application" required>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-contacted">Not yet contacted</SelectItem>
                  <SelectItem value="awaiting">Contacted, awaiting response</SelectItem>
                  <SelectItem value="granted">Consent granted</SelectItem>
                  <SelectItem value="refused">Consent refused</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="LHA consent reference (if issued)">
              <Input placeholder="Optional" />
            </Field>
            <Field label="Do you know if planning permission is also required?" className="sm:col-span-2">
              <RadioGroup name="planningNeeded" options={["Yes", "No", "Not sure"]} />
            </Field>
          </div>
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-foreground/80">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-accent" />
            <p>
              Contact your LHA as early as possible — some councils have
              lengthy processing times or don&apos;t yet permit cross-pavement
              solutions, and this can affect your installation timeline.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionHeading number={6} title="Eligibility confirmations" />
          <div className="flex flex-col">
            <CheckRow id="notMoving" required>
              I am not moving house or planning to move.
            </CheckRow>
            <CheckRow id="notPreviouslyClaimed" required>
              I have not previously claimed this grant, the Renters and Flat
              Owners grant, EVHS or the Domestic Recharge Scheme at this
              address.
            </CheckRow>
            <CheckRow id="notInstalled" required>
              The chargepoint has not already been installed.
            </CheckRow>
            <CheckRow id="willInstallCrossPavement" required>
              I understand a permanent cross-pavement charging solution must
              be installed alongside the chargepoint, and this cost is not
              covered by the grant.
            </CheckRow>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionHeading number={7} title="Anything else we should know?" />
          <div className="flex flex-col gap-4">
            <Field label="Additional context (optional)">
              <Textarea
                rows={3}
                placeholder="e.g. shared driveway disputes, existing quotes, preferred installation dates"
              />
            </Field>
            <CheckRow id="dataConsent" required>
              I consent to Nison Energy storing and using these details to
              assess my eligibility, obtain quotes, and progress my grant
              application.
            </CheckRow>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Fields marked <span className="text-accent">*</span> are required to start your application.
        </p>
        <Button type="submit" size="lg" className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90">
          Submit details
        </Button>
      </div>
    </form>
  );
}
