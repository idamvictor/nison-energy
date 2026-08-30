"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const enquiryAreas = [
  "House",
  "Flat",
  "Apartment Building",
  "Shared Accommodation",
  "Office Parking",
  "School Car Park",
  "Hospitality",
  "Other",
];

const enquiryReasons = [
  "Home EV Installation",
  "Workplace EV Installation",
  "EV Maintenance",
  "Joining our network",
];

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none invalid:text-muted-foreground/45 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="size-6 text-success" />
        </span>
        <p className="font-heading text-lg font-semibold text-foreground">
          Thanks — we&apos;ve got your enquiry
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          A member of the team will be in touch shortly. If it&apos;s
          urgent, call us on 033 0633 0252.
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First name">
          <Input required placeholder="First name" />
        </Field>
        <Field label="Last name">
          <Input required placeholder="Last name" />
        </Field>
        <Field label="Phone number">
          <Input required type="tel" placeholder="Phone number" />
        </Field>
        <Field label="Email">
          <Input required type="email" placeholder="Email" />
        </Field>
        <Field label="Job title (optional)">
          <Input placeholder="Job title" />
        </Field>
        <Field label="Company name (optional)">
          <Input placeholder="Company name" />
        </Field>
        <Field label="Postcode (optional)" className="sm:col-span-2">
          <Input placeholder="Postcode" />
        </Field>

        <Field label="Which best describes your area of enquiry?">
          <select required defaultValue="" className={selectClass}>
            <option value="" disabled>
              Select an option
            </option>
            {enquiryAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Reason for enquiry">
          <select required defaultValue="" className={selectClass}>
            <option value="" disabled>
              Select an option
            </option>
            {enquiryReasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <RadioField
        name="communications"
        label="Happy to receive future communications on insights and trends?"
      />

      <Field label="Any additional information? (optional)">
        <Textarea rows={4} placeholder="Tell us a bit more about your enquiry" />
      </Field>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full bg-accent text-base text-accent-foreground hover:bg-accent/90 sm:w-auto"
      >
        Send
      </Button>
    </form>
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
    <label className={`flex flex-col gap-1.5 text-sm font-medium text-foreground ${className ?? ""}`}>
      {label}
      {children}
    </label>
  );
}

function RadioField({ name, label }: { name: string; label: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-4">
        {["Yes", "No"].map((option) => (
          <label
            key={option}
            className="flex items-center gap-1.5 text-sm text-foreground/80"
          >
            <input
              type="radio"
              name={name}
              value={option}
              className="size-4 accent-primary"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}
