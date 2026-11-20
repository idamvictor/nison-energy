"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { GA_ID } from "@/lib/analytics";

/**
 * The Google tags themselves are server-rendered in the root layout's <head>.
 * This keeps Google's official opt-out flag in step on client-side navigation,
 * so the team's own /admin visits don't mix into the customer numbers.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = pathname.startsWith("/admin");
  }, [pathname]);

  return null;
}
