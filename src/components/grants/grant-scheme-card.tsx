import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { GrantScheme } from "@/lib/grants";

export function GrantSchemeCard({
  scheme,
  icon: Icon,
}: {
  scheme: GrantScheme;
  icon: LucideIcon;
}) {
  return (
    <Link href={`/ozev-grants/${scheme.slug}`} className="group block h-full">
      <Card className="h-full gap-0 overflow-hidden py-0 ring-border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-primary/20">
        <div className="relative h-32 w-full bg-secondary">
          <Image
            src={scheme.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(0deg, color-mix(in oklch, black 75%, var(--primary) 25%) 0%, transparent 65%)",
              opacity: 0.75,
            }}
          />
          <span className="absolute bottom-3 left-4 flex size-10 items-center justify-center rounded-full bg-white text-primary shadow-sm ring-4 ring-white/60">
            <Icon className="size-5" />
          </span>
          {scheme.status === "closed" && (
            <Badge variant="destructive" className="absolute top-3 right-3">
              Closed
            </Badge>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col pt-5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {scheme.audience}
          </p>
          <h3 className="mt-1.5 font-heading text-base leading-snug font-semibold text-foreground">
            {scheme.title}
          </h3>

          <div className="mt-auto border-t border-border pt-3.5">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
              View eligibility
              <ArrowRight className="size-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
