"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { submitEnquiry, type EnquiryFormState } from "@/app/contact-us/actions";

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
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none invalid:text-muted-foreground/45 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

const initialState: EnquiryFormState = { status: "idle" };

function splitName(name?: string | null): { first: string; last: string } {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitEnquiry,
    initialState,
  );
  const { data: session } = authClient.useSession();
  const prefill = splitName(session?.user.name);
  const errors = state.status === "error" ? state.errors : {};

  if (state.status === "success") {
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
          urgent, call us on 07525 567054.
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      action={formAction}
      // Give a signed-in user a fresh set of prefilled defaults across re-renders.
      key={session?.user.id ?? "guest"}
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
        <Field label="First name" error={errors.firstName}>
          <Input
            name="firstName"
            required
            defaultValue={prefill.first}
            placeholder="First name"
            aria-invalid={!!errors.firstName}
          />
        </Field>
        <Field label="Last name" error={errors.lastName}>
          <Input
            name="lastName"
            required
            defaultValue={prefill.last}
            placeholder="Last name"
            aria-invalid={!!errors.lastName}
          />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <Input
            name="phone"
            required
            type="tel"
            defaultValue={session?.user.phone ?? ""}
            placeholder="Phone number"
            aria-invalid={!!errors.phone}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input
            name="email"
            required
            type="email"
            defaultValue={session?.user.email ?? ""}
            placeholder="Email"
            aria-invalid={!!errors.email}
          />
        </Field>
        <Field label="Job title (optional)">
          <Input name="jobTitle" placeholder="Job title" />
        </Field>
        <Field label="Company name (optional)">
          <Input name="companyName" placeholder="Company name" />
        </Field>
        <Field label="Postcode (optional)" className="sm:col-span-2">
          <Input name="postcode" placeholder="Postcode" />
        </Field>

        <Field
          label="Which best describes your area of enquiry?"
          error={errors.areaOfEnquiry}
        >
          <select
            name="areaOfEnquiry"
            required
            defaultValue=""
            className={selectClass}
            aria-invalid={!!errors.areaOfEnquiry}
          >
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

        <Field label="Reason for enquiry" error={errors.reasonForEnquiry}>
          <select
            name="reasonForEnquiry"
            required
            defaultValue=""
            className={selectClass}
            aria-invalid={!!errors.reasonForEnquiry}
          >
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
        name="futureCommunications"
        label="Happy to receive future communications on insights and trends?"
      />

      <Field label="Any additional information? (optional)">
        <Textarea
          name="additionalInformation"
          rows={4}
          placeholder="Tell us a bit more about your enquiry"
        />
      </Field>

      {state.status === "error" && state.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-12 w-full bg-accent text-base text-accent-foreground hover:bg-accent/90 sm:w-auto"
      >
        {pending ? "Sending…" : "Send"}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
  className,
  error,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium text-foreground ${className ?? ""}`}>
      {label}
      {children}
      {error && <span className="text-xs font-normal text-destructive">{error}</span>}
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
