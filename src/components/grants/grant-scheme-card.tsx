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
        <div className="relative aspect-video w-full bg-secondary">
          <Image
            src={scheme.image}
            alt={scheme.audience}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {scheme.status === "closed" && (
            <Badge variant="destructive" className="absolute top-3 left-3">
              Closed to new applications
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col gap-2 pt-5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4.5" />
          </span>
          <h3 className="font-heading text-lg font-semibold text-foreground">
            {scheme.audience}
          </h3>
          <p className="text-sm text-muted-foreground">{scheme.tagline}</p>
          <p className="mt-1 text-sm font-semibold text-primary">
            {scheme.grantAmount}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
            Learn more
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
