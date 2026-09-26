"use client";

import { useState } from "react";
import {
  Megaphone,
  Plus,
  ImageIcon,
  Languages,
  Link2,
  Sparkles,
} from "lucide-react";

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const DEMO_CAMPAIGNS = [
  {
    id: "c-1",
    platform: "linkedin",
    project: "Maharashtra Tree Plantation",
    headline: "🌱 1,000 Saplings Planted in Maharashtra's Western Ghats",
    body: "Our team has planted over 1,000 native saplings across 3 sites in the Western Ghats region. Each planting site is GPS-verified, and every sapling is tracked in our evidence system...",
    language: "en",
    status: "draft",
    generatedAssets: 4,
    sourceEvidence: 8,
  },
  {
    id: "c-2",
    platform: "instagram",
    project: "Bellandur Lake Cleanup",
    headline: "Before vs After: Bellandur Lake Transformation",
    body: "Swipe to see the incredible transformation at Bellandur Lake! Our volunteers have removed over 2 tonnes of plastic waste and restored natural vegetation along the bank...",
    language: "en",
    status: "draft",
    generatedAssets: 6,
    sourceEvidence: 12,
  },
];

const platformIcons: Record<string, React.ComponentType<any>> = {
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
};

export default function CampaignsPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Campaign Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate campaign-ready content from verified evidence
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Campaigns list */}
      <div className="space-y-4">
        {DEMO_CAMPAIGNS.map((campaign) => {
          const PlatformIcon = platformIcons[campaign.platform] || Megaphone;
          return (
            <div
              key={campaign.id}
              className="rounded-xl border border-white/5 bg-slate-800/50 backdrop-blur-sm overflow-hidden hover:border-white/10 transition-all"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5">
                    <PlatformIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">
                        {campaign.headline}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-amber-500/10 text-amber-400">
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                      {campaign.body}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                      <span className="capitalize">{campaign.platform}</span>
                      <span className="flex items-center gap-1">
                        <Languages className="w-3 h-3" />
                        {campaign.language === "en" ? "English" : "Hindi"}
                      </span>
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {campaign.generatedAssets} assets generated
                      </span>
                      <span className="flex items-center gap-1">
                        <Link2 className="w-3 h-3" />
                        {campaign.sourceEvidence} source evidence
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preview cards */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-slate-900/50 border border-white/5 flex items-center justify-center text-slate-700 relative overflow-hidden"
                    >
                      <ImageIcon className="w-6 h-6" />
                      <div className="absolute bottom-1 left-1">
                        <span className="px-1 py-0.5 rounded text-[7px] font-medium bg-purple-500/20 text-purple-400">
                          AI-generated
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">
              <Sparkles className="w-5 h-5 inline mr-2 text-emerald-400" />
              Create Campaign
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Project</label>
                <select className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-sm text-white">
                  <option>Maharashtra Tree Plantation</option>
                  <option>Bellandur Lake Cleanup</option>
                  <option>Rajasthan School Water</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {["LinkedIn", "Instagram", "X"].map((p) => (
                    <button
                      key={p}
                      className="px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-sm text-slate-400 hover:text-white hover:border-emerald-500/30 transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Language</label>
                <div className="grid grid-cols-2 gap-2">
                  {["English", "Hindi"].map((l) => (
                    <button
                      key={l}
                      className="px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-sm text-slate-400 hover:text-white hover:border-emerald-500/30 transition-all"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
                <Sparkles className="w-4 h-4" />
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
