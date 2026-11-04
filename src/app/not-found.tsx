import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Home, MessageCircle } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/whatsapp";

// The site-wide 404: unknown URLs and any page that calls notFound() (e.g. a
// product that has been removed).
export const metadata: Metadata = {
  title: "Page not found | Ocunio Energy",
  robots: { index: false },
};

const popular = [
  { href: "/home-charging", label: "Residential Chargers" },
  { href: "/workplace-charging", label: "Commercial Chargers" },
  { href: "/accessories", label: "Accessories" },
  { href: "/cables", label: "Cables" },
  { href: "/solar-panels", label: "Solar Panels" },
  { href: "/ozev-grants", label: "OZEV Grants" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <TrustBar />
      <main className="flex flex-1 items-center bg-secondary/50">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <p
            aria-hidden
            className="bg-linear-to-r from-primary to-accent bg-clip-text font-heading text-[7rem] leading-none font-bold tracking-tight text-transparent sm:text-[10rem]"
          >
            404
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            Page not found
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            Sorry, we couldn&apos;t find the page you were looking for. It may have moved, or the link may be out of date.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="cta" className="gap-2" nativeButton={false} render={<Link href="/" />}>
              <Home className="size-4" />
              Back to home
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              nativeButton={false}
              render={<a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" />}
            >
              <MessageCircle className="size-4" />
              Chat with us on WhatsApp
            </Button>
          </div>

          <div className="mt-12 w-full border-t border-border pt-8">
            <p className="text-sm font-medium text-foreground">Or try one of these</p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2">
              {popular.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 rounded-full bg-background px-3.5 py-1.5 text-sm text-foreground/80 ring-1 ring-border transition-colors hover:text-foreground hover:ring-primary/40"
                  >
                    {link.label}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
