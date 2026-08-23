"use client";

import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import type { AdminLead } from "@/lib/admin-leads";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function LeadTable({ leads }: { leads: AdminLead[] }) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">No leads found</p>
        <p className="text-sm text-muted-foreground">
          Try a different search or status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Enquiry</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="cursor-default">
              <TableCell>
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="font-medium text-foreground hover:text-primary hover:underline"
                >
                  {lead.firstName} {lead.lastName}
                </Link>
                {lead.companyName && (
                  <p className="text-xs text-muted-foreground">
                    {lead.companyName}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <p className="text-foreground">{lead.email}</p>
                <p className="text-xs text-muted-foreground">{lead.phone}</p>
              </TableCell>
              <TableCell>
                <p className="text-foreground">{lead.reasonForEnquiry}</p>
                <p className="text-xs text-muted-foreground">
                  {lead.areaOfEnquiry}
                </p>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(lead.submittedAt)}
              </TableCell>
              <TableCell>
                <StatusBadge status={lead.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
