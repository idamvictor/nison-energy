import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getUnreadCount } from "@/lib/notifications/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const count = user ? await getUnreadCount(user.id) : 0;
  return NextResponse.json({ count });
}
