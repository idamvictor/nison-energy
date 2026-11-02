import { CalendarCheck, Mail, Truck, Video } from "lucide-react";

import { COMPANY } from "@/lib/company";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

// Copy from the client's review doc ("What happens after you pay"), word for word.
const STEPS = [
  {
    icon: Mail,
    title: "Confirmation",
    body: "Your order confirmation arrives by email straight away.",
  },
  {
    icon: Video,
    title: "Virtual survey",
    body: "We’ll send you an online survey tool and ask for a few photos of your fuse board and parking area. Our team reviews them to confirm everything is ready for installation.",
    highlight: true,
  },
  {
    icon: Truck,
    title: "Delivery",
    body: "Your charger is dispatched by free tracked delivery and arrives in 1–3 days.",
  },
  {
    icon: CalendarCheck,
    title: "Installation day",
    body: "We’ll book your installation within two weeks of the survey. Our OZEV-approved engineer will fit and test the charger, set up the app, and show you how everything works.",
  },
];

/**
 * Checkout, above the pay button, for baskets with installation: what happens
 * next — chiefly that the virtual survey link arrives by email.
 */
export function AfterYouPay() {
  return (
    <section aria-labelledby="after-you-pay" className="rounded-[12px] bg-[#1a2a35] p-4 text-sm">
      <h2 id="after-you-pay" className="text-base font-medium text-white">
        What happens after you pay
      </h2>
      <ol className="mt-3 flex flex-col gap-2.5">
        {STEPS.map(({ icon: Icon, title, body, highlight }, index) => (
          <li
            key={title}
            className={cn(
              "flex items-start gap-3 rounded-[10px] p-2.5",
              highlight && "bg-white/[0.06] ring-1 ring-accent/60",
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full",
                highlight ? "bg-accent text-accent-foreground" : "bg-white/10 text-white",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </span>
            <p className="text-white/75">
              <span className="font-medium text-white">
                {index + 1}. {title}:
              </span>{" "}
              {body}
              {highlight && (
                <span className="ml-1.5 inline-flex items-center rounded-full bg-accent px-1.5 py-px align-middle text-[10px] font-semibold tracking-wide text-accent-foreground uppercase">
                  Link by email
                </span>
              )}
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-white/65">
        <em>Questions?</em>{" "}
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline underline-offset-2 hover:text-white/80"
        >
          Chat with us on WhatsApp
        </a>{" "}
        ·{" "}
        <a href={`mailto:${COMPANY.email}`} className="text-white underline underline-offset-2 hover:text-white/80">
          {COMPANY.email}
        </a>
      </p>
    </section>
  );
}
