"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEMO_MODE } from "@/lib/ai/openai";
import {
  LayoutDashboard,
  ImageIcon,
  Search,
  GitCompareArrows,
  ShieldCheck,
  FileText,
  Megaphone,
  Menu,
  X,
  Leaf,
} from "lucide-react";
import { useState } from "react";
import { ToastProvider } from "@/components/ui/toast";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/library", label: "Library", icon: ImageIcon },
  { href: "/dashboard/search", label: "Search", icon: Search },
  { href: "/dashboard/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/dashboard/verify", label: "Verify", icon: ShieldCheck },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:flex lg:flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          bg-slate-900/80 backdrop-blur-xl border-r border-white/5`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              ImpactLens
            </h1>
            <p className="text-[10px] text-emerald-400/80 font-medium tracking-widest uppercase">
              Media Intelligence
            </p>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 shadow-inner shadow-emerald-500/5"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <item.icon className={`w-4.5 h-4.5 ${isActive ? "text-emerald-400" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>System operational</span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 lg:px-8 py-3 border-b border-white/5 bg-slate-900/40 backdrop-blur-md">
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Demo mode banner */}
          {typeof window !== "undefined" && (
            <div className="flex-1 flex justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                DEMO MODE — Using fixture data
              </div>
            </div>
          )}

          {/* User avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
              DA
            </div>
          </div>
        </header>

        {/* Page content */}
        <ToastProvider>
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
        </ToastProvider>
      </div>
    </div>
  );
}
