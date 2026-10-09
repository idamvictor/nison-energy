import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/checkout/clear-cart-on-mount";
import { SurveyNextStep } from "@/components/checkout/survey-next-step";
import { whatsappUrl } from "@/lib/whatsapp";
import { fulfilCheckoutSession } from "@/lib/orders/fulfil";
import { includesInstallation } from "@/lib/orders/installation";
import { OPENQUOTE_SURVEY_URL } from "@/lib/content/openquote";

export const metadata: Metadata = { title: "Payment received | Ocunio Energy" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; keep_cart?: string }>;
}) {
  const { session_id: sessionId, keep_cart: keepCart } = await searchParams;
  // Creates the Order now if the webhook hasn't yet (Stripe recommends
  // fulfilling from the landing page too); returns the existing one otherwise.
  const order = sessionId ? await fulfilCheckoutSession(sessionId) : null;
  // No completed session behind this link — never claim a payment that didn't happen.
  if (!order) redirect("/cart");
  const paid = order.paymentStatus === "Paid";
  const needsSurvey = includesInstallation(order.items);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {/* A product-page "buy now" paid for just that item — leave the basket. */}
      <ClearCartOnMount keepCart={keepCart === "1"} />
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mt-2 flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="size-6 text-success" />
            </span>
            <p className="font-heading text-lg font-semibold text-foreground">
              {paid ? "Thanks — we've received your payment" : "Thanks — we're confirming your payment"}
            </p>
            <p className="text-sm text-muted-foreground">Your order reference</p>
            <p className="font-heading text-2xl font-semibold text-primary-ink">{order.reference}</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {paid
                ? "A confirmation email is on its way."
                : "Your payment provider is still confirming the payment — we'll email you as soon as it clears."}{" "}
              {needsSurvey ? (
                <strong className="font-semibold text-foreground">
                  Book your installation by completing this short survey.
                </strong>
              ) : (
                "We'll be in touch when your order is dispatched."
              )}
            </p>
            {needsSurvey && (
              <Button
                variant="cta"
                className="gap-1.5"
                nativeButton={false}
                render={<a href={OPENQUOTE_SURVEY_URL} target="_blank" rel="noopener noreferrer" />}
              >
                Complete the survey
                <ArrowRight className="size-4" />
              </Button>
            )}
            <p className="max-w-sm text-sm text-muted-foreground">
              Questions?{" "}
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-ink underline underline-offset-2"
              >
                Message us on WhatsApp
              </a>
              .
            </p>
            <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
              Back to home
            </Button>
          </div>
          {needsSurvey && <SurveyNextStep />}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
