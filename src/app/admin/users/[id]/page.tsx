import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  FileText,
  KeyRound,
  Laptop,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleBadge } from "@/components/admin/users/role-badge";
import { UserAccountActions } from "@/components/admin/users/user-account-actions";
import { DeleteUserButton } from "@/components/admin/users/delete-user-button";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { QuoteStatusBadge } from "@/components/admin/quotes/quote-status-badge";
import { requireAdmin } from "@/lib/auth/session";
import { getUser } from "@/lib/users/queries";
import { getLeadsForUser } from "@/lib/leads/queries";
import { getOrdersForUser } from "@/lib/orders/queries";
import { getNotificationsForUser } from "@/lib/notifications/queries";
import { getQuotesForUser } from "@/lib/quotes/queries";
import { quoteSchemeLabels } from "@/lib/quotes/types";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const ACCOUNT_LABELS: Record<string, string> = {
  credential: "Email & password",
  google: "Google",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await getUser(id);
  return { title: user ? `${user.name} | Admin` : "User | Admin" };
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireAdmin();
  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();

  const [leads, orders, notifications, quotes] = await Promise.all([
    getLeadsForUser(user.id, user.email),
    getOrdersForUser(user.id, user.email),
    getNotificationsForUser(user.id),
    getQuotesForUser(user.id),
  ]);

  const isSelf = user.id === me.id;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to users
      </Link>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-secondary ring-1 ring-border">
                  {user.image ? (
                    <Image src={user.image} alt={user.name} fill sizes="48px" className="object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-sm font-medium text-muted-foreground">
                      {user.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-xl">
                    {user.name} {isSelf && <span className="text-sm font-normal text-muted-foreground">(you)</span>}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Joined {formatDate(user.createdAt)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <RoleBadge role={user.role} />
                {user.banned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : user.emailVerified ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="secondary">Unverified</Badge>
                )}
              </div>
              {user.banned && user.banReason && (
                <p className="text-xs wrap-break-word text-muted-foreground">
                  Reason: {user.banReason}
                </p>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p className="flex items-center gap-2 text-foreground">
                <Mail className="size-4 text-muted-foreground" />
                {user.email}
              </p>
              {user.phone && (
                <p className="flex items-center gap-2 text-foreground">
                  <Phone className="size-4 text-muted-foreground" />
                  {user.phone}
                </p>
              )}
              {(user.address || user.postcode) && (
                <p className="flex items-center gap-2 text-foreground">
                  <MapPin className="size-4 text-muted-foreground" />
                  {[user.address, user.postcode].filter(Boolean).join(", ")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leads ({leads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <p className="text-sm text-muted-foreground">No enquiries from this user.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {leads.map((lead) => (
                    <li key={lead.id}>
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-primary"
                      >
                        <span className="min-w-0 truncate">
                          {lead.areaOfEnquiry} — {lead.reasonForEnquiry}
                        </span>
                        <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                          {formatDate(lead.submittedAt)}
                          <StatusBadge status={lead.status} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders from this user.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {orders.map((order) => (
                    <li key={order.id}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-primary"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Package className="size-4 shrink-0 text-muted-foreground" />
                          {order.reference}
                        </span>
                        <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                          {currency.format(order.subtotal)}
                          <OrderStatusBadge status={order.status} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quotes ({quotes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {quotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No quotes generated by this user.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {quotes.map((quote) => (
                    <li key={quote.id}>
                      <Link
                        href={`/admin/quotes/${quote.id}`}
                        className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-primary"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FileText className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 truncate">
                            {quoteSchemeLabels[quote.scheme]} — {quote.reference}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                          {formatDate(quote.createdAt)}
                          <QuoteStatusBadge status={quote.status} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {notifications.slice(0, 10).map((n) => (
                    <li key={n.id} className="flex items-start gap-2.5 py-2.5 text-sm">
                      <Bell className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className={n.read ? "text-muted-foreground" : "font-medium text-foreground"}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
                      </div>
                      {!n.read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sign-in &amp; sessions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Sign-in methods</p>
                {user.accounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">None on record.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {user.accounts.map((a) => (
                      <Badge key={a.id} variant="outline" className="gap-1.5">
                        <KeyRound className="size-3" />
                        {ACCOUNT_LABELS[a.providerId] ?? a.providerId}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Active sessions</p>
                {user.sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active sessions.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {user.sessions.map((s) => (
                      <li key={s.id} className="flex items-start gap-2 text-sm">
                        <Laptop className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="truncate text-foreground">
                            {s.ipAddress ?? "Unknown IP"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground" title={s.userAgent ?? undefined}>
                            {s.userAgent ?? "Unknown device"} · expires {formatDate(s.expiresAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <UserAccountActions user={user} isSelf={isSelf} />
            </CardContent>
          </Card>

          <Card className="h-fit border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="size-4" />
                Danger zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSelf ? (
                <p className="text-sm text-muted-foreground">You can&rsquo;t delete your own account.</p>
              ) : (
                <DeleteUserButton userId={user.id} userName={user.name} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
