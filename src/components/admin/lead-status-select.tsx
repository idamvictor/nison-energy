"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leadStatuses, type LeadStatus } from "@/lib/admin-leads";

export function LeadStatusSelect({ initialStatus }: { initialStatus: LeadStatus }) {
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [changed, setChanged] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <Select
        value={status}
        onValueChange={(value) => {
          setStatus(value as LeadStatus);
          setChanged(true);
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {leadStatuses.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {changed && (
        <p className="text-xs text-success">
          Updated for preview — not persisted.
        </p>
      )}
    </div>
  );
}
