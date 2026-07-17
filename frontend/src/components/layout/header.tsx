"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useAnalysisStore } from "@/store/analysis-store";

export default function Header() {
  const pathname = usePathname();
  const { toggleSidebar, currentDataset } = useAnalysisStore();

  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Dashboard";
    if (parts[0] === "analysis" && parts[1] && currentDataset) {
      return `Analysis / ${currentDataset.name}`;
    }
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" / ");
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-background shrink-0 z-20 font-sans shadow-none relative">
      {/* Left: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg border border-border bg-card hover:bg-background text-muted-foreground hover:text-foreground md:hidden shrink-0 cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">
          {getBreadcrumbs()}
        </div>
      </div>

      {/* Right side is intentionally empty for a ultra-minimalist design */}
      <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider font-mono">
        <span>DetectiveAI Session</span>
      </div>
    </header>
  );
}
