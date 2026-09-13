"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MoreHorizontal,
  Search,
  ShieldCheck,
  ShieldOff,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoleBadge } from "@/components/admin/users/role-badge";
import { setUserBanned, setUserRole } from "@/lib/users/actions";
import { roleOptions, type AdminUserRow } from "@/lib/users/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UsersView({
  users,
  counts,
  currentUserId,
}: {
  users: AdminUserRow[];
  counts: { total: number; admins: number; banned: number };
  currentUserId: string;
}) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | (typeof roleOptions)[number]>("all");
  const [banTarget, setBanTarget] = useState<AdminUserRow | null>(null);
  const [banReason, setBanReason] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = role === "all" || u.role === role;
      const haystack = `${u.name} ${u.email}`.toLowerCase();
      return matchesRole && (q === "" || haystack.includes(q));
    });
  }, [users, query, role]);

  function runRole(user: AdminUserRow, next: (typeof roleOptions)[number]) {
    setError(null);
    startTransition(async () => {
      const result = await setUserRole(user.id, next);
      if (!result.ok) setError(result.error);
    });
  }

  function confirmBan() {
    if (!banTarget) return;
    setError(null);
    const target = banTarget;
    const reason = banReason;
    startTransition(async () => {
      const result = await setUserBanned(target.id, true, reason);
      setBanTarget(null);
      setBanReason("");
      if (!result.ok) setError(result.error);
    });
  }

  function unban(user: AdminUserRow) {
    setError(null);
    startTransition(async () => {
      const result = await setUserBanned(user.id, false);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">Users</h2>
        <p className="text-sm text-muted-foreground">
          {counts.total} {counts.total === 1 ? "user" : "users"} · {counts.admins} admin
          {counts.admins === 1 ? "" : "s"}
          {counts.banned > 0 && ` · ${counts.banned} banned`}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-8"
          />
        </div>

        <Select
          value={role}
          onValueChange={(v) => v && setRole(v as typeof role)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roleOptions.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">No users found</p>
          <p className="text-sm text-muted-foreground">Try a different search or filter.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-secondary ring-1 ring-border">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-xs font-medium text-muted-foreground">
                              {user.name.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="truncate font-medium text-foreground hover:text-primary hover:underline"
                          >
                            {user.name}
                            {isSelf && (
                              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                (you)
                              </span>
                            )}
                          </Link>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : user.emailVerified ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Unverified</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" />}
                        >
                          <MoreHorizontal />
                          <span className="sr-only">User actions</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.role === "admin" ? (
                            <DropdownMenuItem
                              disabled={isSelf || pending}
                              onClick={() => runRole(user, "user")}
                            >
                              <ShieldOff />
                              Remove admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              disabled={pending}
                              onClick={() => runRole(user, "admin")}
                            >
                              <ShieldCheck />
                              Make admin
                            </DropdownMenuItem>
                          )}
                          {user.banned ? (
                            <DropdownMenuItem
                              disabled={pending}
                              onClick={() => unban(user)}
                            >
                              <UserRoundCheck />
                              Unban
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={isSelf || pending}
                              onClick={() => {
                                setBanReason("");
                                setBanTarget(user);
                              }}
                            >
                              <UserRoundX />
                              Ban…
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={banTarget !== null}
        onOpenChange={(open) => !open && setBanTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban {banTarget?.name}</DialogTitle>
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
