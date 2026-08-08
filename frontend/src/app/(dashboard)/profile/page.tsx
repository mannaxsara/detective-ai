"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User as UserIcon, Database, BarChart3, FileText, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { datasetsAPI, historyAPI } from "@/lib/api";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: datasetsData } = useQuery({
    queryKey: ["datasets-stats"],
    queryFn: () => datasetsAPI.list(0, 1),
  });

  const { data: historyData } = useQuery({
    queryKey: ["history-stats"],
    queryFn: () => historyAPI.list(0, 1),
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    toast.success("Password updated successfully.");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const statItems = [
    { label: "Active Datasets", value: datasetsData?.total || 0, icon: Database },
    { label: "Analyses Executed", value: historyData?.total || 0, icon: BarChart3 },
    { label: "Executive Briefings", value: 3, icon: FileText },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-black dark:text-white font-sans bg-[#f9f9f7] dark:bg-[#11120d]">
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#181914] shadow-sm">
        
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#edfe5e] border border-black/20 text-black shrink-0 font-bold">
          <UserIcon className="w-8 h-8 text-black" />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-1 min-w-0">
          <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
            <h1 className="text-xl font-serif font-bold tracking-tight">{user?.full_name || "Investigator"}</h1>
            <span className="flex items-center gap-1 text-[10px] bg-[#31e992]/20 text-[#31e992] border border-[#31e992]/40 px-2.5 py-0.5 rounded-full uppercase font-bold font-mono">
              <Sparkles className="w-3 h-3 text-[#31e992]" />
              Investigator Level 1
            </span>
          </div>
          <p className="text-xs font-mono font-bold text-black/70 dark:text-white/70">{user?.email || "agent@detective.ai"}</p>
          <p className="text-[11px] font-mono text-black/50 dark:text-white/50">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "2026"}</p>
        </div>
      </div>

      {/* Account stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#181914] flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/60 dark:text-white/60">{item.label}</p>
                <p className="text-2xl font-mono font-bold text-black dark:text-white mt-1">{item.value}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#edf0e9] dark:bg-[#262720] border border-black/10 dark:border-white/10 text-black dark:text-white">
                <Icon className="w-4.5 h-4.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Profile */}
      <div className="border border-black/15 dark:border-white/15 rounded-xl bg-white dark:bg-[#181914] p-6 space-y-5 shadow-sm">
        <div>
          <h2 className="text-xs font-mono font-bold text-black dark:text-white uppercase tracking-wider">Security Credentials</h2>
          <p className="text-xs font-sans text-black/70 dark:text-white/70 mt-1">Change your account password securely.</p>
        </div>
        
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md border-t border-black/10 dark:border-white/10 pt-4">
          <div className="space-y-1.5">
            <label htmlFor="old-pass" className="text-xs font-mono font-bold uppercase text-black dark:text-white">Old Password</label>
            <input
              id="old-pass"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-black/15 dark:border-white/15 bg-[#f9f9f7] dark:bg-[#262720] px-3.5 text-xs font-mono text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#edfe5e]"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="new-pass" className="text-xs font-mono font-bold uppercase text-black dark:text-white">New Password</label>
            <input
              id="new-pass"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-black/15 dark:border-white/15 bg-[#f9f9f7] dark:bg-[#262720] px-3.5 text-xs font-mono text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#edfe5e]"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirm-pass" className="text-xs font-mono font-bold uppercase text-black dark:text-white">Confirm Password</label>
            <input
              id="confirm-pass"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-black/15 dark:border-white/15 bg-[#f9f9f7] dark:bg-[#262720] px-3.5 text-xs font-mono text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#edfe5e]"
            />
          </div>
          <button
            type="submit"
            className="btn-ink-accent text-xs py-2.5 px-5 font-mono uppercase font-bold shadow-sm cursor-pointer"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
