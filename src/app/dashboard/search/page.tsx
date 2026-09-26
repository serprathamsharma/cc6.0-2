"use client";

import { useState } from "react";
import { Search as SearchIcon, MapPin, Clock, Sparkles, Filter, ImageIcon } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; caption: string; matchReasons: string[] }>>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    // In a real app, call /api/search
    setTimeout(() => {
      setResults([
        { id: "1", caption: "Tree planting activity near lake with volunteers", matchReasons: ["semantic similarity", "keyword match"] },
        { id: "2", caption: "Saplings planted in rows along a rural road", matchReasons: ["semantic similarity"] },
      ]);
      setSearching(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Semantic Search
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Search assets by meaning, not just keywords
        </p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-2xl">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder='Try: "flooded roads in Assam" or "before/after lake cleanup 2025"'
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="absolute right-2 px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {searching ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <p className="text-[10px] text-slate-600">
            Powered by hybrid search: metadata filters + keywords + vector similarity (RRF fusion)
          </p>
        </div>
      </div>

      {/* View mode tabs */}
      <div className="flex items-center gap-2">
        {["Grid", "Map", "Timeline"].map((view) => (
          <button
            key={view}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              view === "Grid"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-slate-800/50 text-slate-500 border border-white/5 hover:text-white"
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">{results.length} results found</p>
          {results.map((result) => (
            <div
              key={result.id}
              className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
            >
              <div className="w-24 h-24 rounded-lg bg-slate-900/50 flex-shrink-0 flex items-center justify-center text-slate-700">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300">{result.caption}</p>
                <div className="flex items-center gap-2 mt-2">
                  {result.matchReasons.map((reason) => (
                    <span
                      key={reason}
                      className="px-2 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <SearchIcon className="w-16 h-16 mx-auto mb-4 text-slate-800" />
          <p className="text-sm text-slate-600">
            Enter a natural language query to search your field evidence
          </p>
        </div>
      )}
    </div>
  );
}
