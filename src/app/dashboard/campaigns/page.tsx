"use client";

import { useState } from "react";
import {
  Megaphone,
  Plus,
  ImageIcon,
  Languages,
  Link2,
  Sparkles,
  Share2,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Crop,
  X,
  Send,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface CampaignItem {
  id: string;
  platform: "linkedin" | "instagram" | "x";
  project: string;
  headline: string;
  bodyEn: string;
  bodyHi: string;
  status: "published" | "draft" | "scheduled";
  aspectRatios: ("1:1" | "4:5" | "9:16")[];
  sourceEvidenceIds: string[];
  derivativeImageUrl: string;
  isAiDerived: boolean;
}

const DEMO_CAMPAIGNS: CampaignItem[] = [
  {
    id: "camp-01",
    platform: "linkedin",
    project: "Maharashtra Afforestation Initiative",
    headline: "🌱 1,250 Native Saplings: +38.4% Canopy Increase in Sahyadri",
    bodyEn:
      "Real restoration requires audited ground truth. Over 14 months, our field teams planted 1,250 native saplings in Satara district, achieving an 88.4% survival rate. Computer vision analysis via Excess Green Index (ExG) confirms a +38.4 percentage point canopy expansion.\n\nEvery claim in this update is anchored to tamper-evident SHA-256 Cloudinary evidence.\n\n#ClimateAction #Restoration #SDG15 #OpenImpact",
    bodyHi:
      "सच्चे पर्यावरणीय सुधार के लिए प्रमाणित ज़मीनी साक्ष्य आवश्यक हैं। 14 महीनों में हमारी टीम ने सतारा जिले में 1,250 देशी पौधे लगाए, जिनमें 88.4% जीवित रहने की दर दर्ज की गई। अतिरिक्त हरित सूचकांक (ExG) के कंप्यूटर विज़न विश्लेषण से हरियाली आवरण में +38.4% की वृद्धि प्रमाणित हुई है।\n\n#पर्यावरण #वृक्षारोपण #जलवायुपरिवर्तन",
    status: "published",
    aspectRatios: ["1:1", "4:5"],
    sourceEvidenceIds: ["ast-01"],
    derivativeImageUrl: "/demo-assets/reforest_after.jpg",
    isAiDerived: true,
  },
  {
    id: "camp-02",
    platform: "instagram",
    project: "Bellandur Wetland Cleanup",
    headline: "🌊 2.5 Tonnes of Plastic Waste Extracted from Bellandur Lake",
    bodyEn:
      "From choked inlet to restored open water. Our community partners removed over 2.5 tonnes of solid waste and deployed floating containment barriers. Check the before/after slider in our bio to inspect raw GPS evidence.\n\n#BellandurLake #WaterCleanUp #SDG6 #CommunityAction",
    bodyHi:
      "बेलंदूर झील के पुनरुद्धार की प्रेरणादायक यात्रा! हमारे सहयोगियों ने 2.5 टन से अधिक कचरा हटाया और खुले जल प्रवाह को पुनर्स्थापित किया। हमारे बायो में दिए लिंक से मूल जीपीएस साक्ष्य देखें।\n\n#स्वच्छजल #पर्यावरणसंरक्षण #सामुदायिकप्रयास",
    status: "draft",
    aspectRatios: ["1:1", "4:5", "9:16"],
    sourceEvidenceIds: ["ast-02"],
    derivativeImageUrl: "/demo-assets/lake_after.jpg",
    isAiDerived: true,
  },
  {
    id: "camp-03",
    platform: "x",
    project: "Barmer Clean Water Infrastructure",
    headline: "☀️ 4,800L/day Solar-Powered Potable Water in the Thar Desert",
    bodyEn:
      "Desert communities in Barmer now have 24/7 access to clean drinking water. Zero grid reliance, automated solar pumping, and zero groundwater drawdown anomaly. Verified on cryptographic ledger: 1f8e4c92...\n\n#CleanWater #SolarPower #SDG6 #ClimateResilience",
    bodyHi:
      "थार रेगिस्तान में स्वच्छ पेयजल क्रांति! बाड़मेर के समुदायों को अब 4,800 लीटर प्रतिदिन सौर-ऊर्जा संचालित शुद्ध पेयजल उपलब्ध है। बिना किसी ग्रिड निर्भरता के संपूर्ण आत्मनिर्भरता।\n\n#सौरऊर्जा #स्वच्छपेयजल #राजस्थान",
    status: "scheduled",
    aspectRatios: ["1:1", "4:5"],
    sourceEvidenceIds: ["ast-03"],
    derivativeImageUrl: "/demo-assets/solar_after.jpg",
    isAiDerived: true,
  },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(DEMO_CAMPAIGNS);
  const [selectedLang, setSelectedLang] = useState<Record<string, "en" | "hi">>({
    "camp-01": "en",
    "camp-02": "en",
    "camp-03": "en",
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAspect, setSelectedAspect] = useState<Record<string, "1:1" | "4:5" | "9:16">>({
    "camp-01": "1:1",
    "camp-02": "4:5",
    "camp-03": "1:1",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState("Maharashtra Afforestation");
  const [newPlatform, setNewPlatform] = useState<"linkedin" | "instagram" | "x">("linkedin");
  const [newHeadline, setNewHeadline] = useState("");
  const { showToast } = useToast();

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast({
      title: "Story Copy Transferred",
      description: "Campaign copy text copied to clipboard.",
      type: "success",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadCreative = (camp: CampaignItem) => {
    const aspect = selectedAspect[camp.id] || "1:1";
    const a = document.createElement("a");
    a.href = camp.derivativeImageUrl;
    a.download = `impactlens-creative-${camp.id}-${aspect}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast({
      title: "Derivative Creative Downloaded",
      description: `Saved ${aspect} smart-cropped creative for ${camp.project}.`,
      type: "success",
    });
  };

  const handleShare = async (camp: CampaignItem) => {
    const currentLang = selectedLang[camp.id] || "en";
    const bodyText = currentLang === "en" ? camp.bodyEn : camp.bodyHi;

    if (navigator.share) {
      try {
        await navigator.share({
          title: camp.headline,
          text: bodyText,
        });
        showToast({
          title: "Story Shared",
          description: "Campaign dispatched via device share sheet.",
          type: "success",
        });
        return;
      } catch {
        // Fall back to copy
      }
    }

    navigator.clipboard?.writeText?.(bodyText);
    showToast({
      title: "Campaign Text Ready to Post",
      description: `Copied full ${camp.platform.toUpperCase()} post copy to clipboard.`,
      type: "success",
    });
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `camp-${Date.now().toString().slice(-4)}`;
    const headline = newHeadline || `Impact Milestone: ${newProject} Progress Update`;

    let image = "/demo-assets/reforest_after.jpg";
    if (newProject.includes("Bellandur")) image = "/demo-assets/lake_after.jpg";
    if (newProject.includes("Barmer")) image = "/demo-assets/solar_after.jpg";
    if (newProject.includes("Mangrove")) image = "/demo-assets/mangrove.jpg";

    const newCamp: CampaignItem = {
      id,
      platform: newPlatform,
      project: newProject,
      headline,
      bodyEn: `Milestone verified for ${newProject}. Our ground telemetry confirms significant progress backed by tamper-evident cryptographic evidence on ImpactLens.\n\n#ClimateAction #TraceableImpact #SDGs`,
      bodyHi: `${newProject} के लिए महत्वपूर्ण उपलब्धि प्रमाणित हुई। ImpactLens पर हमारे ज़मीनी साक्ष्य और पारदर्शी डेटा द्वारा प्रगति की पुष्टि की गई है।\n\n#जलवायुसंरक्षण #सत्यसाक्ष्य`,
      status: "draft",
      aspectRatios: ["1:1", "4:5"],
      sourceEvidenceIds: ["ast-01"],
      derivativeImageUrl: image,
      isAiDerived: true,
    };

    setCampaigns([newCamp, ...campaigns]);
    setIsModalOpen(false);
    setNewHeadline("");

    showToast({
      title: "New Campaign Story Created",
      description: `Drafted bilingual creative story for ${newProject} on ${newPlatform.toUpperCase()}.`,
      type: "success",
    });
  };

  const getAspectClass = (aspect: "1:1" | "4:5" | "9:16") => {
    switch (aspect) {
      case "1:1":
        return "aspect-square max-w-[280px]";
      case "4:5":
        return "aspect-[4/5] max-w-[240px]";
      case "9:16":
        return "aspect-[9/16] max-w-[200px]";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Story & Campaign Studio
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Bilingual & Smart Crop
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Turn verified ground evidence into campaign-ready stories for LinkedIn, Instagram & X with bilingual English/Hindi copy
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Campaign
        </button>
      </div>

      {/* Campaign Cards */}
      <div className="space-y-6">
        {campaigns.map((camp) => {
          const currentLang = selectedLang[camp.id] || "en";
          const currentAspect = selectedAspect[camp.id] || "1:1";
          const bodyText = currentLang === "en" ? camp.bodyEn : camp.bodyHi;

          return (
            <div
              key={camp.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-xl space-y-5"
            >
              {/* Campaign Card Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs uppercase">
                    {camp.platform}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {camp.headline}
                    </h3>
                    <p className="text-xs text-slate-400">{camp.project}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Language Toggle */}
                  <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-white/5 text-xs">
                    <button
                      onClick={() =>
                        setSelectedLang((prev) => ({ ...prev, [camp.id]: "en" }))
                      }
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        currentLang === "en"
                          ? "bg-emerald-500 text-white font-medium shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() =>
                        setSelectedLang((prev) => ({ ...prev, [camp.id]: "hi" }))
                      }
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        currentLang === "hi"
                          ? "bg-emerald-500 text-white font-medium shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      हिन्दी (Hindi)
                    </button>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                      camp.status === "published"
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>
              </div>

              {/* Main Content Area: Copy & Derivative Smart Crop Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left: Generated Copy */}
                <div className="space-y-4">
                  <div className="relative p-4 rounded-2xl bg-slate-950/60 border border-white/5 font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {bodyText}
                    <button
                      onClick={() => handleCopy(camp.id, bodyText)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1 text-[11px] cursor-pointer"
                      title="Copy text"
                    >
                      {copiedId === camp.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  {/* Evidence Traceability Badge */}
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Anchored Evidence:
                    </span>
                    <div className="flex items-center gap-2">
                      {camp.sourceEvidenceIds.map((id) => (
                        <span
                          key={id}
                          className="px-2 py-0.5 rounded font-mono text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        >
                          #{id}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handleShare(camp)}
                      className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share / Dispatch Post
                    </button>

                    <button
                      onClick={() => handleDownloadCreative(camp)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      Download Creative
                    </button>
                  </div>
                </div>

                {/* Right: Cloudinary Smart Crop Derivative Preview */}
                <div className="space-y-3 flex flex-col items-center">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Crop className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cloudinary Smart Crop Aspect Ratio:</span>
                    <div className="flex items-center p-0.5 rounded-lg bg-slate-800 border border-white/5 text-[11px]">
                      {(["1:1", "4:5", "9:16"] as const).map((aspect) => (
                        <button
                          key={aspect}
                          onClick={() =>
                            setSelectedAspect((prev) => ({
                              ...prev,
                              [camp.id]: aspect,
                            }))
                          }
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            currentAspect === aspect
                              ? "bg-emerald-500 text-white font-medium"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {aspect}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cropped Image Container */}
                  <div
                    className={`relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl transition-all duration-300 ${getAspectClass(
                      currentAspect
                    )}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={camp.derivativeImageUrl}
                      alt="Campaign Creative"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-amber-300 border border-amber-500/30">
                        AI-Generated Derivative
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-black/75 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                        Smart Crop {currentAspect}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create New Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-400" />
                Draft New Social Campaign Story
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Intervention Project
                </label>
                <select
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Maharashtra Afforestation">Maharashtra Afforestation (Satara Ridge)</option>
                  <option value="Bellandur Wetland Cleanup">Bellandur Wetland Cleanup (Bangalore)</option>
                  <option value="Barmer Clean Water Infrastructure">Barmer Solar Clean Water (Thar Desert)</option>
                  <option value="Sundarbans Mangrove Restoration">Sundarbans Mangrove Restoration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Social Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["linkedin", "instagram", "x"] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setNewPlatform(p)}
                      className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        newPlatform === p
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : "bg-slate-800 text-slate-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Headline / Hook (Optional)
                </label>
                <input
                  type="text"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  placeholder="e.g. +38.4% Forest Canopy Expansion Verified"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Bilingual English and Hindi copy will be automatically generated with smart-crop aspect ratios and tamper-evident SHA-256 evidence links.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Generate Story Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
