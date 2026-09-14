import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { SiteHeader } from "@/components/shared/site-header";
import { TrustBar } from "@/components/shared/trust-bar";
import { SiteFooter } from "@/components/shared/site-footer";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/checkout/clear-cart-on-mount";
import { COMPANY } from "@/lib/company";
import { getOrderByCheckoutSession } from "@/lib/orders/queries";

export const metadata: Metadata = { title: "Payment received | Ocunio Energy" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const order = sessionId ? await getOrderByCheckoutSession(sessionId) : null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <ClearCartOnMount />
      <SiteHeader />
      <TrustBar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mt-2 flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="size-6 text-success" />
            </span>
            <p className="font-heading text-lg font-semibold text-foreground">
              Thanks — we&apos;ve received your payment
            </p>
            {order && (
              <>
                <p className="text-sm text-muted-foreground">Your order reference</p>
                <p className="font-heading text-2xl font-semibold text-primary">
                  {order.reference}
                </p>
              </>
            )}
            <p className="max-w-sm text-sm text-muted-foreground">
              A confirmation email is on its way, along with your receipt from Stripe. A member
              of the team will be in touch to book your installation. If it&apos;s urgent, call
              us on {COMPANY.phone}.
            </p>
            <Button nativeButton={false} render={<Link href="/" />}>
              Back to home
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
