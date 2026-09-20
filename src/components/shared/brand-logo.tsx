import { brandLogos } from "@/lib/content/brand-logos";

export function BrandLogo({
  brand,
  className,
}: {
  brand: string;
  className?: string;
}) {
  const logo = brandLogos[brand];
  if (!logo) {
    return (
      <p className="text-sm font-medium tracking-wide text-primary uppercase">
        {brand}
      </p>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={brand}
      className={className ?? "h-6 w-auto object-contain"}
    />
  );
}
