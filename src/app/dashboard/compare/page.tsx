"use client";

import { useState } from "react";
import {
  GitCompareArrows,
  ArrowLeftRight,
  Check,
  X,
  ImageIcon,
  MapPin,
  Clock,
  Eye,
} from "lucide-react";

const DEMO_PAIRS = [
  {
    id: "pair-1",
    beforeCaption: "Barren land with scattered debris near the lake",
    afterCaption: "Young saplings planted in rows, debris cleared",
    gpsDistance: 12,
    timeGap: 180,
    status: "confirmed",
    site: "Bellandur Lake, Bangalore",
  },
  {
    id: "pair-2",
    beforeCaption: "Dry school yard with no water infrastructure",
    afterCaption: "New water tank and hand pump installed in school yard",
    gpsDistance: 5,
    timeGap: 120,
    status: "suggested",
    site: "Village School, Jaipur",
  },
  {
    id: "pair-3",
    beforeCaption: "Polluted river bank with plastic waste visible",
    afterCaption: "Clean river bank with vegetation growing along edges",
    gpsDistance: 8,
    timeGap: 90,
    status: "suggested",
    site: "Yamuna Bank, Delhi",
  },
];

export default function ComparePage() {
  const [selectedView, setSelectedView] = useState<"slider" | "side-by-side" | "fade">("slider");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Before/After Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {DEMO_PAIRS.length} pairs detected — confirm or reject suggested matches
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 border border-white/5 p-0.5">
          {(["slider", "side-by-side", "fade"] as const).map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedView === view
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              {view.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Pairs list */}
      <div className="space-y-4">
        {DEMO_PAIRS.map((pair) => (
          <div
            key={pair.id}
            className="rounded-xl border border-white/5 bg-slate-800/50 backdrop-blur-sm overflow-hidden hover:border-white/10 transition-all cursor-pointer"
          >
            <div className="flex flex-col md:flex-row">
              {/* Before */}
              <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 uppercase tracking-wider">
                    Before
                  </span>
                </div>
                <div className="aspect-[16/10] rounded-lg bg-slate-900/50 flex items-center justify-center text-slate-700 mb-3">
                  <ImageIcon className="w-12 h-12" />
                </div>
                <p className="text-xs text-slate-400">{pair.beforeCaption}</p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center px-3">
                <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
              </div>

              {/* After */}
              <div className="flex-1 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 uppercase tracking-wider">
                    After
                  </span>
                </div>
                <div className="aspect-[16/10] rounded-lg bg-slate-900/50 flex items-center justify-center text-slate-700 mb-3">
                  <ImageIcon className="w-12 h-12" />
                </div>
                <p className="text-xs text-slate-400">{pair.afterCaption}</p>
              </div>
            </div>

            {/* Meta + Actions */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/30 border-t border-white/5">
              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {pair.site} ({pair.gpsDistance}m apart)
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {pair.timeGap} days gap
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                    pair.status === "confirmed"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {pair.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-colors">
                  <Check className="w-3 h-3" />
                  Confirm
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors">
                  <X className="w-3 h-3" />
                  Reject
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 text-slate-400 text-xs hover:bg-white/10 transition-colors">
                  <Eye className="w-3 h-3" />
                  Analyze
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
