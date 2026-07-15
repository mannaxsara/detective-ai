"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
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
  { name: "Cases", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

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
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`flex flex-col h-screen border-r border-border bg-card shrink-0 z-40 font-sans ${
          isMobile ? "fixed left-0 top-0 bottom-0 shadow-2xl" : "relative"
        } ${isMobile && sidebarCollapsed ? "pointer-events-none border-none" : "pointer-events-auto"}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            {sidebarCollapsed && !isMobile ? (
              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background select-none">
                <span className="text-sm font-black text-primary">D</span>
              </div>
            ) : (
              <span className="font-black text-[13px] tracking-widest text-foreground uppercase select-none">
                DetectiveAI
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto scrollbar-thin">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 border ${
                  active
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40 border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
                {(!sidebarCollapsed || isMobile) && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border text-foreground shrink-0">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
            {(!sidebarCollapsed || isMobile) && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-foreground truncate">{user?.full_name || "Agent"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
            {(!sidebarCollapsed || isMobile) && (
              <div className="flex items-center gap-1.5">
                <ThemeToggleButton variant="circle" start="center" blur={true} className="w-7 h-7 p-1 rounded-lg border-border hover:bg-background" />
                <button
                  onClick={logout}
                  className="p-1 rounded-lg hover:bg-background text-muted-foreground hover:text-destructive transition-colors w-7 h-7 flex items-center justify-center border border-transparent cursor-pointer"
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
