import type { Metadata } from "next";

import { getGuideChargers, selectionForProduct } from "@/lib/grant-guide/chargers";
import WorkplaceChargingSchemeGuide from "./guide";

export const metadata: Metadata = {
  title: "Workplace Charging Scheme OZEV Grant Guide | Ocunio Energy",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ charger?: string }>;
}) {
  const [chargers, { charger }] = await Promise.all([getGuideChargers(), searchParams]);
  return (
    <WorkplaceChargingSchemeGuide
      chargers={chargers}
      defaultCategory="commercial"
      initialCharger={selectionForProduct(chargers, charger)}
    />
  );
}
