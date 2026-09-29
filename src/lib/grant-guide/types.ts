// Client-safe shapes for the OZEV guides' charger finder.

export type GuideChargerVariant = {
  id: string;
  /** Full product name (includes colour/length) — what goes on the quote. */
  name: string;
  colour: string;
  cableLength?: string;
  image: string;
  priceIncVat: number;
  priceExVat: number;
};

export type GuideCharger = {
  key: string;
  category: "home" | "commercial";
  /** Product name without the trailing colour/length. */
  name: string;
  brand: string;
  image: string;
  powerOutput: string;
  connectionType: "Tethered" | "Untethered";
  featured: boolean;
  fromPriceExVat: number;
  /** Cheapest first. */
  variants: GuideChargerVariant[];
};

export type ChargerSelection = { key: string; variantId: string };

/** Props every OZEV guide client component receives from its server page. */
export type ChargerGuideProps = {
  chargers: GuideCharger[];
  defaultCategory: GuideCharger["category"];
  /** From `?charger=<productId>` — pre-selects that charger. */
  initialCharger?: ChargerSelection | null;
};
