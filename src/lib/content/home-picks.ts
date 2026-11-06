// Hand-picked tweaks to the home page's automatic "Best Budget Chargers" list
// (the cheapest residential chargers under £400, one per product family).
// Ids are product ids — the last part of the product page URL.

/** Never shown in the budget section (still sold as normal). */
export const BUDGET_HIDDEN_IDS = ["solax-smart-7-2kw-ev-charger-g2-tethered"];

/** Shown instead of the cheapest variant of their family (e.g. tethered over untethered). */
export const BUDGET_PREFERRED_IDS = ["fastamps-7-4kw-alpha7-gen4-tethered-ev-charger-black"];
