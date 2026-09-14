import "server-only";

import Stripe from "stripe";

function createStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set — add your Stripe secret key to .env");
  }
  return new Stripe(secretKey);
}

const globalForStripe = globalThis as unknown as { stripe?: Stripe };

export const stripe = globalForStripe.stripe ?? createStripeClient();

if (process.env.NODE_ENV !== "production") {
  globalForStripe.stripe = stripe;
}
