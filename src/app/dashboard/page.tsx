"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ImageIcon,
  ShieldCheck,
  FolderOpen,
  MapPin,
  GitCompareArrows,
  Leaf,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Globe,
  Layers,
  ChevronRight,
  Clock,
  ExternalLink,
} from "lucide-react";
import { ImpactMap, type MapPoint } from "@/components/map/ImpactMap";
import { ProvenanceDrawer, type ProvenanceAsset } from "@/components/provenance/ProvenanceDrawer";
import { getAssetImageUrl } from "@/lib/utils/asset-image";

interface KPIData {
  label: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}

const KPIS_BY_TIMEFRAME: Record<string, KPIData[]> = {
  "30d": [
    {
      label: "Evidence Assets Added",
      value: "24",
      change: "+12 vs prev 30d",
      icon: ImageIcon,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Verified Ground Truth",
      value: "95.8%",
      change: "23 of 24 verified",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Active Projects",
      value: "3",
      change: "Maharashtra, Bangalore, Rajasthan",
      icon: FolderOpen,
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Before/After Change Pairs",
      value: "3",
      change: "100% viewpoint aligned",
      icon: GitCompareArrows,
      color: "from-purple-500 to-indigo-500",
    },
    {
      label: "Mean Green Cover Growth",
      value: "+38.4%",
      change: "ExG (2G - R - B) metric",
      icon: Leaf,
      color: "from-emerald-500 to-green-600",
    },
    {
      label: "Cryptographic Audit",
      value: "Chain Intact",
      change: "Zero broken hashes",
      icon: ShieldCheck,
      color: "from-teal-500 to-emerald-600",
    },
  ],
  qtd: [
    {
      label: "Evidence Assets Added",
      value: "48",
      change: "Across 4 field survey drives",
      icon: ImageIcon,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Verified Ground Truth",
      value: "93.7%",
      change: "45 of 48 verified",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Active Projects",
      value: "3",
      change: "14 field monitoring sites",
      icon: FolderOpen,
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Before/After Change Pairs",
      value: "5",
      change: "Spectral index verified",
      icon: GitCompareArrows,
      color: "from-purple-500 to-indigo-500",
    },
    {
      label: "Mean Green Cover Growth",
      value: "+41.2%",
      change: "Post-monsoon seasonal peak",
      icon: Leaf,
      color: "from-emerald-500 to-green-600",
    },
    {
      label: "Cryptographic Audit",
      value: "Chain Intact",
      change: "Verified on Merkle tree",
      icon: ShieldCheck,
      color: "from-teal-500 to-emerald-600",
    },
  ],
  all: [
    {
      label: "Total Evidence Assets",
      value: "68",
      change: "100% immutable derivatives",
      icon: ImageIcon,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Verified Ground Truth",
      value: "94.1%",
      change: "64 of 68 verified",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Active Projects",
      value: "3",
      change: "Maharashtra, Bangalore, Rajasthan",
      icon: FolderOpen,
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Before/After Change Pairs",
      value: "6",
      change: "Dual-date matched pairs",
      icon: GitCompareArrows,
      color: "from-purple-500 to-indigo-500",
    },
    {
      label: "Mean Green Cover Growth",
      value: "+38.4%",
      change: "Weighted project average",
      icon: Leaf,
      color: "from-emerald-500 to-green-600",
    },
    {
      label: "Cryptographic Audit",
      value: "Chain Intact",
      change: "Zero ledger discrepancies",
      icon: ShieldCheck,
      color: "from-teal-500 to-emerald-600",
    },
  ],
};

const MAP_POINTS: MapPoint[] = [
  {
    id: "satara-1",
    lat: 17.6805,
    lng: 73.9904,
    title: "Sahyadri Reforestation Parcel 4 (Satara)",
    status: "verified",
  },
  {
    id: "bangalore-1",
    lat: 12.9352,
    lng: 77.6675,
    title: "Bellandur Wetland South Inlet Feeder",
    status: "verified",
  },
  {
    id: "barmer-1",
    lat: 25.7532,
    lng: 71.3967,
    title: "Community RO Solar Water Station (Barmer)",
    status: "verified",
  },
];

const SDG_CONTRIBUTIONS = [
  {
    code: "SDG 15",
    name: "Life on Land",
    percentage: 54,
    color: "bg-emerald-500",
    description: "1,250 native saplings planted in Western Ghats corridor",
  },
  {
    code: "SDG 6",
    name: "Clean Water & Sanitation",
    percentage: 28,
    color: "bg-blue-500",
    description: "2.5 tonnes lake waste extracted & solar filtration unit live",
  },
  {
    code: "SDG 13",
    name: "Climate Action",
    percentage: 18,
    color: "bg-amber-500",
    description: "Carbon sink expansion and community drought resilience",
  },
];

const RECENT_EVIDENCE = [
  {
    id: "ast-01",
    cloudinaryPublicId: "impactlens/demo/reforest_after",
    caption: "Native sapling canopy along Western Ghats ridge",
    project: "Maharashtra Afforestation",
    date: "Aug 18, 2025",
    status: "verified",
    sha: "b45a198de30cf299a7102e3b994d80a13e551fa0488219ad02bb91845c10ad82",
    gpsLat: 17.6805,
    gpsLng: 73.9904,
  },
  {
    id: "ast-02",
    cloudinaryPublicId: "impactlens/demo/lake_after",
    caption: "Bellandur lake south inlet after debris extraction",
    project: "Bellandur Cleanup",
    date: "Jul 24, 2025",
    status: "verified",
    sha: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    gpsLat: 12.9352,
    gpsLng: 77.6744,
  },
  {
    id: "ast-03",
    cloudinaryPublicId: "impactlens/demo/solar_after",
    caption: "Solar-powered clean drinking water filtration kiosk",
    project: "Barmer Clean Water",
    date: "Sep 15, 2025",
    status: "verified",
    sha: "1f8e4c9201bd774ac3998a44b12df602a819c43b90013e2f89104194cba89711",
    gpsLat: 25.7532,
    gpsLng: 71.3967,
  },
  {
    id: "ast-04",
    cloudinaryPublicId: "impactlens/demo/mangrove",
    caption: "Intertidal coastal mangrove propagule restoration",
    project: "Sundarbans Mangrove",
    date: "Jun 30, 2025",
    status: "verified",
    sha: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    gpsLat: 21.9497,
    gpsLng: 88.8999,
  },
];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"30d" | "qtd" | "all">("all");
  const [selectedAsset, setSelectedAsset] = useState<ProvenanceAsset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const kpis = KPIS_BY_TIMEFRAME[timeRange];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Media-Intelligence Platform for Ground Truth
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Verifiable Impact Intelligence
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Trace field photos and videos from raw Cloudinary upload through AI vision analysis and immutable cryptographic hash-chaining to audited donor reports.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <Link
              href="/dashboard/library"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer"
            >
              Explore Evidence Library <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/compare"
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Before/After Engine
            </Link>
            <Link
              href="/dashboard/verify"
              className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Verify Ledger
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Audited Impact Telemetry
        </h2>
        <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/5 text-xs">
          <button
            onClick={() => setTimeRange("30d")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeRange === "30d"
                ? "bg-emerald-500 text-white font-medium shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange("qtd")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeRange === "qtd"
                ? "bg-emerald-500 text-white font-medium shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Quarter to Date
          </button>
          <button
            onClick={() => setTimeRange("all")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              timeRange === "all"
                ? "bg-emerald-500 text-white font-medium shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 backdrop-blur-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{kpi.label}</span>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.color} text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white tracking-tight">{kpi.value}</div>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                  {kpi.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Center Layout: Map and SDG Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Active Geographic Intervention Zones
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">3 Verified Clusters</span>
          </div>

          <ImpactMap points={MAP_POINTS} className="w-full h-[360px] rounded-2xl overflow-hidden border border-white/5" />
        </div>

        {/* SDG Contribution Breakdown */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              UN Sustainable Development Goals
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Field evidence auto-mapped to targeted global SDG milestones.
            </p>
          </div>

          <div className="space-y-4 my-2">
            {SDG_CONTRIBUTIONS.map((sdg) => (
              <div key={sdg.code} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{sdg.code}: {sdg.name}</span>
                  <span className="font-mono text-emerald-400">{sdg.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${sdg.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${sdg.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">{sdg.description}</p>
              </div>
            ))}
          </div>

          {/* Responsible AI Safety Card */}
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Responsible AI & Privacy Protection
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1">
              <li>✓ One-click face blurring on derivative outputs</li>
              <li>✓ Coarsened GPS precision for sensitive habitats</li>
              <li>✓ No human facial identification</li>
              <li>✓ Clear AI-generated vs Original badge on every asset</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Verified Field Evidence Carousel / Stream */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              Recent Verified Field Evidence Stream
            </h3>
          </div>
          <Link
            href="/dashboard/library"
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
          >
            View All in Library <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RECENT_EVIDENCE.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedAsset({
                  id: item.id,
                  cloudinaryPublicId: item.cloudinaryPublicId,
                  caption: item.caption,
                  gpsLat: item.gpsLat,
                  gpsLng: item.gpsLng,
                  capturedAt: item.date,
                  verificationStatus: item.status,
                  originalSha256: item.sha,
                  deviceInfo: "Certified Field Telemetry Sensor",
                });
                setDrawerOpen(true);
              }}
              className="group p-3 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer space-y-3"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAssetImageUrl(item, 300)}
                  alt={item.caption}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/demo-assets/reforest_after.jpg";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-1.5 left-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-emerald-400 text-[9px] font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {item.caption}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>{item.project}</span>
                  <span className="font-mono text-slate-500">{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provenance Drawer */}
      <ProvenanceDrawer
        asset={selectedAsset}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
