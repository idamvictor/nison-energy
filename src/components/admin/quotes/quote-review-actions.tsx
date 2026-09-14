"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { reviewQuote } from "@/lib/quotes/actions";
import type { QuoteStatus } from "@/lib/quotes/types";

export function QuoteReviewActions({
  quoteId,
  status,
}: {
  quoteId: string;
  status: QuoteStatus;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status !== "Pending") {
    return (
      <p className="text-sm text-muted-foreground">
        This quote has already been reviewed.
      </p>
    );
  }

  function approve() {
    setError(null);
    startTransition(async () => {
      const result = await reviewQuote(quoteId, "approve");
      if (!result.ok) setError(result.error);
    });
  }

  function confirmReject() {
    setError(null);
    startTransition(async () => {
      const result = await reviewQuote(quoteId, "reject", reason);
      setRejectOpen(false);
      setReason("");
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      {error && <p className="text-destructive">{error}</p>}
      <Button
        type="button"
        disabled={pending}
        onClick={approve}
        className="justify-start"
      >
        <Check />
        {pending ? "Approving…" : "Approve"}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => {
          setReason("");
          setRejectOpen(true);
        }}
        className="justify-start text-destructive hover:bg-destructive/10"
      >
        <X />
        Reject…
      </Button>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this quote</DialogTitle>
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
    </div>
  );
}
