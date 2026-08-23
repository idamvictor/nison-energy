"use client";

import { useState } from "react";

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
} from "@/lib/admin-leads";

export function InstallationTracker({
  installation,
}: {
  installation?: InstallationDetails;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Stage">
          <Select defaultValue={installation?.stage ?? "Enquiry Received"}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {installationStages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Grant status">
          <Select defaultValue={installation?.grantStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select grant status" />
            </SelectTrigger>
            <SelectContent>
              {grantStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Survey date">
          <Input type="date" defaultValue={installation?.surveyDate} />
        </Field>
        <Field label="Install date">
          <Input type="date" defaultValue={installation?.installDate} />
        </Field>
        <Field label="Engineer" className="sm:col-span-2">
          <Input
            defaultValue={installation?.engineer}
            placeholder="e.g. Dave Prentice"
          />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" className="w-fit">
          Save
        </Button>
        {saved && (
          <p className="text-xs text-success">
            Saved for preview — nothing is persisted yet.
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
