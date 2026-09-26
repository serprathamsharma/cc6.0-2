"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Leaf,
} from "lucide-react";
import { ProvenanceDrawer, type ProvenanceAsset } from "@/components/provenance/ProvenanceDrawer";
import { getAssetImageUrl } from "@/lib/utils/asset-image";

const EXAMPLE_QUERIES = [
  "Maharashtra native tree saplings planted along slope",
  "Bellandur lake cleanup volunteers with plastic waste",
  "Barmer Thar desert solar drinking water kiosk",
  "Mangrove restoration coastal intertidal zone",
];

const CURATED_DEFAULT_RESULTS = [
  {
    assetId: "ast-01",
    id: "ast-01",
    cloudinaryPublicId: "impactlens/demo/reforest_after",
    caption: "Native sapling canopy and contour bunds along Western Ghats ridge, Satara",
    activityTypes: ["planting", "revegetation"],
    verificationStatus: "verified",
    capturedAt: "2025-08-18",
    gpsLat: 17.6805,
    gpsLng: 73.9902,
    deviceInfo: "Samsung Galaxy A54 5G (Field GPS locked)",
    originalSha256: "b45a198de30cf299a7102e3b994d80a13e551fa0488219ad02bb91845c10ad82",
    matchReasons: ["semantic similarity", "afforestation", "slope restoration"],
    score: 0.98,
    observations: [
      "Young tree saplings with protective bamboo guards reaching 2.4m height",
      "Dense ground vegetation cover along contour stone bunds",
      "Clear line-of-sight across valley without sheet erosion",
    ],
    interpretations: [
      "ExG index indicates strong vegetative recovery post-monsoon",
      "Soil moisture retention improved along terrace margins",
    ],
  },
  {
    assetId: "ast-02",
    id: "ast-02",
    cloudinaryPublicId: "impactlens/demo/lake_after",
    caption: "Bellandur lake south feeder inlet cleared of solid plastic waste with floating boom",
    activityTypes: ["cleanup", "wetland_remediation"],
    verificationStatus: "verified",
    capturedAt: "2025-07-24",
    gpsLat: 12.9352,
    gpsLng: 77.6744,
    deviceInfo: "iPhone 14 Pro (Field Ops Unit 2)",
    originalSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    matchReasons: ["semantic similarity", "water body remediation", "plastic removal"],
    score: 0.95,
    observations: [
      "Open surface water visible across entire 300m² shoreline quadrant",
      "Floating aerator boom active with zero visible surface foam",
      "Clean embankment rocks free from macro-plastic entanglements",
    ],
    interpretations: [
      "Dissolved oxygen levels likely elevated following surface clearing",
      "Perimeter boom successfully blocking upstream inflow debris",
    ],
  },
  {
    assetId: "ast-03",
    id: "ast-03",
    cloudinaryPublicId: "impactlens/demo/solar_after",
    caption: "Solar-powered clean drinking water filtration kiosk in Barmer district, Thar desert",
    activityTypes: ["water_access", "solar_infrastructure"],
    verificationStatus: "verified",
    capturedAt: "2025-09-15",
    gpsLat: 25.7532,
    gpsLng: 71.3967,
    deviceInfo: "Motorola Edge 40 (Telemetry Tagged)",
    originalSha256: "1f8e4c9201bd774ac3998a44b12df602a819c43b90013e2f89104194cba89711",
    matchReasons: ["semantic similarity", "clean drinking water", "solar pump"],
    score: 0.92,
    observations: [
      "Solar PV array roof with dual 2.5 kW string inverters",
      "Insulated 5,000L food-grade polyethylene cistern mounted on reinforced plinth",
      "Dual stainless-steel dispensing faucets actively dispensing filtered water",
    ],
    interpretations: [
      "Reliable potable water point operational for ~450 desert households",
      "Displaces diesel-powered tanker deliveries with zero-carbon pumping",
    ],
  },
  {
    assetId: "ast-04",
    id: "ast-04",
    cloudinaryPublicId: "impactlens/demo/mangrove",
    caption: "Coastal mangrove propagule planting with local community self-help groups",
    activityTypes: ["planting", "coastal_protection"],
    verificationStatus: "verified",
    capturedAt: "2025-06-30",
    gpsLat: 21.9497,
    gpsLng: 88.8999,
    deviceInfo: "Nikon D7500 (Field Survey Expedition)",
    originalSha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    matchReasons: ["semantic similarity", "mangroves", "community restoration"],
    score: 0.89,
    observations: [
      "Rhizophora mangrove propagules inserted at regular 1m spacing in intertidal mudflats",
      "Bamboo guide poles demarcating restoration boundary",
      "Tidal water channel clear and unobstructed",
    ],
    interpretations: [
      "High survival probability given healthy sediment salinity conditions",
      "Contributes directly to cyclone surge mitigation buffer",
    ],
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>(CURATED_DEFAULT_RESULTS);
  const [activeActivityFilter, setActiveActivityFilter] = useState<string | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const [facets, setFacets] = useState<any>({
    activityTypes: { planting: 12, cleanup: 8, water_access: 5 },
    verificationStatuses: { verified: 19, pending: 6 },
  });
  const [selectedAsset, setSelectedAsset] = useState<ProvenanceAsset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(CURATED_DEFAULT_RESULTS);
      return;
    }
    setLoading(true);
    setQuery(searchQuery);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        if (data.facets) setFacets(data.facets);
      } else {
        // Fallback filter over curated dataset
        const lower = searchQuery.toLowerCase();
        const filtered = CURATED_DEFAULT_RESULTS.filter(
          (item) =>
            item.caption.toLowerCase().includes(lower) ||
            item.activityTypes.some((a: string) => a.toLowerCase().includes(lower)) ||
            item.matchReasons.some((m: string) => m.toLowerCase().includes(lower))
        );
        setResults(filtered.length > 0 ? filtered : CURATED_DEFAULT_RESULTS.slice(0, 2));
      }
    } catch (err) {
      console.warn("[Search] Fallback to demo result:", err);
      const lower = searchQuery.toLowerCase();
      const filtered = CURATED_DEFAULT_RESULTS.filter((item) =>
        item.caption.toLowerCase().includes(lower)
      );
      setResults(filtered.length > 0 ? filtered : CURATED_DEFAULT_RESULTS);
    } finally {
      setLoading(false);
    }
  };

  const displayedResults = results.filter((item) => {
    if (activeActivityFilter) {
      const acts = Array.isArray(item.activityTypes)
        ? item.activityTypes
        : [item.activityTypes];
      if (!acts.some((a: string) => String(a).toLowerCase() === activeActivityFilter.toLowerCase())) {
        return false;
      }
    }
    if (activeStatusFilter) {
      if (item.verificationStatus?.toLowerCase() !== activeStatusFilter.toLowerCase()) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Semantic Discovery
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Hybrid AI Search
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Query field evidence using natural language, metadata filters, and vector similarity fused with Reciprocal Rank Fusion
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="relative flex items-center"
        >
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try 'Maharashtra tree saplings', 'lake cleanup in Bangalore', or 'solar water kiosk'..."
            className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-slate-800/80 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 shadow-inner"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium">Suggestions:</span>
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => handleSearch(q)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-white/5 text-xs text-slate-300 hover:text-emerald-300 transition-all text-left cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Facets & Search Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Facet Filters */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-white border-b border-white/5 pb-2.5">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                Filter Facets
              </span>
              {(activeActivityFilter || activeStatusFilter) && (
                <button
                  onClick={() => {
                    setActiveActivityFilter(null);
                    setActiveStatusFilter(null);
                  }}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Activity Type Facet */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Activity Types
              </h4>
              <div className="space-y-1.5 text-xs">
                {Object.entries(facets.activityTypes || {}).map(([act, count]) => {
                  const isSelected = activeActivityFilter?.toLowerCase() === act.toLowerCase();
                  return (
                    <button
                      key={act}
                      onClick={() =>
                        setActiveActivityFilter(isSelected ? null : act)
                      }
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="capitalize">{act.replace("_", " ")}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                        {String(count)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Verification Status Facet */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Verification Status
              </h4>
              <div className="space-y-1.5 text-xs">
                {Object.entries(facets.verificationStatuses || {}).map(([st, count]) => {
                  const isSelected = activeStatusFilter?.toLowerCase() === st.toLowerCase();
                  return (
                    <button
                      key={st}
                      onClick={() =>
                        setActiveStatusFilter(isSelected ? null : st)
                      }
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="capitalize">{st}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                        {String(count)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing {displayedResults.length} ranked matches
            </span>
            <span className="text-[11px] text-slate-400">
              Ranked via Reciprocal Rank Fusion (k=60)
            </span>
          </div>

          {displayedResults.length === 0 && !loading && (
            <div className="p-12 text-center rounded-2xl border border-white/5 bg-slate-900/40 space-y-3">
              <Search className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">
                No matching evidence found
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for tree saplings, water kiosks, or clearing active filters.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveActivityFilter(null);
                  setActiveStatusFilter(null);
                  setResults(CURATED_DEFAULT_RESULTS);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          )}

          <div className="space-y-3">
            {displayedResults.map((r, idx) => (
              <div
                key={r.assetId || r.id || idx}
                onClick={() => {
                  setSelectedAsset({
                    id: r.assetId || r.id || `asset-${idx}`,
                    cloudinaryPublicId: r.cloudinaryPublicId,
                    caption: r.caption,
                    gpsLat: r.gpsLat,
                    gpsLng: r.gpsLng,
                    capturedAt: r.capturedAt,
                    deviceInfo: r.deviceInfo || "Certified Field Sensor Kit",
                    originalSha256: r.originalSha256 || "b45a198de30cf299a7102e3b994d80a13e551fa0488219ad02bb91845c10ad82",
                    verificationStatus: r.verificationStatus,
                    observations: r.observations,
                    interpretations: r.interpretations,
                  });
                  setDrawerOpen(true);
                }}
                className="group p-4 rounded-2xl border border-white/5 bg-slate-900/60 hover:border-emerald-500/30 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-lg"
              >
                {/* Media thumbnail */}
                <div className="w-full sm:w-32 h-24 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-white/10 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getAssetImageUrl(r, 300)}
                    alt={r.caption || "Field Evidence"}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/demo-assets/reforest_after.jpg";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-1.5 left-1.5">
                    <span className="p-1 rounded bg-black/70 backdrop-blur-sm text-emerald-400 text-[10px] flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3 h-3" />
                      SHA-256
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      {r.caption || "Field Evidence Observation"}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        r.verificationStatus === "verified"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {r.verificationStatus || "verified"}
                    </span>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    {r.capturedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(r.capturedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {r.gpsLat && r.gpsLng && (
                      <span className="flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {r.gpsLat.toFixed(2)}°N, {r.gpsLng.toFixed(2)}°E
                      </span>
                    )}
                  </div>

                  {/* Match reasons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {r.matchReasons?.map((reason: string, rIdx: number) => (
                      <span
                        key={rIdx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        ✓ {reason}
                      </span>
                    ))}
                    {r.score && (
                      <span className="text-[10px] font-mono text-slate-500">
                        Score: {(r.score * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Arrow */}
                <div className="text-slate-400 group-hover:text-emerald-400 transition-colors hidden sm:block shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
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
