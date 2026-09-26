"use client";

import { useState } from "react";
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
} from "lucide-react";
import { ProvenanceDrawer, type ProvenanceAsset } from "@/components/provenance/ProvenanceDrawer";

const EXAMPLE_QUERIES = [
  "flooded roads in Assam after monsoon",
  "native tree saplings planted along slope",
  "lake cleanup volunteers with plastic waste",
  "school solar drinking water pump",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [facets, setFacets] = useState<any>({
    activityTypes: { planting: 12, cleanup: 8, water_access: 5 },
    verificationStatuses: { verified: 19, pending: 6 },
  });
  const [selectedAsset, setSelectedAsset] = useState<ProvenanceAsset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setQuery(searchQuery);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
        if (data.facets) setFacets(data.facets);
      }
    } catch (err) {
      console.warn("[Search] Fallback to demo result:", err);
      setResults([
        {
          assetId: "demo-1",
          cloudinaryPublicId: "impactlens/mh-trees-01",
          caption: "Native sapling plantation drive in Sahyadri corridor, Satara district",
          activityTypes: ["planting"],
          verificationStatus: "verified",
          capturedAt: "2025-07-15",
          gpsLat: 17.68,
          gpsLng: 73.99,
          matchReasons: ["semantic similarity", "keyword match"],
          score: 0.94,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md space-y-3">
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
            placeholder="Try 'lake cleanup in Bangalore' or 'tree saplings after monsoon'..."
            className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-slate-800/80 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 shadow-inner"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
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
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-white/5 text-xs text-slate-300 hover:text-emerald-300 transition-all text-left"
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
              <button
                onClick={() => handleSearch(query)}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Activity Type Facet */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Activity Types
              </h4>
              <div className="space-y-1.5 text-xs">
                {Object.entries(facets.activityTypes || {}).map(([act, count]) => (
                  <label
                    key={act}
                    className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer"
                  >
                    <span className="capitalize">{act.replace("_", " ")}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                      {String(count)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Verification Status Facet */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Verification Status
              </h4>
              <div className="space-y-1.5 text-xs">
                {Object.entries(facets.verificationStatuses || {}).map(([st, count]) => (
                  <label
                    key={st}
                    className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer"
                  >
                    <span className="capitalize">{st}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                      {String(count)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing {results.length} ranked matches
            </span>
            <span className="text-[11px] text-slate-400">
              Ranked via Reciprocal Rank Fusion (k=60)
            </span>
          </div>

          {results.length === 0 && !loading && (
            <div className="p-12 text-center rounded-2xl border border-white/5 bg-slate-900/40 space-y-3">
              <Search className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">
                Start discovering evidence
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Type a natural language query above or select one of the suggested search queries.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {results.map((r, idx) => (
              <div
                key={r.assetId || idx}
                onClick={() => {
                  setSelectedAsset(r);
                  setDrawerOpen(true);
                }}
                className="group p-4 rounded-2xl border border-white/5 bg-slate-900/60 hover:border-emerald-500/30 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-lg"
              >
                {/* Media thumbnail */}
                <div className="w-full sm:w-28 h-20 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-white/10 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      r.cloudinaryPublicId
                        ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"}/image/upload/w_200,c_fill,q_auto/${r.cloudinaryPublicId}`
                        : "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200"
                    }
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-1 left-1">
                    <span className="p-0.5 rounded bg-black/60 text-emerald-400 text-[9px]">
                      <ShieldCheck className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      {r.caption || "Field Evidence"}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        r.verificationStatus === "verified"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {r.verificationStatus || "pending"}
                    </span>
                  </div>

                  {/* Match reasons */}
                  <div className="flex flex-wrap items-center gap-1.5">
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
                <div className="text-slate-400 group-hover:text-emerald-400 transition-colors hidden sm:block">
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
