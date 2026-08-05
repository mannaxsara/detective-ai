"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  History,
  Settings,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useAnalysisStore } from "@/store/analysis-store";
import { ThemeToggleButton } from "@/components/ui/ThemeToggle";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "New Case", href: "/upload", icon: Upload },
  { name: "Case Archives", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="13" r="9.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="11" cy="12" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="15" r="1.2" fill="currentColor" />
      <line x1="11" y1="12" x2="15" y2="10" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="15" y1="10" x2="15" y2="15" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="11" y1="12" x2="15" y2="15" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="20" y1="20" x2="28" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useAnalysisStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isItemActive = (item: typeof NAV_ITEMS[0]) => {
    return pathname === item.href;
  };

  const sidebarWidth = isMobile
    ? sidebarCollapsed ? 0 : 250
    : sidebarCollapsed ? 72 : 250;

  return (
    <>
      {/* Mobile dim background overlay */}
      {isMobile && !sidebarCollapsed && (
        <div
          onClick={() => setSidebarCollapsed(true)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300 md:hidden"
        />
      )}

      <motion.aside
        animate={{ 
          width: sidebarWidth,
          x: isMobile && sidebarCollapsed ? -250 : 0
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={`flex flex-col h-screen border-r border-border/80 bg-card/90 backdrop-blur-xl shrink-0 z-40 font-sans overflow-hidden ${
          isMobile ? "fixed left-0 top-0 bottom-0 shadow-2xl" : "relative"
        } ${isMobile && sidebarCollapsed ? "pointer-events-none border-none" : "pointer-events-auto"}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border/80 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden group select-none">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-primary/20 bg-primary/10 text-primary shrink-0 transition-transform group-hover:scale-105">
              <LogoMark size={18} />
            </div>
            {(!sidebarCollapsed || isMobile) && (
              <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-foreground truncate">
                Detective<span className="text-primary">AI</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-lg border border-border/80 bg-background/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (isMobile) setSidebarCollapsed(true);
                }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 border select-none group ${
                  active
                    ? "bg-primary/10 text-primary border-primary/30 font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${active ? "text-primary" : "text-muted-foreground/70"}`} />
                {(!sidebarCollapsed || isMobile) && <span className="truncate">{item.name}</span>}
                {active && (
                  <motion.div
                    layoutId="activeSidePill"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-border/80 bg-card/80 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border text-foreground shrink-0 overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            {(!sidebarCollapsed || isMobile) && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-foreground truncate">{user?.full_name || "Agent"}</p>
                <p className="text-[10px] text-muted-foreground/70 truncate">{user?.email || "agent@detective.ai"}</p>
              </div>
            )}
            {(!sidebarCollapsed || isMobile) && (
              <div className="flex items-center gap-1">
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors cursor-pointer border border-transparent"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
