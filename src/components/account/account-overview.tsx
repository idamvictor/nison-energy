"use client";

import Link from "next/link";
import { ArrowRight, Heart, Mail, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";
import { accountCustomer } from "@/lib/account-mock";
import { adminLeads } from "@/lib/admin-leads";

const tiles = [
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/enquiries", label: "My Enquiries", icon: Mail },
] as const;

export function AccountOverview() {
  const { items } = useWishlist();
  const enquiryCount = adminLeads.filter(
    (lead) => lead.email === accountCustomer.email
  ).length;

  const counts: Record<(typeof tiles)[number]["href"], string> = {
    "/account/profile": "Saved details",
    "/account/wishlist": `${items.length} saved`,
    "/account/enquiries": `${enquiryCount} submitted`,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Welcome back
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-foreground">
          {accountCustomer.firstName} {accountCustomer.lastName}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
