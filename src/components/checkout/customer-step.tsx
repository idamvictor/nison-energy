"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { withRedirect } from "@/lib/auth/redirect";

/**
 * Who's checking out. Guests can pay straight away (no account needed);
 * signing in fills the form from the account and links the order to it.
 */
export function CustomerStep({ signedInEmail }: { signedInEmail: string | null }) {
  const router = useRouter();
  const [signingOut, startSignOut] = useTransition();

  if (signedInEmail) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary px-4 py-3 ring-1 ring-foreground/10">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <UserRound className="size-4 text-primary-ink" />
          Signed in as <span className="font-medium">{signedInEmail}</span>
        </p>
        <button
          type="button"
          disabled={signingOut}
          onClick={() =>
            startSignOut(async () => {
              await authClient.signOut();
              router.refresh();
            })
          }
          className="text-sm font-medium text-primary-ink underline underline-offset-2 hover:text-foreground disabled:opacity-50"
        >
          {signingOut ? "Signing out…" : "Not you? Sign out"}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-lg border-2 border-primary bg-primary/5 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex size-4 items-center justify-center rounded-full border-2 border-primary-ink">
            <span className="size-1.5 rounded-full bg-primary-ink" />
          </span>
          Checkout as guest
        </p>
        <p className="mt-0.5 pl-6 text-xs text-muted-foreground">Quick and easy — no account needed.</p>
      </div>
      <Link
        href={withRedirect("/sign-in", "/checkout")}
        className="rounded-lg border border-foreground/15 px-4 py-3 transition-colors hover:border-primary/50 hover:bg-secondary"
      >
        <p className="text-sm font-semibold text-foreground">Sign in</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Have an account? Your details fill in automatically.
        </p>
      </Link>
    </div>
  );
}
