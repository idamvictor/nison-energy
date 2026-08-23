"use client";

import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { accountCustomer } from "@/lib/account-mock";

function pageTitle(pathname: string): string {
  if (pathname === "/account") return "Overview";
  if (pathname.startsWith("/account/profile")) return "Profile";
  if (pathname.startsWith("/account/wishlist")) return "Wishlist";
  if (pathname.startsWith("/account/enquiries")) return "My Enquiries";
  return "My Account";
}

export function AccountTopbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/70">
      <div
        aria-hidden
        className="h-0.75 w-full bg-linear-to-r from-primary via-primary to-accent"
      />
      <div className="flex h-13 items-center justify-between gap-3 border-b border-border px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <h1 className="font-heading text-sm font-semibold text-foreground">
            {pageTitle(pathname)}
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Signed in as {accountCustomer.firstName} {accountCustomer.lastName}
        </p>
      </div>
    </header>
  );
}
