"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadTable } from "@/components/admin/shared/lead-table";
import { adminLeads, leadStatuses, type LeadStatus } from "@/lib/admin-leads";

export default function AdminLeadsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");

  const filtered = [...adminLeads]
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
    .filter((lead) => {
      const matchesStatus = status === "all" || lead.status === status;
      const haystack =
        `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.companyName ?? ""}`.toLowerCase();
      const matchesQuery =
        query.trim() === "" || haystack.includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">
          Leads
        </h2>
        <p className="text-sm text-muted-foreground">
          {adminLeads.length} enquiries submitted through the contact form.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads…"
            className="pl-8"
          />
        </div>

        <Select
          value={status}
          onValueChange={(value) => setStatus(value as LeadStatus | "all")}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {leadStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <LeadTable leads={filtered} />
    </div>
  );
}
