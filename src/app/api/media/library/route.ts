import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getMediaLibrary } from "@/lib/media/queries";
import { can } from "@/lib/auth/permissions";

// Reads the DB fresh per request — cheap, and admin-only usage means no
// meaningful cache benefit to chase here.
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "products.edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urls = await getMediaLibrary();
  return NextResponse.json({ urls });
}
