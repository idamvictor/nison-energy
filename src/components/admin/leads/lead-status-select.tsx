"use client";

import { useState, useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leadStatuses, type LeadStatus } from "@/lib/leads/types";
import { updateLeadStatus } from "@/lib/leads/actions";

export function LeadStatusSelect({
  leadId,
  initialStatus,
}: {
  leadId: string;
  initialStatus: LeadStatus;
}) {
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <Select
        value={status}
        disabled={pending}
        onValueChange={(value) => {
          const next = value as LeadStatus;
          const prev = status;
          setStatus(next);
          setError(null);
          startTransition(async () => {
            const result = await updateLeadStatus(leadId, next);
            if (!result.ok) {
              setStatus(prev);
              setError(result.error);
            }
          });
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
      {pending && <p className="text-xs text-muted-foreground">Saving…</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
