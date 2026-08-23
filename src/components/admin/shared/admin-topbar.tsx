"use client";

import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";

function pageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/residential")) return "Residential Chargers";
  if (pathname.startsWith("/admin/commercial")) return "Commercial Chargers";
  if (pathname.startsWith("/admin/accessories")) return "Accessories";
  if (pathname.startsWith("/admin/leads")) return "Leads";
  return "Admin";
}

export function AdminTopbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/70">
      <div
        aria-hidden
        className="h-0.75 w-full bg-linear-to-r from-primary via-primary to-accent"
      />
      <div className="flex h-13 items-center gap-3 border-b border-border px-4 sm:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="font-heading text-sm font-semibold text-foreground">
          {pageTitle(pathname)}
        </h1>
      </div>
    </header>
  );
}
