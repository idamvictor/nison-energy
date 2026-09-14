"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  FileText,
  Inbox as InboxIcon,
  Mail,
  ShoppingCart,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/actions";
import type {
  NotificationKind,
  NotificationView,
} from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

const kindIcon: Record<NotificationKind, LucideIcon> = {
  order: ShoppingCart,
  enquiry: Mail,
  quote: FileText,
  system: InboxIcon,
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

function refreshBadge() {
  window.dispatchEvent(new Event("notifications:refresh"));
}

export function AccountInbox({
  notifications,
}: {
  notifications: NotificationView[];
}) {
  const [selected, setSelected] = useState<NotificationView | null>(null);
  const [, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.read).length;

  function openItem(item: NotificationView) {
    setSelected(item);
    if (!item.read) {
      startTransition(async () => {
        await markNotificationRead(item.id);
        refreshBadge();
      });
    }
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      refreshBadge();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
            Inbox
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Updates about your orders and enquiries, in one place.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <InboxIcon className="size-5" />
            </span>
            <p className="font-heading text-lg font-semibold text-foreground">
              Nothing here yet
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Updates about your orders and enquiries will show up here as they
              happen.
            </p>
          </div>
        ) : (
          notifications.map((item) => {
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
                          className={cn(
                            "mt-1.5 size-2 shrink-0 rounded-full bg-accent",
                          )}
                        />
                      )}
                    </div>
                    {item.body && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.body}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected?.body && (
            <p className="text-sm text-foreground/80">{selected.body}</p>
          )}
          {selected && (
            <p className="text-xs text-muted-foreground">
              {formatDate(selected.createdAt)}
            </p>
          )}
          {selected?.href && (
            <Button
              nativeButton={false}
              render={<Link href={selected.href} />}
              className="w-fit"
            >
              View
              <ArrowRight />
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
