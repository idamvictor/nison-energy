import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Small square partner marks for product cards. The wide "Works with…"
// banners on detail pages live in partner-badges.tsx.
const PARTNER_ICONS: Record<string, { src: string; alt: string; className?: string }> = {
  "OVO Energy": {
    src: "/api/media/uploads/a94609fd-1f6f-4f91-8e41-21328b6db61d.png",
    alt: "Works with OVO Energy",
    // The tilted tile reads smaller than Octopus's solid round mark; scale
    // (not size) so the row height — and the price row below — don't shift.
    className: "scale-125",
  },
  "Octopus Energy": {
    src: "/api/media/uploads/94b701b6-59cf-4039-9f07-9b99ae05acc1.png",
    alt: "Works with Octopus Energy",
  },
};

/**
 * A quiet line under a product card's name: the warranty on the left, energy
 * partner logos on the right. Renders nothing when there's neither.
 */
export function CardMeta({ warranty, tariffs }: { warranty?: string; tariffs?: string[] }) {
  const partners = (tariffs ?? []).filter((t) => PARTNER_ICONS[t]);
  if (!warranty && partners.length === 0) return null;

  return (
    <div className="flex min-h-5 items-center justify-between gap-3">
      {warranty ? (
        <span className="inline-flex h-5 items-center gap-1 rounded-full bg-accent-strong px-2 text-[11px] font-semibold text-accent-foreground">
          <ShieldCheck className="size-3 shrink-0" aria-hidden />
          {warranty} warranty
        </span>
      ) : (
        <span />
      )}
      {partners.length > 0 && (
        <span className="flex shrink-0 items-center gap-2">
          {partners.map((tariff) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={tariff}
              src={PARTNER_ICONS[tariff].src}
              alt={PARTNER_ICONS[tariff].alt}
              title={PARTNER_ICONS[tariff].alt}
              width={20}
              height={20}
              className={cn("size-5 rounded-md object-contain", PARTNER_ICONS[tariff].className)}
            />
          ))}
        </span>
      )}
    </div>
  );
}
