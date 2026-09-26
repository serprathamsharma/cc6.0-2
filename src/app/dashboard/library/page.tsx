"use client";

import { useState } from "react";
import {
  ImageIcon,
  Upload,
  Grid3X3,
  List,
  Filter,
  ShieldCheck,
  Clock,
  MapPin,
  Eye,
} from "lucide-react";

// Demo assets for when no real data exists
const DEMO_ASSETS = [
  {
    id: "demo-1",
    cloudinaryPublicId: "sample",
    resourceType: "image",
    caption: "Tree plantation activity in Maharashtra — saplings being planted along a rural road",
    activityTypes: ["planting"],
    verificationStatus: "verified",
    capturedAt: "2025-06-15",
    gpsLat: 19.076,
    gpsLng: 72.877,
    region: "Maharashtra, India",
  },
  {
    id: "demo-2",
    cloudinaryPublicId: "sample",
    resourceType: "image",
    caption: "Lake cleanup volunteers removing debris from Bellandur Lake shore",
    activityTypes: ["cleanup"],
    verificationStatus: "pending",
    capturedAt: "2025-07-20",
    gpsLat: 12.935,
    gpsLng: 77.667,
    region: "Karnataka, India",
  },
  {
    id: "demo-3",
    cloudinaryPublicId: "sample",
    resourceType: "image",
    caption: "Water infrastructure installation at a rural school — new hand pump and storage tank",
    activityTypes: ["water_access", "infrastructure"],
    verificationStatus: "pending",
    capturedAt: "2025-08-10",
    gpsLat: 26.912,
    gpsLng: 75.787,
    region: "Rajasthan, India",
  },
];

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  verified: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  rejected: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
};

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Asset Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {DEMO_ASSETS.length} assets across all projects
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center rounded-lg bg-slate-800/50 border border-white/5 p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Upload button */}
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <Upload className="w-4 h-4" />
            Upload Assets
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-white/5 text-slate-400 text-xs hover:text-white transition-colors">
          <Filter className="w-3 h-3" />
          Filters
        </button>
        {["All", "Verified", "Pending", "Images", "Videos"].map((filter) => (
          <button
            key={filter}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "All"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-slate-800/50 text-slate-500 border border-white/5 hover:text-white"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      <div
        className={`grid gap-4 ${
          viewMode === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        }`}
      >
        {DEMO_ASSETS.map((asset) => {
          const status = statusColors[asset.verificationStatus];
          return (
            <div
              key={asset.id}
              className="group relative rounded-xl border border-white/5 bg-slate-800/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-slate-900/50 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                  <ImageIcon className="w-16 h-16" />
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-sm text-white text-xs hover:bg-white/20 transition-colors">
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </div>
                </div>

                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${status.bg} backdrop-blur-sm`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    <span className={`text-[10px] font-medium ${status.text}`}>
                      {asset.verificationStatus}
                    </span>
                  </div>
                </div>

                {/* Original badge */}
                <div className="absolute top-2 left-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 backdrop-blur-sm">
                    <span className="text-[10px] font-medium text-blue-400">
                      Original
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {asset.caption}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {asset.capturedAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {asset.region}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {asset.activityTypes.map((type) => (
                    <span
                      key={type}
                      className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload modal (simplified) */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Upload Assets</h2>
              <button
                onClick={() => setShowUpload(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-12 text-center hover:border-emerald-500/30 transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p className="text-sm text-slate-400 mb-2">
                Drag and drop field photos and videos here
              </p>
              <p className="text-xs text-slate-600">
                Supports images (JPG, PNG, WebP) and videos (MP4, MOV)
              </p>
              <button className="mt-4 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors">
                Browse Files
              </button>
            </div>
            <p className="text-[10px] text-slate-600 mt-3 text-center">
              Uploads are signed and verified. EXIF metadata is preserved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
