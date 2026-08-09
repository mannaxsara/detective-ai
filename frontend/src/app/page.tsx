"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, ShieldAlert, LineChart, MessageSquare,
  FileText, Database, ArrowUpRight, RefreshCw,
  BarChart3, Layers, Sparkles, Copy, Check,
  CheckCircle2, Zap, ShieldCheck, Sun, Moon,
  Clock, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeToggle } from "@/components/ui/ThemeToggle";

/* ─────────────────────────────────────────────────────────────
   MAGNIFYING LENS LOGO — Official High-Contrast Monogram SVG
───────────────────────────────────────────────────────────── */
function MagnifyingLogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 transition-transform group-hover:scale-105">
      <circle cx="13" cy="13" r="9" stroke="currentColor" strokeWidth="3" fill="none" />
      <circle cx="13" cy="13" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
      <circle cx="11" cy="11" r="1.2" fill="currentColor" />
      <circle cx="15" cy="14" r="1" fill="currentColor" />
      <path d="M19.5 19.5L27.5 27.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN HOMEPAGE (Editorial Brutalist Masterpiece)
───────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCodeTab, setSelectedCodeTab] = useState<"python" | "nodejs" | "curl">("python");
  const [copiedCode, setCopiedCode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark: isDarkMode, toggleTheme } = useThemeToggle();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [apiViewMode, setApiViewMode] = useState<"code" | "response">("code");

  useEffect(() => {
    if (localStorage.getItem("detective_token")) setIsLoggedIn(true);
    setLoading(false);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const codeSnippets = {
    python: `import httpx

# Programmatically trigger automated dataset sweep (REST API v1)
response = httpx.post(
    "https://detective-ai-guio.onrender.com/api/datasets/upload",
    files={"file": open("server_telemetry.parquet", "rb")},
    headers={"Authorization": "Bearer YOUR_JWT_TOKEN"}
)

analysis = response.json()
print("Health Score:", analysis["health_score"])
print("3-Sigma Outliers:", len(analysis["anomalies"]))
print("PDF Briefing Report:", analysis["report_pdf_url"])`,

    nodejs: `import axios from 'axios';
import fs from 'fs';

// Trigger automated dataset sweep from your Node backend
const formData = new FormData();
formData.append('file', fs.createReadStream('server_telemetry.parquet'));

const res = await axios.post(
  'https://detective-ai-guio.onrender.com/api/datasets/upload',
  formData,
  { headers: { Authorization: 'Bearer YOUR_JWT_TOKEN' } }
);

console.log('Case ID:', res.data.id);
console.log('Health Score:', res.data.health_score);`,

    curl: `# Upload raw dataset directly via cURL from terminal or CI/CD
curl -X POST "https://detective-ai-guio.onrender.com/api/datasets/upload" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -F "file=@server_telemetry.parquet"`
  };

  const faqs = [
    {
      q: "What file formats and dataset sizes does DetectiveAI support?",
      a: "DetectiveAI accepts CSV, XLSX, XLS, and Apache Parquet binary files up to 500MB per upload. Powered by Polars, our Rust-native execution engine parses and profiles multi-million row datasets in seconds."
    },
    {
      q: "How does DetectiveAI detect data anomalies and outliers?",
      a: "We run dual statistical sweeps: Interquartile Range (IQR) bounds for distribution skew and Z-score magnitude analysis (|Z| > 3.0) across numerical columns. Outlier rows are flagged with severe drift indicators and exact cell coordinates."
    },
    {
      q: "Are my evidence datasets kept private and secure?",
      a: "Yes. Every upload is encrypted in transit and at rest using AES-256 storage, processed within an isolated temporary sandbox, and never retained or fed into public LLM training datasets."
    },
    {
      q: "Can I export reports for executive briefings and stakeholder presentations?",
      a: "With one click, DetectiveAI compiles all schema diagnostics, 3-sigma anomaly findings, ARIMA forecast curves, and statistical test results into publication-grade PDF or Word briefing documents."
    },
    {
      q: "Can I trigger forensics sweeps automatically via API?",
      a: "Yes. Full REST API access is available to programmatically upload datasets, poll case health diagnostics, and retrieve structured JSON analysis payloads directly within your Python or Node.js backend pipelines."
    },
    {
      q: "What statistical hypothesis tests are conducted on categorical data?",
      a: "Our statistics lab automatically executes Chi-Square tests of independence on categorical pairs, Student's t-tests across numerical cohorts, and Pearson correlation matrices to quantify feature relationships with precise p-values."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-[#11120d] text-[#000000] dark:text-[#f9f9f7] font-sans selection:bg-[#edfe5e] selection:text-[#000000] overflow-x-hidden transition-colors duration-200">
      
      {/* ── TOP NAVIGATION BAR ── */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[1120px]">
        <div className="rounded-[16px] border border-black dark:border-[#3b3a33] bg-[#f9f9f7]/90 dark:bg-[#1c1d18]/90 backdrop-blur-xl px-5 h-[56px] flex items-center justify-between shadow-[4px_4px_0px_#000000]">
          
          {/* Left: Reticle Lens Brand Mark */}
          <Link href="/" className="flex items-center gap-3 group select-none cursor-pointer">
            <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-[9px] border border-black bg-[#edfe5e] flex items-center justify-center text-black font-bold shadow-[2px_2px_0px_#000000] group-hover:bg-[#31e992] transition-colors shrink-0">
              <MagnifyingLogoMark size={20} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-extrabold text-lg text-black dark:text-white tracking-tight">
                Detective
              </span>
              <span className="font-mono text-[10px] font-black uppercase tracking-wider bg-[#31e992] text-black border border-black px-1.5 py-0.5 rounded-[4px] shadow-[1px_1px_0px_#000000] group-hover:bg-[#edfe5e] transition-colors">
                AI
              </span>
            </div>
          </Link>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wider">
            {[
              { label: "Features", href: "#features" },
              { label: "Modules", href: "#modules" },
              { label: "API", href: "#api" },
              { label: "Pricing", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                className="px-3 py-1.5 rounded-[6px] border border-transparent hover:border-black dark:hover:border-[#3b3a33] hover:bg-[#edfe5e] dark:hover:bg-[#edfe5e] text-black/75 dark:text-white/80 hover:text-black dark:hover:text-black transition-all cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right: Actions & Dark/Light Mode Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-[8px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#262720] hover:bg-[#edfe5e] dark:hover:bg-[#edfe5e] text-black dark:text-white dark:hover:text-black shadow-[2px_2px_0px_#000000] cursor-pointer transition-all flex items-center justify-center active:scale-[0.98]"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Dark / Light Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {!loading && (
              isLoggedIn ? (
                <Link href="/dashboard">
                  <span className="btn-ink-accent text-xs py-1.5 px-4 flex items-center gap-1.5 cursor-pointer font-mono uppercase font-bold shadow-[2px_2px_0px_#000000] hover:translate-y-[-1px] active:scale-[0.98] transition-transform">
                    Workspace <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:inline-block font-mono text-xs font-bold uppercase text-black/70 dark:text-white/80 hover:text-black dark:hover:text-white hover:underline px-2">
                    Sign in
                  </Link>
                  <Link href="/register">
                    <span className="btn-ink-accent text-xs py-1.5 px-4 cursor-pointer font-mono uppercase font-bold shadow-[2px_2px_0px_#000000] hover:translate-y-[-1px] active:scale-[0.98] transition-transform">
                      Get Started
                    </span>
                  </Link>
                </>
              )
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-[6px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] md:hidden text-black dark:text-white shadow-[1px_1px_0px_#000000] cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              <div className="w-4 h-4 flex flex-col justify-between items-center py-0.5">
                <span className={`w-full h-0.5 bg-black dark:bg-white transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
                <span className={`w-full h-0.5 bg-black dark:bg-white transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
                <span className={`w-full h-0.5 bg-black dark:bg-white transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 border border-black dark:border-[#3b3a33] rounded-[12px] bg-[#f9f9f7] dark:bg-[#1c1d18] overflow-hidden md:hidden shadow-[4px_4px_0px_#000000]"
            >
              <div className="px-5 py-5 space-y-3 font-mono text-xs font-bold uppercase">
                <div className="grid grid-cols-2 gap-2 pb-3 border-b border-black dark:border-[#3b3a33]">
                  <a href="#features" onClick={() => setMobileMenuOpen(false)} className="p-2 border border-black dark:border-[#3b3a33] rounded-[6px] bg-white dark:bg-[#262720] text-center">Features</a>
                  <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="p-2 border border-black dark:border-[#3b3a33] rounded-[6px] bg-white dark:bg-[#262720] text-center">Modules</a>
                  <a href="#api" onClick={() => setMobileMenuOpen(false)} className="p-2 border border-black dark:border-[#3b3a33] rounded-[6px] bg-white dark:bg-[#262720] text-center">API</a>
                  <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="p-2 border border-black dark:border-[#3b3a33] rounded-[6px] bg-white dark:bg-[#262720] text-center">Pricing</a>
                  <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="p-2 border border-black dark:border-[#3b3a33] rounded-[6px] bg-white dark:bg-[#262720] text-center">FAQ</a>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-ink-outlined text-center py-2">
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn-ink-accent text-center py-2 shadow-[2px_2px_0px_#000000]">
                    Get Started Free
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO SECTION (BALANCED SPACING BELOW FIXED NAVBAR) ── */}
      <section className="border-b border-black dark:border-[#3b3a33] pt-28 sm:pt-32 md:pt-36 pb-20 md:pb-28 bg-[#f9f9f7] dark:bg-[#11120d] relative">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="space-y-6 max-w-[800px] text-left">
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[24px] border border-black dark:border-[#3b3a33] bg-[#edfe5e] text-black text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_#000000]">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                Autonomous Data Forensics & Statistical Intelligence
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] tracking-tight text-black dark:text-white">
              Raw Spreadsheets Into <br />
              <span className="bg-[#edfe5e] text-black border-2 border-black px-4 py-2 sm:py-2.5 pb-3 rounded-2xl inline-block mt-3 shadow-[4px_4px_0px_#000000] leading-snug">
                Inked Executive Briefings.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-sans text-black/85 dark:text-white/85 max-w-[640px] leading-relaxed tracking-[0.02em] pt-2">
              Upload CSV, Excel, or Parquet datasets. DetectiveAI profiles schema health, isolates 3-sigma outliers, projects time-series forecasts, and exports executive briefing reports in under 10 seconds.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link href={isLoggedIn ? "/dashboard" : "/register"}>
                <span className="btn-ink-accent text-sm py-3.5 px-7 font-mono uppercase font-bold inline-flex items-center gap-2 cursor-pointer shadow-[3.5px_3.5px_0px_#000000] hover:translate-y-[-1px] active:scale-[0.98] transition-transform">
                  {isLoggedIn ? "Open Forensics Workspace" : "Start Free Investigation"}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link href="/history">
                <span className="btn-ink-outlined text-sm py-3.5 px-7 font-mono uppercase font-bold inline-flex items-center gap-2 cursor-pointer active:scale-[0.98]">
                  Browse Case Archives
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── BUILT FOR TECHNICAL PRECISION (PILLARS) ── */}
      <section id="features" className="scroll-mt-28 border-b border-black dark:border-[#3b3a33] py-24 md:py-32 bg-[#edf0e9] dark:bg-[#181914]">
        <div className="max-w-[1240px] mx-auto px-6 space-y-16">
          <div className="space-y-4 max-w-[760px] text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.08em] bg-[#edfe5e] text-black px-3.5 py-1.5 border border-black rounded-[4px] inline-block shadow-[2px_2px_0px_#000000]">
              Engine Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-black dark:text-white tracking-tight">
              Built For Technical Precision.
            </h2>
            <p className="text-base sm:text-lg font-sans text-black/80 dark:text-white/80 leading-relaxed">
              Standard BI tools only chart what exists. DetectiveAI audits dataset structural validity, exposes hidden 3-sigma anomalies, and generates 1-click automated remediation scripts.
            </p>
          </div>

          {/* 4 Spacious Pillar Cards with Large Bold Lucide Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {[
              {
                title: "Polars Rust Speed",
                desc: "Parses 10M+ rows in under 2 seconds with zero memory overhead via parallel SIMD vector processing.",
                accent: "bg-[#edfe5e] text-black",
                badge: "100× Faster",
                icon: Zap
              },
              {
                title: "Zero Hallucinations",
                desc: "Dual IQR & Z-score distribution sweeps ensure 100% mathematical reproducibility without LLM hallucinations.",
                accent: "bg-[#e6ebf5] dark:bg-[#1f2430] text-black dark:text-white",
                badge: "100% Deterministic",
                icon: ShieldAlert
              },
              {
                title: "1-Click Remediation",
                desc: "Detects null drifts, duplicate keys, and negative anomalies, producing automated Python & SQL fix scripts.",
                accent: "bg-[#dbeee3] dark:bg-[#1a2820] text-black dark:text-white",
                badge: "Auto-Fix Scripts",
                icon: RefreshCw
              },
              {
                title: "Executive PDF Exports",
                desc: "Compiles all schema charts, statistical test results, and recommendations into publication-grade briefing PDFs.",
                accent: "bg-[#f4f4f0] dark:bg-[#1c1d18] text-black dark:text-white",
                badge: "PDF / DOCX",
                icon: FileText
              }
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className={`border border-black dark:border-[#3b3a33] rounded-2xl p-7 space-y-6 ${p.accent} shadow-[5px_5px_0px_#000000] hover:shadow-[7px_7px_0px_#000000] hover:translate-y-[-2px] transition-all flex flex-col justify-between`}
                >
                  <div className="space-y-5 text-left">
                    <div className="flex items-center justify-between gap-3">
                      {/* Prominent High-Contrast 56x56px Icon Badge with size={28} Icon */}
                      <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-2xl border-2 border-black bg-[#edfe5e] flex items-center justify-center text-black font-bold shadow-[3px_3px_0px_#000000] shrink-0">
                        <Icon size={28} className="text-black shrink-0 stroke-[2.5]" />
                      </div>
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider bg-black text-white px-3 py-1 rounded border border-black shadow-[1px_1px_0px_#000000] shrink-0">
                        {p.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold font-serif leading-snug">{p.title}</h3>
                    <p className="text-xs sm:text-sm font-sans opacity-90 leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="pt-4 border-t border-black/20 dark:border-white/20 flex items-center gap-2 font-mono text-[11px] font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-[#31e992]" />
                    <span>Verified Standard</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMPLETE FORENSICS SUITE (4-COLUMN BENTO GRID WITH PROMINENT LOGO & ICONS) ── */}
      <section id="modules" className="scroll-mt-28 border-b border-black dark:border-[#3b3a33] py-24 md:py-32 bg-[#f9f9f7] dark:bg-[#11120d]">
        <div className="max-w-[1240px] mx-auto px-6 space-y-16">
          
          {/* Section Header with Large 64x64px Section Logo Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-black/10 dark:border-white/10 pb-8 text-left">
            <div className="w-16 h-16 min-w-[64px] min-h-[64px] rounded-2xl bg-[#edfe5e] border-2 border-black flex items-center justify-center text-black font-bold shadow-[4px_4px_0px_#000000] shrink-0">
              <Layers size={32} className="text-black shrink-0 stroke-[2.5]" />
            </div>
            <div className="space-y-2 max-w-[760px]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-[0.08em] bg-[#edfe5e] text-black px-3.5 py-1.5 border border-black rounded-[4px] shadow-[2px_2px_0px_#000000]">
                  Forensics Suite Core
                </span>
                <span className="text-xs font-mono text-black/60 dark:text-white/60 font-bold uppercase">
                  6 Analytical Engines Active
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold font-serif text-black dark:text-white tracking-tight">
                Core Intelligence Modules.
              </h2>
              <p className="text-sm sm:text-base font-sans text-black/80 dark:text-white/80 leading-relaxed">
                Every evidence upload executes in parallel across our 6 core analytical engines.
              </p>
            </div>
          </div>

          {/* 4-Column Bento Grid Layout with Prominent 56x56px Icon Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 lg:gap-8">
            {[
              {
                num: "01",
                title: "Polars Columnar Profiling",
                desc: "High-speed columnar profiling engine parses null ratios, min/max bounds, variance, and distinct cardinality across multi-million row datasets in milliseconds.",
                accent: "bg-[#edfe5e] text-black",
                icon: Database,
                tag: "Polars Core",
                span: "lg:col-span-2"
              },
              {
                num: "02",
                title: "3-Sigma Anomaly Outlier Scan",
                desc: "Scans distribution tails to isolate statistical anomalies (|Z| > 3.0) and flag outlier rows automatically with cell coordinates.",
                accent: "bg-[#dbeee3] dark:bg-[#1a2820] text-black dark:text-white",
                icon: ShieldAlert,
                tag: "3-Sigma Outliers",
                span: "lg:col-span-1"
              },
              {
                num: "03",
                title: "90-Period Predictive Forecasting",
                desc: "Projects up to 90 future periods with 80% and 95% confidence bands using automated trend & seasonality modeling.",
                accent: "bg-[#e6ebf5] dark:bg-[#1f2430] text-black dark:text-white",
                icon: LineChart,
                tag: "Confidence Bands",
                span: "lg:col-span-1"
              },
              {
                num: "04",
                title: "Chi-Square & T-Test Hypothesis Lab",
                desc: "Evaluates statistical significance (p-values) across numerical cohorts and categorical independence.",
                accent: "bg-[#f4f4f0] dark:bg-[#262720] text-black dark:text-white",
                icon: BarChart3,
                tag: "p-Value Lab",
                span: "lg:col-span-1"
              },
              {
                num: "05",
                title: "5-Whys Root Cause Tracer",
                desc: "Recursively drills into data anomalies to construct a 5-step causal tree down to root structural drivers.",
                accent: "bg-white dark:bg-[#1c1d18] text-black dark:text-white",
                icon: Layers,
                tag: "Causal Tree",
                span: "lg:col-span-1"
              },
              {
                num: "06",
                title: "Executive PDF Briefing Compiler",
                desc: "Compiles all schema diagnostics, anomaly sweeps, time-series forecasts, and charts into publication-grade executive briefing PDFs with 1-click export.",
                accent: "bg-[#edfe5e] text-black",
                icon: FileText,
                tag: "PDF Export",
                span: "lg:col-span-2"
              }
            ].map((mod, i) => {
              const Icon = mod.icon;
              return (
                <div
                  key={i}
                  className={`border border-black dark:border-[#3b3a33] rounded-2xl p-7 sm:p-8 space-y-6 ${mod.accent} ${mod.span} shadow-[6px_6px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] hover:translate-y-[-2px] transition-all flex flex-col justify-between`}
                >
                  <div className="space-y-5 text-left">
                    <div className="flex items-start justify-between gap-2">
                      {/* Prominent High-Contrast 56x56px Icon Badge with size={28} Icon */}
                      <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-2xl border-2 border-black bg-[#edfe5e] flex items-center justify-center text-black font-bold shadow-[3px_3px_0px_#000000] shrink-0">
                        <Icon size={28} className="text-black shrink-0 stroke-[2.5]" />
                      </div>
                      
                      {/* Right Tag & Number: Stacked cleanly to prevent overflow on 4-col layout */}
                      <div className="flex flex-col items-end gap-1.5 min-w-0">
                        <span className="font-mono text-xs sm:text-sm font-extrabold opacity-60 leading-none">#{mod.num}</span>
                        <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-black text-white px-2.5 py-1 rounded border border-black shadow-[1px_1px_0px_#000000] whitespace-nowrap">
                          {mod.tag}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold leading-tight">{mod.title}</h3>
                    <p className="text-sm font-sans opacity-90 leading-relaxed">{mod.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROGRAMMATIC FORENSICS REST API ── */}
      <section id="api" className="scroll-mt-28 border-b border-black dark:border-[#3b3a33] py-24 md:py-32 bg-[#edf0e9] dark:bg-[#181914]">
        <div className="max-w-[1240px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-[0.08em] bg-[#edfe5e] text-black px-3.5 py-1.5 border border-black rounded-[4px] shadow-[2px_2px_0px_#000000]">
                Developer REST API
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider bg-[#31e992] text-black px-3 py-1 border border-black rounded-[4px] shadow-[2px_2px_0px_#000000]">
                ● COMING SOON
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-black dark:text-white leading-tight">
              Programmatic Forensics Into Your Stack.
            </h2>

            <div className="space-y-3.5 text-sm sm:text-base font-sans text-black/85 dark:text-white/85 leading-relaxed">
              <p>
                Instead of manually uploading spreadsheets via web UI, your backend microservices, data pipelines, or CI/CD test runners can trigger automated dataset sweeps programmatically.
              </p>
              <p>
                Send raw Parquet or CSV bytes via REST. DetectiveAI runs parallel Polars diagnostics and responds with structured JSON anomaly payloads, p-values, and instant PDF report download links.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5">
                {(["python", "nodejs", "curl"] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => { setSelectedCodeTab(lang); setApiViewMode("code"); }}
                    className={`btn-ink-pill text-xs py-2 px-4 font-mono font-bold uppercase cursor-pointer transition-all ${
                      apiViewMode === "code" && selectedCodeTab === lang ? "bg-[#edfe5e] text-black shadow-[3px_3px_0px_#000000]" : "bg-white dark:bg-[#262720] text-black dark:text-white hover:bg-[#edf0e9]"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <span className="text-black/30 dark:text-white/30 hidden sm:inline">|</span>
              <button
                onClick={() => setApiViewMode(apiViewMode === "code" ? "response" : "code")}
                className={`btn-ink-pill text-xs py-2 px-4 font-mono font-bold uppercase cursor-pointer transition-all ${
                  apiViewMode === "response" ? "bg-[#31e992] text-black shadow-[3px_3px_0px_#000000]" : "bg-white dark:bg-[#262720] text-black dark:text-white hover:bg-[#edf0e9]"
                }`}
              >
                {apiViewMode === "code" ? "View API JSON Response ➔" : "← View Code Request"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 border border-black dark:border-[#3b3a33] rounded-[18px] bg-black text-white p-6 sm:p-7 font-mono text-xs space-y-4 relative shadow-[7px_7px_0px_#000000] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#bc3e3e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#edfe5e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#31e992]" />
                <span className="text-white/70 text-[11px] uppercase font-bold ml-2">
                  {apiViewMode === "code" ? `REST API Request (${selectedCodeTab})` : "HTTP 200 OK — Response Payload"}
                </span>
              </div>
              <button
                onClick={() => handleCopyCode(apiViewMode === "code" ? codeSnippets[selectedCodeTab] : JSON.stringify({ status: 200, health_score: 98.4, anomalies_found: 3 }, null, 2))}
                className="flex items-center gap-1.5 text-[11px] font-mono text-white hover:text-[#edfe5e] bg-white/10 px-3 py-1 rounded border border-white/20 cursor-pointer transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#31e992]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {apiViewMode === "code" ? (
              <pre className="overflow-x-auto text-[11px] sm:text-xs leading-relaxed text-[#edfe5e] pt-1">
                <code>{codeSnippets[selectedCodeTab]}</code>
              </pre>
            ) : (
              <pre className="overflow-x-auto text-[11px] sm:text-xs leading-relaxed text-[#31e992] pt-1">
                <code>{`{
  "status": 200,
  "case_id": "case_1",
  "health_score": 98.4,
  "rows_processed": 1048576,
  "profiling_time_ms": 142,
  "anomalies_detected": [
    { "column": "latency_ms", "z_score": 3.84, "severity": "HIGH" },
    { "column": "error_rate", "z_score": 4.12, "severity": "CRITICAL" }
  ],
  "briefing_pdf_url": "https://detective-ai-guio.onrender.com/reports/case_1.pdf"
}`}</code>
              </pre>
            )}
          </div>

        </div>
      </section>

      {/* ── TRANSPARENT ACCESS (PRICING & COMING SOON TIERS) ── */}
      <section id="pricing" className="scroll-mt-28 border-b border-black dark:border-[#3b3a33] py-24 md:py-32 bg-[#f9f9f7] dark:bg-[#11120d]">
        <div className="max-w-[1240px] mx-auto px-6 space-y-16">
          <div className="text-center space-y-3 max-w-[640px] mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.08em] bg-[#edfe5e] text-black px-3 py-1 border border-black rounded-[4px] inline-block shadow-[2px_2px_0px_#000000]">
              Transparent Access
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-black dark:text-white">
              Start Free. Pro Tiers Coming Soon.
            </h2>
            <p className="text-sm sm:text-base font-sans text-black/80 dark:text-white/80">
              DetectiveAI is currently 100% free for individual data analysts. Premium team & enterprise tiers will launch soon.
            </p>
          </div>

          {/* 3 Clean Spaced Pricing Boxes with Upgraded Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                name: "Community Investigator",
                price: "$0",
                period: "Free Forever",
                desc: "Full access to Polars profiling, 3-sigma anomaly scans, and PDF executive exports for individual analysts.",
                features: [
                  "Upload files up to 500MB",
                  "CSV, Parquet & XLSX ingestion",
                  "Core Parallel Forensics Modules",
                  "1-Click PDF Executive Exports",
                  "Full Web Dashboard Access"
                ],
                cta: "Start Free Investigation",
                accent: "bg-[#edfe5e] text-black",
                comingSoon: false,
                popular: true
              },
              {
                name: "Pro Detective",
                price: "$29",
                period: "Coming Soon",
                desc: "High-volume batch dataset processing, dedicated REST API keys, and priority Polars cloud execution.",
                features: [
                  "Everything in Free Tier",
                  "Dedicated REST API Access Keys",
                  "Unlimited Batch Dataset Sweeps",
                  "Automated Scheduled File Drops",
                  "Custom 5-Whys Causal Trees"
                ],
                cta: "Join Pro Waitlist",
                accent: "bg-white dark:bg-[#1c1d18] text-black dark:text-white",
                comingSoon: true,
                popular: false
              },
              {
                name: "Enterprise Firm",
                price: "Custom",
                period: "Coming Soon",
                desc: "Dedicated cloud sandboxes, custom SOC2 encryption compliance, and custom database connectors.",
                features: [
                  "Everything in Pro Tier",
                  "Dedicated On-Premise Sandboxes",
                  "Custom PostgreSQL / Snowflake Connectors",
                  "SLA Guarantee & 24/7 Priority Support",
                  "Custom SSO & IAM Role Integration"
                ],
                cta: "Contact Enterprise",
                accent: "bg-[#bed4fb] text-black",
                comingSoon: true,
                popular: false
              }
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative border border-black dark:border-[#3b3a33] rounded-2xl p-7 sm:p-8 space-y-6 flex flex-col justify-between ${plan.accent} shadow-[6px_6px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] hover:translate-y-[-3px] transition-all text-left`}
              >
                {plan.popular ? (
                  <span className="absolute -top-3.5 right-6 font-mono text-[10px] font-bold uppercase tracking-wider bg-black text-white px-3 py-1 rounded-[4px] border border-black shadow-[2px_2px_0px_#000000]">
                    Available Now
                  </span>
                ) : plan.comingSoon ? (
                  <span className="absolute -top-3.5 right-6 font-mono text-[10px] font-bold uppercase tracking-wider bg-[#31e992] text-black px-3 py-1 rounded-[4px] border border-black shadow-[2px_2px_0px_#000000]">
                    Coming Soon
                  </span>
                ) : null}

                <div className="space-y-4">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider block">{plan.name}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold font-serif">{plan.price}</span>
                    <span className="text-xs font-mono opacity-80 font-bold">/{plan.period}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-sans opacity-90 leading-relaxed">{plan.desc}</p>
                  
                  <div className="space-y-3 border-t border-black/30 dark:border-white/20 pt-5">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-sans font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link href={plan.comingSoon ? "#" : "/register"} className="w-full pt-2">
                  <button
                    className={`w-full py-3 px-4 font-mono text-xs uppercase font-bold text-center cursor-pointer rounded-xl border border-black shadow-[3px_3px_0px_#000000] hover:translate-y-[-1px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                      plan.comingSoon
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "bg-[#edfe5e] text-black hover:bg-[#31e992]"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GOT QUESTIONS? (ENHANCED FAQ ACCORDION) ── */}
      <section id="faq" className="scroll-mt-28 border-b border-black dark:border-[#3b3a33] py-24 md:py-32 bg-[#edf0e9] dark:bg-[#181914]">
        <div className="max-w-[840px] mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.08em] bg-[#edfe5e] text-black px-3 py-1 border border-black rounded-[4px] inline-block shadow-[2px_2px_0px_#000000]">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-black dark:text-white">Frequently Asked Questions</h2>
            <p className="text-sm font-sans text-black/75 dark:text-white/75">Clear answers regarding data privacy, engine architecture, and report generation.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div key={i} className="border border-black dark:border-[#3b3a33] rounded-2xl bg-white dark:bg-[#1c1d18] overflow-hidden shadow-[4px_4px_0px_#000000]">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full p-5 text-left font-serif font-bold text-base sm:text-lg flex items-center justify-between gap-4 cursor-pointer hover:bg-[#edf0e9] dark:hover:bg-[#262720] text-black dark:text-white transition-colors"
                  >
                    <span className="min-w-0">{faq.q}</span>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded border border-black bg-[#edfe5e] text-black shadow-[1.5px_1.5px_0px_#000000] shrink-0 whitespace-nowrap">{isOpen ? "− HIDE" : "+ READ"}</span>
                  </button>
                  {isOpen && (
                    <div className="p-5 border-t border-black dark:border-[#3b3a33] bg-[#f9f9f7] dark:bg-[#11120d] text-xs sm:text-sm font-sans text-black/85 dark:text-white/85 leading-relaxed text-left">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#f9f9f7] dark:bg-[#11120d] py-12 border-t border-black dark:border-[#3b3a33] text-black dark:text-white">
        <div className="max-w-[1240px] mx-auto px-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-black bg-[#edfe5e] flex items-center justify-center text-black font-bold shadow-[2px_2px_0px_#000000] shrink-0">
              <MagnifyingLogoMark size={18} />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="font-bold uppercase tracking-wider text-black dark:text-white truncate">DetectiveAI Forensics Engine</span>
              <span className="text-[10px] text-[#000000]/60 dark:text-white/60">v2.4.0 Rust Core • Production Engine</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-bold uppercase text-black/70 dark:text-white/70">
            <a href="#features" className="hover:underline hover:text-black dark:hover:text-white transition-colors">Features</a>
            <a href="#modules" className="hover:underline hover:text-black dark:hover:text-white transition-colors">Modules</a>
            <a href="#api" className="hover:underline hover:text-black dark:hover:text-white transition-colors">API</a>
            <a href="#pricing" className="hover:underline hover:text-black dark:hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:underline hover:text-black dark:hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-2 text-black/60 dark:text-white/60 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#31e992] shrink-0" />
            <span>All Core Engines Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
