import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuoteStatusBadge } from "@/components/admin/quotes/quote-status-badge";
import { QuoteReviewActions } from "@/components/admin/quotes/quote-review-actions";
import { DeleteQuoteButton } from "@/components/admin/quotes/delete-quote-button";
import { getQuote } from "@/lib/quotes/queries";
import { quoteSchemeLabels } from "@/lib/quotes/types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function formatValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
      .join(", ");
  }
  return String(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const quote = await getQuote(id);
  return {
    title: quote ? `${quote.userName} — ${quoteSchemeLabels[quote.scheme]} | Admin` : "Quote | Admin",
  };
}

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();

  const inputEntries = Object.entries(quote.input).filter(
    ([, value]) => typeof value !== "object" || value == null,
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/quotes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to quotes
        </Link>
        <QuoteStatusBadge status={quote.status} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {quoteSchemeLabels[quote.scheme]}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Reference {quote.reference} · Submitted {formatDateTime(quote.createdAt)}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p className="flex items-center gap-2 text-foreground">
                <Mail className="size-4 text-muted-foreground" />
                {quote.userName} · {quote.userEmail}
              </p>
              {quote.status === "Rejected" && quote.rejectionReason && (
                <p className="mt-1 rounded-lg bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  Rejected: {quote.rejectionReason}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submitted details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {inputEntries.map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs font-medium text-muted-foreground">
                      {fieldLabel(key)}
                    </dt>
                    <dd className="mt-0.5 text-sm text-foreground">
                      {formatValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Document</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-start"
                nativeButton={false}
                render={
                  <a href={`/api/quotes/${quote.id}`} target="_blank" rel="noopener noreferrer" />
                }
              >
                <ExternalLink />
                Open document
              </Button>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Review</CardTitle>
            </CardHeader>
            <CardContent>
              <QuoteReviewActions quoteId={quote.id} status={quote.status} />
            </CardContent>
          </Card>

          <Card className="h-fit border-destructive/30">
            <CardHeader>
              <CardTitle>Danger zone</CardTitle>
            </CardHeader>
            <CardContent>
              <DeleteQuoteButton quoteId={quote.id} reference={quote.reference} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
