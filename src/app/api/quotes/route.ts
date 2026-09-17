import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { uploadDocument } from "@/lib/media/queries";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { quoteSchemes, type QuoteScheme } from "@/lib/quotes/types";
import type { Prisma } from "@/generated/prisma/client";
import { CACHE_TAGS } from "@/lib/cache/tags";

// Uses the S3 SDK — not edge-compatible.
export const runtime = "nodejs";
// Handles file bytes — never statically cache this route.
export const dynamic = "force-dynamic";

// Renters generates a Word-compatible .doc; landlord/workplace generate a
// real PDF. Anything else is rejected.
const ALLOWED_QUOTE_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
};

export async function POST(request: Request) {
  // Any signed-in user may submit a quote — this is the sign-in gate itself
  // (the guide pages also check client-side, but this is the real guard).
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to generate a quote." },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields. Pretend it worked, store nothing.
  if (String(formData.get("company_website") ?? "").trim() !== "") {
    return NextResponse.json({ ok: true, id: "ok", status: "Pending" }, { status: 201 });
  }

  const allowed = await checkRateLimit(`quote:${user.id}`, { limit: 10, windowMs: 60 * 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts — please try again in a bit." },
      { status: 429 },
    );
  }

  const scheme = formData.get("scheme");
  const reference = formData.get("reference");
  const fileName = formData.get("fileName");
  const file = formData.get("file");
  const inputRaw = formData.get("input");

  if (
    typeof scheme !== "string" ||
    !quoteSchemes.includes(scheme as QuoteScheme) ||
    typeof reference !== "string" ||
    !reference.trim() ||
    typeof fileName !== "string" ||
    !fileName.trim() ||
    !(file instanceof File) ||
    typeof inputRaw !== "string"
  ) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  let input: unknown;
  try {
    input = JSON.parse(inputRaw);
  } catch {
    return NextResponse.json({ error: "Invalid input payload." }, { status: 400 });
  }

  const ext = ALLOWED_QUOTE_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { key } = await uploadDocument(bytes, {
    contentType: file.type,
    ext,
  });

  const quote = await prisma.quoteDocument.create({
    data: {
      userId: user.id,
      scheme: scheme as QuoteScheme,
      // Renters is self-serve; the other two schemes need admin sign-off.
      status: scheme === "Renters" ? "Approved" : "Pending",
      reference,
      fileKey: key,
      fileName,
      input: input as Prisma.InputJsonValue,
    },
  });
  revalidateTag(CACHE_TAGS.quotes, { expire: 0 });

  return NextResponse.json(
    { ok: true, id: quote.id, status: quote.status },
    { status: 201 },
  );
}
