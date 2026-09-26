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
} from "lucide-react";
import { ImpactMap, type MapPoint } from "@/components/map/ImpactMap";

const KPIS = [
  {
    label: "Total Evidence Assets",
    value: "68",
    change: "+12 this month",
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
    label: "Before/After Verified Pairs",
    value: "6",
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
];

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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] flex items-center gap-1.5"
            >
              Explore Evidence Library <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/compare"
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold border border-white/10 transition-all flex items-center gap-1.5"
            >
              Before/After Engine
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {KPIS.map((kpi, idx) => {
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
    </div>
  );
}
