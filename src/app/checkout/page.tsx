import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth/session";
import { dbToAccessory, getProductRow } from "@/lib/catalog/queries";
import { CHECKOUT_EXTRA_PRODUCT_IDS } from "@/lib/orders/extras";
import { CheckoutClient, type CheckoutDefaults, type CheckoutExtra } from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout | Ocunio Energy",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const [user, ...rows] = await Promise.all([
    getCurrentUser(),
    ...CHECKOUT_EXTRA_PRODUCT_IDS.map((id) => getProductRow(id)),
  ]);

  const extras: CheckoutExtra[] = rows
    .filter((row) => row?.active && row.price != null)
    .map((row) => {
      const { id, name, price, image } = dbToAccessory(row!);
      return { id, name, price, image };
    });

  // Signed-in customers start with their account details filled in (all
  // editable), so the order — and its emails — go to the right inbox.
  let defaults: CheckoutDefaults | undefined;
  if (user) {
    const [firstName = "", ...rest] = user.name.trim().split(/\s+/);
    defaults = {
      firstName,
      lastName: rest.join(" "),
      email: user.email,
      phone: user.phone ?? "",
      address: user.address ?? "",
      postcode: user.postcode ?? "",
    };
  }

  return <CheckoutClient extras={extras} defaults={defaults} />;
}
