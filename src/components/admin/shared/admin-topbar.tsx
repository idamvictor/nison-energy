"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

function pageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/residential")) return "Residential Chargers";
  if (pathname.startsWith("/admin/commercial")) return "Commercial Chargers";
  if (pathname.startsWith("/admin/accessories")) return "Accessories";
  if (pathname.startsWith("/admin/blog")) return "Blog";
  if (pathname.startsWith("/admin/leads")) return "Leads";
  if (pathname.startsWith("/admin/orders")) return "Orders";
  if (pathname.startsWith("/admin/users")) return "Users";
  return "Admin";
}

export function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

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
        <div className="ml-auto flex items-center gap-3">
          {session?.user.email && (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {session.user.email}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
