import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getMediaLibrary } from "@/lib/media/queries";
import { can } from "@/lib/auth/permissions";
import { isMediaScope } from "@/lib/catalog/types";

// Reads the DB fresh per request — cheap, and admin-only usage means no
// meaningful cache benefit to chase here.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "products.edit")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Each admin section only browses its own images (?scope=Solar, …, blog).
  const scope = new URL(request.url).searchParams.get("scope");
  if (!isMediaScope(scope)) {
    return NextResponse.json({ error: "Unknown media scope" }, { status: 400 });
  }
  const urls = await getMediaLibrary(scope);
  return NextResponse.json({ urls });
}
