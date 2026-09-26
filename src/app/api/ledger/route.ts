import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ledgerEntries } from "@/lib/db/schema";
import { verifyChain, type LedgerEntry } from "@/lib/ledger/hash-chain";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const entries = await db.query.ledgerEntries.findMany({
      orderBy: [asc(ledgerEntries.generatedAt)],
    });

    const typedEntries: LedgerEntry[] = entries.map((e: any) => ({
      id: e.id,
      assetId: e.assetId,
      entryType: e.entryType as any,
      entryHash: e.entryHash,
      previousHash: e.previousHash,
      cloudinaryPublicId: e.cloudinaryPublicId || undefined,
      cloudinaryVersion: e.cloudinaryVersion || undefined,
      originalSha256: e.originalSha256 || undefined,
      transformationUrl: e.transformationUrl || undefined,
      transformationString: e.transformationString || undefined,
      actor: e.actor || undefined,
      modelId: e.modelId || undefined,
      promptVersion: e.promptVersion || undefined,
      entryData: (e.entryData as Record<string, unknown>) || undefined,
      generatedAt: e.generatedAt,
    }));

    const verification = verifyChain(typedEntries);

    return NextResponse.json({
      entries: typedEntries,
      count: typedEntries.length,
      verification,
    });
  } catch (error: any) {
    console.error("[API Ledger] Error fetching ledger:", error);
    return NextResponse.json(
      { error: "Failed to fetch ledger", details: error.message },
      { status: 500 }
    );
  }
}
