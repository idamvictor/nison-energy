"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
            className="hidden gap-1.5 bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 sm:inline-flex"
            size="lg"
            nativeButton={false}
            render={<Link href="/contact-us" />}
          >
            Contact Us
            <ArrowRight className="size-4" />
          </Button>

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
              <div className="mt-auto flex flex-col gap-2 p-4">
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  nativeButton={false}
                  render={<Link href="/contact-us" />}
                >
                  Contact Us
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
