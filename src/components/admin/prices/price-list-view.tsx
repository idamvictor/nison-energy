"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Download, ExternalLink, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { setPriceReviewOpen } from "@/lib/pricing-review/actions";
import {
  categoryLabels,
  exVatOf,
  type PriceRow,
  type ReviewWindow,
  type SubmissionSummary,
} from "@/lib/pricing-review/types";
import type { ProductCategory } from "@/lib/catalog/types";

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

function downloadCsv(rows: PriceRow[]) {
  const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    ["Category", "Product", "SKU", "Price ex VAT", "Price inc VAT", "Status"].map(cell).join(","),
    ...rows.map((r) =>
      [
        categoryLabels[r.category],
        r.name,
        r.sku ?? "",
        r.price == null ? "Price on request" : exVatOf(r.price).toFixed(2),
        r.price == null ? "Price on request" : r.price.toFixed(2),
        r.active ? "Active" : "Inactive",
      ]
        .map((v) => cell(String(v)))
        .join(","),
    ),
  ];
  const url = URL.createObjectURL(new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `ocunio-price-list-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ReviewPageCard({ reviewWindow, reviewUrl }: { reviewWindow: ReviewWindow; reviewUrl: string }) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = () =>
    startTransition(async () => {
      setError(null);
      const res = await setPriceReviewOpen(!reviewWindow.open);
      if (!res.ok) setError(res.error);
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client price review page</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <p className="text-muted-foreground">
          Send the client this page to check prices and suggest new ex VAT prices. Their changes come back here for
          you to approve — nothing changes on the website until you do. While it&apos;s closed, the page redirects
          to the homepage.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={reviewWindow.open}
            disabled={pending}
            onClick={toggle}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60",
              reviewWindow.open ? "bg-success" : "bg-foreground/20",
            )}
          >
            <span className="sr-only">Price review page open</span>
            <span
              className={cn(
                "inline-block size-5 rounded-full bg-white shadow transition-transform",
                reviewWindow.open ? "translate-x-5.5" : "translate-x-0.5",
              )}
            />
          </button>
          <span className={cn("font-semibold", reviewWindow.open ? "text-success" : "text-muted-foreground")}>
            {reviewWindow.open ? "Open" : "Closed"}
          </span>
          <span className="text-muted-foreground">
            {reviewWindow.open
              ? `since ${formatDate(reviewWindow.openedAt)}`
              : reviewWindow.closedAt
                ? `since ${formatDate(reviewWindow.closedAt)}`
                : ""}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded-md bg-muted px-2.5 py-1.5 text-xs break-all">{reviewUrl}</code>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={async () => {
              await navigator.clipboard.writeText(reviewUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy link"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            nativeButton={false}
            render={<a href="/price-review" target="_blank" rel="noopener noreferrer" />}
          >
            <ExternalLink />
            View page
          </Button>
        </div>
        {error && <p className="text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}

export function PriceListView({
  rows,
  reviewWindow,
  submissions,
  reviewUrl,
}: {
  rows: PriceRow[];
  reviewWindow: ReviewWindow;
  submissions: SubmissionSummary[];
  reviewUrl: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (category === "all" || r.category === category) &&
        (!q || `${r.name} ${r.sku ?? ""}`.toLowerCase().includes(q)),
    );
  }, [rows, query, category]);

  const categories = Object.keys(categoryLabels) as ProductCategory[];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Price list</h1>
        <p className="text-sm text-muted-foreground">
          Every product with its price ex VAT and inc VAT. Prices are stored inc VAT; ex VAT is calculated at 20%.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ReviewPageCard reviewWindow={reviewWindow} reviewUrl={reviewUrl} />
        <Card>
          <CardHeader>
            <CardTitle>Waiting for approval</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {submissions.length === 0 ? (
              <p className="text-muted-foreground">No price changes are waiting for approval.</p>
            ) : (
              submissions.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/prices/submissions/${s.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted"
                >
                  <span>
                    <span className="font-medium">Submitted by {s.reviewerName}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatDate(s.submittedAt)} · {s.changes} {s.changes === 1 ? "change" : "changes"}
                    </span>
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-56 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search product or SKU"
                className="pl-8"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory | "all")}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
              aria-label="Category"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => downloadCsv(filtered)}>
              <Download />
              Export CSV
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {rows.length} products
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Price ex VAT</TableHead>
                  <TableHead className="text-right">Price inc VAT</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className={cn(!r.active && "text-muted-foreground")}>
                    <TableCell className="whitespace-nowrap">{categoryLabels[r.category]}</TableCell>
                    <TableCell className="max-w-md whitespace-normal">{r.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.sku ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.price == null ? "Price on request" : formatCurrency(exVatOf(r.price))}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {r.price == null ? "—" : formatCurrency(r.price)}
                    </TableCell>
                    <TableCell>{r.active ? "Active" : "Inactive"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
