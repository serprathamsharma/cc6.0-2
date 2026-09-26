"use client";

import {
  ImageIcon,
  ShieldCheck,
  FolderOpen,
  MapPin,
  GitCompareArrows,
  Leaf,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

// Demo KPI data
const kpis = [
  { label: "Total Assets", value: "0", icon: ImageIcon, color: "emerald", change: null },
  { label: "Verified", value: "0%", icon: ShieldCheck, color: "blue", change: null },
  { label: "Projects", value: "0", icon: FolderOpen, color: "purple", change: null },
  { label: "Sites", value: "0", icon: MapPin, color: "amber", change: null },
  { label: "Before/After Pairs", value: "0", icon: GitCompareArrows, color: "teal", change: null },
  { label: "Est. Green Cover Δ", value: "—", icon: Leaf, color: "green", change: null },
];

const colorClasses: Record<string, { bg: string; text: string; shadow: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", shadow: "shadow-emerald-500/10" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", shadow: "shadow-blue-500/10" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", shadow: "shadow-purple-500/10" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", shadow: "shadow-amber-500/10" },
  teal: { bg: "bg-teal-500/10", text: "text-teal-400", shadow: "shadow-teal-500/10" },
  green: { bg: "bg-green-500/10", text: "text-green-400", shadow: "shadow-green-500/10" },
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Impact Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time overview of your organization&apos;s field evidence and impact metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const colors = colorClasses[kpi.color];
          return (
            <div
              key={kpi.label}
              className={`relative overflow-hidden rounded-xl border border-white/5 bg-slate-800/50 backdrop-blur-sm p-4 transition-all duration-300 hover:border-white/10 hover:shadow-lg ${colors.shadow}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <kpi.icon className={`w-4 h-4 ${colors.text}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>

              {/* Decorative gradient */}
              <div
                className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${colors.bg} blur-2xl opacity-30`}
              />
            </div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map placeholder */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-slate-800/50 backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Project Sites
            </h2>
          </div>
          <div className="h-80 flex items-center justify-center text-slate-600">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="text-sm">Upload assets to see project sites on the map</p>
            </div>
          </div>
        </div>

        {/* Activity breakdown */}
        <div className="rounded-xl border border-white/5 bg-slate-800/50 backdrop-blur-sm">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Activity Breakdown
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {["Planting", "Cleanup", "Construction", "Water Access", "Education"].map((activity) => (
              <div key={activity} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">{activity}</span>
                    <span className="text-xs text-slate-500">0</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500/30 w-0 transition-all duration-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data quality panel */}
      <div className="rounded-xl border border-white/5 bg-slate-800/50 backdrop-blur-sm">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Data Quality
          </h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: "Missing GPS", count: 0, severity: "warning" },
            { label: "Unverified", count: 0, severity: "info" },
            { label: "Low Quality", count: 0, severity: "warning" },
            { label: "Near Duplicates", count: 0, severity: "info" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-900/50 border border-white/5"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  item.severity === "warning"
                    ? "bg-amber-400"
                    : "bg-blue-400"
                }`}
              />
              <div>
                <p className="text-lg font-bold text-white">{item.count}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
