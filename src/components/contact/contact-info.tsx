import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MapEmbed, getMapsDirectionsUrl } from "@/components/shared/map-embed";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/shared/social-icons";

const ADDRESS = "71-75 Shelton Street, Covent Garden, London, WC2H 9JQ";

const hours = [
  { day: "Monday – Friday", time: "09:00 – 18:00" },
  { day: "Saturday", time: "10:00 – 16:00" },
  { day: "Sunday & Bank Holidays", time: "Closed" },
];

export function ContactInfo() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/get-a-quote"
        className="group flex items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4 transition-colors hover:bg-primary/10"
      >
        <div>
          <p className="text-sm font-medium text-foreground">
            Already know which charger you want?
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Get a priced quote in a couple of minutes instead.
          </p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
      </Link>

      <div className="flex flex-col gap-4 rounded-2xl border border-border p-6">
        <a
          href="tel:03306330252"
          className="flex items-center gap-3 transition-colors hover:text-primary"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
            <Phone className="size-4" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Call us</p>
            <p className="text-sm font-medium text-foreground">
              033 0633 0252
            </p>
          </div>
        </a>

        <a
          href="mailto:info@nisonenergy.com"
          className="flex items-center gap-3 transition-colors hover:text-primary"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
            <Mail className="size-4" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Email us</p>
            <p className="text-sm font-medium text-foreground">
              info@nisonenergy.com
            </p>
          </div>
        </a>

        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
            <Clock className="size-4" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Opening hours</p>
            <dl className="mt-1 flex flex-col gap-0.5">
              {hours.map((h) => (
                <div key={h.day} className="flex justify-between gap-4 text-sm">
                  <dt className="text-foreground/70">{h.day}</dt>
                  <dd className="font-medium text-foreground">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          {[FacebookIcon, InstagramIcon, LinkedinIcon].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="relative h-56 w-full">
          <MapEmbed
            address={ADDRESS}
            title="Nison Energy office location"
            className="absolute inset-0 size-full grayscale-[0.3]"
          />
        </div>
        <div className="p-4">
          <p className="text-sm text-foreground">
            71–75 Shelton Street, Covent Garden, London, WC2H 9JQ
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-1.5 border-primary/25 text-primary hover:bg-primary/5"
            nativeButton={false}
            render={
              <a
                href={getMapsDirectionsUrl(ADDRESS)}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <MapPin className="size-3.5" />
            View on Google Maps
          </Button>
        </div>
      </div>
    </div>
  );
}
