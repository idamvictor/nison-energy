import { Clock, Mail, MapPin, Phone } from "lucide-react";

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
          href="mailto:info@ocunioenergy.com"
          className="flex items-center gap-3 transition-colors hover:text-primary"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
            <Mail className="size-4" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Email us</p>
            <p className="text-sm font-medium text-foreground">
              info@ocunioenergy.com
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

      <div className="flex items-start gap-3 rounded-2xl border border-border p-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <MapPin className="size-4" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">Our address</p>
          <p className="text-sm font-medium text-foreground">{ADDRESS}</p>
        </div>
      </div>
    </div>
  );
}
