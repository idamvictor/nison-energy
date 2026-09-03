"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Clock, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { accountCustomer } from "@/lib/account-mock";
import { cn } from "@/lib/utils";
import {
  useGrantApplication,
  type GrantApplicationRecord,
  type GrantApplicationStatus,
} from "@/hooks/use-grant-application";
import { useNotifications } from "@/hooks/use-notifications";

const statusLabel: Record<GrantApplicationStatus, string> = {
  approved: "Grant application approved",
  rejected: "Grant application rejected",
  waiting: "Grant application awaiting a decision",
};

function notifyGrantChanges(
  prev: GrantApplicationRecord | null,
  next: Omit<GrantApplicationRecord, "updatedAt">,
  push: (kind: "order" | "grant", title: string, description?: string) => void
) {
  if (!prev) {
    return;
  }
  if (!prev.hasApplied && next.hasApplied) {
    push("grant", "Grant application marked as submitted");
  }
  if (prev.status !== next.status && next.status) {
    push(
      "grant",
      statusLabel[next.status],
      next.status === "rejected" ? next.rejectionReason || undefined : undefined
    );
  }
  if (!prev.authCode && next.authCode) {
    push("grant", "Your grant authorisation code has arrived", next.authCode);
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      {label}
      {children}
    </label>
  );
}

function RadioRow({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { label: string; value: string }[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-1.5 text-sm text-foreground/80">
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
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AccountDetailsSummary() {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-secondary px-4 py-3.5 text-sm">
      <div>
        <p className="font-medium text-foreground">
          {accountCustomer.firstName} {accountCustomer.lastName}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {accountCustomer.email} · {accountCustomer.phone}
        </p>
        <p className="text-xs text-muted-foreground">
          {accountCustomer.address}, {accountCustomer.postcode}
        </p>
      </div>
      <Link
        href="/account/profile"
        className="shrink-0 text-xs font-medium text-primary hover:underline"
      >
        Not you? Edit profile
      </Link>
    </div>
  );
}

type TimelineState = "done" | "active" | "rejected" | "pending";
type TimelineItem = { label: string; state: TimelineState; detail?: string };

function buildTimeline(record: GrantApplicationRecord): TimelineItem[] {
  const { hasApplied, status, authCode, rejectionReason } = record;
  return [
    {
      label: "Application submitted",
      state: hasApplied ? "done" : "active",
      detail: hasApplied ? "Submitted to OZEV via GOV.UK" : "Not yet submitted",
    },
    {
      label: status === "rejected" ? "Application rejected" : "Decision from OZEV",
      state: !hasApplied
        ? "pending"
        : status === "approved"
          ? "done"
          : status === "rejected"
            ? "rejected"
            : "active",
      detail:
        status === "approved"
          ? "Approved"
          : status === "rejected"
            ? rejectionReason || "No reason given"
            : hasApplied
              ? "Waiting to hear back"
              : undefined,
    },
    {
      label: "Authorisation code received",
      state: status === "approved" ? (authCode ? "done" : "active") : "pending",
      detail: status === "approved" && authCode ? authCode : undefined,
    },
  ];
}

function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((item, index) => (
        <li key={item.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                item.state === "done" && "bg-primary text-primary-foreground",
                item.state === "active" && "bg-accent text-accent-foreground",
                item.state === "rejected" && "bg-destructive text-destructive-foreground",
                item.state === "pending" && "bg-muted text-muted-foreground"
              )}
            >
              {item.state === "done" && <Check className="size-3.5" />}
              {item.state === "active" && <Clock className="size-3.5" />}
              {item.state === "rejected" && <X className="size-3.5" />}
              {item.state === "pending" && index + 1}
            </span>
            {index < items.length - 1 && (
              <span
                className={cn(
                  "my-1 min-h-5 w-0.5 flex-1 rounded-full",
                  item.state === "done" ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
          <div className="flex-1 pb-5 last:pb-0">
            <p
              className={cn(
                "text-sm font-medium",
                item.state === "pending" ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {item.label}
            </p>
            {item.detail && <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function GrantApplicationTracker() {
  const record = useGrantApplication((state) => state.record);
  const save = useGrantApplication((state) => state.save);
  const pushNotification = useNotifications((state) => state.push);
  const [editing, setEditing] = useState(false);

  if (!record || editing) {
    return (
      <div className="flex flex-col gap-5">
        <AccountDetailsSummary />
        <ApplicationForm
          initial={record}
          onCancel={record ? () => setEditing(false) : undefined}
          onSave={(next) => {
            notifyGrantChanges(record, next, pushNotification);
            save(next);
            setEditing(false);
          }}
        />
      </div>
    );
  }

  const timeline = buildTimeline(record);

  return (
    <div className="flex flex-col gap-4">
      <AccountDetailsSummary />

      <div className="rounded-xl border border-border p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Last updated {formatDate(record.updatedAt)}
          </p>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Update status
          </Button>
        </div>
        <Timeline items={timeline} />
      </div>

      {!record.hasApplied && (
        <div className="flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-3 text-xs text-foreground/80">
          <span className="font-semibold text-accent">!</span>
          <p>
            Ready to apply? Use the apply button in the next step of this
            guide, then come back and update your status here.
          </p>
        </div>
      )}
    </div>
  );
}

function ApplicationForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: GrantApplicationRecord | null;
  onCancel?: () => void;
  onSave: (record: Omit<GrantApplicationRecord, "updatedAt">) => void;
}) {
  const [hasApplied, setHasApplied] = useState<"yes" | "no" | null>(
    initial ? (initial.hasApplied ? "yes" : "no") : null
  );
  const [status, setStatus] = useState<GrantApplicationStatus | null>(initial?.status ?? null);
  const [chargerId, setChargerId] = useState(initial?.chargerId ?? "");

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        onSave({
          chargerId,
          hasApplied: hasApplied === "yes",
          status: hasApplied === "yes" ? status : null,
          authCode: String(data.get("authCode") ?? ""),
          rejectionReason: String(data.get("rejectionReason") ?? ""),
          notes: String(data.get("notes") ?? ""),
        });
      }}
    >
      <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <Field label="Have you applied for the grant on the GOV.UK website?">
          <RadioRow
            name="hasApplied"
            value={hasApplied}
            onChange={(v) => {
              setHasApplied(v as "yes" | "no");
              if (v === "no") setStatus(null);
            }}
            options={[
              { label: "Yes", value: "yes" },
              { label: "Not yet", value: "no" },
            ]}
          />
        </Field>

        {hasApplied === "yes" && (
          <>
            <Field label="What's the current status of your application?">
              <RadioRow
                name="status"
                value={status}
                onChange={(v) => setStatus(v as GrantApplicationStatus)}
                options={[
                  { label: "Approved", value: "approved" },
                  { label: "Still waiting", value: "waiting" },
                  { label: "Rejected", value: "rejected" },
                ]}
              />
            </Field>

            {status === "approved" && (
              <Field label="Grant claim authorisation code">
                <Input name="authCode" placeholder="e.g. EVHS-XXXXXXX" defaultValue={initial?.authCode} />
              </Field>
            )}

            {status === "rejected" && (
              <Field label="What reason was given for the rejection?">
                <Textarea
                  name="rejectionReason"
                  rows={3}
                  placeholder="e.g. missing evidence, property not eligible, incorrect details"
                  defaultValue={initial?.rejectionReason}
                />
              </Field>
            )}
          </>
        )}
      </div>

      <Field label="Which charger have you applied for?">
        <Select value={chargerId} onValueChange={(v) => setChargerId(v ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a charger" />
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
      </Field>

      <Field label="Any other information (optional)">
        <Textarea
          name="notes"
          rows={3}
          placeholder="Anything else that would help us guide you through the process"
          defaultValue={initial?.notes}
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" className="w-fit bg-accent text-accent-foreground hover:bg-accent/90">
          {initial ? "Save update" : "Save my status"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Saved to this device — come back any time to update it as your application progresses.
      </p>
    </form>
  );
}
