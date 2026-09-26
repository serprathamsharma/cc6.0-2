"use client";

import { useState, useEffect } from "react";
import {
  ImageIcon,
  Upload,
  Grid3X3,
  List,
  Map as MapIcon,
  Clock,
  Filter,
  ShieldCheck,
  MapPin,
  Eye,
  CheckCircle2,
  Sparkles,
  Search,
} from "lucide-react";
import { ImpactMap, type MapPoint } from "@/components/map/ImpactMap";
import { ImpactTimeline, type TimelineEvent } from "@/components/timeline/ImpactTimeline";
import { ProvenanceDrawer, type ProvenanceAsset } from "@/components/provenance/ProvenanceDrawer";

// Initial realistic demo fixtures for Indian impact projects
const DEMO_FIXTURES: ProvenanceAsset[] = [
  {
    id: "demo-1",
    cloudinaryPublicId: "impactlens/mh-trees-01",
    resourceType: "image",
    caption: "Native sapling plantation drive in Sahyadri corridor, Satara district",
    capturedAt: "2025-07-15T09:30:00Z",
    gpsLat: 17.6805,
    gpsLng: 73.9904,
    deviceInfo: "Canon EOS R5 / 24-70mm f/2.8",
    originalSha256: "9a2f7c4e88d154bc0991e45f94b301ad5a932bc3e0a12cfd99214b7e801ad4f2",
    verificationStatus: "verified",
    observations: [
      "12 freshly dug planting pits arranged at 2-meter intervals along contour bunds",
      "Stakes and biodegradable bamboo guards visible around 8 young saplings",
      "Field team of 6 individuals wearing protective footwear and gloves",
    ],
    interpretations: [
      "Follows standard soil and moisture conservation guidelines for Western Ghats reforestation",
      "Consistent with Phase 1 monsoon planting schedule",
    ],
  },
  {
    id: "demo-2",
    cloudinaryPublicId: "impactlens/bellandur-cleanup-01",
    resourceType: "image",
    caption: "Volunteer debris extraction and wetland aeration at Bellandur Lake South Inlet",
    capturedAt: "2025-08-22T08:15:00Z",
    gpsLat: 12.9352,
    gpsLng: 77.6675,
    deviceInfo: "Sony Alpha 7 IV / 35mm f/1.8",
    originalSha256: "b45a198de30cf299a7102e3b994d80a13e551fa0488219ad02bb91845c10ad82",
    verificationStatus: "verified",
    observations: [
      "Submerged floating boom trapping macro-plastics and invasive water hyacinth mats",
      "2.5 metric ton municipal waste transport bin stationed on paved access road",
      "Turbidity meter reading visible on handheld device display: 42 NTU",
    ],
    interpretations: [
      "Noticeable reduction in solid surface debris compared to pre-monsoon baseline",
      "Aeration intervention active in targeted feeder channel",
    ],
  },
  {
    id: "demo-3",
    cloudinaryPublicId: "impactlens/rajasthan-water-01",
    resourceType: "image",
    caption: "Solar-powered community reverse-osmosis filtration unit commissioning, Barmer",
    capturedAt: "2025-09-10T14:45:00Z",
    gpsLat: 25.7532,
    gpsLng: 71.3967,
    deviceInfo: "DJI Mavic 3 Enterprise / Hasselblad 20MP",
    originalSha256: "7c19ad43e201b4998ca0f918420e11894d01ea598b0213cd99812fa4b01e33c1",
    verificationStatus: "pending",
    observations: [
      "5.2 kW photovoltaic array mounted on reinforced concrete roof slab",
      "Twin 5,000-liter food-grade polyethylene storage tanks connected to dispensing manifold",
      "Digital flow meter displaying cumulative output: 14,280 Liters",
    ],
    interpretations: [
      "Provides verified safe drinking water access for approximately 350 rural households",
      "Fully operational off-grid power supply verified under full sunlight",
    ],
  },
];

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map" | "timeline">("grid");
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assetsList, setAssetsList] = useState<ProvenanceAsset[]>(DEMO_FIXTURES);
  const [selectedAsset, setSelectedAsset] = useState<ProvenanceAsset | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Fetch real database assets on load
  useEffect(() => {
    fetch("/api/assets")
      .then((res) => res.json())
      .then((data) => {
        if (data.assets && data.assets.length > 0) {
          setAssetsList(data.assets);
        }
      })
      .catch((err) => console.warn("[Library] Using demo fixtures:", err));
  }, []);

  const filteredAssets = assetsList.filter((asset) => {
    const matchesSearch =
      !searchFilter ||
      (asset.caption && asset.caption.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (asset.deviceInfo && asset.deviceInfo.toLowerCase().includes(searchFilter.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || asset.verificationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenAsset = (asset: ProvenanceAsset) => {
    setSelectedAsset(asset);
    setIsDrawerOpen(true);
  };

  const handleStatusChange = (assetId: string, newStatus: "verified" | "rejected") => {
    setAssetsList((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, verificationStatus: newStatus } : a))
    );
    if (selectedAsset?.id === assetId) {
      setSelectedAsset((prev) => (prev ? { ...prev, verificationStatus: newStatus } : null));
    }
  };

  const mapPoints: MapPoint[] = filteredAssets
    .filter((a) => a.gpsLat && a.gpsLng)
    .map((a) => ({
      id: a.id,
      lat: a.gpsLat!,
      lng: a.gpsLng!,
      title: a.caption || "Evidence Asset",
      status: a.verificationStatus,
    }));

  const timelineEvents: TimelineEvent[] = filteredAssets.map((a) => ({
    id: a.id,
    date: a.capturedAt ? new Date(a.capturedAt).toLocaleDateString() : "2025-07-15",
    title: a.caption?.split("—")[0] || "Field Activity",
    description: a.caption || "Asset documented with GPS telemetry and hash chain validation",
    activityType: "field_operation",
    location: `${a.gpsLat ? a.gpsLat.toFixed(2) : "19.07"}°N, ${a.gpsLng ? a.gpsLng.toFixed(2) : "72.87"}°E`,
    verified: a.verificationStatus === "verified",
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Evidence Library
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              {filteredAssets.length} Assets
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse verified field photos and videos with cryptographic chain of custody
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
          >
            <Upload className="w-4 h-4" />
            Upload Evidence
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search by caption, site, device..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/60 border border-white/5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800/60 border border-white/5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Review</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* View Mode Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-white/5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "map"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Map View"
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "timeline"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Timeline View"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => handleOpenAsset(asset)}
              className="group rounded-2xl border border-white/5 bg-slate-900/60 hover:border-emerald-500/30 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer flex flex-col"
            >
              {/* Media Thumbnail */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    asset.cloudinaryPublicId
                      ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"}/image/upload/w_600,c_fill,q_auto,f_auto/${asset.cloudinaryPublicId}`
                      : "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600"
                  }
                  alt={asset.caption || "Evidence asset"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Original Evidence
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                      asset.verificationStatus === "verified"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {asset.verificationStatus || "pending"}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-200 line-clamp-2 leading-relaxed">
                    {asset.caption || "Field photo"}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {asset.gpsLat ? `${asset.gpsLat.toFixed(2)}°N, ${asset.gpsLng?.toFixed(2)}°E` : "Geo-tagged"}
                  </span>
                  <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium">
                    Provenance <Eye className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === "list" && (
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-white/5 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Captured</th>
                <th className="py-3 px-4">Coordinates</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Checksum (SHA-256)</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => handleOpenAsset(asset)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          asset.cloudinaryPublicId
                            ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"}/image/upload/w_100,c_fill,q_auto/${asset.cloudinaryPublicId}`
                            : "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100"
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-slate-200 font-medium line-clamp-1 max-w-xs">
                      {asset.caption || "Evidence asset"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {asset.capturedAt ? new Date(asset.capturedAt).toLocaleDateString() : "2025-07-15"}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {asset.gpsLat ? `${asset.gpsLat.toFixed(3)}, ${asset.gpsLng?.toFixed(3)}` : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        asset.verificationStatus === "verified"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {asset.verificationStatus || "pending"}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px] truncate max-w-[120px]">
                    {asset.originalSha256 || "e3b0c442..."}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-emerald-400 hover:text-emerald-300 font-medium text-xs">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === "map" && (
        <div className="space-y-4">
          <ImpactMap
            points={mapPoints}
            onSelectPoint={(id) => {
              const a = assetsList.find((x) => x.id === id);
              if (a) handleOpenAsset(a);
            }}
          />
          <p className="text-xs text-slate-400 text-center">
            Click on any GPS cluster pin to view verified field evidence and chain of custody.
          </p>
        </div>
      )}

      {viewMode === "timeline" && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
          <ImpactTimeline
            events={timelineEvents}
            onSelectEvent={(id) => {
              const a = assetsList.find((x) => x.id === id);
              if (a) handleOpenAsset(a);
            }}
          />
        </div>
      )}

      {/* Provenance Drawer */}
      <ProvenanceDrawer
        asset={selectedAsset}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
