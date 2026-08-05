"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Database, Sparkles } from "lucide-react";
import { useAnalysisStore } from "@/store/analysis-store";
import { ThemeToggleButton } from "@/components/ui/ThemeToggle";

export default function Header() {
  const pathname = usePathname();
  const { toggleSidebar, currentDataset } = useAnalysisStore();

  const renderBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return <span className="font-semibold text-foreground">Dashboard</span>;

    if (parts[0] === "analysis" && parts[1]) {
      return (
        <div className="flex items-center gap-1.5 min-w-0">
          <Link href="/history" className="hover:text-foreground transition-colors font-medium">
            Cases
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-bold text-foreground truncate flex items-center gap-1.5">
            <Database className="w-3 h-3 text-primary shrink-0" />
            {currentDataset?.name || `Case #${parts[1]}`}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5">
        {parts.map((part, index) => {
          const isLast = index === parts.length - 1;
          const label = part.charAt(0).toUpperCase() + part.slice(1);
          return (
            <React.Fragment key={part}>
              {index > 0 && <span className="text-muted-foreground/40">/</span>}
              <span className={isLast ? "font-bold text-foreground" : "hover:text-foreground transition-colors"}>
                {label}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <header className="flex items-center justify-between h-14 px-5 border-b border-border/80 bg-card/60 backdrop-blur-md shrink-0 z-20 font-sans relative select-none">
      {/* Left: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg border border-border/80 bg-background/60 hover:bg-muted text-muted-foreground hover:text-foreground md:hidden shrink-0 cursor-pointer transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="text-xs font-mono text-muted-foreground truncate min-w-0">
          {renderBreadcrumbs()}
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Command shortcut visual indicator */}
        <button
          onClick={() => {}}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-border/80 bg-background/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground text-[11px] font-mono transition-all cursor-pointer"
        >
          <Search className="w-3 h-3 text-muted-foreground/60" />
          <span>Quick Find</span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[9px] border border-border font-bold text-muted-foreground">⌘K</kbd>
        </button>

        {/* Live status badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-mono text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>POLARS ENGINE</span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggleButton variant="circle" start="center" blur={true} className="w-7 h-7 p-1 rounded-lg border border-border/80 bg-background/40 hover:bg-muted" />
      </div>
    </header>
  );
}
