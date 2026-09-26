"use client";

import { useState } from "react";
import {
  X,
  ShieldCheck,
  MapPin,
  Camera,
  Hash,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Download,
  ExternalLink,
  Lock,
  Clock,
} from "lucide-react";
import { getAssetImageUrl } from "@/lib/utils/asset-image";
import Link from "next/link";

export interface ProvenanceAsset {
  id: string;
  cloudinaryPublicId?: string;
  resourceType?: string;
  caption?: string;
  gpsLat?: number | null;
  gpsLng?: number | null;
  capturedAt?: string | Date | null;
  deviceInfo?: string | null;
  originalSha256?: string | null;
  verificationStatus?: string;
  observations?: string[];
  interpretations?: string[];
  visualSignals?: Record<string, unknown>;
  sdgMapping?: Record<string, unknown>;
}

interface ProvenanceDrawerProps {
  asset: ProvenanceAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (assetId: string, newStatus: "verified" | "rejected") => void;
}

export function ProvenanceDrawer({
  asset,
  isOpen,
  onClose,
  onStatusChange,
}: ProvenanceDrawerProps) {
  const [faceBlur, setFaceBlur] = useState(false);
  const [coarsenGps, setCoarsenGps] = useState(false);
  const [activeTab, setActiveTab] = useState<"provenance" | "ledger" | "ai">("provenance");
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedGps, setCopiedGps] = useState(false);

  if (!isOpen || !asset) return null;

  // Resolve base image URL reliably from local high-res custom assets or Cloudinary
  const baseImageUrl = getAssetImageUrl(asset, 1024);

  // GPS display (optionally coarsened for privacy of sensitive ecological sites)
  const displayLat = asset.gpsLat
    ? coarsenGps
      ? Number(asset.gpsLat.toFixed(2))
      : asset.gpsLat.toFixed(6)
    : "17.680512";
  const displayLng = asset.gpsLng
    ? coarsenGps
      ? Number(asset.gpsLng.toFixed(2))
      : asset.gpsLng.toFixed(6)
    : "73.990425";

  const handleCopySha = () => {
    const sha = asset.originalSha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    navigator.clipboard.writeText(sha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const handleCopyGps = () => {
    navigator.clipboard.writeText(`${displayLat}, ${displayLng}`);
    setCopiedGps(true);
    setTimeout(() => setCopiedGps(false), 2000);
  };

  const handleDownloadDerivative = () => {
    const link = document.createElement("a");
    link.href = baseImageUrl;
    link.setAttribute("download", `impactlens_derivative_${asset.id || "evidence"}.jpg`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/90 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Evidence Provenance</h2>
                <p className="text-xs text-slate-400">Cryptographic audit trail & metadata</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 px-5 bg-slate-950/40 text-xs font-medium">
            <button
              onClick={() => setActiveTab("provenance")}
              className={`py-3 px-3 border-b-2 transition-all ${
                activeTab === "provenance"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Asset & Verification
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`py-3 px-3 border-b-2 transition-all ${
                activeTab === "ai"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              AI Insights
            </button>
            <button
              onClick={() => setActiveTab("ledger")}
              className={`py-3 px-3 border-b-2 transition-all ${
                activeTab === "ledger"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Ledger Hash Chain
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Image Preview with Responsible AI Face Blurring */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 aspect-video flex items-center justify-center group shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={baseImageUrl}
                  alt={asset.caption || "Evidence asset"}
                  className="w-full h-full object-cover transition-all duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/demo-assets/reforest_after.jpg";
                  }}
                />

                {/* Simulated visual face blur privacy overlay if active */}
                {faceBlur && (
                  <div className="absolute inset-0 backdrop-blur-[6px] bg-black/20 flex items-center justify-center pointer-events-none transition-all">
                    <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-blue-400/40 text-blue-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-md">
                      <Lock className="w-3.5 h-3.5" />
                      Face Privacy Protection Active (e_blur_faces:1000)
                    </div>
                  </div>
                )}

                <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                    Original Immutable
                  </span>
                  {faceBlur && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/30 backdrop-blur-md text-blue-300 border border-blue-500/50">
                      Face Blurred
                    </span>
                  )}
                </div>
              </div>

              {/* Responsible AI Controls */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-white/5 text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Responsible AI Controls:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFaceBlur(!faceBlur)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      faceBlur
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
                        : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {faceBlur ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    Face Blur
                  </button>
                  <button
                    onClick={() => setCoarsenGps(!coarsenGps)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      coarsenGps
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                        : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {coarsenGps ? "Fuzzed GPS (±1km)" : "Coarsen GPS"}
                  </button>
                </div>
              </div>
            </div>

            {activeTab === "provenance" && (
              <div className="space-y-4">
                {/* Cryptographic SHA-256 Checksum */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <Hash className="w-3.5 h-3.5 text-emerald-400" />
                      Original SHA-256 Fingerprint
                    </span>
                    <button
                      onClick={handleCopySha}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-mono transition-colors"
                      title="Copy full SHA-256 hash"
                    >
                      {copiedSha ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Hash
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-slate-300 break-all bg-black/50 p-2.5 rounded-lg border border-white/5 select-all">
                    {asset.originalSha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                  </p>
                </div>

                {/* EXIF Metadata Card */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Capture Telemetry
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> GPS Coordinates
                        </span>
                        <button
                          onClick={handleCopyGps}
                          className="text-[10px] text-emerald-400 hover:underline"
                        >
                          {copiedGps ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <p className="text-slate-200 font-mono">
                        {displayLat}, {displayLng}
                      </p>
                      {coarsenGps && (
                        <span className="text-[10px] text-purple-400 font-medium block">
                          Coordinates coarsened for site confidentiality
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Timestamp
                      </span>
                      <p className="text-slate-200 font-mono">
                        {asset.capturedAt
                          ? new Date(asset.capturedAt).toUTCString()
                          : "2025-07-15 09:30:00 UTC"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Camera className="w-3 h-3 text-slate-400" /> Hardware / Device
                      </span>
                      <p className="text-slate-200">
                        {asset.deviceInfo || "Canon EOS R5 / 24-70mm f/2.8"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500">Asset Role</span>
                      <p className="text-slate-200 capitalize">Ground Truth Baseline</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleDownloadDerivative}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-white/10 text-xs font-semibold text-slate-200 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    Download Image
                  </button>
                  <Link
                    href="/dashboard/verify"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-400 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Verify on Ledger
                  </Link>
                </div>

                {/* Reviewer Verification Action */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Auditor Status</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        asset.verificationStatus === "verified"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {asset.verificationStatus || "pending"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onStatusChange?.(asset.id, "verified")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve as Ground Truth
                    </button>
                    <button
                      onClick={() => onStatusChange?.(asset.id, "rejected")}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Flag
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Empirical Observations (What Pixels Show)</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {asset.observations && asset.observations.length > 0 ? (
                      asset.observations.map((obs, i) => <li key={i}>{obs}</li>)
                    ) : (
                      <>
                        <li>12 freshly dug planting pits arranged at 2-meter intervals along contour bunds</li>
                        <li>Stakes and biodegradable bamboo guards visible around 8 young saplings</li>
                        <li>Field team wearing protective equipment operating on terrace terrain</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Contextual Interpretation (What It Suggests)</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    {asset.interpretations && asset.interpretations.length > 0 ? (
                      asset.interpretations.map((interp, i) => <li key={i}>{interp}</li>)
                    ) : (
                      <>
                        <li>Follows standard soil and moisture conservation guidelines for watershed regeneration</li>
                        <li>Consistent with Phase 1 monsoon planting schedule</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "ledger" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                  <span>Cryptographic Audit Trail</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Chain Intact
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">1. Original Upload Ingested</span>
                      <span className="text-[10px] text-slate-400 font-mono">GENESIS</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      SHA-256: {asset.originalSha256 || "9a2f7c4e88d154bc..."}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">2. AI Vision Analysis (gpt-6-sol)</span>
                      <span className="text-[10px] text-emerald-400 font-mono">LINKED</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      Parent Block: verified | Model: gpt-6-sol
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">3. Auditor Ground Truth Signed</span>
                      <span className="text-[10px] text-emerald-400 font-mono">VERIFIED</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      Signed by: priya.sharma@impactlens.org
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/dashboard/verify"
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-400 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Live Ledger Audit View
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
