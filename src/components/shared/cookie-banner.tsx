"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OPEN_EVENT, readCookieChoice, saveCookieChoice, subscribeCookieChoice } from "@/lib/analytics";

/**
 * Asks for consent to analytics cookies (Google Analytics) until the visitor
 * chooses. Their choice is remembered on this device; "Cookie settings" in
 * the footer reopens it. Not shown in the admin.
 */
export function CookieBanner() {
  const pathname = usePathname();
  // undefined on the server / first render, so the HTML matches; then the stored choice.
  const choice = useSyncExternalStore(subscribeCookieChoice, readCookieChoice, () => undefined);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  if (choice === undefined || pathname.startsWith("/admin")) return null;
  if (choice !== null && !reopened) return null;

  const decide = (value: "granted" | "denied") => {
    saveCookieChoice(value);
    setReopened(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-60 sm:right-auto sm:max-w-md"
    >
      <div className="rounded-2xl border border-border bg-background p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-ink">
            <Cookie className="size-4.5" />
          </span>
          <div>
            <p className="font-heading text-sm font-semibold text-foreground">We use cookies</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;d like to use analytics cookies (Google Analytics) to understand how the site is used and
              improve it. Essential cookies for your basket and account are always on.{" "}
              <Link href="/privacy-policy" className="font-medium text-primary-ink underline-offset-2 hover:underline">
                Privacy policy
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="flex-1" onClick={() => decide("granted")}>
            Accept
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => decide("denied")}>
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
