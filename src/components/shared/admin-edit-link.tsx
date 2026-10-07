"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * Small "Edit" link shown next to a product title, admin-only. Deliberately
 * a client component reading session via authClient.useSession() (same
 * pattern as site-header.tsx) rather than a server-side getCurrentUser()
 * check on the page itself — that would pull in headers() and force the
 * whole ISR'd product page into fully dynamic rendering on every request.
 */
export function AdminEditLink({ href }: { href: string }) {
  const { data: session } = authClient.useSession();
  // The server never has the session, so render nothing until hydrated —
  // otherwise a cached client session makes the first render differ (hydration error).
  const hydrated = useHydrated();
  if (!hydrated || session?.user.role !== "admin") return null;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary-ink"
    >
      <Pencil className="size-3.5" />
      Edit
    </Link>
  );
}
