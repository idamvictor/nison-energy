"use client";

import { useRef, useState, useTransition } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitOnStreetParkingIntake } from "@/lib/leads/actions";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2.5 text-sm text-foreground/80">
      <input
        type="checkbox"
        required
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-primary"
      />
      {label}
    </label>
  );
}

function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2 sm:col-span-2">
      <legend className="mb-2 text-sm font-medium text-foreground">{label}</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm text-foreground/80">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="size-4 accent-primary"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function OnStreetIntakeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  // Tenure and vehicle ownership start unanswered — the customer must choose.
  const [tenure, setTenure] = useState("");
  const [contactTime, setContactTime] = useState("none");
  const [thirdPartyNeeded, setThirdPartyNeeded] = useState("");
  const [permissionStatus, setPermissionStatus] = useState("na");
  const [vehicleOwnership, setVehicleOwnership] = useState("");
  const [planningNeeded, setPlanningNeeded] = useState("");
  const [lhaStatus, setLhaStatus] = useState("Not yet contacted");
  const [confirmNoOffStreet, setConfirmNoOffStreet] = useState(false);
  const [notMoving, setNotMoving] = useState(false);
  const [notPreviouslyClaimed, setNotPreviouslyClaimed] = useState(false);
  const [notInstalled, setNotInstalled] = useState(false);
  const [understandsCrossPavement, setUnderstandsCrossPavement] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    // Base UI selects aren't native form controls, so `required` can't enforce these.
    if (!tenure) {
      setError("Please tell us whether you own or rent the property.");
      return;
    }
    if (!vehicleOwnership) {
      setError("Please tell us how the vehicle is held.");
      return;
    }
    const data = new FormData(e.currentTarget);
    data.set("tenure", tenure);
    data.set("contactTime", contactTime);
    data.set("thirdPartyNeeded", thirdPartyNeeded);
    data.set("permissionStatus", permissionStatus);
    data.set("vehicleOwnership", vehicleOwnership);
    data.set("planningNeeded", planningNeeded);
    data.set("lhaStatus", lhaStatus);

    startTransition(async () => {
      const result = await submitOnStreetParkingIntake(data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/5 px-3.5 py-3 text-sm text-foreground/80">
        <Check className="mt-0.5 size-4 shrink-0 text-success" />
        <p>
          Thanks — your details are in. A member of the Ocunio Energy team will review your
          submission and be in touch to confirm next steps, including your site survey and LHA
          consent guidance.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-lg border border-border bg-secondary/40 p-4"
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

      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          1. Your contact details
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name">
            <Input name="firstName" required placeholder="Jane" />
          </Field>
          <Field label="Last name">
            <Input name="lastName" required placeholder="Doe" />
          </Field>
          <Field label="Phone number">
            <Input name="phone" required type="tel" placeholder="07…" />
          </Field>
          <Field label="Email address">
            <Input name="email" required type="email" placeholder="jane@email.com" />
          </Field>
          <Field label="Property address" hint="Where the chargepoint will be installed.">
            <Input name="address" required placeholder="Street, city, postcode" />
          </Field>
          <Field label="Do you own or rent this property?">
            <Select value={tenure} onValueChange={(v) => v && setTenure(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Own">Own</SelectItem>
                <SelectItem value="Rent">Rent</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Best time to contact you">
            <Select value={contactTime} onValueChange={(v) => v && setContactTime(v)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v: string) => (v === "none" ? "No preference" : v)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No preference</SelectItem>
                <SelectItem value="Morning">Morning</SelectItem>
                <SelectItem value="Afternoon">Afternoon</SelectItem>
                <SelectItem value="Evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          2. Third-party permission
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          Only needed if the property or parking is managed by a landlord, freeholder, managing
          agent or private road owner.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RadioGroup
            label="Does anyone else need to give permission for the works?"
            name="thirdPartyNeeded"
            value={thirdPartyNeeded}
            onChange={setThirdPartyNeeded}
            options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ]}
          />
          <Field label="Name of landlord / freeholder / agent">
            <Input name="landlordName" placeholder="Optional" />
          </Field>
          <Field label="Their contact details">
            <Input name="landlordContact" placeholder="Optional" />
          </Field>
          <Field label="Written permission obtained?" hint="Select “Not applicable” if no one else needs to give permission.">
            <Select value={permissionStatus} onValueChange={(v) => v && setPermissionStatus(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes, in hand</SelectItem>
                <SelectItem value="progress">In progress</SelectItem>
                <SelectItem value="not_started">Not started</SelectItem>
                <SelectItem value="na">Not applicable</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          3. On-street parking details
        </p>
        <div className="flex flex-col gap-4">
          <Field label="Where is the on-street parking located relative to your home?">
            <Textarea
              name="parkingLocation"
              required
              rows={2}
              placeholder="e.g. directly outside the property, opposite side of the road, nearest lamppost, etc."
            />
          </Field>
          <CheckboxRow
            label="I confirm I do not have private, exclusive off-street parking (driveway, garage or residential car park) at this property."
            checked={confirmNoOffStreet}
            onChange={setConfirmNoOffStreet}
          />
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          4. Vehicle details
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Vehicle make and model">
            <Input name="vehicleModel" required placeholder="e.g. Tesla Model Y" />
          </Field>
          <Field label="Registration number">
            <Input name="vehicleReg" placeholder="Optional" />
          </Field>
          <Field label="How is the vehicle held?">
            <Select value={vehicleOwnership} onValueChange={(v) => v && setVehicleOwnership(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Registered owner (new or used)">
                  Registered owner (new or used)
                </SelectItem>
                <SelectItem value="Leaseholder (min. 6 months)">
                  Leaseholder (min. 6 months)
                </SelectItem>
                <SelectItem value="Company car / named primary user">
                  Company car / named primary user
                </SelectItem>
                <SelectItem value="Vehicle on order">Vehicle on order</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="If on order, expected delivery date">
            <Input name="deliveryDate" type="date" />
          </Field>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          5. Local highways authority (LHA)
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          The cross-pavement solution needs LHA consent before you apply — this is mandatory
          evidence for the grant.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name of your local council / highways authority">
            <Input name="lhaName" required placeholder="e.g. London Borough of Hackney" />
          </Field>
          <Field label="Status of your LHA consent application">
            <Select value={lhaStatus} onValueChange={(v) => v && setLhaStatus(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not yet contacted">Not yet contacted</SelectItem>
                <SelectItem value="Contacted, awaiting response">
                  Contacted, awaiting response
                </SelectItem>
                <SelectItem value="Consent granted">Consent granted</SelectItem>
                <SelectItem value="Consent refused">Consent refused</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="LHA consent reference (if issued)">
            <Input name="lhaReference" placeholder="Optional" />
          </Field>
          <RadioGroup
            label="Do you know if planning permission is also required?"
            name="planningNeeded"
            value={planningNeeded}
            onChange={setPlanningNeeded}
            options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
              { label: "Not sure", value: "unsure" },
            ]}
          />
        </div>
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-foreground/80">
          <span className="font-semibold text-accent">!</span>
          <p>
            Contact your LHA as early as possible — some councils have lengthy processing times
            or don&apos;t yet permit cross-pavement solutions, and this can affect your
            installation timeline.
          </p>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          6. Eligibility confirmations
        </p>
        <div className="flex flex-col gap-2.5">
          <CheckboxRow
            label="I am not moving house or planning to move."
            checked={notMoving}
            onChange={setNotMoving}
          />
          <CheckboxRow
            label="I have not previously claimed this grant, the Renters and Flat Owners grant, EVHS or the Domestic Recharge Scheme at this address."
            checked={notPreviouslyClaimed}
            onChange={setNotPreviouslyClaimed}
          />
          <CheckboxRow
            label="The chargepoint has not already been installed."
            checked={notInstalled}
            onChange={setNotInstalled}
          />
          <CheckboxRow
            label="I understand a permanent cross-pavement charging solution must be installed alongside the chargepoint, and this cost is not covered by the grant."
            checked={understandsCrossPavement}
            onChange={setUnderstandsCrossPavement}
          />
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          7. Anything else we should know?
        </p>
        <Textarea
          name="notes"
          rows={2}
          placeholder="Any additional context — e.g. shared driveway disputes, existing quotes, preferred installation dates."
        />
        <div className="mt-3">
          <CheckboxRow
            label="I consent to Ocunio Energy storing and using these details to assess my eligibility, obtain quotes, and progress my grant application."
            checked={dataConsent}
            onChange={setDataConsent}
          />
        </div>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={pending}
        variant="cta"
        className="w-fit gap-1.5"
      >
        {pending ? "Submitting…" : "Submit details"}
      </Button>
    </form>
  );
}
