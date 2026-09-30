"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { signInHref } from "@/lib/auth/redirect";

/** Gate in front of quote generation on the OZEV guide pages. */
export function SignInRequiredDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  // Content only renders while open (client-side), so reading the query here is safe.
  const returnTo = typeof window === "undefined" ? pathname : pathname + window.location.search;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in to generate your quote</DialogTitle>
          <DialogDescription>
            Your quote is saved to your account so you can find it again any
            time — sign in (or create an account) to continue. Your answers
            and details are kept, so you&apos;ll pick up right where you left off.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            nativeButton={false}
            render={
              <Link href={signInHref(returnTo)} />
            }
          >
            Sign in to continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Shown above the quote form when a guide was restored after signing in. */
export function DraftRestoredNotice() {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/5 px-3.5 py-3 text-sm text-foreground/80">
      <Check className="mt-0.5 size-4 shrink-0 text-success" />
      <p>
        <strong className="text-foreground">Welcome back — your details are still here.</strong>{" "}
        Check them over, then choose &quot;Generate My Quote&quot; again.
      </p>
    </div>
  );
}
