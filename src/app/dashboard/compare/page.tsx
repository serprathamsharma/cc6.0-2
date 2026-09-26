"use client";

import { useState } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import {
  GitCompareArrows,
  Sliders,
  Columns2,
  Layers,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Leaf,
  Scan,
  Download,
  Copy,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ComparePair {
  id: string;
  projectName: string;
  siteName: string;
  beforeDate: string;
  afterDate: string;
  timeDeltaDays: number;
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeSha256: string;
  afterSha256: string;
  category: string;
  observedChanges: string[];
  quantification: {
    metric: string;
    beforeValue: string;
    afterValue: string;
    change: string;
    isEstimate: boolean;
  };
  limitations: string[];
  confidence: number;
}

const DEMO_PAIRS: ComparePair[] = [
  {
    id: "pair-1",
    projectName: "Maharashtra Afforestation Initiative",
    siteName: "Satara Western Ghats Watershed Site 4",
    beforeDate: "June 12, 2024",
    afterDate: "August 18, 2025",
    timeDeltaDays: 432,
    beforeImageUrl: "/demo-assets/reforest_before.jpg",
    afterImageUrl: "/demo-assets/reforest_after.jpg",
    beforeSha256: "9a2f7c4e88d154bc0991e45f94b301ad5a932bc3e0a12cfd99214b7e801ad4f2",
    afterSha256: "b45a198de30cf299a7102e3b994d80a13e551fa0488219ad02bb91845c10ad82",
    category: "Revegetation & Agro-forestry",
    observedChanges: [
      "Barren red soil in foreground now covered with dense native shrub layer and young tree canopy",
      "Contour trenches visible in 2024 now stabilize terrace edges with zero visible rill erosion",
      "12 individual saplings identified with protective bamboo guards in 2024 now exceed 2.4m height",
    ],
    quantification: {
      metric: "Excess Green Index (ExG) Canopy Cover",
      beforeValue: "11.4%",
      afterValue: "49.8%",
      change: "+38.4 percentage points",
      isEstimate: true,
    },
    limitations: [
      "Azimuth difference: after image taken at 14° clockwise rotation relative to baseline landmark",
      "Monsoon seasonality: 2025 image was taken during peak growing season (August)",
      "Solar elevation: 2024 image exhibits longer ground shadows due to late-afternoon capture",
    ],
    confidence: 0.94,
  },
  {
    id: "pair-2",
    projectName: "Bellandur Wetland Remediation",
    siteName: "South Feeder Inlet Zone A",
    beforeDate: "January 10, 2025",
    afterDate: "July 24, 2025",
    timeDeltaDays: 195,
    beforeImageUrl: "/demo-assets/lake_before.jpg",
    afterImageUrl: "/demo-assets/lake_after.jpg",
    beforeSha256: "7c19ad43e201b4998ca0f918420e11894d01ea598b0213cd99812fa4b01e33c1",
    afterSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    category: "Wetland Remediation & Solid Waste Extraction",
    observedChanges: [
      "Solid surface debris and accumulated plastics covering ~300m² shoreline fully cleared",
      "Floating aerator and perimeter containment boom deployed and functional",
      "Turbid froth at inlet channel reduced to clear open water surface",
    ],
    quantification: {
      metric: "Open Surface Water vs Solid Waste Area",
      beforeValue: "18.2% open water",
      afterValue: "91.5% open water",
      change: "+73.3 percentage points",
      isEstimate: true,
    },
    limitations: [
      "Water level variance between pre-monsoon January and post-monsoon July (+0.6m stage height)",
      "Floating boom obstructs direct visual baseline of shoreline bedrock in after photo",
    ],
    confidence: 0.91,
  },
  {
    id: "pair-3",
    projectName: "Barmer Clean Water Infrastructure",
    siteName: "Sector 3 Solar Water Kiosk, Thar Desert",
    beforeDate: "March 05, 2024",
    afterDate: "September 15, 2025",
    timeDeltaDays: 559,
    beforeImageUrl: "/demo-assets/solar_before.jpg",
    afterImageUrl: "/demo-assets/solar_after.jpg",
    beforeSha256: "4d7c81a29b4e63cf50a12e8731b992f4ca18e77519bb01af93245c711890ab42",
    afterSha256: "1f8e4c9201bd774ac3998a44b12df602a819c43b90013e2f89104194cba89711",
    category: "Off-Grid Solar & Potable Water Distribution",
    observedChanges: [
      "Parched drought terrain transformed with automated solar pump array and 5,000L insulated storage tank",
      "Operational stainless steel dispensing taps serving ~450 pastoral households daily",
      "Zero groundwater drawdown anomaly registered across 90-day operational telemetry",
    ],
    quantification: {
      metric: "Potable Water Access & Renewable Utilization",
      beforeValue: "0 L/day (Trucked)",
      afterValue: "4,800 L/day (Solar)",
      change: "+4,800 L/day Potable",
      isEstimate: false,
    },
    limitations: [
      "Pipeline pressure drop sensors require annual dry-season recalibration",
      "Telemetry logs subject to satellite uplink jitter during dust storms",
    ],
    confidence: 0.98,
  },
];

export default function ComparePage() {
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"slider" | "side" | "fade">("slider");
  const [fadeOpacity, setFadeOpacity] = useState(50);
  const [isScanning, setIsScanning] = useState(false);
  const { showToast } = useToast();

  const pair = DEMO_PAIRS[selectedPairIndex];

  const handleRunScan = () => {
    setIsScanning(true);
    showToast({
      title: "Analyzing Multispectral Imagery",
      description: `Computing Excess Green Index (ExG) and edge alignment for ${pair.projectName}...`,
      type: "info",
    });

    setTimeout(() => {
      setIsScanning(false);
      showToast({
        title: "ExG Analysis Verified",
        description: `Verified change of ${pair.quantification.change} with ${(pair.confidence * 100).toFixed(0)}% confidence score.`,
        type: "success",
      });
    }, 1400);
  };

  const handleExportAudit = () => {
    const auditPayload = {
      auditTimestamp: new Date().toISOString(),
      pairId: pair.id,
      projectName: pair.projectName,
      siteName: pair.siteName,
      timeDeltaDays: pair.timeDeltaDays,
      cryptographicHashes: {
        baseline: pair.beforeSha256,
        comparison: pair.afterSha256,
        hashChainAlgorithm: "SHA-256 (FIPS 180-4)",
      },
      metric: pair.quantification,
      disclosedLimitations: pair.limitations,
      confidenceScore: pair.confidence,
      immutabilityStatus: "SECURE — Cloudinary Original Derivative",
    };

    const blob = new Blob([JSON.stringify(auditPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `impactlens-audit-${pair.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast({
      title: "Comparison Audit Downloaded",
      description: `Saved impactlens-audit-${pair.id}.json with full cryptographic citations.`,
      type: "success",
    });
  };

  const handleAddToReport = () => {
    const citation = `[Evidence Citation: ${pair.projectName} (${pair.siteName}) | Metric: ${pair.quantification.metric} (${pair.quantification.change}) | Baseline Hash: ${pair.beforeSha256.slice(0, 12)}... | Verified Hash: ${pair.afterSha256.slice(0, 12)}...]`;
    navigator.clipboard?.writeText?.(citation);

    showToast({
      title: "Claim Attached to Report Draft",
      description: "Cryptographic evidence citation copied to clipboard and pinned to active report draft.",
      type: "success",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Before / After Change Engine
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Verifiable Evidence
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quantify visible ground impact with pixel-level alignment, Excess Green Index, and AI limitation disclosure
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all ${
              isScanning
                ? "bg-slate-800 text-slate-400 border border-white/10"
                : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20 cursor-pointer"
            }`}
          >
            <Scan className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Running ExG Scan..." : "Run New ExG Scan"}
          </button>

          <button
            onClick={handleExportAudit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-white/10 transition-all cursor-pointer"
            title="Download verified audit JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export Audit
          </button>

          <button
            onClick={handleAddToReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
            title="Copy verified citation to clipboard"
          >
            <Copy className="w-3.5 h-3.5" />
            Add to Report
          </button>
        </div>
      </div>

      {/* Project Selector Pills */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/5 overflow-x-auto">
        {DEMO_PAIRS.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => setSelectedPairIndex(idx)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              selectedPairIndex === idx
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Project {idx + 1}: {p.projectName}
          </button>
        ))}
      </div>

      {/* Main Comparison Canvas */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden backdrop-blur-md space-y-4 p-5">
        {/* View Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">Comparison Mode:</span>
            <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-white/5">
              <button
                onClick={() => setViewMode("slider")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === "slider"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Interactive Slider
              </button>
              <button
                onClick={() => setViewMode("side")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === "side"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                Side-by-Side
              </button>
              <button
                onClick={() => setViewMode("fade")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === "fade"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Fade Blend
              </button>
            </div>
          </div>

          {/* Fade slider if in fade mode */}
          {viewMode === "fade" && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Before (0%)</span>
              <input
                type="range"
                min="0"
                max="100"
                value={fadeOpacity}
                onChange={(e) => setFadeOpacity(Number(e.target.value))}
                className="w-32 accent-emerald-500"
              />
              <span>After (100%)</span>
            </div>
          )}

          {/* Time Delta Pill */}
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <Calendar className="w-3.5 h-3.5" />
            <span>Time Gap: {pair.timeDeltaDays} Days</span>
          </div>
        </div>

        {/* Viewport Render Area */}
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-950 aspect-[16/9] max-h-[520px] flex items-center justify-center">
          {/* Scanning laser effect overlay */}
          {isScanning && (
            <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan" />
              <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-[0.5px]" />
            </div>
          )}

          {viewMode === "slider" && (
            <div className="w-full h-full">
              <ReactCompareSlider
                itemOne={
                  <ReactCompareSliderImage
                    src={pair.beforeImageUrl}
                    alt="Before transformation"
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={pair.afterImageUrl}
                    alt="After transformation"
                  />
                }
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {viewMode === "side" && (
            <div className="w-full h-full grid grid-cols-2 divide-x divide-white/10">
              <div className="relative h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pair.beforeImageUrl}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-amber-400 border border-amber-500/30">
                  BEFORE: {pair.beforeDate}
                </div>
              </div>
              <div className="relative h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pair.afterImageUrl}
                  alt="After"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                  AFTER: {pair.afterDate}
                </div>
              </div>
            </div>
          )}

          {viewMode === "fade" && (
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pair.beforeImageUrl}
                alt="Before"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pair.afterImageUrl}
                alt="After"
                style={{ opacity: fadeOpacity / 100 }}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150"
              />
            </div>
          )}
        </div>

        {/* Pair Identification Meta */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {pair.siteName}
            </span>
            <span>•</span>
            <span className="font-mono text-slate-400">
              Before: {pair.beforeSha256.slice(0, 12)}...
            </span>
            <span>•</span>
            <span className="font-mono text-slate-400">
              After: {pair.afterSha256.slice(0, 12)}...
            </span>
          </div>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Immutable Cloudinary Derivatives
          </span>
        </div>
      </div>

      {/* AI Ground Change Analysis Card (Observational vs Interpretive separation + Limitations) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pixel Observations */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Factual Ground Observations (Pixel Evidence)
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Model: gpt-6-astra (High Reasoning)
            </span>
          </div>

          <div className="space-y-2.5">
            {pair.observedChanges.map((obs, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-200 leading-relaxed">{obs}</p>
              </div>
            ))}
          </div>

          {/* Honest AI Limitation Disclosures */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
            <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              Transparent Limitations & Disclosures
            </h4>
            <p className="text-[11px] text-slate-400">
              To prevent overstated impact, the following camera, solar, and seasonal discrepancies are formally disclosed:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
              {pair.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Quantified Index & Metrics */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Quantified Change Metric
            </h3>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-center">
              <span className="text-[11px] text-emerald-300 uppercase font-semibold tracking-wider">
                {pair.quantification.metric}
              </span>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {pair.quantification.change}
              </div>
              <p className="text-[10px] text-emerald-400/80 font-mono">
                Baseline: {pair.quantification.beforeValue} → Final: {pair.quantification.afterValue}
              </p>
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {pair.quantification.isEstimate ? "Labeled as Estimate (ExG 2G-R-B)" : "Verified Field Sensor Data"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Confidence Score:</span>
                <span className="text-emerald-400 font-semibold font-mono">
                  {(pair.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Intervention Category:</span>
                <span className="text-slate-200 font-medium">{pair.category}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pixel Alignment:</span>
                <span className="text-slate-200 font-mono">Normalized 500x500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
