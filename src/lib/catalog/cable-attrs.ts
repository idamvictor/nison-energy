// Cable product attributes, kept in Product.filters (JSON) like the circuit
// protection filters: { type: ["Meter Tails"], length: ["1m"], core: ["2 × 16mm²"] }.
// Client-safe.

import { cableTypes, type CableType } from "@/lib/catalog/types";

export type CableAttrs = { type: CableType; length?: string; core?: string };

const first = (raw: Record<string, unknown>, key: string): string | undefined => {
  const value = raw[key];
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
};

/** Read a row's stored attributes; anything unknown falls back to an install kit. */
export function readCableAttrs(raw: unknown): CableAttrs {
  const obj = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const type = first(obj, "type");
  return {
    type: cableTypes.includes(type as CableType) ? (type as CableType) : "EV Ultra Install Kit",
    length: first(obj, "length"),
    core: first(obj, "core"),
  };
}

/** The JSON stored for a cable product (empty length / core left out). */
export function cableAttrsToFilters(attrs: CableAttrs): Record<string, string[]> {
  return {
    type: [attrs.type],
    ...(attrs.length ? { length: [attrs.length] } : {}),
    ...(attrs.core ? { core: [attrs.core] } : {}),
  };
}

/** "1m" → 1, for sorting packs shortest first. */
export const lengthValue = (length?: string) => parseFloat(length ?? "") || 0;
