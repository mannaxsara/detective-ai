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
            className={`w-full text-left flex items-center h-10 px-4 text-xs font-mono font-bold uppercase tracking-wider rounded-cards transition-all border cursor-pointer ${
              activeTab === "profile"
                ? "text-primary bg-primary/10 border-primary/20 shadow-sm"
                : "text-muted-foreground hover:text-foreground bg-transparent border-transparent hover:bg-muted/30"
            }`}
          >
            <UserIcon className="w-4 h-4 mr-2.5 shrink-0" />
            Agent Profile
          </button>
          
          <button
            onClick={() => setActiveTab("ui")}
            className={`w-full text-left flex items-center h-10 px-4 text-xs font-mono font-bold uppercase tracking-wider rounded-cards transition-all border cursor-pointer ${
              activeTab === "ui"
                ? "text-primary bg-primary/10 border-primary/20 shadow-sm"
                : "text-muted-foreground hover:text-foreground bg-transparent border-transparent hover:bg-muted/30"
            }`}
          >
            <Layout className="w-4 h-4 mr-2.5 shrink-0" />
            UI Preferences
          </button>
          
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full text-left flex items-center h-10 px-4 text-xs font-mono font-bold uppercase tracking-wider rounded-cards transition-all border cursor-pointer ${
              activeTab === "security"
                ? "text-primary bg-primary/10 border-primary/20 shadow-sm"
                : "text-muted-foreground hover:text-foreground bg-transparent border-transparent hover:bg-muted/30"
            }`}
          >
            <Shield className="w-4 h-4 mr-2.5 shrink-0" />
            Security & Keys
          </button>
        </div>

        {/* Right Side: Settings panels */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === "profile" && (
            <div className="rounded-cards border border-border bg-card p-6 flex flex-col gap-5 text-left shadow-sm">
              <div>
                <h4 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Agent Information</h4>
                <p className="text-muted-foreground text-xs mt-1">Update account credentials and authentication targets.</p>
              </div>
              
              <div className="border-t border-border/40 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-muted-foreground text-xs font-bold">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    defaultValue={user?.full_name || "User"}
                    className="h-10 w-full rounded-cards border border-border bg-background px-3.5 text-xs text-foreground placeholder:text-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-muted-foreground text-xs font-bold">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    defaultValue={user?.email || "user@company.com"}
                    disabled
                    className="h-10 w-full rounded-cards border border-border bg-muted/40 px-3.5 text-xs text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSave}
                  className="bg-primary hover:opacity-90 text-primary-foreground font-mono text-[10px] font-bold uppercase tracking-wider h-9 px-5 rounded-cards shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </div>
          )}

          {activeTab === "ui" && (
            <div className="rounded-cards border border-border bg-card p-6 flex flex-col gap-5 text-left shadow-sm">
              <div>
                <h4 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Application Settings</h4>
                <p className="text-muted-foreground text-xs mt-1">Toggle interface styling and engine behaviors.</p>
              </div>
              
              <div className="border-t border-border/40 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Dark Theme Interface</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Toggle interface styling mode between dark and light.</p>
                  </div>
                  <Switch checked={isDark} onCheckedChange={toggleTheme} className="data-[state=checked]:bg-primary" />
                </div>
                
                <div className="flex items-center justify-between border-t border-border/40 pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Strict Investigation Checks</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Always execute detailed anomaly checks during upload.</p>
                  </div>
                  <Switch checked={analytics} onCheckedChange={setAnalytics} className="data-[state=checked]:bg-primary" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="rounded-cards border border-border bg-card p-6 flex flex-col gap-5 text-left shadow-sm">
              <div>
                <h4 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Security Controls</h4>
                <p className="text-muted-foreground text-xs mt-1">Manage session credentials and active API keys.</p>
              </div>
              
              <div className="border-t border-border/40 pt-4 space-y-4">
                <div className="p-3.5 rounded-cards bg-background border border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>SESSION SECURE: JWT bearer active</span>
                  </div>
                  <span className="text-primary font-bold">ACTIVE</span>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="rounded-cards border border-destructive/30 bg-destructive/5 p-6 flex flex-col gap-5 text-left shadow-sm">
            <div>
              <h4 className="text-xs font-mono font-bold text-destructive uppercase tracking-wider">Danger Zone</h4>
              <p className="text-destructive/80 text-xs mt-1 font-medium">Permanently delete your profile and all active case logs.</p>
            </div>
            
            <div className="border-t border-destructive/20 pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">Delete Agent Profile</h4>
                <p className="text-xs text-muted-foreground mt-0.5">This action cannot be undone. All database records will be erased.</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="bg-destructive hover:opacity-90 text-destructive-foreground font-mono text-[10px] font-bold uppercase tracking-wider h-9 rounded-cards flex items-center gap-1.5 px-4 cursor-pointer transition-all"
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
