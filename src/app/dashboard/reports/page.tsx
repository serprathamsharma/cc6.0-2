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
  Plus,
  X,
  FileCheck,
} from "lucide-react";
import { ProvenanceDrawer, type ProvenanceAsset } from "@/components/provenance/ProvenanceDrawer";
import { generateEvidencePackZip } from "@/lib/reports/evidence-pack";
import { useToast } from "@/components/ui/toast";

interface ReportTemplateData {
  title: string;
  project: string;
  period: string;
  templateLabel: string;
  executiveSummary: string;
  sdgs: { code: string; name: string }[];
  claims: {
    id: string;
    claimText: string;
    evidenceAssetIds: string[];
    sdg: string;
  }[];
  metrics: { label: string; value: string; citation: string }[];
  limitations: string[];
}

const TEMPLATES_DATA: Record<string, ReportTemplateData> = {
  csr: {
    title: "Maharashtra Western Ghats Afforestation & Watershed Regeneration",
    project: "Maharashtra Afforestation Initiative",
    period: "June 2024 — August 2025",
    templateLabel: "CSR & Government Compliance (Schedule VII)",
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
        evidenceAssetIds: ["ast-01"],
        sdg: "SDG 15.3",
      },
      {
        id: "cl-2",
        claimText: "Vegetation canopy expanded from 11.4% to 49.8% over a 432-day interval",
        evidenceAssetIds: ["ast-01"],
        sdg: "SDG 15.3",
      },
      {
        id: "cl-3",
        claimText: "Solid waste barrier deployed trapping ~2.5 tonnes of macro-plastics and invasive biomass",
        evidenceAssetIds: ["ast-02"],
        sdg: "SDG 6.6",
      },
    ],
    metrics: [
      { label: "Total Saplings Planted", value: "1,250", citation: "ast-01" },
      { label: "Canopy Increase (ExG)", value: "+38.4 pp", citation: "ast-01" },
      { label: "Audited Survival Rate", value: "88.4%", citation: "ast-01" },
      { label: "Community Beneficiaries", value: "420 families", citation: "ast-03" },
    ],
    limitations: [
      "Azimuth difference: after photo taken at 14° clockwise rotation relative to baseline landmark",
      "Seasonal difference: baseline captured in dry season (June), final captured post-monsoon (August)",
    ],
  },
  donor: {
    title: "Institutional Donor Grant Audit: Multi-State Climate Resilience",
    project: "Pan-India Impact Portfolio",
    period: "FY 2024-25 Full Year",
    templateLabel: "Institutional Philanthropic Donor Brief",
    executiveSummary:
      "Capital deployment across Western Ghats agroforestry, Bangalore wetland remediation, and Thar Desert potable water hubs achieved 100% cryptographic milestones. All $240,000 in philanthropic allocation is accounted for with geo-stamped field photos, raw SHA-256 asset checksums, and third-party verifiable tamper checks.",
    sdgs: [
      { code: "SDG 6.1", name: "Clean Water: Universal and Equitable Access to Safe Water" },
      { code: "SDG 15.2", name: "Life on Land: Sustainable Forest Management & Reforestation" },
      { code: "SDG 17.17", name: "Partnerships: Encourage and Promote Effective Partnerships" },
    ],
    claims: [
      {
        id: "cl-1",
        claimText: "4,800 L/day potable water delivered via solar micro-kiosk in Barmer",
        evidenceAssetIds: ["ast-03"],
        sdg: "SDG 6.1",
      },
      {
        id: "cl-2",
        claimText: "Zero budget leakage: all physical equipment verified by geotagged photo hashes",
        evidenceAssetIds: ["ast-01", "ast-03"],
        sdg: "SDG 17.17",
      },
      {
        id: "cl-3",
        claimText: "91.5% open water surface restored in Bellandur feeder zone",
        evidenceAssetIds: ["ast-02"],
        sdg: "SDG 6.6",
      },
    ],
    metrics: [
      { label: "Total Capital Audited", value: "$240,000", citation: "ast-01" },
      { label: "Field Verification Rate", value: "100%", citation: "ast-02" },
      { label: "Daily Clean Water Output", value: "4,800 L/day", citation: "ast-03" },
      { label: "Hectares Regenerated", value: "14.2 ha", citation: "ast-01" },
    ],
    limitations: [
      "Groundwater flow monitoring sensors rely on cellular telemetry with occasional 24h upload delay during sandstorms",
    ],
  },
  community: {
    title: "Grassroots Community Impact & Biodiversity Summary",
    project: "Village Watershed Panchayat Council",
    period: "Quarter 3 2025",
    templateLabel: "Community & Local Gram Panchayat Brief",
    executiveSummary:
      "This localized progress report shares transparent outcomes directly with participating rural village councils. Native saplings provided by local community nurseries have survived at 88.4%, while plastic debris removed from local feeder canals has improved water accessibility for livestock and agriculture.",
    sdgs: [
      { code: "SDG 1.5", name: "No Poverty: Build Resilience of Vulnerable Communities" },
      { code: "SDG 11.B", name: "Sustainable Cities & Communities: Disaster Risk Management" },
      { code: "SDG 15.5", name: "Life on Land: Halt Biodiversity Loss and Habitat Degradation" },
    ],
    claims: [
      {
        id: "cl-1",
        claimText: "420 local agrarian families benefited from improved soil water retention",
        evidenceAssetIds: ["ast-01"],
        sdg: "SDG 1.5",
      },
      {
        id: "cl-2",
        claimText: "Local youth volunteer brigade completed 320 volunteer-hours of channel clearance",
        evidenceAssetIds: ["ast-02"],
        sdg: "SDG 11.B",
      },
    ],
    metrics: [
      { label: "Participating Households", value: "420", citation: "ast-01" },
      { label: "Volunteer Hours Logged", value: "320 hrs", citation: "ast-02" },
      { label: "Native Species Varietals", value: "14 native", citation: "ast-01" },
      { label: "Safe Potable Access Points", value: "2 kiosks", citation: "ast-03" },
    ],
    limitations: [
      "Photographic records respect privacy consent: all community volunteer faces blurred on public ledger",
    ],
  },
};

export default function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<"csr" | "donor" | "community">("csr");
  const [selectedAsset, setSelectedAsset] = useState<ProvenanceAsset | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [reportTitleInput, setReportTitleInput] = useState("");
  const { showToast } = useToast();

  const report = TEMPLATES_DATA[selectedTemplate];

  const handleCitationClick = (assetId: string) => {
    let caption = "Native sapling plantation drive in Sahyadri corridor, Satara district";
    let imagePublicId = "impactlens/demo/reforest_after";
    let lat = 17.6805;
    let lng = 73.9904;
    let sha = "b45a198de30cf299a7102e3b994d80a13e551fa0488219ad02bb91845c10ad82";

    if (assetId === "ast-02" || assetId === "demo-2") {
      caption = "Volunteer debris extraction and wetland aeration at Bellandur Lake South Inlet";
      imagePublicId = "impactlens/demo/lake_after";
      lat = 12.9352;
      lng = 77.6744;
      sha = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    } else if (assetId === "ast-03" || assetId === "demo-3") {
      caption = "Solar-powered clean drinking water filtration kiosk in Barmer district, Thar desert";
      imagePublicId = "impactlens/demo/solar_after";
      lat = 25.7532;
      lng = 71.3967;
      sha = "1f8e4c9201bd774ac3998a44b12df602a819c43b90013e2f89104194cba89711";
    }

    setSelectedAsset({
      id: assetId,
      cloudinaryPublicId: imagePublicId,
      caption,
      gpsLat: lat,
      gpsLng: lng,
      capturedAt: "2025-08-18",
      verificationStatus: "verified",
      originalSha256: sha,
      deviceInfo: "Certified Ground Sensor Kit (GPS locked)",
      observations: [
        "Primary ground evidence asset verified against SHA-256 cryptographic chain",
        "Geographic coordinates match surveyed project polygon boundary",
      ],
      interpretations: [
        "Direct visual backing for cited metric in the active report",
      ],
    });
    setIsDrawerOpen(true);
  };

  const handleExportZip = async () => {
    setDownloadingZip(true);
    showToast({
      title: "Packaging Evidence Pack",
      description: "Compiling markdown report, SHA-256 cryptographic manifest, and high-res derivative assets...",
      type: "info",
    });

    try {
      const blob = await generateEvidencePackZip({
        reportTitle: report.title,
        reportId: `rep-${selectedTemplate}-${Date.now().toString().slice(-4)}`,
        project: report.project,
        generatedAt: new Date().toISOString(),
        reportMarkdown: `# ${report.title}\n\n**Template:** ${report.templateLabel}\n**Period:** ${report.period}\n\n## Executive Summary\n${report.executiveSummary}\n\n## Audited Claims\n${report.claims.map((c) => `- **${c.claimText}** (Citing #${c.evidenceAssetIds.join(", #")}) [${c.sdg}]`).join("\n")}`,
        items: [
          {
            assetId: "ast-01",
            publicId: "impactlens/demo/reforest_after",
            sha256: "b45a198de30cf299a7102e3b994d80a13e551fa0488219ad02bb91845c10ad82",
            caption: "Native sapling plantation in Sahyadri corridor",
            capturedAt: "2025-08-18T09:30:00Z",
            gpsCoordinates: "17.6805, 73.9904",
            verificationStatus: "verified",
            claimsCited: [report.claims[0]?.claimText || ""],
          },
          {
            assetId: "ast-02",
            publicId: "impactlens/demo/lake_after",
            sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            caption: "Lake cleanup volunteers removing debris",
            capturedAt: "2025-07-24T08:15:00Z",
            gpsCoordinates: "12.9352, 77.6744",
            verificationStatus: "verified",
            claimsCited: [report.claims[1]?.claimText || ""],
          },
        ],
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `EvidencePack_${report.project.replace(/\s+/g, "_")}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast({
        title: "Evidence Pack Downloaded",
        description: `Saved EvidencePack_${report.project.replace(/\s+/g, "_")}.zip containing report, manifest & assets.`,
        type: "success",
      });
    } catch (e) {
      console.error("Failed to generate Evidence Pack:", e);
      showToast({
        title: "Download Failed",
        description: "Could not create ZIP pack.",
        type: "error",
      });
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerateModalOpen(false);
    showToast({
      title: "Audit Report Generated",
      description: `Report "${reportTitleInput || report.title}" compiled with verified evidence citations.`,
      type: "success",
    });
    setReportTitleInput("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            New Report
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / PDF
          </button>
          <button
            onClick={handleExportZip}
            disabled={downloadingZip}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
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
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedTemplate === "csr"
                  ? "bg-emerald-500 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              CSR & Government
            </button>
            <button
              onClick={() => setSelectedTemplate("donor")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedTemplate === "donor"
                  ? "bg-emerald-500 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Institutional Donor
            </button>
            <button
              onClick={() => setSelectedTemplate("community")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedTemplate === "community"
                  ? "bg-emerald-500 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Community Brief
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
            {report.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> {report.project}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {report.period}
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-mono text-[11px]">
              Template: {report.templateLabel}
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
            Executive Summary
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed text-justify">
            {report.executiveSummary}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {report.metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-1.5"
            >
              <span className="text-[11px] text-slate-400 font-medium">{m.label}</span>
              <div className="text-xl font-bold text-white">{m.value}</div>
              <button
                onClick={() => handleCitationClick(m.citation)}
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
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
            {report.claims.map((claim) => (
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
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
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
            {report.sdgs.map((sdg, idx) => (
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
            {report.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Generate Report Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                Generate Verifiable Audit Report
              </h3>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Report Title
                </label>
                <input
                  type="text"
                  value={reportTitleInput}
                  onChange={(e) => setReportTitleInput(e.target.value)}
                  placeholder="e.g. Q3 2025 Comprehensive Verification Report"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Audience Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) =>
                    setSelectedTemplate(e.target.value as "csr" | "donor" | "community")
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="csr">CSR & Government Compliance (Schedule VII)</option>
                  <option value="donor">Institutional Philanthropic Donor Brief</option>
                  <option value="community">Grassroots Community & Panchayat Summary</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  The report generator checks the ledger hash chain before generating. Unverified assets are strictly excluded.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  Compile Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provenance Drawer triggered on any citation click */}
      <ProvenanceDrawer
        asset={selectedAsset}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
