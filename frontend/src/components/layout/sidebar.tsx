"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database,
  Sparkles
} from "lucide-react";
import { useAnalysisStore } from "@/store/analysis-store";
import { useAuthStore } from "@/store/auth-store";

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAnalysisStore();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "New Case", href: "/upload", icon: Upload },
    { label: "Case Archives", href: "/history", icon: History },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-screen bg-[#f9f9f7] dark:bg-[#11120d] border-r border-black/15 dark:border-white/15 flex flex-col justify-between select-none relative z-30 shrink-0 font-sans overflow-hidden"
    >
      <div className="flex flex-col flex-1 min-h-0">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-black/15 dark:border-white/15 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            {/* Vibrant Lime Favicon Monogram Icon Badge */}
            <div className="w-8 h-8 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] rounded-lg bg-[#edfe5e] border border-black flex items-center justify-center text-black shrink-0 shadow-xs">
              <svg
                width="18"
                height="18"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="13" cy="13" r="9" stroke="#000000" strokeWidth="3" />
                <circle cx="13" cy="13" r="4.5" stroke="#000000" strokeWidth="2" strokeDasharray="2 2" />
                <circle cx="11" cy="11" r="1.5" fill="#000000" />
                <circle cx="15" cy="14" r="1.5" fill="#000000" />
                <line x1="19.5" y1="19.5" x2="27.5" y2="27.5" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <span className="font-serif font-extrabold text-base tracking-tight truncate text-black dark:text-white">
                DETECTIVE<span className="text-[#31e992] ml-0.5">AI</span>
              </span>
            )}
          </Link>

          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center p-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#181914] hover:bg-[#edf0e9] dark:hover:bg-[#262720] text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#edfe5e] text-black border border-black/30 shadow-xs"
                    : "text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-[#edf0e9] dark:hover:bg-[#262720] border border-transparent"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-black/70 dark:text-white/70"}`} />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-black/15 dark:border-white/15 bg-[#f9f9f7] dark:bg-[#11120d] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] rounded-full bg-[#edfe5e] border border-black flex items-center justify-center text-black font-mono font-bold text-xs shrink-0 select-none shadow-xs">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "C"}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0 text-left overflow-hidden">
              <p className="text-xs font-mono font-bold text-black dark:text-white truncate">{user?.full_name || "Chaitanya Patil"}</p>
              <p className="text-[10px] font-mono text-black/60 dark:text-white/60 truncate">{user?.email || "chaitanyapatil700@gmail.com"}</p>
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#181914] hover:bg-[#bc3e3e] hover:text-white text-black dark:text-white transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
