import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { accountEnquiries, type AccountEnquiryStatus } from "@/lib/account-mock";

export const metadata: Metadata = { title: "My Enquiries" };

const statusVariant: Record<
  AccountEnquiryStatus,
  "default" | "secondary" | "outline" | "success" | "destructive"
> = {
  New: "default",
  Contacted: "secondary",
  Quoted: "outline",
  Won: "success",
  Lost: "destructive",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AccountEnquiriesPage() {
  if (accountEnquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-5" />
        </span>
        <p className="font-heading text-lg font-semibold text-foreground">
          No enquiries yet
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Submit a quote request and it&apos;ll show up here.
        </p>
        <Button nativeButton={false} render={<Link href="/contact-us" />}>
          Contact us
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {accountEnquiries.map((enquiry) => (
        <Card key={enquiry.id}>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">
                  {enquiry.reasonForEnquiry}
                </p>
                <Badge variant={statusVariant[enquiry.status]}>
                  {enquiry.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {enquiry.areaOfEnquiry} · Submitted {formatDate(enquiry.submittedAt)}
              </p>
              {enquiry.additionalInformation && (
                <p className="mt-2 max-w-2xl text-sm text-foreground/80">
                  {enquiry.additionalInformation}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
