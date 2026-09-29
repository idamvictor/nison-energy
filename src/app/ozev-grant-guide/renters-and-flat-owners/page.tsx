import type { Metadata } from "next";

import { getGuideChargers, selectionForProduct } from "@/lib/grant-guide/chargers";
import RentersFlatOwnersGuide from "./guide";

export const metadata: Metadata = {
  title: "Renters & Flat Owners OZEV Grant Guide | Ocunio Energy",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ charger?: string }>;
}) {
  const [chargers, { charger }] = await Promise.all([getGuideChargers(), searchParams]);
  return (
    <RentersFlatOwnersGuide
      chargers={chargers}
      defaultCategory="home"
      initialCharger={selectionForProduct(chargers, charger)}
    />
  );
}
