const logos: Record<string, { src: string; alt: string; width: number }> = {
  "Octopus Energy": {
    src: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Octopus_Energy_logo_%282019%29.svg",
    alt: "Octopus Energy",
    width: 120,
  },
  "OVO Energy": {
    src: "https://upload.wikimedia.org/wikipedia/commons/1/15/Ovo_Energy_logo.svg",
    alt: "OVO Energy",
    width: 80,
  },
};

export function TariffBadges({ tariffs }: { tariffs?: string[] }) {
  if (!tariffs || tariffs.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">
        Compatible with smart energy tariffs
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {tariffs.map((tariff) => {
          const logo = logos[tariff];
          if (!logo) return null;
          return (
            <span
              key={tariff}
              className="flex h-9 items-center rounded-lg border border-border bg-white px-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo.src}
                alt={logo.alt}
                style={{ width: logo.width }}
                className="h-5 w-auto object-contain"
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}
