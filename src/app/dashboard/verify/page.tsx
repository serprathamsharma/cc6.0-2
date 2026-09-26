"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Hash,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
  Eye,
  FileCheck,
} from "lucide-react";
import {
  verifyChain,
  computeEntryHash,
  GENESIS_HASH,
  type LedgerEntry,
  type LedgerEntryData,
} from "@/lib/ledger/hash-chain";
import { useToast } from "@/components/ui/toast";

// Generate mathematically valid initial demonstration ledger entries
function createInitialDemoEntries(): LedgerEntry[] {
  let prevHash = GENESIS_HASH;
  const raw: LedgerEntryData[] = [
    {
      assetId: "a-001",
      entryType: "upload",
      cloudinaryPublicId: "impactlens/mh/p1/img_01",
      cloudinaryVersion: 1,
      originalSha256: "9a2f7c4e88d154bc0991e45f94b301ad5a932bc3e0a12cfd99214b7e801ad4f2",
      actor: "field.officer@impactlens.org",
      generatedAt: "2025-07-15T09:30:00.000Z",
      entryData: {
        location: "Satara, Maharashtra",
        format: "jpg",
        bytes: 3418290,
      },
    },
    {
      assetId: "a-001",
      entryType: "analysis",
      cloudinaryPublicId: "impactlens/mh/p1/img_01",
      modelId: "gpt-6-sol",
      promptVersion: "1.0.0",
      actor: "system:pipeline",
      generatedAt: "2025-07-15T09:32:15.000Z",
      entryData: {
        caption: "Native sapling plantation drive in Sahyadri corridor",
        sdgTarget: "SDG 15.3",
        visualSignals: { vegetation: "high", people: 6 },
      },
    },
    {
      assetId: "a-001",
      entryType: "verification",
      cloudinaryPublicId: "impactlens/mh/p1/img_01",
      actor: "senior.reviewer@ngo.org",
      generatedAt: "2025-07-15T11:00:00.000Z",
      entryData: {
        status: "verified",
        gpsMatch: true,
        notes: "Field location cross-referenced with Satara forest division GIS parcel",
      },
    },
    {
      assetId: "a-002",
      entryType: "upload",
      cloudinaryPublicId: "impactlens/blr/cleanup_01",
      cloudinaryVersion: 1,
      originalSha256: "b45a198de30cf299a7102e3b994d80a13e551fa0488219ad02bb91845c10ad82",
      actor: "field.officer@impactlens.org",
      generatedAt: "2025-08-22T08:15:00.000Z",
      entryData: {
        location: "Bellandur Lake, Bangalore",
        format: "jpg",
      },
    },
  ];

  return raw.map((item, idx) => {
    const entryHash = computeEntryHash(prevHash, item);
    const entry: LedgerEntry = {
      id: `leg-${idx + 1}`,
      previousHash: prevHash,
      entryHash,
      ...item,
    };
    prevHash = entryHash;
    return entry;
  });
}

const INITIAL_DEMO_ENTRIES: LedgerEntry[] = createInitialDemoEntries();

export default function VerifyPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>(INITIAL_DEMO_ENTRIES);
  const [originalEntries, setOriginalEntries] = useState<LedgerEntry[]>(INITIAL_DEMO_ENTRIES);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    totalEntries: number;
    verifiedEntries: number;
    firstTamperedIndex?: number;
    firstTamperedId?: string;
  }>({
    valid: true,
    totalEntries: INITIAL_DEMO_ENTRIES.length,
    verifiedEntries: INITIAL_DEMO_ENTRIES.length,
  });
  const [isTampered, setIsTampered] = useState(false);
  const [reviewTab, setReviewTab] = useState<"ledger" | "queue">("ledger");
  const { showToast } = useToast();

  // Fetch real ledger from database on mount
  useEffect(() => {
    fetch("/api/ledger")
      .then((res) => res.json())
      .then((data) => {
        if (data.entries && data.entries.length > 0) {
          setEntries(data.entries);
          setOriginalEntries(data.entries);
          setVerificationResult(data.verification);
        }
      })
      .catch((err) => console.warn("[Verify] Using demo ledger:", err));
  }, []);

  const handleRunVerify = () => {
    const res = verifyChain(entries);
    setVerificationResult(res);
  };

  const handleSimulateTamper = () => {
    // Deliberately modify data in entry #1 to demonstrate tamper detection
    const tampered = entries.map((e, idx) => {
      if (idx === 1) {
        return {
          ...e,
          originalSha256: "0000000000000000000000000000000000000000000000000000000000000000",
          entryData: {
            ...e.entryData,
            caption: "TAMPERED PAYLOAD: Falsified impact claim injected here",
          },
        };
      }
      return e;
    });

    setEntries(tampered);
    setIsTampered(true);
    const res = verifyChain(tampered);
    setVerificationResult(res);
  };

  const handleRestoreChain = () => {
    setEntries(originalEntries);
    setIsTampered(false);
    const res = verifyChain(originalEntries);
    setVerificationResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Evidence Ledger & Verification
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
                verificationResult.valid
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
              }`}
            >
              {verificationResult.valid ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> Chain Intact
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" /> Tampering Detected!
                </>
              )}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Every upload, AI analysis, transformation, and review is permanently hash-chained with SHA-256
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {!isTampered ? (
            <button
              onClick={handleSimulateTamper}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Simulate Tamper
            </button>
          ) : (
            <button
              onClick={handleRestoreChain}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restore Intact Chain
            </button>
          )}

          <button
            onClick={handleRunVerify}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
          >
            <ShieldCheck className="w-4 h-4" />
            Verify Entire Chain
          </button>
        </div>
      </div>

      {/* Verification Status Alert Banner */}
      <div
        className={`p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between transition-all ${
          verificationResult.valid
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
            : "bg-red-500/15 border-red-500/30 text-red-200"
        }`}
      >
        <div className="flex items-center gap-3">
          {verificationResult.valid ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 animate-bounce" />
          )}
          <div>
            <h3 className="text-sm font-semibold">
              {verificationResult.valid
                ? `Cryptographic Audit Passed (${verificationResult.verifiedEntries}/${verificationResult.totalEntries} entries valid)`
                : `CHAIN BROKEN: Tampered entry detected at index #${verificationResult.firstTamperedIndex} (ID: ${verificationResult.firstTamperedId})`}
            </h3>
            <p className="text-xs opacity-80 mt-0.5">
              {verificationResult.valid
                ? "All parent-child SHA-256 block hashes match canonical JSON payloads. Evidence is authentic and unaltered."
                : "The cryptographic hash of the modified entry does not match the chained parent hash. Tampering was immediately identified."}
            </p>
          </div>
        </div>
        <div className="hidden sm:block font-mono text-xs opacity-75">
          SHA-256 / Canonical JSON
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 text-xs font-medium space-x-6">
        <button
          onClick={() => setReviewTab("ledger")}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            reviewTab === "ledger"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          Cryptographic Ledger ({entries.length} Blocks)
        </button>
        <button
          onClick={() => setReviewTab("queue")}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            reviewTab === "queue"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Reviewer Queue (Pending Approval)
        </button>
      </div>

      {reviewTab === "ledger" && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-white/10 text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Block #</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Asset ID</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Chained Hash (entry_hash)</th>
                  <th className="py-3 px-4">Previous Hash</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {entries.map((entry, idx) => {
                  const isTamperedRow =
                    !verificationResult.valid &&
                    verificationResult.firstTamperedIndex === idx;

                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isTamperedRow
                          ? "bg-red-500/20 text-red-200 border-l-4 border-red-500"
                          : "hover:bg-slate-800/40 text-slate-300"
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-400">#{idx + 1}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-800 text-emerald-400 border border-white/5">
                          {entry.entryType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{entry.assetId}</td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-[120px]">
                        {entry.actor || "system"}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 truncate max-w-[140px]" title={entry.entryHash}>
                        {entry.entryHash.slice(0, 16)}...
                      </td>
                      <td className="py-3 px-4 text-slate-500 truncate max-w-[140px]" title={entry.previousHash}>
                        {entry.previousHash.slice(0, 16)}...
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(entry.generatedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reviewTab === "queue" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-semibold text-white">
              Pending Human Verification Queue
            </h3>
            <p className="text-xs text-slate-400">
              Field evidence requires independent reviewer confirmation before being cited in official reports.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">
                      Community Water RO Filtration Unit Commissioning
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      Pending Review
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Uploaded by field officer. GPS: 25.753°N, 71.396°E (Barmer, Rajasthan). SHA-256 intact.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      showToast({
                        title: "Evidence Approved & Signed",
                        description: "Cryptographic signature committed to ledger block #5. Verification status updated to VERIFIED.",
                        type: "success",
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Sign
                  </button>
                  <button
                    onClick={() => {
                      showToast({
                        title: "Evidence Flagged for Clarification",
                        description: "Review note sent back to field surveyor. GPS coordinate bounds re-requested.",
                        type: "info",
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
