"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorksRowsField, type WorkRow } from "@/components/grant-guide/works-rows-field";
import { generateReferenceCode } from "@/lib/reference-code";
import { generateWorkplaceQuotePdf } from "@/lib/generate-workplace-quote-pdf";

const chargerModels = [
  "Ocunio Fleet 7kW Tethered",
  "Ocunio Fleet 7kW Untethered",
  "Ocunio Fleet 22kW Tethered (three-phase)",
];

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

export function WorkplaceQuoteForm({ done }: { done: { label: string; onClick: () => void } }) {
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [charger, setCharger] = useState(chargerModels[0]);
  const [works, setWorks] = useState<WorkRow[]>([{ desc: "", cost: "" }]);

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="size-6 text-success" />
        </span>
        <p className="font-heading text-lg font-semibold text-foreground">
          Your quote has been downloaded.
        </p>
        <p className="font-heading text-2xl font-semibold text-primary">{reference}</p>
        <Button onClick={done.onClick}>{done.label}</Button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const ref = generateReferenceCode("NIS");
        generateWorkplaceQuotePdf({
          reference: ref,
          contactName: String(data.get("contactName") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? "") || undefined,
          businessName: String(data.get("businessName") ?? ""),
          regNumber: String(data.get("regNumber") ?? "") || undefined,
          billingAddress: String(data.get("billingAddress") ?? ""),
          siteAddress: String(data.get("siteAddress") ?? ""),
          sockets: Math.min(parseInt(String(data.get("sockets") ?? "1"), 10) || 1, 40),
          chargerModel: charger,
          chargerUnitCost: parseFloat(String(data.get("chargerCost") ?? "0")) || 0,
          labourCost: parseFloat(String(data.get("labourCost") ?? "0")) || 0,
          works: works
            .filter((w) => w.desc || w.cost)
            .map((w) => ({ desc: w.desc || "Additional works", cost: parseFloat(w.cost) || 0 })),
        });
        setReference(ref);
        setSubmitted(true);
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
          <Input name="businessName" required placeholder="e.g. Woodgreen Logistics Ltd" />
        </Field>
        <Field label="Company reg. no. / VAT no. / business rates ref.">
          <Input name="regNumber" placeholder="e.g. 12345678" />
        </Field>
        <Field label="Number of sockets requested (max 40)">
          <Input name="sockets" type="number" min={1} max={40} defaultValue={1} required />
        </Field>
        <Field label="Billing address" className="sm:col-span-2">
          <Input name="billingAddress" required placeholder="e.g. 10 Commercial Way, London, NW10 7LR" />
        </Field>
        <Field label="Installation site address" className="sm:col-span-2">
          <Input name="siteAddress" required placeholder="e.g. Woodgreen Logistics, Site 2, Industrial Estate, Watford" />
        </Field>
        <Field label="Charger model" className="sm:col-span-2">
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
        <Field label="Charger unit cost per socket (£, ex VAT)">
          <Input name="chargerCost" type="number" min={0} step="0.01" placeholder="e.g. 399" required />
        </Field>
        <Field label="Labour cost per socket (£, ex VAT)">
          <Input name="labourCost" type="number" min={0} step="0.01" placeholder="e.g. 250" required />
        </Field>
      </div>

      <WorksRowsField rows={works} onChange={setWorks} />

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full bg-accent text-base text-accent-foreground hover:bg-accent/90"
      >
        Generate My Quote
      </Button>
    </form>
  );
}
