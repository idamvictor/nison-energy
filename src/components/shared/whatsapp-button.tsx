"use client";

import { usePathname } from "next/navigation";

import { WhatsAppIcon } from "@/components/shared/social-icons";
import { contextualMessage, whatsappUrl } from "@/lib/whatsapp";

// Pages where a floating chat bubble would get in the way.
const HIDDEN_PREFIXES = ["/admin", "/sign-in", "/forgot-password", "/reset-password"];

/**
 * Floating "chat with us" button — the site's only direct line to the team
 * (no phone number is shown anywhere). Opens WhatsApp with a message that
 * names the page the customer is on.
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      // Built at click time so the message names the current page (titles
      // change on client-side navigation after this renders).
      onClick={(e) => {
        e.currentTarget.href = whatsappUrl(contextualMessage(document.title));
      }}
      className="group fixed right-[max(1.25rem,env(safe-area-inset-right))] bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 flex items-center transition-[bottom] duration-300 focus-visible:outline-none [[data-compare-bar]_&]:bottom-[calc(var(--compare-bar-h,5rem)+0.75rem)]"
    >
      <span className="pointer-events-none mr-3 hidden translate-x-2 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium whitespace-nowrap text-background opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:block">
        Chat with us
      </span>
      <span className="relative flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-6px_rgba(37,211,102,0.65)] ring-4 ring-white transition-transform duration-200 group-hover:scale-105 group-focus-visible:ring-primary/60 group-active:scale-95">
        {/* One gentle pulse on load — noticeable, not nagging. */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-0 motion-safe:animate-[whatsapp-pulse_1.8s_ease-out_1.2s_2]"
        />
        <WhatsAppIcon className="relative size-7" />
      </span>
    </a>
  );
}
