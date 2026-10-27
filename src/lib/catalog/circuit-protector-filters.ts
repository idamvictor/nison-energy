// Circuit protector catalogue filters. Each product stores its values in
// `Product.filters` as { [key]: string[] }; the storefront sidebar, the admin
// form and scripts/import-circuit-protector-filters.ts all read this list.
// Values are shown in the order listed here.

export type CircuitProtectorFilters = Record<string, string[]>;

export const CIRCUIT_PROTECTOR_FILTERS = [
  {
    key: "type",
    title: "Product Type",
    values: [
      "EV Charger Protection",
      "PME Fault Detection",
      "Distribution Boards",
      "Surge Protection",
      "Heat Pump Protection",
      "Solar PV Protection",
      "Enclosures & Accessories",
    ],
  },
  {
    key: "application",
    title: "Application",
    values: [
      "EV Charging",
      "Solar PV",
      "Heat Pump",
      "Commercial & Industrial",
      "Three-Phase Domestic",
      "Outdoor Power",
      "General Wiring",
    ],
  },
  { key: "supply", title: "Supply", values: ["Single-Phase", "Three-Phase", "Universal"] },
  { key: "current", title: "Current Rating", values: ["13A", "20A", "32A", "40A", "100A", "125A"] },
  { key: "installation", title: "Installation", values: ["Indoor", "Outdoor / Weatherproof"] },
  { key: "curve", title: "Tripping Curve", values: ["B Curve", "C Curve"] },
  { key: "rcdType", title: "RCD / RCBO Type", values: ["Type A", "Type B", "Type B HP"] },
  {
    key: "features",
    title: "Features",
    values: ["Surge Protection", "PME Fault Detection", "Load Balancing", "kWh Meter"],
  },
] as const satisfies readonly { key: string; title: string; values: readonly string[] }[];

/** Keeps only known keys/values (in definition order); drops empty groups. */
export function cleanCircuitProtectorFilters(raw: unknown): CircuitProtectorFilters {
  const out: CircuitProtectorFilters = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  const input = raw as Record<string, unknown>;
  for (const def of CIRCUIT_PROTECTOR_FILTERS) {
    const given = input[def.key];
    if (!Array.isArray(given)) continue;
    const values = (def.values as readonly string[]).filter((v) => given.includes(v));
    if (values.length) out[def.key] = values;
  }
  return out;
}
