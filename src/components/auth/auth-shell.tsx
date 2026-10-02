import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, PoundSterling, Truck } from "lucide-react";

const PANEL_IMAGE =
  "/media/wp/2025/05/side-view-man-charging-his-car-min-scaled.webp";

const facts = [
  { icon: PoundSterling, label: "OZEV grant support" },
  { icon: BadgeCheck, label: "Certified installers" },
  { icon: Truck, label: "Free delivery" },
];

const SEGMENTS = 8;
const LIT = 6;

// Signature element: a slim battery-style meter that charges up once on load.
function ChargeMeter() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5" aria-hidden>
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const lit = i < LIT;
          const tip = i === LIT - 1;
          return (
            <span
              key={i}
              className={
                tip
                  ? "h-2 flex-1 origin-left rounded-full bg-primary shadow-[0_0_14px_2px] shadow-primary/60 motion-safe:animate-[charge-fill_500ms_ease-out_both]"
                  : lit
                    ? "h-2 flex-1 origin-left rounded-full bg-white motion-safe:animate-[charge-fill_500ms_ease-out_both]"
                    : "h-2 flex-1 rounded-full bg-white/20"
              }
              style={lit ? { animationDelay: `${300 + i * 110}ms` } : undefined}
            />
          );
        })}
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/60">
        Charging your account
      </p>
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex min-h-svh flex-col px-4 py-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Image
              src="/ocunio-energy-logo.png"
              alt="Ocunio Energy"
              width={676}
              height={369}
              priority
              className="h-10 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Ocunio Energy</p>
          <nav className="flex gap-4">
            <Link href="/terms-and-conditions" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy
            </Link>
          </nav>
        </footer>
      </div>

      <div className="hidden p-3 lg:block">
        <div className="relative h-full overflow-hidden rounded-3xl bg-neutral-900">
          <Image
            src={PANEL_IMAGE}
            alt=""
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/10" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-8 p-10 xl:p-12">
            <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-[-0.02em] text-white xl:text-4xl">
              One account for your charger, installation and grant.
            </h2>

            <ChargeMeter />

            <ul className="flex flex-wrap gap-x-6 gap-y-3 border-t border-white/15 pt-6">
              {facts.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-white/80">
                  <Icon className="size-4 text-white/60" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
