"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  Download,
  Eye,
  Archive,
  Clock,
  Link2,
} from "lucide-react";

const DEMO_REPORTS = [
  {
    id: "r-1",
    title: "Q2 2025 Tree Plantation Impact Report",
    template: "donor",
    project: "Maharashtra Tree Plantation",
    periodStart: "2025-04-01",
    periodEnd: "2025-06-30",
    status: "draft",
    claimsCount: 12,
    citedAssets: 24,
  },
  {
    id: "r-2",
    title: "Lake Cleanup Progress Update — Community",
    template: "community",
    project: "Bellandur Lake Cleanup",
    periodStart: "2025-05-01",
    periodEnd: "2025-07-31",
    status: "published",
    claimsCount: 8,
    citedAssets: 16,
  },
];

const templateColors: Record<string, { bg: string; text: string }> = {
  donor: { bg: "bg-blue-500/10", text: "text-blue-400" },
  csr_government: { bg: "bg-purple-500/10", text: "text-purple-400" },
  community: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
};

export default function ReportsPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Evidence Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Every statement backed by traceable evidence
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          New Report
        </button>
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {DEMO_REPORTS.map((report) => {
          const template = templateColors[report.template] || templateColors.donor;
          return (
            <div
              key={report.id}
              className="rounded-xl border border-white/5 bg-slate-800/50 backdrop-blur-sm p-5 hover:border-white/10 transition-all cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">
                      {report.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                        report.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-500">
                    <span className={`px-2 py-0.5 rounded ${template.bg} ${template.text} font-medium`}>
                      {report.template}
                    </span>
                    <span>{report.project}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {report.periodStart} → {report.periodEnd}
                    </span>
                    <span className="flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      {report.claimsCount} claims, {report.citedAssets} evidence
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-xs hover:bg-white/10 transition-colors">
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-xs hover:bg-white/10 transition-colors">
                    <Download className="w-3 h-3" />
                    PDF
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-xs hover:bg-white/10 transition-colors">
                    <Archive className="w-3 h-3" />
                    Evidence Pack
                  </button>
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
            <h2 className="text-lg font-bold text-white mb-4">Generate Report</h2>
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
                <label className="text-xs text-slate-400 block mb-1.5">Template</label>
                <select className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-sm text-white">
                  <option value="donor">Donor Report</option>
                  <option value="csr_government">CSR / Government Progress</option>
                  <option value="community">Community Update</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Period Start</label>
                  <input type="date" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Period End</label>
                  <input type="date" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-sm text-white" />
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
              <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
