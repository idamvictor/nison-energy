import { NextResponse } from "next/server";

import { searchProducts } from "@/lib/search/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 40) : 6;

  const results = await searchProducts(q, limit);
  return NextResponse.json({ results });
}
