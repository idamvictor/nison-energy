"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check, MoreHorizontal, Search, Trash2, X } from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuoteStatusBadge } from "@/components/admin/quotes/quote-status-badge";
import { deleteQuote, reviewQuote } from "@/lib/quotes/actions";
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
  const [rejectTarget, setRejectTarget] = useState<AdminQuoteRow | null>(null);
  const [reason, setReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminQuoteRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quotes.filter((quote) => {
      const matchesStatus = status === "all" || quote.status === status;
      const haystack = `${quote.userName} ${quote.userEmail} ${quote.reference}`.toLowerCase();
      return matchesStatus && (q === "" || haystack.includes(q));
    });
  }, [quotes, query, status]);

  function approve(quote: AdminQuoteRow) {
    setError(null);
    startTransition(async () => {
      const result = await reviewQuote(quote.id, "approve");
      if (!result.ok) setError(result.error);
    });
  }

  function confirmReject() {
    if (!rejectTarget) return;
    setError(null);
    const target = rejectTarget;
    const reasonText = reason;
    startTransition(async () => {
      const result = await reviewQuote(target.id, "reject", reasonText);
      setRejectTarget(null);
      setReason("");
      if (!result.ok) setError(result.error);
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setError(null);
    const target = deleteTarget;
    startTransition(async () => {
      const result = await deleteQuote(target.id);
      setDeleteTarget(null);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">Quotes</h2>
        <p className="text-sm text-muted-foreground">
          {quotes.length} {quotes.length === 1 ? "quote" : "quotes"} generated from the OZEV guides.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

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
                <TableHead className="w-10" />
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" />}
                      >
                        <MoreHorizontal />
                        <span className="sr-only">Quote actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {quote.status === "Pending" && (
                          <>
                            <DropdownMenuItem
                              disabled={pending}
                              onClick={() => approve(quote)}
                            >
                              <Check />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={pending}
                              onClick={() => {
                                setReason("");
                                setRejectTarget(quote);
                              }}
                            >
                              <X />
                              Reject…
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={pending}
                          onClick={() => setDeleteTarget(quote)}
                        >
                          <Trash2 />
                          Delete…
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectTarget?.userName}&rsquo;s quote</DialogTitle>
            <DialogDescription>
              The customer will be notified, with this reason if you add one.
            </DialogDescription>
          </DialogHeader>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Reason (optional)
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. figures don't match the site survey"
            />
          </label>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" disabled={pending} onClick={confirmReject}>
              {pending ? "Rejecting…" : "Reject quote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.userName}&rsquo;s quote?</DialogTitle>
            <DialogDescription>
              This permanently removes the document from their account and deletes the
              underlying file. This can&rsquo;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" disabled={pending} onClick={confirmDelete}>
              {pending ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
