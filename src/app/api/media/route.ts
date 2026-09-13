import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { uploadImage } from "@/lib/media/queries";

// Uses the Node "fs"/"crypto"/S3 SDK — not edge-compatible.
export const runtime = "nodejs";
// Handles file bytes — never statically cache this route.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Admin-only (blog/product image uploads). proxy.ts doesn't cover /api routes.
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

  const result = await uploadImage(file);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ url: result.image.url }, { status: 201 });
}
