import type { Metadata } from "next";

import { dbToAccessory, getProductRow } from "@/lib/catalog/queries";
import { CHECKOUT_EXTRA_PRODUCT_IDS } from "@/lib/orders/extras";
import { CheckoutClient, type CheckoutExtra } from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout | Ocunio Energy",
  robots: { index: false },
};

export const revalidate = 3600;

export default async function CheckoutPage() {
  const rows = await Promise.all(CHECKOUT_EXTRA_PRODUCT_IDS.map((id) => getProductRow(id)));
  const extras: CheckoutExtra[] = rows
    .filter((row) => row?.active && row.price != null)
    .map((row) => {
      const { id, name, price, image } = dbToAccessory(row!);
      return { id, name, price, image };
    });

  return <CheckoutClient extras={extras} />;
}
