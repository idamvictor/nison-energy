"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuoteStatusBadge } from "@/components/admin/quotes/quote-status-badge";
import {
  quoteSchemeLabels,
  quoteStatuses,
  type AdminQuoteRow,
  type QuoteStatus,
} from "@/lib/quotes/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function QuotesTableView({ quotes }: { quotes: AdminQuoteRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<QuoteStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quotes.filter((quote) => {
      const matchesStatus = status === "all" || quote.status === status;
      const haystack = `${quote.userName} ${quote.userEmail} ${quote.reference}`.toLowerCase();
      return matchesStatus && (q === "" || haystack.includes(q));
    });
  }, [quotes, query, status]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">Quotes</h2>
        <p className="text-sm text-muted-foreground">
          {quotes.length} {quotes.length === 1 ? "quote" : "quotes"} generated from the OZEV guides.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer or reference…"
            className="pl-8"
          />
        </div>

        <Select
          value={status}
          onValueChange={(value) => value && setStatus(value as QuoteStatus | "all")}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {quoteStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">No quotes found</p>
          <p className="text-sm text-muted-foreground">Try a different search or status filter.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Customer</TableHead>
                <TableHead>Scheme</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>
                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {quote.userName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{quote.userEmail}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {quoteSchemeLabels[quote.scheme]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{quote.reference}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(quote.createdAt)}
                  </TableCell>
                  <TableCell>
                    <QuoteStatusBadge status={quote.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
