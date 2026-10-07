"use client";

import { useEffect, useState } from "react";

import { getInstallFees } from "@/lib/orders/actions";

/** Installation fees (from the DB) for the given product ids, keyed by id. */
export function useInstallFees(productIds: string[]): Record<string, number> {
  const key = [...new Set(productIds)].sort().join(",");
  const [fees, setFees] = useState<{ key: string; fees: Record<string, number> }>({ key: "", fees: {} });
  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    getInstallFees(key.split(","))
      .then((result) => {
        if (!cancelled) setFees({ key, fees: result });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [key]);
  return fees.fees;
}
