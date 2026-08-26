"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox as InboxIcon, Mail, ShoppingCart, Zap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GrantApplicationTracker } from "@/components/grant-guide/grant-application-tracker";
import { useNotifications } from "@/hooks/use-notifications";
import { adminLeads, type AdminLead } from "@/lib/admin-leads";
import { accountCustomer } from "@/lib/account-mock";
import { cn } from "@/lib/utils";

type FeedKind = "order" | "grant" | "enquiry";

type FeedItem = {
  id: string;
  kind: FeedKind;
  title: string;
  description?: string;
  createdAt: string;
  read: boolean;
  lead?: AdminLead;
};

const kindIcon: Record<FeedKind, LucideIcon> = {
  order: ShoppingCart,
  grant: Zap,
  enquiry: Mail,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildEnquiryItems(): FeedItem[] {
  return adminLeads
    .filter((lead) => lead.email === accountCustomer.email)
    .flatMap((lead): FeedItem[] => {
      const items: FeedItem[] = [
        {
          id: `enquiry-${lead.id}`,
          kind: "enquiry",
          title: `Enquiry received — ${lead.areaOfEnquiry}`,
          description: `Status: ${lead.status}`,
          createdAt: lead.submittedAt,
          read: true,
          lead,
        },
      ];

      if (lead.installation) {
        const detail = [
          lead.installation.grantStatus && `OZEV grant: ${lead.installation.grantStatus}`,
          lead.installation.engineer && `Engineer: ${lead.installation.engineer}`,
        ]
          .filter(Boolean)
          .join(" · ");

        items.push({
          id: `enquiry-${lead.id}-installation`,
          kind: "enquiry",
          title: `Installation update — ${lead.installation.stage}`,
          description: detail || undefined,
          createdAt:
            lead.installation.installDate ??
            lead.installation.surveyDate ??
            lead.submittedAt,
          read: true,
          lead,
        });
      }

      return items;
    });
}

export function AccountInbox() {
  const notifications = useNotifications((s) => s.items);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const markRead = useNotifications((s) => s.markRead);
  const [selected, setSelected] = useState<FeedItem | null>(null);

  const feed: FeedItem[] = [...notifications, ...buildEnquiryItems()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  function openItem(item: FeedItem) {
    setSelected(item);
    if (item.kind !== "enquiry" && !item.read) {
      markRead(item.id);
    }
  }

  if (feed.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
          <InboxIcon className="size-5" />
        </span>
        <p className="font-heading text-lg font-semibold text-foreground">
          Your inbox is empty
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Updates about your orders and your OZEV grant application will show
          up here as they happen.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
            Inbox
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything that&apos;s happened with your orders and grant
            application, in one place.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {feed.map((item) => {
          const Icon = kindIcon[item.kind];
          return (
            <Card
              key={item.id}
              onClick={() => openItem(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openItem(item);
              }}
              className="cursor-pointer transition-colors hover:bg-secondary/60"
            >
              <CardContent className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4.5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    {!item.read && (
                      <span
                        aria-label="Unread"
                        className={cn("mt-1.5 size-2 shrink-0 rounded-full bg-accent")}
                      />
                    )}
                  </div>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            {selected?.kind !== "grant" && (
              <DialogDescription>
                {selected ? formatDate(selected.createdAt) : ""}
              </DialogDescription>
            )}
          </DialogHeader>

          {selected?.kind === "grant" && <GrantApplicationTracker />}

          {selected?.kind === "order" && selected.description && (
            <p className="text-sm text-foreground/80">{selected.description}</p>
          )}

          {selected?.kind === "enquiry" && selected.lead && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Area of enquiry</dt>
                <dd className="text-foreground">{selected.lead.areaOfEnquiry}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="text-foreground">{selected.lead.status}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">Reason</dt>
                <dd className="text-foreground">{selected.lead.reasonForEnquiry}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="text-foreground">{selected.lead.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Submitted</dt>
                <dd className="text-foreground">{formatDate(selected.lead.submittedAt)}</dd>
              </div>
              {selected.lead.installation && (
                <>
                  <div>
                    <dt className="text-xs text-muted-foreground">Installation stage</dt>
                    <dd className="text-foreground">{selected.lead.installation.stage}</dd>
                  </div>
                  {selected.lead.installation.grantStatus && (
                    <div>
                      <dt className="text-xs text-muted-foreground">OZEV grant</dt>
                      <dd className="text-foreground">
                        {selected.lead.installation.grantStatus}
                      </dd>
                    </div>
                  )}
                  {selected.lead.installation.engineer && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Engineer</dt>
                      <dd className="text-foreground">{selected.lead.installation.engineer}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
