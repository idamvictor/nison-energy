"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MailPlus, RotateCw, UserMinus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleBadge } from "@/components/admin/users/role-badge";
import {
  assignableRoles,
  can,
  canManageUser,
  roleLabels,
  type AssignableRole,
  type Role,
} from "@/lib/auth/permissions";
import { setUserRole } from "@/lib/users/actions";
import { resendTeamInvite, revokeTeamInvite, sendTeamInvite } from "@/lib/team/actions";
import type { PendingInvite, TeamMember } from "@/lib/team/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Team members, invite form and pending invites — top of /admin/users. */
export function TeamPanel({
  members,
  invites,
  currentUserId,
  myRole,
}: {
  members: TeamMember[];
  invites: PendingInvite[];
  currentUserId: string;
  myRole: Role;
}) {
  const canManage = can(myRole, "team.manage");
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AssignableRole>("staff");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: true } | { ok: false; error: string }>, success?: string) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error);
      else if (success) setNotice(success);
    });
  }

  function invite(e: React.FormEvent) {
    e.preventDefault();
    const to = email.trim();
    run(async () => {
      const result = await sendTeamInvite({ email: to, role: inviteRole });
      if (result.ok) setEmail("");
      return result;
    }, `Invite sent to ${to}.`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <p className="text-sm text-muted-foreground">
          Super admin: everything. Admin: everything except the Price list. Staff: products,
          blog, leads, orders and quote approvals — not prices, quote deletion or the team.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {notice && <p className="text-sm text-success">{notice}</p>}

        <ul className="divide-y divide-border rounded-xl border border-border">
          {members.map((m) => {
            const isSelf = m.id === currentUserId;
            const manageable = !isSelf && canManageUser(myRole, m.role);
            return (
              <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/users/${m.id}`}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {m.name}
                  </Link>
                  {isSelf && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
                  <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                </div>
                {m.banned && <Badge variant="destructive">Banned</Badge>}
                {manageable ? (
                  <div className="flex items-center gap-2">
                    <Select
                      items={roleLabels}
                      value={m.role}
                      onValueChange={(v) =>
                        v && v !== m.role && run(() => setUserRole(m.id, v as Role), `${m.name} is now ${roleLabels[v as Role]}.`)
                      }
                      disabled={pending}
                    >
                      <SelectTrigger className="w-32" aria-label={`Role for ${m.name}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableRoles.map((r) => (
                          <SelectItem key={r} value={r}>
                            {roleLabels[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => {
                        if (window.confirm(`Remove ${m.name} from the team? Their account stays as a customer and they're signed out.`)) {
                          run(() => setUserRole(m.id, "user"), `${m.name} was removed from the team.`);
                        }
                      }}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <UserMinus />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <RoleBadge role={m.role} />
                )}
              </li>
            );
          })}
        </ul>

        {canManage && (
          <form onSubmit={invite} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-foreground">
              Invite by email
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Role
              <Select
                items={roleLabels}
                value={inviteRole}
                onValueChange={(v) => v && setInviteRole(v as AssignableRole)}
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabels[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <Button type="submit" disabled={pending || email.trim() === ""}>
              <MailPlus />
              {pending ? "Sending…" : "Send invite"}
            </Button>
          </form>
        )}

        {invites.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-foreground">Pending invites</h3>
            <ul className="divide-y divide-border rounded-xl border border-border">
              {invites.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{i.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {roleLabels[i.role]} · sent {formatDate(i.createdAt)}
                      {i.invitedByName && ` by ${i.invitedByName}`} ·{" "}
                      {i.expired ? (
                        <span className="text-destructive">expired</span>
                      ) : (
                        `expires ${formatDate(i.expiresAt)}`
                      )}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => run(() => resendTeamInvite(i.id), `Invite re-sent to ${i.email}.`)}
                      >
                        <RotateCw />
                        Resend
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() => run(() => revokeTeamInvite(i.id), `Invite to ${i.email} revoked.`)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <X />
                        Revoke
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
