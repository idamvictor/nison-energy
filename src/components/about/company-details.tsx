import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MapEmbed, getMapsDirectionsUrl } from "@/components/shared/map-embed";

const details = [
  { label: "Legal name", value: "Nison Limited, trading as Nison Energy" },
  { label: "Registered in", value: "England and Wales, No. 16371062" },
  { label: "Registered address", value: "71–75 Shelton Street, Covent Garden, London, WC2H 9JQ" },
  { label: "VAT number", value: "495472057" },
  { label: "OZEV Installer No.", value: "13528" },
];

const ADDRESS = "71-75 Shelton Street, Covent Garden, London, WC2H 9JQ";

export function CompanyDetails() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-border lg:grid-cols-2">
          <div className="p-6 sm:p-8">
            <p className="font-heading text-sm font-semibold text-foreground">
              Company Details
            </p>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {details.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="mt-0.5 text-sm text-foreground">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <Button
              variant="outline"
              className="mt-6 gap-2 border-primary/25 text-primary hover:bg-primary/5"
              nativeButton={false}
              render={
                <a
                  href={getMapsDirectionsUrl(ADDRESS)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MapPin className="size-4" />
              View on Google Maps
            </Button>
          </div>

          <div className="relative min-h-64 w-full lg:min-h-full">
            <MapEmbed
              address={ADDRESS}
              title="Nison Energy registered office location"
              className="absolute inset-0 size-full grayscale-[0.3]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
