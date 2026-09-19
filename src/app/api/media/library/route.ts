import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getMediaLibrary } from "@/lib/media/queries";

// Reads the DB fresh per request — cheap, and admin-only usage means no
// meaningful cache benefit to chase here.
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urls = await getMediaLibrary();
  return NextResponse.json({ urls });
}
