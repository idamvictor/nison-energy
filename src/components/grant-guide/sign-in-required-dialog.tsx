"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Gate in front of quote generation on the OZEV guide pages. */
export function SignInRequiredDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in to generate your quote</DialogTitle>
          <DialogDescription>
            Your quote is saved to your account so you can find it again any
            time — sign in (or create an account) to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            nativeButton={false}
            render={
              <Link href={`/sign-in?redirect=${encodeURIComponent(pathname)}`} />
            }
          >
            Sign in to continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
