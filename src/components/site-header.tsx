"use client";

import Link from "next/link";
import { Menu, Phone, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "#chargers", label: "Home Charging" },
  { href: "#workplace", label: "Workplace Charging" },
  { href: "#accessories", label: "EV Accessories" },
  { href: "#about", label: "About Us" },
  { href: "#grants", label: "OZEV Grants" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-sm supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-5" strokeWidth={2.25} />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Nison Energy
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="tel:03306330252"
            className="hidden items-center gap-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground md:flex"
          >
            <Phone className="size-4" />
            033 0633 0252
          </a>
          <Button
            className="hidden bg-accent text-accent-foreground hover:bg-accent/90 sm:inline-flex"
            size="lg"
          >
            Get a quote
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
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 p-4">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Get a quote
                </Button>
                <a
                  href="tel:03306330252"
                  className="flex items-center justify-center gap-1.5 text-sm font-medium text-foreground/70"
                >
                  <Phone className="size-4" />
                  033 0633 0252
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
