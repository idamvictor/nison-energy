"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Heart,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  ShoppingCart,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { accountCustomer } from "@/lib/account-mock";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const accountLinks = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/enquiries", label: "My Enquiries", icon: Mail },
];

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/home-charging", label: "Residential Chargers" },
  { href: "/workplace-charging", label: "Commercial Chargers" },
  { href: "/accessories", label: "Accessories" },
  { href: "/about-us", label: "About Us" },
  { href: "#grants", label: "OZEV Grants" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href.startsWith("/") && (pathname === href || pathname.startsWith(`${href}/`));
  const cartCount = useCart((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const openCart = useCart((s) => s.openCart);
  const isSignedIn = useAuth((s) => s.isSignedIn);
  const signIn = useAuth((s) => s.signIn);
  const signOut = useAuth((s) => s.signOut);
  const initials = `${accountCustomer.firstName[0]}${accountCustomer.lastName[0]}`;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 shadow-sm backdrop-blur-sm supports-backdrop-filter:bg-background/70">
      <div
        aria-hidden
        className="h-0.75 w-full bg-linear-to-r from-primary via-primary to-accent"
      />
      <div className="mx-auto flex h-17 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
          <Image
            src="/logo.png"
            alt="Nison Energy"
            width={3264}
            height={1273}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative py-1 text-sm font-medium transition-colors hover:text-foreground",
                  active ? "text-foreground" : "text-foreground/70"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute inset-x-0 -bottom-0.5 h-0.5 origin-left rounded-full bg-linear-to-r from-primary to-accent transition-transform duration-200 ease-out group-hover:scale-x-100",
                    active ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="relative"
            aria-label="Open cart"
            onClick={openCart}
          >
            <ShoppingCart className="size-4.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-4.5 items-center justify-center rounded-full bg-accent text-[0.65rem] font-semibold text-accent-foreground">
                {cartCount}
              </span>
            )}
          </Button>

          {isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="secondary"
                    size="icon"
                    className="hidden rounded-full bg-primary text-primary-foreground hover:bg-primary/90 sm:inline-flex"
                    aria-label="My account"
                  />
                }
              >
                <span className="text-xs font-semibold">{initials}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    Signed in as {accountCustomer.firstName} {accountCustomer.lastName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {accountLinks.map((link) => (
                    <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
                      <link.icon />
                      {link.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={signOut}>
                    <LogOut />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              className="hidden gap-1.5 bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 sm:inline-flex"
              size="lg"
              nativeButton={false}
              render={<Link href="/account" />}
              onClick={signIn}
            >
              Get Started
              <ArrowRight className="size-4" />
            </Button>
          )}

          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="lg:hidden" />
              }
            >
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Nison Energy</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-md px-2 py-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                        active
                          ? "bg-secondary text-foreground"
                          : "text-foreground/80"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-auto flex flex-col gap-1 border-t border-border p-4">
                {isSignedIn ? (
                  <>
                    <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
                      Signed in as {accountCustomer.firstName}{" "}
                      {accountCustomer.lastName}
                    </p>
                    {accountLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-2.5 rounded-md px-2 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <link.icon className="size-4" />
                        {link.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex items-center gap-2.5 rounded-md px-2 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <Button
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    nativeButton={false}
                    render={<Link href="/account" />}
                    onClick={signIn}
                  >
                    Get Started
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
