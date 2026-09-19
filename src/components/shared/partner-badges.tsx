const logos: Record<string, { src: string; alt: string; width: number }> = {
  "Octopus Energy": {
    src: "/api/media/uploads/d94d9db1-309b-4dfa-99fe-2b4cfa6b4b6d.png",
    alt: "Works with Octopus Energy",
    width: 140,
  },
  "OVO Energy": {
    src: "/api/media/uploads/13ddaf23-7723-496f-b95a-be8e92f2481d.png",
    alt: "Works with OVO Energy",
    width: 140,
  },
};

export function PartnerBadges({ tariffs }: { tariffs?: string[] }) {
  if (!tariffs || tariffs.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {tariffs.map((tariff) => {
        const logo = logos[tariff];
        if (!logo) return null;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={tariff}
            src={logo.src}
            alt={logo.alt}
            style={{ width: logo.width }}
            className="h-auto w-auto object-contain"
          />
        );
      })}
    </div>
  );
}
