"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Wand2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PostcodeInput } from "@/components/shared/postcode-input";
import {
  AddressAutocomplete,
  type AddressSuggestion,
} from "@/components/shared/address-autocomplete";
import { Button } from "@/components/ui/button";
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
import { generateQuotePdf } from "@/lib/generate-quote-pdf";
import { accountCustomer } from "@/lib/account-mock";

// The only quote-request entry point on the site — rendered inside the
// popup on /ozev-grant-guide's Step 1.
export function QuoteRequestForm({
  done,
  showComplianceFooter = true,
}: {
  done: { label: string; onClick: () => void };
  showComplianceFooter?: boolean;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function setField(name: string, value: string) {
    const form = formRef.current;
    if (!form) return;
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      field.value = value;
      // PostcodeInput and AddressAutocomplete are controlled components —
      // a direct DOM value assignment won't trigger their onChange, so
      // dispatch a real input event to sync their React state.
      field.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function handleAddressSelect(suggestion: AddressSuggestion) {
    if (suggestion.city) setField("townCity", suggestion.city);
    if (suggestion.postcode) setField("postcode", suggestion.postcode);
  }

  function fillSampleData() {
    const set = setField;
    set("fullName", `${accountCustomer.firstName} ${accountCustomer.lastName}`);
    set("email", accountCustomer.email);
    set("addressLine1", accountCustomer.address);
    set("townCity", "London");
    set("postcode", accountCustomer.postcode);
    set(
      "notes",
      "Driveway parking, would like the OZEV grant applied if eligible."
    );
    setSelectedId("easee-one");
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="size-6 text-success" />
        </span>
        <p className="font-heading text-lg font-semibold text-foreground">
          Your code has been downloaded.
        </p>
        <p className="font-heading text-2xl font-semibold text-primary">
          {reference}
        </p>
        <Button onClick={done.onClick}>{done.label}</Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const selected =
          products.find((p) => p.id === selectedId) ??
          commercialProducts.find((p) => p.id === selectedId);
        const ref = generateReferenceCode("NIS");

        generateQuotePdf({
          reference: ref,
          fullName: String(data.get("fullName") ?? ""),
          email: String(data.get("email") ?? ""),
          addressLine1: String(data.get("addressLine1") ?? ""),
          addressLine2: String(data.get("addressLine2") ?? ""),
          townCity: String(data.get("townCity") ?? ""),
          postcode: String(data.get("postcode") ?? ""),
          chargerName: selected?.name ?? "",
          grossPrice: selected?.price ?? null,
          notes: String(data.get("notes") ?? ""),
        });

        setReference(ref);
        setSubmitted(true);
      }}
    >
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={fillSampleData}
        >
          <Wand2 className="size-3.5" />
          Fill sample data
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <Input name="fullName" required placeholder="Full name" />
        </Field>
        <Field label="Email address">
          <Input name="email" required type="email" placeholder="Email address" />
        </Field>
        <Field label="Address line 1" className="sm:col-span-2">
          <AddressAutocomplete name="addressLine1" required onSelect={handleAddressSelect} />
        </Field>
        <Field label="Address line 2 (optional)" className="sm:col-span-2">
          <Input name="addressLine2" placeholder="Address line 2" />
        </Field>
        <Field label="Town / city">
          <Input name="townCity" required placeholder="Town / city" />
        </Field>
        <Field label="Postcode">
          <PostcodeInput required />
        </Field>
        <Field label="Select your charger" className="sm:col-span-2">
          <Select value={selectedId} onValueChange={(value) => setSelectedId(value ?? "")}>
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
            All chargers are OZEV-approved and eligible for grant support where applicable.
          </p>
        </Field>
        <Field label="Anything else we should know? (optional)" className="sm:col-span-2">
          <Textarea name="notes" rows={4} placeholder="Tell us a bit more" />
        </Field>
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full bg-accent text-base text-accent-foreground hover:bg-accent/90"
      >
        Request my quote
      </Button>

      {showComplianceFooter && (
        <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4 text-xs text-muted-foreground">
          <p>
            Nison Energy (trading as Nison Limited) · OZEV Installer No. 13528 · Borehamwood, Hertfordshire
          </p>
          <p>info@nisonenergy.com · 033 0633 0252 · www.nisonenergy.com</p>
          <p>
            We&apos;ll never share your details. A quote is sent by email within one working day.
          </p>
        </div>
      )}
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
    <label
      className={`flex flex-col gap-1.5 text-sm font-medium text-foreground ${className ?? ""}`}
    >
      {label}
      {children}
    </label>
  );
}
