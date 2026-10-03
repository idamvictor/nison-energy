/**
 * Catalogue accessories offered as add-ons in the checkout "Extras" step, in
 * display order. They're real Product rows, so price, name and image come from
 * the DB; a deactivated or unpriced product simply drops out of the list.
 */
export const CHECKOUT_EXTRA_PRODUCT_IDS = [
  "zev-type-2-32a-single-phase-ev-charging-cable-straight-discrete-5m-grey",
  "wottz-portable-ev-granny-charger-vehicle-socket-type-2-uk10a-max-7-5m-black",
] as const;
