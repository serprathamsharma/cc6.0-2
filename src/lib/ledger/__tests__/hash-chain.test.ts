import { describe, it, expect } from "vitest";
import {
  createLedgerEntry,
  verifyChain,
  GENESIS_HASH,
  type LedgerEntry,
  type LedgerEntryData,
} from "../hash-chain";

describe("Evidence Ledger Hash Chain", () => {
  it("should create valid genesis chained entry", () => {
    const entryData: LedgerEntryData = {
      assetId: "asset-1",
      entryType: "upload",
      cloudinaryPublicId: "impactlens/org1/proj1/test",
      cloudinaryVersion: 1,
      originalSha256: "abc123sha256",
      actor: "user@impactlens.org",
      generatedAt: new Date().toISOString(),
    };

    const { entryHash, previousHash } = createLedgerEntry(null, entryData);
    expect(previousHash).toBe(GENESIS_HASH);
    expect(entryHash).toHaveLength(64);
  });

  it("should verify a multi-step intact hash chain", () => {
    const entries: LedgerEntry[] = [];
    let prevHash: string | null = null;

    // Step 1: Upload
    const uploadData: LedgerEntryData = {
      assetId: "asset-1",
      entryType: "upload",
      cloudinaryPublicId: "impactlens/p1/img1",
      generatedAt: "2026-09-26T12:00:00.000Z",
    };
    const e1 = createLedgerEntry(prevHash, uploadData);
    entries.push({ id: "entry-1", ...uploadData, ...e1 });
    prevHash = e1.entryHash;

    // Step 2: Analysis
    const analysisData: LedgerEntryData = {
      assetId: "asset-1",
      entryType: "analysis",
      modelId: "gpt-6-sol",
      promptVersion: "1.0.0",
      entryData: { caption: "Mangrove saplings planted along shoreline" },
      generatedAt: "2026-09-26T12:05:00.000Z",
    };
    const e2 = createLedgerEntry(prevHash, analysisData);
    entries.push({ id: "entry-2", ...analysisData, ...e2 });
    prevHash = e2.entryHash;

    // Step 3: Verification
    const verifyData: LedgerEntryData = {
      assetId: "asset-1",
      entryType: "verification",
      actor: "reviewer@ngo.org",
      entryData: { status: "verified", notes: "GPS verified on site" },
      generatedAt: "2026-09-26T12:10:00.000Z",
    };
    const e3 = createLedgerEntry(prevHash, verifyData);
    entries.push({ id: "entry-3", ...verifyData, ...e3 });

    const result = verifyChain(entries);
    expect(result.valid).toBe(true);
    expect(result.totalEntries).toBe(3);
    expect(result.verifiedEntries).toBe(3);
  });

  it("should detect tampering in entry data and identify the first tampered entry", () => {
    const entries: LedgerEntry[] = [];
    let prevHash: string | null = null;

    // Entry 1
    const d1: LedgerEntryData = {
      assetId: "asset-1",
      entryType: "upload",
      cloudinaryPublicId: "test-pub-id",
      generatedAt: "2026-09-26T12:00:00.000Z",
    };
    const e1 = createLedgerEntry(prevHash, d1);
    entries.push({ id: "entry-1", ...d1, ...e1 });
    prevHash = e1.entryHash;

    // Entry 2
    const d2: LedgerEntryData = {
      assetId: "asset-1",
      entryType: "verification",
      actor: "reviewer-1",
      entryData: { status: "verified" },
      generatedAt: "2026-09-26T12:10:00.000Z",
    };
    const e2 = createLedgerEntry(prevHash, d2);
    entries.push({ id: "entry-2", ...d2, ...e2 });

    // Tamper with entry 1 after the fact!
    entries[0].cloudinaryPublicId = "hacked-malicious-id";

    const result = verifyChain(entries);
    expect(result.valid).toBe(false);
    expect(result.firstTamperedIndex).toBe(0);
    expect(result.firstTamperedId).toBe("entry-1");
  });
});
