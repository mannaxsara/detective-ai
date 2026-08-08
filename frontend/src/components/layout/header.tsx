"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Database, Zap, User as UserIcon, LogOut, Sun, Moon } from "lucide-react";
import { useAnalysisStore } from "@/store/analysis-store";
import { useAuthStore } from "@/store/auth-store";
import { useThemeToggle } from "@/components/ui/ThemeToggle";

export default function Header() {
  const pathname = usePathname();
  const { toggleSidebar, currentDataset } = useAnalysisStore();
  const { user, logout } = useAuthStore();
  const [quickFindOpen, setQuickFindOpen] = useState(false);
  const { isDark, toggleTheme } = useThemeToggle({
    variant: "circle",
    start: "top-right",
    blur: true
  });

  const renderBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0 || parts[0] === "dashboard") {
      return (
        <span className="font-mono text-[11px] font-bold text-black dark:text-white uppercase tracking-wider flex items-center gap-2 bg-white dark:bg-[#181914] border border-black/15 dark:border-white/15 px-3 py-1 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-[#31e992] border border-black/20" />
          Dashboard Overview
        </span>
      );
    }

    if (parts[0] === "analysis" && parts[1]) {
      return (
        <div className="flex items-center gap-2 min-w-0 font-mono text-[11px] uppercase tracking-wider">
          <Link href="/history" className="hover:underline font-bold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white shrink-0">
            Cases Archive
          </Link>
          <span className="text-black/30 dark:text-white/30 shrink-0">/</span>
          <span className="font-bold text-black flex items-center gap-1.5 bg-[#edfe5e] border border-black/20 px-2.5 py-1 rounded-lg min-w-0 max-w-[160px] sm:max-w-[280px]">
            <Database className="w-3.5 h-3.5 text-black shrink-0" />
            <span className="truncate">{currentDataset?.name || `Case #${parts[1]}`}</span>
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
        {parts.map((part, index) => {
          const isLast = index === parts.length - 1;
          const label = part.charAt(0).toUpperCase() + part.slice(1);
          return (
            <React.Fragment key={part}>
              {index > 0 && <span className="text-black/30 dark:text-white/30">/</span>}
              <span className={isLast ? "font-bold text-black dark:text-white bg-white dark:bg-[#181914] border border-black/15 dark:border-white/15 px-2.5 py-1 rounded-lg" : "hover:underline text-black/60 dark:text-white/60 font-bold"}>
                {label}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <header className="flex items-center justify-between h-14 px-5 border-b border-black/15 dark:border-white/15 bg-[#f9f9f7] dark:bg-[#11120d] shrink-0 z-20 font-sans relative select-none">
      {/* Left: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#181914] hover:bg-[#edf0e9] text-black dark:text-white md:hidden shrink-0 cursor-pointer transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="text-xs font-mono truncate min-w-0">
          {renderBreadcrumbs()}
        </div>
      </div>

      {/* Right Side Controls — shrink-0 prevents overlap */}
      <div className="flex items-center gap-2.5 shrink-0 ml-3">
        {/* Light/Dark Mode Toggle Switch Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#181914] hover:bg-[#edf0e9] dark:hover:bg-[#262720] text-black dark:text-white transition-colors cursor-pointer flex items-center justify-center"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-[#edfe5e]" />
          ) : (
            <Moon className="w-4 h-4 text-black" />
          )}
        </button>

        {/* Command shortcut trigger */}
        <button
          onClick={() => setQuickFindOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#181914] hover:bg-[#edf0e9] dark:hover:bg-[#262720] text-black dark:text-white text-[11px] font-mono font-bold transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-black/60 dark:text-white/60" />
          <span className="uppercase tracking-wider text-[10px] text-black/70 dark:text-white/70">Find</span>
          <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-black/70 dark:text-white/70 text-[9px] font-mono font-bold">⌘K</kbd>
        </button>

        {/* Engine Latency Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#31e992]/40 bg-[#31e992]/15 text-[10px] font-mono text-[#31e992] font-bold uppercase tracking-wider">
          <Zap className="w-3 h-3 text-[#31e992]" />
          <span>12ms</span>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 border-l border-black/10 dark:border-white/10 pl-2.5">
          <div className="w-7 h-7 rounded-full bg-[#edfe5e] border border-black/20 flex items-center justify-center text-[11px] font-mono font-bold text-black shrink-0">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "A"}
          </div>
          <span className="hidden xl:inline-block text-[11px] font-mono font-bold uppercase text-black/70 dark:text-white/70 truncate max-w-[100px]">
            {user?.full_name || "Agent"}
          </span>
        </div>
      </div>
    </header>
  );
}
