"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/account", label: "Overview" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/enquiries", label: "My Enquiries" },
];

export function AccountNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/account" ? pathname === "/account" : pathname.startsWith(href);

  return (
    <nav className="flex items-center gap-6 overflow-x-auto border-b border-border">
      {navLinks.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative shrink-0 py-3 text-sm font-medium transition-colors hover:text-foreground",
              active ? "text-foreground" : "text-foreground/60"
            )}
          >
            {link.label}
            <span
              className={cn(
                "absolute inset-x-0 -bottom-px h-0.5 origin-left rounded-full bg-linear-to-r from-primary to-accent transition-transform duration-200 ease-out group-hover:scale-x-100",
                active ? "scale-x-100" : "scale-x-0"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
