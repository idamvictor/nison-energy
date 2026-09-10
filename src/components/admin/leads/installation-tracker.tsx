"use client";

import { useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  installationStages,
  grantStatuses,
  type InstallationDetails,
} from "@/lib/leads/types";
import { updateLeadInstallation } from "@/lib/leads/actions";

const NONE = "__none";

export function InstallationTracker({
  leadId,
  installation,
}: {
  leadId: string;
  installation?: InstallationDetails;
}) {
  const [stage, setStage] = useState(installation?.stage ?? "Enquiry Received");
  const [grantStatus, setGrantStatus] = useState(installation?.grantStatus ?? NONE);
  const [surveyDate, setSurveyDate] = useState(installation?.surveyDate ?? "");
  const [installDate, setInstallDate] = useState(installation?.installDate ?? "");
  const [engineer, setEngineer] = useState(installation?.engineer ?? "");

  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<
    { kind: "ok" | "error"; text: string } | null
  >(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updateLeadInstallation(leadId, {
        stage,
        grantStatus: grantStatus === NONE ? undefined : grantStatus,
        surveyDate: surveyDate || undefined,
        installDate: installDate || undefined,
        engineer: engineer || undefined,
      });
      setMessage(
        result.ok
          ? { kind: "ok", text: "Saved." }
          : { kind: "error", text: result.error },
      );
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Stage">
          <Select
            value={stage}
            onValueChange={(v) => v && setStage(v as typeof stage)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {installationStages.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Grant status">
          <Select
            value={grantStatus}
            onValueChange={(v) => v && setGrantStatus(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select grant status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Not set</SelectItem>
              {grantStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Survey date">
          <Input
            type="date"
            value={surveyDate}
            onChange={(e) => setSurveyDate(e.target.value)}
          />
        </Field>
        <Field label="Install date">
          <Input
            type="date"
            value={installDate}
            onChange={(e) => setInstallDate(e.target.value)}
          />
        </Field>
        <Field label="Engineer" className="sm:col-span-2">
          <Input
            value={engineer}
            onChange={(e) => setEngineer(e.target.value)}
            placeholder="e.g. Dave Prentice"
          />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" className="w-fit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {message && (
          <p
            className={
              message.kind === "ok"
                ? "text-xs text-success"
                : "text-xs text-destructive"
            }
          >
            {message.text}
          </p>
        )}
      </div>
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
