"use client";

import Link from "next/link";
import Image from "next/image";
import { CreditCard, Mail, Phone } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/shared/social-icons";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "OZEV Grant Eligibility", href: "/ozev-grant-guide" },
  { label: "Independent Subcontractor", href: "/independent-subcontractor" },
];

const productLinks = [
  { label: "Residential Chargers", href: "/home-charging" },
  { label: "Commercial Chargers", href: "/workplace-charging" },
  { label: "Accessories", href: "/accessories" },
  { label: "OZEV Grants", href: "/ozev-grants" },
  { label: "Delivery Information", href: "/delivery-information" },
];

const legalLinks = [
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const paymentMethods = ["Visa", "Mastercard", "PayPal", "Stripe", "Apple Pay"];

export function SiteFooter() {
  return (
    <footer
      className="text-white"
      style={{
        backgroundColor: "color-mix(in oklch, var(--primary), black 55%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" className="flex items-center">
              <Image
                src="/ocunio-energy-logo.png"
                alt="Ocunio Energy"
                width={676}
                height={369}
                className="h-11 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/60">
              Buy. Install. Claim Your Grant. All in One Place, from Ocunio
              Energy.
            </p>
            <a
              href="tel:07525567054"
              className="mt-4 flex w-fit items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-white/10">
                <Phone className="size-3.5" />
              </span>
              07525 567054
            </a>
            <div className="mt-5 flex items-center gap-3">
              {[FacebookIcon, InstagramIcon, LinkedinIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Quick links" items={quickLinks} />
          <FooterColumn title="Products" items={productLinks} />
          <FooterColumn title="Legal" items={legalLinks} />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center rounded-xl border border-white/15 bg-white p-3">
              <Image
                src="https://res.cloudinary.com/dyp8gtllq/image/upload/v1788398074/Picture4_e1xgc8.webp"
                alt="Office for Zero Emission Vehicles approved installer"
                width={357}
                height={154}
                className="h-14 w-auto object-contain"
              />
            </div>

            <div>
              <p className="font-heading text-sm font-semibold">
                Stay in the Loop
              </p>
              <p className="mt-1 text-xs text-white/60">
                Subscribe for the latest news, updates and exclusive offers,
                delivered straight to your inbox.
              </p>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="relative flex-1">
                  <Mail className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    className="border-white/15 bg-white/10 pl-8 text-white placeholder:text-white/50"
                    required
                  />
                </div>
                <Button className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-white/10" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-2xl text-xs leading-relaxed text-white/50">
            Nison Limited, trading as Ocunio Energy. Registered in England
            and Wales No.16371062. Registered office 71-75 Shelton Street
            Covent Garden London United Kingdom WC2 9JQ. VAT Number:
            495472057.
            <br />
            Copyright © {new Date().getFullYear()}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="flex items-center gap-1.5 rounded-md border border-white/15 px-2.5 py-1 text-xs text-white/70"
              >
                <CreditCard className="size-3.5" />
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="font-heading text-sm font-semibold text-white">
        {title}
      </p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
