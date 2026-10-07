"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * False during server rendering and the first (hydrating) client render, true
 * after. Gate anything that depends on client-only state — e.g. the cached
 * auth session — so the first client render matches the server HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
