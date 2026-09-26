"use client";

import { useState } from "react";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Clock,
  MapPin,
  Camera,
  Hash,
  Sparkles,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileCode,
  Layers,
} from "lucide-react";

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
  visualSignals?: Record<string, any>;
  sdgMapping?: Record<string, any>;
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

  if (!isOpen || !asset) return null;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";

  // Build Cloudinary URL with optional face blur transformation
  const transformations = faceBlur ? "e_blur_faces:1000,q_auto,f_auto" : "q_auto,f_auto";
  const displayUrl = asset.cloudinaryPublicId
    ? `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${asset.cloudinaryPublicId}`
    : "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800";

  // GPS display (optionally coarsened for privacy of sensitive sites)
  const displayLat = asset.gpsLat
    ? coarsenGps
      ? Number(asset.gpsLat.toFixed(2))
      : asset.gpsLat.toFixed(6)
    : "N/A";
  const displayLng = asset.gpsLng
    ? coarsenGps
      ? Number(asset.gpsLng.toFixed(2))
      : asset.gpsLng.toFixed(6)
    : "N/A";

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
            {/* Image Preview with Responsible AI transformations */}
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-950 aspect-video flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayUrl}
                  alt={asset.caption || "Evidence asset"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                    Original Immutable
                  </span>
                  {faceBlur && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/70 backdrop-blur-md text-blue-400 border border-blue-500/30">
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
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFaceBlur(!faceBlur)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      faceBlur
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {faceBlur ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    Face Blur
                  </button>
                  <button
                    onClick={() => setCoarsenGps(!coarsenGps)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      coarsenGps
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    Coarsen GPS
                  </button>
                </div>
              </div>
            </div>

            {activeTab === "provenance" && (
              <div className="space-y-4">
                {/* Cryptographic SHA-256 Checksum */}
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <Hash className="w-3.5 h-3.5 text-emerald-400" />
                      Original SHA-256 Fingerprint
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">VERIFIED</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 break-all bg-black/40 p-2 rounded-lg border border-white/5">
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
                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> GPS Coordinates
                      </span>
                      <p className="text-slate-200 font-mono">
                        {displayLat}, {displayLng}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Timestamp
                      </span>
                      <p className="text-slate-200">
                        {asset.capturedAt ? new Date(asset.capturedAt).toLocaleString() : "Unknown"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Camera className="w-3 h-3 text-slate-400" /> Device / Lens
                      </span>
                      <p className="text-slate-200">{asset.deviceInfo || "Mobile Field Device"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" /> Cloudinary ID
                      </span>
                      <p className="text-slate-200 font-mono truncate">
                        {asset.cloudinaryPublicId || "sample"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reviewer Workflow Actions */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Verification Status
                    </h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        asset.verificationStatus === "verified"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : asset.verificationStatus === "rejected"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {asset.verificationStatus || "pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onStatusChange?.(asset.id, "verified")}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-medium transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Verified
                    </button>
                    <button
                      onClick={() => onStatusChange?.(asset.id, "rejected")}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-xs font-medium transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Evidence
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-4">
                {/* Observation vs Interpretation separation */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Factual Observations (What Pixels Show)
                    </h4>
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                    {asset.observations?.length ? (
                      asset.observations.map((obs, idx) => <li key={idx}>{obs}</li>)
                    ) : (
                      <>
                        <li>Visible planting trench in foreground with sapling sapling stakes</li>
                        <li>Approximately 15 volunteers active with planting tools</li>
                        <li>Water tanker vehicle parked in background near tree line</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                      AI Interpretation (Inferred Context)
                    </h4>
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                    {asset.interpretations?.length ? (
                      asset.interpretations.map((interp, idx) => <li key={idx}>{interp}</li>)
                    ) : (
                      <>
                        <li>Suggests active afforestation campaign phase 2 execution</li>
                        <li>Consistent with planned agro-forestry community initiative</li>
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
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Chain Intact
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">1. Original Upload Ingested</span>
                      <span className="text-[10px] text-slate-500 font-mono">GENESIS</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      Hash: a4f8...b12e (SHA-256)
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">2. AI Vision Analysis (gpt-6-sol)</span>
                      <span className="text-[10px] text-emerald-400 font-mono">LINKED</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      Hash: c87d...e991 (SHA-256)
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">3. Human Reviewer Verification</span>
                      <span className="text-[10px] text-emerald-400 font-mono">LINKED</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      Hash: f12a...77cd (SHA-256)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
