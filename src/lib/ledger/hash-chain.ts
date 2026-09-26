import { sha256 } from "js-sha256";

export interface LedgerEntryData {
  assetId: string;
  entryType: "upload" | "analysis" | "transform" | "verification" | "report_cite";
  cloudinaryPublicId?: string;
  cloudinaryVersion?: number;
  originalSha256?: string;
  transformationUrl?: string;
  transformationString?: string;
  actor?: string;
  modelId?: string;
  promptVersion?: string;
  entryData?: Record<string, unknown>;
  generatedAt: string | Date;
}

/**
 * Recursive deterministic canonical JSON stringifier that sorts keys at all depths.
 */
export function canonicalStringify(obj: any): string {
  if (obj === null || obj === undefined) {
    return "null";
  }
  if (typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalStringify).join(",") + "]";
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys
    .filter((k) => obj[k] !== undefined && obj[k] !== null)
    .map((k) => JSON.stringify(k) + ":" + canonicalStringify(obj[k]));
  return "{" + pairs.join(",") + "}";
}

/**
 * Compute a deterministic hash for a ledger entry.
 * entry_hash = SHA-256(previousHash + canonicalJSON(entry))
 */
export function computeEntryHash(
  previousHash: string,
  entry: LedgerEntryData
): string {
  const normDate =
    entry.generatedAt instanceof Date
      ? entry.generatedAt.toISOString()
      : String(entry.generatedAt);
  const normalized = { ...entry, generatedAt: normDate };
  const canonical = canonicalStringify(normalized);
  const input = previousHash + canonical;
  return sha256(input);
}

/**
 * The genesis hash for the first entry in a chain.
 */
export const GENESIS_HASH = sha256("impactlens-genesis");

export interface LedgerEntry extends LedgerEntryData {
  id: string;
  entryHash: string;
  previousHash: string;
}

export interface VerificationResult {
  valid: boolean;
  totalEntries: number;
  verifiedEntries: number;
  firstTamperedIndex?: number;
  firstTamperedId?: string;
}

/**
 * Verify the integrity of a hash chain.
 * Returns the first tampered entry if the chain is broken.
 */
export function verifyChain(entries: LedgerEntry[]): VerificationResult {
  if (entries.length === 0) {
    return { valid: true, totalEntries: 0, verifiedEntries: 0 };
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const expectedPreviousHash = i === 0 ? GENESIS_HASH : entries[i - 1].entryHash;

    // Check previous hash link
    if (entry.previousHash !== expectedPreviousHash) {
      return {
        valid: false,
        totalEntries: entries.length,
        verifiedEntries: i,
        firstTamperedIndex: i,
        firstTamperedId: entry.id,
      };
    }

    // Recompute and verify entry hash
    const entryData: LedgerEntryData = {
      assetId: entry.assetId,
      entryType: entry.entryType,
      cloudinaryPublicId: entry.cloudinaryPublicId,
      cloudinaryVersion: entry.cloudinaryVersion,
      originalSha256: entry.originalSha256,
      transformationUrl: entry.transformationUrl,
      transformationString: entry.transformationString,
      actor: entry.actor,
      modelId: entry.modelId,
      promptVersion: entry.promptVersion,
      entryData: entry.entryData as Record<string, unknown>,
      generatedAt: entry.generatedAt,
    };

    const recomputedHash = computeEntryHash(entry.previousHash, entryData);

    if (recomputedHash !== entry.entryHash) {
      return {
        valid: false,
        totalEntries: entries.length,
        verifiedEntries: i,
        firstTamperedIndex: i,
        firstTamperedId: entry.id,
      };
    }
  }

  return {
    valid: true,
    totalEntries: entries.length,
    verifiedEntries: entries.length,
  };
}

/**
 * Create a new ledger entry with proper hash chaining.
 */
export function createLedgerEntry(
  previousHash: string | null,
  data: LedgerEntryData
): { entryHash: string; previousHash: string } {
  const prevHash = previousHash || GENESIS_HASH;
  const entryHash = computeEntryHash(prevHash, data);
  return { entryHash, previousHash: prevHash };
}
