"use client";

import Link from "next/link";
import { ArrowRight, Heart, Inbox, ShoppingBag, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/lib/wishlist/store";
import type { SessionUser } from "@/lib/auth/session";

const tiles = [
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: ShoppingBag },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/inbox", label: "Inbox", icon: Inbox },
] as const;

export function AccountOverview({
  user,
  orderCount,
  enquiryCount,
  unreadCount,
}: {
  user: SessionUser;
  orderCount: number;
  enquiryCount: number;
  unreadCount: number;
}) {
  const { items } = useWishlist();

  const counts: Record<(typeof tiles)[number]["href"], string> = {
    "/account/profile": "Saved details",
    "/account/orders":
      orderCount > 0
        ? `${orderCount} ${orderCount === 1 ? "order" : "orders"}`
        : "No orders yet",
    "/account/wishlist": `${items.length} saved`,
    "/account/inbox":
      unreadCount > 0
        ? `${unreadCount} new`
        : enquiryCount > 0
          ? `${enquiryCount} ${enquiryCount === 1 ? "enquiry" : "enquiries"}`
          : "All caught up",
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Welcome back
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-foreground">
          {user.name || user.email}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href} className="block">
            <Card className="gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/20">
              <CardContent className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">
                    {tile.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {counts[tile.href]}
                  </p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <tile.icon className="size-4.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-fit"
        nativeButton={false}
        render={<Link href="/home-charging" />}
      >
        Browse residential chargers
        <ArrowRight />
      </Button>
    </div>
  );
}
