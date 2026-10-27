"use client";

import ReactDOM from "react-dom";

/**
 * Opens connections to Stripe and PayPal as the page starts loading, so the
 * product-page wallet buttons (Apple Pay / Google Pay / PayPal) are ready
 * sooner. Renders nothing.
 */
export function PaymentPreconnect() {
  ReactDOM.preconnect("https://js.stripe.com");
  ReactDOM.preconnect("https://api.stripe.com");
  ReactDOM.preconnect("https://www.paypal.com");
  ReactDOM.preconnect("https://www.paypalobjects.com");
  return null;
}
