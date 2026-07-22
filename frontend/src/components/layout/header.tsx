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
          className="p-1.5 rounded-cards border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground md:hidden shrink-0 cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="text-xs font-mono font-medium text-foreground tracking-tight">
          {getBreadcrumbs()}
        </div>
      </div>

      {/* Right side: Session status */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Session Active</span>
      </div>
    </header>
  );
}
