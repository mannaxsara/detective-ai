"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check, ArrowRight, Database, Cpu, ShieldCheck, HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";

function LogoMark({ size = 28 }: { size?: number }) {
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

export default function PricingPage() {
  const [mounted, setMounted] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [customStorage, setCustomStorage] = useState<number>(2); // slider step index

  useEffect(() => { setMounted(true); }, []);

  const storageSteps = [
    { label: "100 MB", val: 100, price: 0, specs: "Single-thread Polars, standard Z-Score scans", tier: "Sand Free" },
    { label: "1 GB", val: 1000, price: 19, specs: "4-core parallel engine, ARIMA vector checks", tier: "Developer" },
    { label: "10 GB", val: 10000, price: 49, specs: "16-core parallel parsing, full AI copilot support", tier: "Charcoal Pro" },
    { label: "100 GB", val: 100000, price: 149, specs: "Dedicated memory-only sandbox, custom ARIMA coefficients", tier: "Enterprise Scale" },
    { label: "1 TB", val: 1000000, price: 399, specs: "Custom FastAPI execution cluster, unlimited executive report briefings", tier: "Forensic Core" }
  ];

  const activeStep = storageSteps[customStorage];
  const calculatedPrice = billingPeriod === "annual" ? Math.floor(activeStep.price * 0.8) : activeStep.price;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] dark:bg-[#11120d] flex items-center justify-center font-mono text-[9px] text-[#555555] dark:text-[#a09e93] uppercase tracking-widest">
        Initializing pricing sandbox...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-[#11120d] text-black dark:text-white font-sans relative overflow-hidden flex flex-col justify-between">
      
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(86,84,73,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(86,84,73,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Navbar capsules */}
      <header className="relative z-20 max-w-[1180px] w-full mx-auto px-6 pt-6 flex justify-between items-center select-none">
        <Link href="/" className="flex items-center gap-2 text-black dark:text-[#edfe5e] hover:opacity-95 transition-opacity">
          <LogoMark size={14} />
          <span className="font-mono font-bold text-[10px] uppercase tracking-[0.2em] text-black dark:text-white">DetectiveAI</span>
        </Link>
        <Link href="/dashboard" className="px-3.5 py-1.5 rounded-full border border-black dark:border-[#3b3a33] bg-[#f9f9f7] dark:bg-[#1c1d18] text-[9px] font-mono font-bold uppercase tracking-wider hover:bg-[#f9f9f7] dark:hover:bg-[#11120d] transition-all">
          Workspace →
        </Link>
      </header>

      {/* Main container */}
      <main className="relative z-10 max-w-[1000px] mx-auto px-6 py-12 md:py-20 flex-1 flex flex-col justify-center space-y-12 md:space-y-16">
        
        {/* Typographic Headings */}
        <div className="text-center space-y-3">
          <span className="font-mono text-[9px] font-bold text-black dark:text-[#edfe5e] uppercase tracking-widest">Pricing Strategy</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none text-black dark:text-white max-w-2xl mx-auto">
            Predictable. transparent.<br />forensic pricing.
          </h1>
          <p className="text-[#555555]/60 dark:text-[#a09e93]/60 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
            Select the target active data volume capacity your diagnostics team needs. Zero server storage retention.
          </p>
        </div>

        {/* Toggle + Interactive Slider block */}
        <div className="border border-black dark:border-[#3b3a33] bg-[#f9f9f7] dark:bg-[#1c1d18] rounded-2xl p-6 md:p-8 space-y-8 max-w-2xl w-full mx-auto shadow-sm">
          
          {/* Switcher & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/40 dark:border-[#3b3a33]/40 pb-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">Ingestion Capacity Calculator</h3>
              <p className="text-[10px] text-[#555555] dark:text-[#a09e93] mt-0.5">Drag to dynamically scale active telemetry workspace sizes.</p>
            </div>
            
            {/* Billing period switcher */}
            <div className="flex border border-black dark:border-[#3b3a33] rounded-full p-0.5 bg-[#f9f9f7] dark:bg-[#11120d] font-mono text-[8px] self-start sm:self-auto select-none">
              <button 
                onClick={() => setBillingPeriod("monthly")} 
                className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-all ${billingPeriod === "monthly" ? "bg-black dark:bg-[#edfe5e] text-[#f9f9f7] dark:text-black" : "text-[#555555] dark:text-[#a09e93] hover:text-black dark:hover:text-white"}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingPeriod("annual")} 
                className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-all ${billingPeriod === "annual" ? "bg-black dark:bg-[#edfe5e] text-[#f9f9f7] dark:text-black" : "text-[#555555] dark:text-[#a09e93] hover:text-black dark:hover:text-white"}`}
              >
                Annual (-20%)
              </button>
            </div>
          </div>

          {/* Interactive slider element */}
          <div className="space-y-6">
            <div className="flex justify-between items-center font-mono">
              <span className="text-[10px] text-[#555555] dark:text-[#a09e93]">Select File limit:</span>
              <span className="text-lg font-black text-black dark:text-white">{activeStep.label}</span>
            </div>
            
            <input 
              type="range" 
              min={0} 
              max={4} 
              step={1} 
              value={customStorage}
              onChange={(e) => setCustomStorage(Number(e.target.value))}
              className="w-full h-1 bg-black dark:bg-[#3b3a33] rounded-full appearance-none cursor-pointer accent-black dark:accent-[#edfe5e] focus:outline-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black dark:[&::-webkit-slider-thumb]:bg-[#edfe5e] [&::-webkit-slider-thumb]:appearance-none"
            />
            
            <div className="flex justify-between font-mono text-[8.5px] text-[#555555]/45 dark:text-[#a09e93]/45 font-bold px-0.5">
              {storageSteps.map((s, i) => (
                <span key={i} className={`cursor-pointer transition-colors ${customStorage === i ? "text-black dark:text-[#edfe5e] font-bold" : ""}`} onClick={() => setCustomStorage(i)}>{s.label}</span>
              ))}
            </div>
          </div>

          {/* Pricing Result Card */}
          <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-6 bg-[#f9f9f7]/30 dark:bg-[#11120d]/30 border border-black/40 dark:border-[#3b3a33]/40 rounded-xl p-5 items-center">
            <div className="space-y-1.5 text-left">
              <span className="font-mono text-[8px] px-2 py-0.5 rounded bg-black/10 dark:bg-[#edfe5e]/10 text-black dark:text-[#edfe5e] font-bold uppercase tracking-wider">{activeStep.tier}</span>
              <h4 className="text-xs font-bold text-black dark:text-white mt-2">{activeStep.label} active case limit</h4>
              <p className="text-[10px] text-[#555555] dark:text-[#a09e93] leading-normal">{activeStep.specs}</p>
            </div>
            <div className="sm:text-right space-y-3">
              <div className="font-mono leading-none">
                <span className="text-3xl font-black text-black dark:text-white tracking-tight">${calculatedPrice}</span>
                <span className="text-[9px] text-[#555555]/60 dark:text-[#a09e93]/60 uppercase">/mo</span>
              </div>
              <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-black dark:bg-[#edfe5e] text-[#f9f9f7] dark:text-black font-mono text-[9px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all">
                Select plan <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* Feature comparison checks grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full mx-auto pt-4">
          {[
            { t: "Polars Core Ingestion", d: "High speed rust-backed schema parsers run on every case file, coercing types under 15ms." },
            { t: "Predictive ARIMA Arrays", d: "Compute autotuned auto-regressive integrations projecting forecasts 90 periods forward." },
            { t: "Zero-Retention Isolation", d: "No persistent databases. Your uploaded CSV, JSON and Parquet bytes reside entirely in RAM." }
          ].map((item, i) => (
            <div key={i} className="space-y-2 border-t border-black/30 dark:border-[#3b3a33]/30 pt-4 cursor-default">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-black/10 dark:bg-[#edfe5e]/10 border border-black/20 dark:border-[#edfe5e]/20 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-black dark:text-[#edfe5e]" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-black dark:text-white">{item.t}</span>
              </div>
              <p className="text-[9.5px] text-[#555555] dark:text-[#a09e93] leading-normal">{item.d}</p>
            </div>
          ))}
        </div>

      </main>

      {/* Styled simple footer */}
      <footer className="relative z-10 border-t border-black dark:border-[#3b3a33] py-8 bg-[#f9f9f7]/20 dark:bg-[#1c1d18]/20 select-none">
        <div className="max-w-[1180px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-[8px] text-[#555555]/45 dark:text-[#a09e93]/45 font-bold uppercase tracking-widest">
          <span>© {new Date().getFullYear()} DetectiveAI Pricing</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home Page</Link>
            <span>·</span>
            <Link href="/dashboard" className="hover:text-black dark:hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
