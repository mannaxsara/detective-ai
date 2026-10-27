"use client";

import React, { useState, useEffect } from "react";
import { Shield, User as UserIcon, Layout, Trash2, CheckCircle2, Key } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/auth-store";
import { useThemeToggle } from "@/components/ui/ThemeToggle";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { isDark, toggleTheme } = useThemeToggle({
    variant: "circle",
    start: "center",
    blur: true
  });

  const [fullName, setFullName] = useState("");
  const [analytics, setAnalytics] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "ui" | "security">("profile");
  const [customKey, setCustomKey] = useState("");
  const [aiProvider, setAiProvider] = useState<"gemini" | "ollama" | "openai" | "custom">("gemini");
  const [aiBaseUrl, setAiBaseUrl] = useState("");
  const [aiModel, setAiModel] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCustomKey(localStorage.getItem("detective_custom_gemini_key") || localStorage.getItem("detective_ai_key") || "");
      setAiProvider((localStorage.getItem("detective_ai_provider") as any) || "gemini");
      setAiBaseUrl(localStorage.getItem("detective_ai_base_url") || "");
      setAiModel(localStorage.getItem("detective_ai_model") || "");
    }
  }, []);

  const handleSaveCustomKey = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("detective_ai_provider", aiProvider);
      if (aiBaseUrl.trim()) {
        localStorage.setItem("detective_ai_base_url", aiBaseUrl.trim());
      } else {
        localStorage.removeItem("detective_ai_base_url");
      }
      if (aiModel.trim()) {
        localStorage.setItem("detective_ai_model", aiModel.trim());
      } else {
        localStorage.removeItem("detective_ai_model");
      }

      if (customKey.trim()) {
        localStorage.setItem("detective_custom_gemini_key", customKey.trim());
        localStorage.setItem("detective_ai_key", customKey.trim());
        toast.success(`AI configuration saved (${aiProvider.toUpperCase()}). Engine ready!`);
      } else {
        localStorage.removeItem("detective_custom_gemini_key");
        localStorage.removeItem("detective_ai_key");
        if (aiProvider === "ollama") {
          toast.success("Local Ollama engine saved (no API key required).");
        } else {
          toast.info("Custom API key removed. Using standard engine.");
        }
      }
    }
  };

  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user]);

  const handleSave = () => {
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }

    if (user) {
      setUser({ ...user, full_name: fullName.trim() });
    } else {
      setUser({
        id: "1",
        email: "chaitanyapatil700@gmail.com",
        full_name: fullName.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      });
    }

    toast.success("Agent profile successfully updated.");
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to permanently delete your agent profile? This action cannot be undone.")) {
      toast.error("Account deletion is disabled for demo purposes.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-black dark:text-white bg-[#f9f9f7] dark:bg-[#11120d]">
      
      {/* Title */}
      <div className="space-y-1 text-left">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
          Terminal Settings
        </h1>
        <p className="text-xs font-sans text-black/70 dark:text-white/70">
          Configure agent credentials, terminal preferences, and secure keys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Category selector */}
        <div className="space-y-2 flex flex-col items-stretch">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left flex items-center h-11 px-4 text-xs font-mono font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-[#edfe5e] text-black border-black/30 shadow-xs"
                : "text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white bg-white dark:bg-[#181914] border-black/15 dark:border-white/15 hover:bg-black/5"
            }`}
          >
            <UserIcon className="w-4 h-4 mr-2.5 shrink-0 text-black dark:text-white" />
            Agent Profile
          </button>
          
          <button
            onClick={() => setActiveTab("ui")}
            className={`w-full text-left flex items-center h-11 px-4 text-xs font-mono font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
              activeTab === "ui"
                ? "bg-[#edfe5e] text-black border-black/30 shadow-xs"
                : "text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white bg-white dark:bg-[#181914] border-black/15 dark:border-white/15 hover:bg-black/5"
            }`}
          >
            <Layout className="w-4 h-4 mr-2.5 shrink-0 text-black dark:text-white" />
            UI Preferences
          </button>
          
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full text-left flex items-center h-11 px-4 text-xs font-mono font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-[#edfe5e] text-black border-black/30 shadow-xs"
                : "text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white bg-white dark:bg-[#181914] border-black/15 dark:border-white/15 hover:bg-black/5"
            }`}
          >
            <Shield className="w-4 h-4 mr-2.5 shrink-0 text-black dark:text-white" />
            Security & Keys
          </button>
        </div>

        {/* Right Side: Settings panels */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === "profile" && (
            <div className="border border-black dark:border-[#3b3a33] rounded-[18px] bg-white dark:bg-[#1c1d18] p-6 space-y-5 shadow-[4px_4px_0px_#000000]">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">Agent Information</h2>
                <p className="text-xs font-sans text-black/70 dark:text-white/70 mt-1">Update account credentials and authentication targets.</p>
              </div>
              
              <div className="border-t border-black/10 dark:border-white/10 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2 text-left">
                  <label htmlFor="name" className="block text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Chaitanya Patil"
                    className="h-11 w-full rounded-xl border border-black/20 dark:border-white/20 bg-[#f9f9f7] dark:bg-[#262720] px-4 text-xs font-mono font-bold text-black dark:text-white leading-normal focus:outline-none focus:ring-2 focus:ring-[#edfe5e] transition-all shadow-xs"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label htmlFor="email" className="block text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user?.email || "chaitanyapatil700@gmail.com"}
                    disabled
                    className="h-11 w-full rounded-xl border border-black/20 dark:border-white/20 bg-[#edf0e9] dark:bg-[#1f201a] px-4 text-xs font-mono font-bold text-black/70 dark:text-white/70 cursor-not-allowed opacity-90 leading-normal"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSave}
                  className="btn-ink-accent text-xs py-2.5 px-6 font-mono uppercase font-bold shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </div>
          )}

          {activeTab === "ui" && (
            <div className="border border-black dark:border-[#3b3a33] rounded-[18px] bg-white dark:bg-[#1c1d18] p-6 space-y-5 shadow-[4px_4px_0px_#000000]">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">Application Settings</h2>
                <p className="text-xs font-sans text-black/70 dark:text-white/70 mt-1">Toggle interface styling and engine behaviors.</p>
              </div>
              
              <div className="border-t border-black/10 dark:border-white/10 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-serif font-bold text-black dark:text-white">Dark Theme Interface</h3>
                    <p className="text-xs font-sans text-black/70 dark:text-white/70 mt-0.5">Toggle interface styling mode between dark and light.</p>
                  </div>
                  <Switch checked={isDark} onCheckedChange={toggleTheme} className="data-[state=checked]:bg-[#edfe5e]" />
                </div>
                
                <div className="flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-4">
                  <div>
                    <h3 className="text-xs font-serif font-bold text-black dark:text-white">Strict Investigation Checks</h3>
                    <p className="text-xs font-sans text-black/70 dark:text-white/70 mt-0.5">Always execute detailed 3-sigma anomaly checks during file upload.</p>
                  </div>
                  <Switch checked={analytics} onCheckedChange={setAnalytics} className="data-[state=checked]:bg-[#edfe5e]" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="border border-black dark:border-[#3b3a33] rounded-[18px] bg-white dark:bg-[#1c1d18] p-6 space-y-5 shadow-[4px_4px_0px_#000000]">
              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">Security Controls</h2>
                <p className="text-xs font-sans text-black/70 dark:text-white/70 mt-1">Manage session credentials and active API keys.</p>
              </div>
              
              <div className="border-t border-black/10 dark:border-white/10 pt-4 space-y-4">
                <div className="p-4 rounded-xl bg-[#f9f9f7] dark:bg-[#262720] border border-black/15 dark:border-white/15 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 font-bold text-black dark:text-white">
                    <Shield className="w-4 h-4 text-[#31e992]" />
                    <span>SESSION SECURE: JWT Bearer Token</span>
                  </div>
                  <span className="bg-[#31e992]/20 text-[#31e992] border border-[#31e992]/40 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                    ACTIVE
                  </span>
                </div>

                {/* Multi-Engine AI Provider & BYOK */}
                <div className="p-4 rounded-xl bg-[#f9f9f7] dark:bg-[#262720] border border-black/15 dark:border-white/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono font-bold text-xs text-black dark:text-white">
                      <Key className="w-4 h-4 text-[#edfe5e]" />
                      <span>AI Engine & Model Configuration</span>
                    </div>
                    {customKey || aiProvider === "ollama" ? (
                      <span className="bg-[#31e992]/20 text-[#31e992] border border-[#31e992]/40 px-2.5 py-0.5 rounded-full font-bold text-[10px] font-mono">
                        {aiProvider === "ollama" ? "LOCAL ACTIVE" : "KEY CONNECTED"}
                      </span>
                    ) : (
                      <span className="bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60 border border-black/15 dark:border-white/15 px-2.5 py-0.5 rounded-full font-bold text-[10px] font-mono">
                        STANDARD
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-sans text-black/70 dark:text-white/70 leading-relaxed">
                    Connect your personal Google Gemini API key, standard OpenAI key, or run completely offline with <strong>Local Ollama / LM Studio</strong> on your PC for 100% private data forensics.
                  </p>

                  {/* Provider Radio Tabs */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { id: "gemini", label: "Google Gemini" },
                      { id: "ollama", label: "Local Ollama" },
                      { id: "openai", label: "OpenAI / Custom" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setAiProvider(p.id as any)}
                        className={`h-8 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                          aiProvider === p.id
                            ? "bg-[#edfe5e] text-black border-black shadow-xs"
                            : "bg-white dark:bg-[#181914] text-black/70 dark:text-white/70 border-black/15 dark:border-white/15 hover:bg-black/5"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Inputs based on provider */}
                  {aiProvider === "ollama" && (
                    <div className="space-y-2 pt-1 text-left">
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-mono uppercase font-bold text-black/60 dark:text-white/60">Ollama Base URL</label>
                          <input
                            type="text"
                            value={aiBaseUrl}
                            onChange={(e) => setAiBaseUrl(e.target.value)}
                            placeholder="http://localhost:11434/v1"
                            className="h-9 w-full rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-[#181914] px-3 text-xs font-mono text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-[#edfe5e]"
                          />
                        </div>
                        <div className="w-1/3 space-y-1">
                          <label className="text-[10px] font-mono uppercase font-bold text-black/60 dark:text-white/60">Model</label>
                          <input
                            type="text"
                            value={aiModel}
                            onChange={(e) => setAiModel(e.target.value)}
                            placeholder="llama3.2"
                            className="h-9 w-full rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-[#181914] px-3 text-xs font-mono text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-[#edfe5e]"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] font-mono text-[#31e992]">
                        ✓ Offline & 100% Private. No external network requests or API costs.
                      </p>
                    </div>
                  )}

                  {aiProvider === "openai" && (
                    <div className="space-y-2 pt-1 text-left">
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-mono uppercase font-bold text-black/60 dark:text-white/60">Custom Base URL (Optional)</label>
                          <input
                            type="text"
                            value={aiBaseUrl}
                            onChange={(e) => setAiBaseUrl(e.target.value)}
                            placeholder="https://api.openai.com/v1 (or Groq, DeepSeek)"
                            className="h-9 w-full rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-[#181914] px-3 text-xs font-mono text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-[#edfe5e]"
                          />
                        </div>
                        <div className="w-1/3 space-y-1">
                          <label className="text-[10px] font-mono uppercase font-bold text-black/60 dark:text-white/60">Model</label>
                          <input
                            type="text"
                            value={aiModel}
                            onChange={(e) => setAiModel(e.target.value)}
                            placeholder="gpt-4o-mini"
                            className="h-9 w-full rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-[#181914] px-3 text-xs font-mono text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-[#edfe5e]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="password"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      placeholder={
                        aiProvider === "ollama"
                          ? "API Key optional for local Ollama"
                          : aiProvider === "gemini"
                          ? "Google Gemini Key (AIzaSy...)"
                          : "API Key (sk-...)"
                      }
                      className="h-10 flex-1 rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-[#181914] px-3 text-xs font-mono text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#edfe5e]"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomKey}
                      className="btn-ink-accent px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="border border-[#bc3e3e]/30 rounded-[18px] bg-[#bc3e3e]/5 p-6 space-y-4 shadow-[4px_4px_0px_#000000]">
            <div>
              <h2 className="text-xs font-mono font-bold text-[#bc3e3e] uppercase tracking-wider">Danger Zone</h2>
              <p className="text-xs font-sans text-black/70 dark:text-white/70 mt-1 font-medium">Permanently delete your agent profile and all active case logs.</p>
            </div>
            
            <div className="border-t border-black/10 dark:border-white/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-serif font-bold text-black dark:text-white">Delete Agent Profile</h3>
                <p className="text-[11px] font-sans text-black/60 dark:text-white/60 mt-0.5">This action cannot be undone. All database records will be erased.</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="bg-[#bc3e3e] text-white border border-[#bc3e3e]/40 font-mono font-bold text-xs uppercase py-2.5 px-5 rounded-lg shadow-[4px_4px_0px_#000000] flex items-center gap-1.5 cursor-pointer hover:brightness-110 shrink-0"
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
