import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { uploadDatasheet } from "@/lib/media/queries";

// Uses the S3 SDK — not edge-compatible.
export const runtime = "nodejs";
// Handles file bytes — never statically cache this route.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Admin-only (product datasheet PDFs). proxy.ts doesn't cover /api routes.
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Optional page-1 preview image rendered in the admin's browser.
  const preview = formData.get("preview");
  const result = await uploadDatasheet(file, preview instanceof File ? preview : null);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ url: result.url }, { status: 201 });
}
