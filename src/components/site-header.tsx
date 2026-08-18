"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/home-charging", label: "Home Charging" },
  { href: "/workplace-charging", label: "Workplace Charging" },
  { href: "#accessories", label: "EV Accessories" },
  { href: "#about", label: "About Us" },
  { href: "#grants", label: "OZEV Grants" },
];

export function SiteHeader() {
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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative py-1 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-linear-to-r from-primary to-accent transition-transform duration-200 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:03306330252"
            className="hidden items-center gap-2 rounded-full py-1.5 pr-3 pl-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground md:flex"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-primary">
              <Phone className="size-3.5" />
            </span>
            033 0633 0252
          </a>
          <Button
            className="hidden gap-1.5 bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 sm:inline-flex"
            size="lg"
          >
            Get a quote
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
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </Link>
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
