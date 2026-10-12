"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { decidePriceSubmission } from "@/lib/pricing-review/actions";
import { categoryLabels, exVatOf, type SubmissionDetail } from "@/lib/pricing-review/types";

const money = (n: number | null) => (n == null ? "—" : formatCurrency(n));

function Diff({ from, to }: { from: number | null; to: number }) {
  if (from == null || from === 0) return <span className="text-muted-foreground">new price</span>;
  const diff = Math.round((to - from) * 100) / 100;
  const pct = (diff / from) * 100;
  const up = diff > 0;
  return (
    <span className={cn("font-medium tabular-nums", up ? "text-destructive" : "text-success")}>
      {up ? "+" : "−"}
      {formatCurrency(Math.abs(diff))} ({up ? "+" : "−"}
      {Math.abs(pct).toFixed(1)}%)
    </span>
  );
}

export function SubmissionReview({ submission }: { submission: SubmissionDetail }) {
  const router = useRouter();
  const pendingRows = submission.proposals.filter((p) => p.status === "Pending");
  const [selected, setSelected] = useState<Set<string>>(() => new Set(pendingRows.map((p) => p.id)));
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const done = submission.status === "Done";

  const decide = (ids: string[]) =>
    startTransition(async () => {
      setError(null);
      const res = await decidePriceSubmission(submission.id, ids);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <Link href="/admin/prices" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to price list
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Price review from {submission.reviewerName}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Submitted {new Date(submission.submittedAt).toLocaleString("en-GB")} · {submission.changes}{" "}
            {submission.changes === 1 ? "change" : "changes"}
            {done && " · reviewed"}
          </p>
        </CardHeader>
        {submission.note && (
          <CardContent>
            <p className="rounded-lg bg-muted px-3 py-2 text-sm whitespace-pre-line">{submission.note}</p>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          {!done && (
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" disabled={busy || selected.size === 0} onClick={() => decide([...selected])} className="gap-1.5">
                <Check />
                Approve selected ({selected.size})
              </Button>
              <Button type="button" variant="outline" disabled={busy} onClick={() => decide(pendingRows.map((p) => p.id))}>
                Approve all
              </Button>
              <Button type="button" variant="outline" disabled={busy} onClick={() => decide([])} className="gap-1.5 text-destructive">
                <X />
                Reject all
              </Button>
              <span className="text-xs text-muted-foreground">Unticked changes are rejected. Approved prices go live straight away.</span>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  {!done && <TableHead className="w-10" />}
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Current ex VAT</TableHead>
                  <TableHead className="text-right">Current inc VAT</TableHead>
                  <TableHead className="text-right">New ex VAT</TableHead>
                  <TableHead className="text-right">New inc VAT</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                  {done && <TableHead>Decision</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {submission.proposals.map((p) => {
                  const changedSince =
                    p.status === "Pending" && (p.livePrice ?? null) !== (p.currentPrice ?? null);
                  return (
                    <TableRow key={p.id}>
                      {!done && (
                        <TableCell>
                          <input
                            type="checkbox"
                            className="size-4 accent-primary"
                            checked={selected.has(p.id)}
                            onChange={() => toggle(p.id)}
                            aria-label={`Approve ${p.name}`}
                          />
                        </TableCell>
                      )}
                      <TableCell className="max-w-sm whitespace-normal">
                        <span className="font-medium">{p.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {categoryLabels[p.category]}
                          {p.sku ? ` · ${p.sku}` : ""}
                        </span>
                        {changedSince && (
                          <span className="mt-1 flex items-center gap-1 text-xs font-medium text-accent-strong">
                            <AlertTriangle className="size-3.5" />
                            Price changed since submission: now {money(p.livePrice)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {p.currentPrice == null ? "—" : formatCurrency(exVatOf(p.currentPrice))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{money(p.currentPrice)}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{formatCurrency(p.proposedExVat)}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{formatCurrency(p.proposedPrice)}</TableCell>
                      <TableCell className="text-right">
                        <Diff from={p.currentPrice} to={p.proposedPrice} />
                      </TableCell>
                      {done && (
                        <TableCell className={p.status === "Approved" ? "text-success" : "text-muted-foreground"}>
                          {p.status}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
