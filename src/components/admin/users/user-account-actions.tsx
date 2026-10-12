"use client";

import { useState, useTransition } from "react";
import { UserRoundCheck, UserRoundX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setUserBanned, setUserRole } from "@/lib/users/actions";
import { canManageUser, roleLabels } from "@/lib/auth/permissions";
import { settableRoles, type AdminUserDetail, type Role } from "@/lib/users/types";

/** Role + ban controls for the user detail page — same actions as the list's
 * row dropdown (src/components/admin/users/users-view.tsx), just inline. */
export function UserAccountActions({
  user,
  isSelf,
  myRole,
}: {
  user: AdminUserDetail;
  isSelf: boolean;
  myRole: Role;
}) {
  const manageable = !isSelf && canManageUser(myRole, user.role);
  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function changeRole(next: Role) {
    if (next === user.role) return;
    setError(null);
    startTransition(async () => {
      const result = await setUserRole(user.id, next);
      if (!result.ok) setError(result.error);
    });
  }

  function confirmBan() {
    setError(null);
    startTransition(async () => {
      const result = await setUserBanned(user.id, true, banReason);
      setBanOpen(false);
      setBanReason("");
      if (!result.ok) setError(result.error);
    });
  }

  function unban() {
    setError(null);
    startTransition(async () => {
      const result = await setUserBanned(user.id, false);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      {error && <p className="text-destructive">{error}</p>}
      {!manageable && (
        <p className="text-xs text-muted-foreground">
          {isSelf
            ? "You can't change your own account here."
            : user.role === "superadmin"
              ? "The Super admin can't be changed."
              : "Only admins can manage accounts."}
        </p>
      )}
      <label className="flex flex-col gap-1.5 font-medium text-foreground">
        Role
        <Select
          items={roleLabels}
          value={user.role}
          onValueChange={(v) => v && changeRole(v as Role)}
          disabled={!manageable || pending}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {settableRoles.map((r) => (
              <SelectItem key={r} value={r}>
                {roleLabels[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      {user.banned ? (
        <Button
          type="button"
          variant="outline"
          disabled={!manageable || pending}
          onClick={unban}
          className="justify-start"
        >
          <UserRoundCheck />
          Unban
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={!manageable || pending}
          onClick={() => {
            setBanReason("");
            setBanOpen(true);
          }}
          className="justify-start text-destructive hover:bg-destructive/10"
        >
          <UserRoundX />
          Ban…
        </Button>
      )}

      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban {user.name}</DialogTitle>
            <DialogDescription>
              They&rsquo;ll be signed out and blocked from signing in until unbanned.
            </DialogDescription>
          </DialogHeader>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
            Reason (optional)
            <Input
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="e.g. spam / abuse"
            />
          </label>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" disabled={pending} onClick={confirmBan}>
              {pending ? "Banning…" : "Ban user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
