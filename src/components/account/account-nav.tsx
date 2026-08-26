"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Inbox, LayoutDashboard, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/inbox", label: "Inbox", icon: Inbox },
];

export function AccountNav() {
  const pathname = usePathname();
  const unreadCount = useNotifications((s) => s.items.filter((item) => !item.read).length);
  const isActive = (href: string) =>
    href === "/account" ? pathname === "/account" : pathname.startsWith(href);

  return (
    <Card size="sm" className="h-fit gap-0 py-2 lg:sticky lg:top-24">
      <CardContent className="flex flex-row gap-1 overflow-x-auto px-2 lg:flex-col lg:overflow-visible">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent text-foreground/70 hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="size-4" />
              {link.label}
              {link.href === "/account/inbox" && unreadCount > 0 && (
                <span className="ml-auto flex size-4.5 shrink-0 items-center justify-center rounded-full bg-accent text-[0.65rem] font-semibold text-accent-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
