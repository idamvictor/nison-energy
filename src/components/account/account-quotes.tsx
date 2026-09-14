import Link from "next/link";
import { FileText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import {
  quoteSchemeLabels,
  type QuoteDocumentView,
  type QuoteStatus,
} from "@/lib/quotes/types";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const statusVariant: Record<QuoteStatus, BadgeVariant> = {
  Pending: "secondary",
  Approved: "success",
  Rejected: "destructive",
};

const statusHint: Record<QuoteStatus, string> = {
  Pending: "Submitted — our team is reviewing it.",
  Approved: "Approved and ready to download.",
  Rejected: "Needs changes before it can be approved.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AccountQuotes({ quotes }: { quotes: QuoteDocumentView[] }) {
  if (quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileText className="size-5" />
        </span>
        <p className="font-heading text-lg font-semibold text-foreground">
          No quotes yet
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Generate a quote from one of our OZEV guides and it&apos;ll show up
          here.
        </p>
        <Button nativeButton={false} render={<Link href="/ozev-grant-guide" />}>
          Browse the OZEV guides
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
          Quotes
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Quotes generated from the OZEV guides — download once approved.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {quotes.map((quote) => (
          <Card key={quote.id}>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-heading font-semibold text-foreground">
                    {quoteSchemeLabels[quote.scheme]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reference {quote.reference} · Generated{" "}
                    {formatDate(quote.createdAt)}
                  </p>
                </div>
                <Badge variant={statusVariant[quote.status]}>{quote.status}</Badge>
              </div>

              {quote.status === "Rejected" && quote.rejectionReason && (
                <p className="rounded-lg bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {quote.rejectionReason}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                <p className="text-muted-foreground">{statusHint[quote.status]}</p>
                {quote.status === "Approved" && (
                  <Button
                    size="sm"
                    nativeButton={false}
                    render={
                      <a href={`/api/quotes/${quote.id}`} target="_blank" rel="noopener noreferrer" />
                    }
                  >
                    Download
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
