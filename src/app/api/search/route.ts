import { NextRequest, NextResponse } from "next/server";
import { hybridSearch } from "@/lib/search/hybrid-search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const projectId = searchParams.get("projectId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const response = await hybridSearch(query, limit, offset);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[API Search] Hybrid search error:", error);
    return NextResponse.json(
      { error: "Search failed", details: error.message },
      { status: 500 }
    );
  }
}
