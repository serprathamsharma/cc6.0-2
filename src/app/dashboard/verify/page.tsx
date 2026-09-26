"use client";

import {
  ShieldCheck,
  AlertTriangle,
  Check,
  X,
  ImageIcon,
  MapPin,
  Clock,
  Hash,
  Eye,
  Link2,
} from "lucide-react";

const DEMO_QUEUE = [
  {
    id: "v-1",
    caption: "Tree planting activity near Bellandur Lake",
    capturedAt: "2025-06-15",
    uploadedAt: "2025-06-16",
    flags: [] as string[],
    gpsLat: 12.935,
    gpsLng: 77.667,
    status: "pending" as const,
  },
  {
    id: "v-2",
    caption: "School water tank installation — exterior view",
    capturedAt: "2025-08-10",
    uploadedAt: "2025-08-12",
    flags: ["EXIF date mismatch: 2 day gap between capture and upload"],
    gpsLat: 26.912,
    gpsLng: 75.787,
    status: "pending" as const,
  },
  {
    id: "v-3",
    caption: "River bank cleanup progress — morning session",
    capturedAt: null,
    uploadedAt: "2025-07-20",
    flags: ["Missing GPS data", "Missing capture date"],
    gpsLat: null,
    gpsLng: null,
    status: "pending" as const,
  },
];

export default function VerifyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Verification Queue
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {DEMO_QUEUE.length} assets pending review — verify evidence authenticity
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending", count: 3, color: "amber" },
          { label: "Verified", count: 0, color: "emerald" },
          { label: "Rejected", count: 0, color: "red" },
          { label: "Flagged", count: 2, color: "orange" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 border border-white/5"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                stat.color === "amber" ? "bg-amber-400" :
                stat.color === "emerald" ? "bg-emerald-400" :
                stat.color === "red" ? "bg-red-400" :
                "bg-orange-400"
              }`}
            />
            <div>
              <p className="text-lg font-bold text-white">{stat.count}</p>
              <p className="text-[10px] text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Queue */}
      <div className="space-y-3">
        {DEMO_QUEUE.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-white/5 bg-slate-800/50 backdrop-blur-sm overflow-hidden hover:border-white/10 transition-all"
          >
            <div className="flex flex-col md:flex-row">
              {/* Thumbnail */}
              <div className="w-full md:w-48 aspect-[4/3] md:aspect-auto bg-slate-900/50 flex items-center justify-center text-slate-700 flex-shrink-0">
                <ImageIcon className="w-12 h-12" />
              </div>

              {/* Details */}
              <div className="flex-1 p-4">
                <p className="text-sm text-slate-300 mb-3">{item.caption}</p>

                <div className="flex items-center gap-4 text-[10px] text-slate-500 mb-3">
                  {item.capturedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Captured: {item.capturedAt}
                    </span>
                  )}
                  {item.gpsLat && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.gpsLat.toFixed(3)}, {item.gpsLng?.toFixed(3)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    SHA-256 verified
                  </span>
                </div>

                {/* Flags */}
                {item.flags.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {item.flags.map((flag) => (
                      <div
                        key={flag}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span className="text-[10px] text-amber-400">{flag}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                    Verify
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors">
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-xs hover:bg-white/10 transition-colors">
                    <Link2 className="w-3.5 h-3.5" />
                    Provenance
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-xs hover:bg-white/10 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify Chain
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
