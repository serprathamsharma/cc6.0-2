"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  ShieldCheck,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FolderOpen,
  Award,
} from "lucide-react";
import { ProvenanceDrawer, type ProvenanceAsset } from "@/components/provenance/ProvenanceDrawer";
import { generateEvidencePackZip } from "@/lib/reports/evidence-pack";

interface ReportClaim {
  id: string;
  claimText: string;
  evidenceAssetIds: string[];
  sdg: string;
}

const DEMO_REPORT = {
  id: "rep-2025-09",
  title: "Maharashtra Western Ghats Afforestation & Watershed Regeneration",
  project: "Maharashtra Reforestation Initiative",
  period: "June 2024 — August 2025",
  template: "CSR / Government Progress",
  executiveSummary:
    "During the 14-month monitoring cycle across Satara District watershed zones, our ground partners planted 1,250 native saplings with an audited 88.4% survival rate. Remote computer vision comparison using the Excess Green Index (ExG) confirms a +38.4 percentage point increase in green canopy coverage along terrace bunds. Every metric in this report is anchored to immutable Cloudinary evidence assets registered in our cryptographic ledger.",
  sdgs: [
    { code: "SDG 15.3", name: "Life on Land: Combat Desertification & Restore Degraded Land" },
    { code: "SDG 13.1", name: "Climate Action: Strengthen Resilience and Adaptive Capacity" },
    { code: "SDG 6.6", name: "Clean Water: Protect and Restore Water-Related Ecosystems" },
  ],
  claims: [
    {
      id: "cl-1",
      claimText: "1,250 native saplings planted across 3 designated contour slope parcels",
      evidenceAssetIds: ["demo-1"],
      sdg: "SDG 15.3",
    },
    {
      id: "cl-2",
      claimText: "Vegetation canopy expanded from 11.4% to 49.8% over a 432-day interval",
      evidenceAssetIds: ["demo-1"],
      sdg: "SDG 15.3",
    },
    {
      id: "cl-3",
      claimText: "Solid waste barrier deployed trapping ~2.5 tonnes of macro-plastics and invasive biomass",
      evidenceAssetIds: ["demo-2"],
      sdg: "SDG 6.6",
    },
  ],
  metrics: [
    { label: "Total Saplings Planted", value: "1,250", citation: "demo-1" },
    { label: "Canopy Increase (ExG)", value: "+38.4 pp", citation: "demo-1" },
    { label: "Audited Survival Rate", value: "88.4%", citation: "demo-1" },
    { label: "Community Beneficiaries", value: "420 families", citation: "demo-3" },
  ],
  limitations: [
    "Azimuth difference: after photo taken at 14° clockwise rotation relative to baseline landmark",
    "Seasonal difference: baseline captured in dry season (June), final captured post-monsoon (August)",
  ],
};

export default function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("csr");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<ProvenanceAsset | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const handleCitationClick = (assetId: string) => {
    setSelectedAsset({
      id: assetId,
      cloudinaryPublicId: assetId === "demo-1" ? "impactlens/mh-trees-01" : "impactlens/bellandur-cleanup-01",
      caption:
        assetId === "demo-1"
          ? "Native sapling plantation drive in Sahyadri corridor, Satara district"
          : "Volunteer debris extraction and wetland aeration at Bellandur Lake South Inlet",
      gpsLat: assetId === "demo-1" ? 17.6805 : 12.9352,
      gpsLng: assetId === "demo-1" ? 73.9904 : 77.6675,
      capturedAt: "2025-07-15",
      verificationStatus: "verified",
      originalSha256: "9a2f7c4e88d154bc0991e45f94b301ad5a932bc3e0a12cfd99214b7e801ad4f2",
      observations: [
        "12 freshly dug planting pits arranged at 2-meter intervals along contour bunds",
        "Biodegradable bamboo guards visible around young saplings",
      ],
      interpretations: [
        "Consistent with Phase 1 monsoon planting schedule for Western Ghats afforestation",
      ],
    });
    setIsDrawerOpen(true);
  };

  const handleExportZip = async () => {
    setDownloadingZip(true);
    try {
      const blob = await generateEvidencePackZip({
        reportTitle: DEMO_REPORT.title,
        reportId: DEMO_REPORT.id,
        project: DEMO_REPORT.project,
        generatedAt: new Date().toISOString(),
        reportMarkdown: `# ${DEMO_REPORT.title}\n\n${DEMO_REPORT.executiveSummary}`,
        items: [
          {
            assetId: "demo-1",
            publicId: "impactlens/mh-trees-01",
            sha256: "9a2f7c4e88d154bc0991e45f94b301ad5a932bc3e0a12cfd99214b7e801ad4f2",
            caption: "Native sapling plantation in Sahyadri corridor",
            capturedAt: "2025-07-15T09:30:00Z",
            gpsCoordinates: "17.6805, 73.9904",
            verificationStatus: "verified",
            claimsCited: [DEMO_REPORT.claims[0].claimText, DEMO_REPORT.claims[1].claimText],
          },
          {
            assetId: "demo-2",
            publicId: "impactlens/bellandur-cleanup-01",
            sha256: "b45a198de30cf299a7102e3b994d80a13e551fa0488219ad02bb91845c10ad82",
            caption: "Lake cleanup volunteers removing debris",
            capturedAt: "2025-08-22T08:15:00Z",
            gpsCoordinates: "12.9352, 77.6675",
            verificationStatus: "verified",
            claimsCited: [DEMO_REPORT.claims[2].claimText],
          },
        ],
      });

      // Trigger download in browser
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `EvidencePack_${DEMO_REPORT.project.replace(/\s+/g, "_")}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to generate Evidence Pack:", e);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Verifiable Reports & Evidence Packs
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              100% Ground Grounded
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Every statement is cryptographically bound to ≥1 original Cloudinary asset ID. Zero hallucination.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print / PDF
          </button>
          <button
            onClick={handleExportZip}
            disabled={downloadingZip}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloadingZip ? "Packaging ZIP..." : "Download Evidence Pack (.zip)"}
          </button>
        </div>
      </div>

      {/* Report Template Selector Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">Audience Template:</span>
          <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-white/5 text-xs">
            <button
              onClick={() => setSelectedTemplate("csr")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTemplate === "csr"
                  ? "bg-emerald-500 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              CSR & Government Progress
            </button>
            <button
              onClick={() => setSelectedTemplate("donor")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTemplate === "donor"
                  ? "bg-emerald-500 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Institutional Donor
            </button>
            <button
              onClick={() => setSelectedTemplate("community")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTemplate === "community"
                  ? "bg-emerald-500 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Community Impact Brief
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Rule: Schema strictly rejects claims without ≥1 evidence citation</span>
        </div>
      </div>

      {/* Rendered Impact Report Document */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl space-y-8 max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="border-b border-white/10 pb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">
              ImpactLens Verified Audit Report
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Cryptographic Chain Intact
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            {DEMO_REPORT.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> {DEMO_REPORT.project}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {DEMO_REPORT.period}
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
            Executive Summary
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed text-justify">
            {DEMO_REPORT.executiveSummary}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {DEMO_REPORT.metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-1.5"
            >
              <span className="text-[11px] text-slate-400 font-medium">{m.label}</span>
              <div className="text-xl font-bold text-white">{m.value}</div>
              <button
                onClick={() => handleCitationClick(m.citation)}
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                [Evidence #{m.citation}]
              </button>
            </div>
          ))}
        </div>

        {/* Verified Claims with Mandatory Citations */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
            Traceable Claims & Direct Evidence Citations
          </h3>
          <div className="space-y-3">
            {DEMO_REPORT.claims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 rounded-xl bg-slate-800/30 border border-white/5 space-y-2 hover:border-white/10 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-100 flex-1">
                    {claim.claimText}
                  </p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 shrink-0 self-start sm:self-auto">
                    {claim.sdg}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <span className="text-[11px] text-slate-500">Cited Evidence:</span>
                  {claim.evidenceAssetIds.map((astId) => (
                    <button
                      key={astId}
                      onClick={() => handleCitationClick(astId)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      #{astId}
                      <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SDG Alignment */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
            United Nations SDG Alignment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEMO_REPORT.sdgs.map((sdg, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-800/40 border border-white/5 space-y-1 text-xs"
              >
                <span className="font-bold text-emerald-400">{sdg.code}</span>
                <p className="text-slate-300 text-[11px]">{sdg.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Limitations & Disclosures */}
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
          <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Mandatory Integrity Disclosures & Limitations
          </h4>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
            {DEMO_REPORT.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Provenance Drawer triggered on any citation click */}
      <ProvenanceDrawer
        asset={selectedAsset}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
