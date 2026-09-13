"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, ShieldOff, UserRoundCheck, UserRoundX } from "lucide-react";

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
import { setUserBanned, setUserRole } from "@/lib/users/actions";
import type { AdminUserDetail } from "@/lib/users/types";

/** Role + ban controls for the user detail page — same actions as the list's
 * row dropdown (src/components/admin/users/users-view.tsx), just inline. */
export function UserAccountActions({
  user,
  isSelf,
}: {
  user: AdminUserDetail;
  isSelf: boolean;
}) {
  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggleRole() {
    setError(null);
    startTransition(async () => {
      const result = await setUserRole(user.id, user.role === "admin" ? "user" : "admin");
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
      <Button
        type="button"
        variant="outline"
        disabled={isSelf || pending}
        onClick={toggleRole}
        className="justify-start"
      >
        {user.role === "admin" ? <ShieldOff /> : <ShieldCheck />}
        {user.role === "admin" ? "Remove admin" : "Make admin"}
      </Button>
      {user.banned ? (
        <Button
          type="button"
          variant="outline"
          disabled={pending}
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
          disabled={isSelf || pending}
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
