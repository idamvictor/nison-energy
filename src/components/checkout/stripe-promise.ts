import { loadStripe } from "@stripe/stripe-js";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/** One Stripe.js load for the whole app (checkout + instalment messages). */
export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
