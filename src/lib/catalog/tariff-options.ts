// "Works with" choices in the charger catalogues' sort dropdown — they narrow
// the list to chargers whose compatibleTariffs include the tariff (the same
// field that shows the Octopus / OVO logos on cards).
export const tariffSortOptions = [
  { value: "octopus", label: "Octopus Energy", tariff: "Octopus Energy" },
  { value: "ovo", label: "OVO Energy", tariff: "OVO Energy" },
] as const;

export type TariffSortValue = (typeof tariffSortOptions)[number]["value"];

/** The tariff a sort value filters by, or undefined for a plain sort. */
export function tariffOf(sort: string): string | undefined {
  return tariffSortOptions.find((o) => o.value === sort)?.tariff;
}
