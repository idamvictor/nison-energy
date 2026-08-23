import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Mail, MapPin, Phone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStatusSelect } from "@/components/admin/leads/lead-status-select";
import { adminLeads } from "@/lib/admin-leads";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lead = adminLeads.find((l) => l.id === id);
  return {
    title: lead ? `${lead.firstName} ${lead.lastName} | Admin` : "Lead | Admin",
  };
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = adminLeads.find((l) => l.id === id);

  if (!lead) notFound();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to leads
        </Link>
        <LeadStatusSelect initialStatus={lead.status} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {lead.firstName} {lead.lastName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Submitted {formatDateTime(lead.submittedAt)}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p className="flex items-center gap-2 text-foreground">
                <Mail className="size-4 text-muted-foreground" />
                {lead.email}
              </p>
              <p className="flex items-center gap-2 text-foreground">
                <Phone className="size-4 text-muted-foreground" />
                {lead.phone}
              </p>
              {lead.companyName && (
                <p className="flex items-center gap-2 text-foreground">
                  <Building2 className="size-4 text-muted-foreground" />
                  {lead.companyName}
                  {lead.jobTitle && ` · ${lead.jobTitle}`}
                </p>
              )}
              {lead.postcode && (
                <p className="flex items-center gap-2 text-foreground">
                  <MapPin className="size-4 text-muted-foreground" />
                  {lead.postcode}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enquiry details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailRow label="Area of enquiry" value={lead.areaOfEnquiry} />
                <DetailRow label="Reason for enquiry" value={lead.reasonForEnquiry} />
                <DetailRow
                  label="Plans to make it a paid service?"
                  value={lead.paidServicePlans}
                />
                <DetailRow
                  label="Happy to receive future communications?"
                  value={lead.futureCommunications}
                />
              </dl>
              {lead.additionalInformation && (
                <div className="mt-4 border-t border-border pt-4">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Additional information
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {lead.additionalInformation}
                  </dd>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-foreground transition-colors hover:bg-muted"
            >
              <Mail className="size-4" />
              Email {lead.firstName}
            </a>
            <a
              href={`tel:${lead.phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-foreground transition-colors hover:bg-muted"
            >
              <Phone className="size-4" />
              Call {lead.firstName}
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}
