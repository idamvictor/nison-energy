import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getLeads, createLead } from "@/lib/leads/queries";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { getClientIp } from "@/lib/rate-limit/ip";

// Reads/writes a real database, so never statically cache this route.
export const dynamic = "force-dynamic";

export async function GET() {
  // Lead data is customer PII — admin only. proxy.ts doesn't cover /api routes.
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await getLeads();
  return NextResponse.json(leads);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields. Pretend it worked, store nothing.
  const record = body as Record<string, unknown>;
  if (String(record.company_website ?? "").trim() !== "") {
    return NextResponse.json({ id: "ok" }, { status: 201 });
  }

  const ip = await getClientIp();
  const allowed = await checkRateLimit(`lead:${ip}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts — please try again in a few minutes." },
      { status: 429 },
    );
  }

  const result = await createLead(body as Record<string, unknown>);
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }
  return NextResponse.json({ id: result.id }, { status: 201 });
}
