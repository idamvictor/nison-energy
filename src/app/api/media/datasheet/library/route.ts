import { NextResponse } from "next/server";

import { adminOnly } from "@/lib/media/admin-guard";
import { deleteDatasheetIfUnused, listDatasheetLibrary } from "@/lib/media/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Last non-empty line of an error — Prisma errors are long and multi-line. */
function briefError(error: unknown): string {
  if (!(error instanceof Error)) return "Unknown error";
  return error.message.split(/\r?\n/).filter((line) => line.trim()).pop() ?? error.message;
}

/** Admin PDF library: every stored datasheet with the products that use it. */
export async function GET() {
  const denied = await adminOnly();
  if (denied) return denied;
  try {
    return NextResponse.json({ items: await listDatasheetLibrary() });
  } catch (error) {
    console.error("PDF library failed to load", error);
    return NextResponse.json({ error: briefError(error) }, { status: 500 });
  }
}

/** Deletes a datasheet (`?url=`) — refused while any product still uses it. */
export async function DELETE(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;
  const url = new URL(request.url).searchParams.get("url") ?? "";
  const result = await deleteDatasheetIfUnused(url);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
  return NextResponse.json({ ok: true });
}
