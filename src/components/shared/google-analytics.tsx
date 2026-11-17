"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

import { GA_ID, GA_INIT_SCRIPT, GA_SRC } from "@/lib/analytics";

/**
 * The Google tag on every page (mounted once in the root layout). Admin pages
 * are switched off with Google's official opt-out flag, so the team's own
 * visits don't mix into the customer numbers.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = pathname.startsWith("/admin");
  }, [pathname]);

  return (
    <>
      <Script id="google-tag-init" strategy="afterInteractive">
        {GA_INIT_SCRIPT}
      </Script>
      <Script id="google-tag" src={GA_SRC} strategy="afterInteractive" />
    </>
  );
}
