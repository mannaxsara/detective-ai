"use client";

import React, { useState } from "react";
import { Shield, User as UserIcon, Layout, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/auth-store";
import { useThemeToggle } from "@/components/ui/ThemeToggle";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useThemeToggle({
    variant: "circle",
    start: "center",
    blur: true
  });
  const [analytics, setAnalytics] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "ui" | "security">("profile");

  const handleSave = () => {
    toast.success("Agent preferences successfully updated.");
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to permanently delete your agent profile? This action cannot be undone.")) {
      toast.error("Account deletion is disabled for demo purposes.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-muted-foreground">
      
      {/* Title */}
      <div className="space-y-1 text-left">
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Terminal Settings
        </h1>
        <p className="text-muted-foreground/60 text-xs font-bold uppercase tracking-wider">
          Configure agent credentials, terminal preferences, and secure keys
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Category selector */}
        <div className="space-y-1.5 flex flex-col items-stretch">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left flex items-center h-10 px-4.5 text-xs font-bold rounded-full transition-all border cursor-pointer ${
              activeTab === "profile"
                ? "text-primary bg-primary/10 border-primary/25 shadow-sm"
                : "text-muted-foreground hover:text-foreground bg-transparent border-transparent hover:bg-card/50"
            }`}
          >
            <UserIcon className="w-4 h-4 mr-2.5 shrink-0" />
            Agent Profile
          </button>
          
          <button
            onClick={() => setActiveTab("ui")}
            className={`w-full text-left flex items-center h-10 px-4.5 text-xs font-bold rounded-full transition-all border cursor-pointer ${
              activeTab === "ui"
                ? "text-primary bg-primary/10 border-primary/25 shadow-sm"
                : "text-muted-foreground hover:text-foreground bg-transparent border-transparent hover:bg-card/50"
            }`}
          >
            <Layout className="w-4 h-4 mr-2.5 shrink-0" />
            UI Preferences
          </button>
          
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full text-left flex items-center h-10 px-4.5 text-xs font-bold rounded-full transition-all border cursor-pointer ${
              activeTab === "security"
                ? "text-primary bg-primary/10 border-primary/25 shadow-sm"
                : "text-muted-foreground hover:text-foreground bg-transparent border-transparent hover:bg-card/50"
            }`}
          >
            <Shield className="w-4 h-4 mr-2.5 shrink-0" />
            Security & Keys
          </button>
        </div>

        {/* Right Side: Settings panels */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === "profile" && (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6.5 flex flex-col gap-5 text-left shadow-sm">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
              
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Agent Information</h4>
                <p className="text-muted-foreground/60 text-[10px] font-semibold mt-0.5">Update account credentials and authentication targets.</p>
              </div>
              
              <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-muted-foreground text-xs font-bold">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    defaultValue={user?.full_name || "User"}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3.5 text-xs text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-muted-foreground text-xs font-bold">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    defaultValue={user?.email || "user@company.com"}
                    disabled
                    className="h-10 w-full rounded-lg border border-border bg-background/50 px-3.5 text-xs text-muted-foreground/40 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSave}
                  className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs h-9 px-5 rounded-full shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </div>
          )}

          {activeTab === "ui" && (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6.5 flex flex-col gap-5 text-left shadow-sm">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
              
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Application Settings</h4>
                <p className="text-muted-foreground/60 text-[10px] font-semibold mt-0.5">Toggle interface styling and engine behaviors.</p>
              </div>
              
              <div className="border-t border-border pt-4 space-y-4.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Obsidian Dark Interface</h4>
                    <p className="text-[10px] text-muted-foreground/50 font-semibold mt-0.5">Toggle interface styling mode between dark and light.</p>
                  </div>
                  <Switch checked={isDark} onCheckedChange={toggleTheme} className="data-[state=checked]:bg-primary" />
                </div>
                
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Strict Investigation Checks</h4>
                    <p className="text-[10px] text-muted-foreground/50 font-semibold mt-0.5">Always execute detailed anomaly checks during upload.</p>
                  </div>
                  <Switch checked={analytics} onCheckedChange={setAnalytics} className="data-[state=checked]:bg-primary" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6.5 flex flex-col gap-5 text-left shadow-sm">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
              
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Security Controls</h4>
                <p className="text-muted-foreground/60 text-[10px] font-semibold mt-0.5">Manage session credentials and active API keys.</p>
              </div>
              
              <div className="border-t border-border pt-4 space-y-4">
                <div className="p-3.5 rounded-lg bg-background border border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground/50">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>SESSION SECURE: JWT bearer loop online</span>
                  </div>
                  <span className="text-primary font-bold">ACTIVE</span>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 flex flex-col gap-5 text-left shadow-sm">
            <div>
              <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider">Danger Zone</h4>
              <p className="text-rose-500/60 text-[10px] font-semibold mt-0.5">Permanently delete your profile and all active case logs.</p>
            </div>
            
            <div className="border-t border-rose-500/10 pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">Delete Agent Profile</h4>
                <p className="text-[10px] text-muted-foreground/55 font-semibold mt-0.5">This action cannot be undone. All database records will be erased.</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-9 rounded-full flex items-center gap-1.5 px-5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
