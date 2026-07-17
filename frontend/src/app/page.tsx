"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, ShieldAlert, LineChart, MessageSquare,
  FileText, Terminal, ShieldCheck, Database,
  Cpu, Upload, ArrowUpRight, RefreshCw,
  ExternalLink, BarChart3, Layers, HardDrive, Settings,
  CheckCircle2, Sun, Moon
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useTheme } from "next-themes";

/* ─────────────────────────────────────────────────────────────
   LOGO — geometric magnifying lens + neural data nodes
───────────────────────────────────────────────────────────── */
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer lens ring */}
      <circle cx="13" cy="13" r="9.5" stroke="currentColor" strokeWidth="2" />
      {/* Inner data-node cluster */}
      <circle cx="11" cy="12" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="15" r="1.2" fill="currentColor" />
      {/* Node connector lines */}
      <line x1="11" y1="12" x2="15" y2="10" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="15" y1="10" x2="15" y2="15" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="11" y1="12" x2="15" y2="15" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      {/* Handle */}
      <line x1="20" y1="20" x2="28" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCROLL REVEAL WRAPPER
───────────────────────────────────────────────────────────── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INLINE MINI ARIMA CHART
───────────────────────────────────────────────────────────── */
function ArimaChart() {
  return (
    <svg className="w-full h-full" viewBox="0 0 200 64" preserveAspectRatio="none">
      {/* Grid lines */}
      {[16, 32, 48].map(y => (
        <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="currentColor" strokeWidth="0.4" className="text-primary/10" />
      ))}
      {/* 95% CI band */}
      <path d="M0,44 Q50,12 80,36 T150,14 L200,22 L200,44 L150,36 L80,54 Q50,36 0,52 Z" fill="currentColor" className="text-primary/6" />
      {/* 80% CI band */}
      <path d="M0,44 Q50,18 80,36 T150,18 L200,26 L200,40 L150,32 L80,48 Q50,28 0,48 Z" fill="currentColor" className="text-primary/10" />
      {/* Historical line — solid */}
      <polyline points="0,44 25,40 50,28 75,38 80,36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/50" />
      {/* Forecast line — dashed */}
      <polyline points="80,36 110,20 140,22 170,16 200,18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" className="text-primary" />
      {/* Inflection dot */}
      <circle cx="80" cy="36" r="3" fill="currentColor" stroke="#11120d" strokeWidth="1.5" className="text-primary" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCodeTab, setSelectedCodeTab] = useState<"python" | "bash">("python");
  const [activeStep, setActiveStep] = useState(0);
  const [simStatus, setSimStatus] = useState<"idle" | "running" | "done">("idle");
  const [simP, setSimP] = useState({ a: 100, b: 85, c: 60 });
  const [simLogs, setSimLogs] = useState(["System ready."]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mockup preview interaction states
  const [previewTab, setPreviewTab] = useState<"database" | "chart" | "anomaly" | "chat">("database");
  const [forecastHorizon, setForecastHorizon] = useState<30 | 60 | 90>(90);
  const [selectedAnomalyIndex, setSelectedAnomalyIndex] = useState<number | null>(null);
  const [mockChatQ, setMockChatQ] = useState("");
  const [mockChatA, setMockChatA] = useState("");
  const [isTypingChat, setIsTypingChat] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const triggerMockChat = (question: string, answer: string) => {
    if (isTypingChat) return;
    setMockChatQ(question);
    setMockChatA("");
    setIsTypingChat(true);
    let i = 0;
    const interval = setInterval(() => {
      setMockChatA(prev => prev + answer.charAt(i));
      i++;
      if (i >= answer.length) {
        clearInterval(interval);
        setIsTypingChat(false);
      }
    }, 15);
  };

  useEffect(() => {
    if (localStorage.getItem("detective_token")) setIsLoggedIn(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(p => (p + 1) % 4), 4500);
    return () => clearInterval(t);
  }, []);

  const runSim = () => {
    if (simStatus === "running") return;
    setSimStatus("running");
    setSimP({ a: 0, b: 0, c: 0 });
    setSimLogs(["[1/3] Opening ingestion pipeline..."]);
    setTimeout(() => { setSimP(p => ({ ...p, a: 100 })); setSimLogs(p => [...p, "✓ 10,240 rows loaded (12ms)"]); }, 900);
    setTimeout(() => { setSimP(p => ({ ...p, b: 85 })); setSimLogs(p => [...p, "⚠ 2 anomalies — Z > 3.0"]); }, 2000);
    setTimeout(() => { setSimP(p => ({ ...p, c: 60 })); setSimLogs(p => [...p, "✓ ARIMA converged. Report ready."]); setSimStatus("done"); }, 3200);
  };

  const steps = [
    { icon: Upload, title: "Upload Evidence", detail: "Drag any CSV, Excel, or Parquet file into the secure sandbox. Polars profiles every column and returns a schema health index in milliseconds.", tag: "12ms ingest" },
    { icon: ShieldAlert, title: "Scan Anomalies", detail: "IQR and Z-score sweeps across every numeric axis. Flags outlier clusters, missing-value blocks, and duplicate records automatically.", tag: "IQR + Z-Score" },
    { icon: LineChart, title: "Forecast & Test", detail: "ARIMA(1,1,1) projects 90 periods forward with 80/95% confidence bands. Run t-tests, ANOVA, and chi-square significance checks.", tag: "90-period ARIMA" },
    { icon: FileText, title: "Export Briefing", detail: "All findings — anomaly records, forecast charts, chat logs — compiled into a PDF or Word executive report in one click.", tag: "PDF + DOCX" },
  ];

  const capabilities = [
    "Polars Engine", "ARIMA Forecasting", "Z-Score Anomaly", "IQR Threshold",
    "Schema Profiler", "T-Test Significance", "ANOVA Lab", "PDF Exporter",
    "AI Copilot", "Parquet Support", "Data Cleaning", "Correlation Matrix",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">

      {/* ── SUBTLE BACKGROUND TEXTURE ── */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(216,207,188,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(216,207,188,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* ══════════════════════════════════════════════════════
          NAVBAR — floating pill
      ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[1040px]"
      >
        <div className="rounded-full border border-border bg-card/70 backdrop-blur-xl px-5 h-[46px] flex items-center justify-between shadow-lg shadow-black/10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity select-none group">
            <LogoMark size={20} />
            <span className="font-mono font-bold text-[10px] uppercase tracking-[0.18em] text-foreground">DetectiveAI</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-0">
            {["#features", "#process", "#core", "#api"].map((href, i) => {
              const labels = ["Features", "Process", "Core", "API"];
              return (
                <a key={href} href={href} className="px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50">
                  {labels[i]}
                </a>
              );
            })}
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <a href="https://github.com/mannaxsara/detective-ai" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2">
              <ExternalLink className="w-3 h-3" /> GitHub
            </a>
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-7 h-7 rounded-full border border-border bg-muted/40 hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === "dark"
                  ? <Sun className="w-3.5 h-3.5 text-muted-foreground" />
                  : <Moon className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            )}
            {!loading && (
              isLoggedIn ? (
                <Link href="/dashboard">
                  <span className="inline-flex items-center gap-1 h-7 rounded-full bg-primary text-primary-foreground font-bold text-[9px] uppercase tracking-wider px-3.5 cursor-pointer hover:opacity-90 transition-opacity">
                    Workspace <ArrowUpRight className="w-2.5 h-2.5" />
                  </span>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block text-[10px] font-mono font-bold text-muted-foreground hover:text-foreground transition-colors px-2">Sign in</Link>
                  <Link href="/register">
                    <span className="inline-flex h-7 rounded-full bg-primary text-primary-foreground font-bold text-[9px] uppercase tracking-wider px-3.5 cursor-pointer hover:opacity-90 transition-opacity items-center">
                      Get Started
                    </span>
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          HERO — split layout, left text / right product
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-[100svh] flex items-center">
        <div className="w-full max-w-[1180px] mx-auto px-6 pt-28 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-8 items-center">

            {/* ── LEFT: Headline block ── */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              className="space-y-7"
            >
              {/* Badge */}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-primary/80 border border-primary/20 rounded-full px-3 py-1 bg-primary/5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Autonomous Forensics Engine
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                className="text-[2.8rem] sm:text-[3.4rem] md:text-[3.8rem] font-black leading-[1.02] tracking-[-0.02em] uppercase"
              >
                Raw data.
                <br />
                <span className="text-primary">Clean</span> briefings.
              </motion.h1>

              {/* Sub */}
              <motion.p
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55 } } }}
                className="text-[13px] text-muted-foreground leading-relaxed max-w-[420px]"
              >
                Upload any CSV, Excel, or Parquet spreadsheet. DetectiveAI automatically scans anomalies, projects ARIMA forecasts, and exports professional PDF/Word briefings — no code required.
              </motion.p>

              {/* Stats row */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                className="flex flex-wrap gap-4"
              >
                {[
                  { v: "<10s", l: "per diagnosis" },
                  { v: "13", l: "analysis modules" },
                  { v: "500MB", l: "max file size" },
                ].map((s, i) => (
                  <div key={i} className="flex items-baseline gap-1.5">
                    <span className="text-[22px] font-black text-foreground font-mono tracking-tight leading-none">{s.v}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{s.l}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                className="flex flex-wrap gap-3 pt-1"
              >
                <Link href={isLoggedIn ? "/dashboard" : "/login"}>
                  <motion.span
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-[11px] uppercase tracking-wider px-5 cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                  >
                    {isLoggedIn ? "Open Workspace" : "Start Investigation"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.span>
                </Link>
                <Link href="/history">
                  <motion.span
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center h-10 rounded-lg border border-border bg-card hover:bg-muted/50 text-foreground font-bold text-[11px] uppercase tracking-wider px-5 cursor-pointer transition-colors"
                  >
                    Case Archives
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>

            {/* ── RIGHT: Interactive Product Preview Window ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Glow behind window */}
              <div className="absolute -inset-6 bg-primary/8 rounded-3xl blur-2xl pointer-events-none" />

              {/* Browser window */}
              <div className="relative border border-border rounded-2xl overflow-hidden shadow-2xl bg-card">
                {/* Chrome bar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/40 select-none">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 h-5 rounded bg-muted/60 flex items-center px-3 justify-between">
                    <span className="text-[9px] font-mono text-muted-foreground/50 truncate">detective.ai/analysis/case-428</span>
                    <span className="text-[7px] font-mono text-primary/60 animate-pulse uppercase tracking-wider font-bold">Interactive Sandbox</span>
                  </div>
                </div>

                {/* App layout */}
                <div className="grid grid-cols-[60px_1fr] min-h-[350px]">
                  {/* Mini sidebar with active tab controls */}
                  <div className="border-r border-border p-2 space-y-4 bg-background/20 flex flex-col items-center">
                    <div className="flex flex-col gap-1 w-full">
                      {[
                        { tab: "database" as const, icon: Database, label: "Data" },
                        { tab: "chart" as const, icon: LineChart, label: "Forecast" },
                        { tab: "anomaly" as const, icon: ShieldAlert, label: "Outliers" },
                        { tab: "chat" as const, icon: MessageSquare, label: "Copilot" },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        const active = previewTab === item.tab;
                        return (
                          <button
                            key={i}
                            onClick={() => setPreviewTab(item.tab)}
                            className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition-all cursor-pointer ${
                              active
                                ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-black/10"
                                : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/30"
                            }`}
                            title={item.label}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-[7px] font-mono tracking-tighter mt-1 block select-none scale-[0.9]">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Main panel - dynamically changes view based on active tab */}
                  <div className="p-5 space-y-4 overflow-hidden flex flex-col justify-between">
                    
                    {/* Panel Top stats */}
                    <div className="flex items-start justify-between border-b border-border/20 pb-3">
                      <div>
                        <div className="text-[7px] font-mono text-muted-foreground/50 uppercase tracking-widest">Active Workspace</div>
                        <div className="text-[11px] font-bold text-foreground mt-0.5 truncate max-w-[180px]">server_telemetry.parquet</div>
                      </div>
                      <div className="flex gap-1.5 text-[8px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">98.4% health</span>
                        <span className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border">10.2k rows</span>
                      </div>
                    </div>

                    {/* View 1: Database Columns view */}
                    {previewTab === "database" && (
                      <div className="flex-1 flex flex-col justify-between py-1 space-y-3 animate-fade-in">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-primary/90 font-mono">Schema Attributes Profile</div>
                        <div className="space-y-1.5">
                          {[
                            { name: "timestamp", type: "datetime", check: true },
                            { name: "cpu_utilization", type: "float64", check: true },
                            { name: "status_code", type: "int64", check: true },
                          ].map((col, i) => (
                            <div key={i} className="flex items-center justify-between border border-border/30 rounded px-2.5 py-1.5 bg-background/20 font-mono text-[9px] text-muted-foreground">
                              <span className="text-foreground font-bold">{col.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] opacity-60">[{col.type}]</span>
                                {col.check && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-[8px] text-muted-foreground/50 leading-relaxed font-mono">
                          * Polars dataframe context initialized. Outlier scans are active on all numeric float coordinates.
                        </div>
                      </div>
                    )}

                    {/* View 2: ARIMA forecasting chart view */}
                    {previewTab === "chart" && (
                      <div className="flex-1 flex flex-col justify-between py-1 space-y-3 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-primary/90 font-mono">ARIMA Predictions (Horizon)</span>
                          <div className="flex border border-border rounded-md overflow-hidden font-mono text-[8px]">
                            {([30, 60, 90] as const).map(d => (
                              <button
                                key={d}
                                onClick={() => setForecastHorizon(d)}
                                className={`px-2 py-0.5 transition-colors cursor-pointer ${forecastHorizon === d ? "bg-primary text-primary-foreground" : "hover:bg-muted/40 text-muted-foreground"}`}
                              >
                                {d}d
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Interactive SVG path changing based on forecastHorizon state */}
                        <div className="h-20 w-full border border-border/40 rounded-lg p-2 bg-background/30 text-primary">
                          <svg className="w-full h-full" viewBox="0 0 200 64" preserveAspectRatio="none">
                            {/* Grid lines */}
                            {[16, 32, 48].map(y => (
                              <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="currentColor" strokeWidth="0.4" className="text-primary/10" />
                            ))}
                            {/* Confidence Interval band scaling with horizon selection */}
                            <path
                              d={`M0,44 Q50,12 80,36 T150,${forecastHorizon === 30 ? 28 : forecastHorizon === 60 ? 20 : 14} L200,${forecastHorizon === 30 ? 32 : forecastHorizon === 60 ? 26 : 22} L200,44 L150,36 L80,54 Q50,36 0,52 Z`}
                              fill="currentColor"
                              className="text-primary/6 transition-all duration-300"
                            />
                            {/* Historical path */}
                            <polyline points="0,44 25,40 50,28 75,38 80,36" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/50" />
                            {/* Interactive forecast path */}
                            <path
                              d={forecastHorizon === 30 
                                ? "M80,36 Q110,28 140,30 T200,32"
                                : forecastHorizon === 60 
                                  ? "M80,36 Q110,24 140,26 T200,26"
                                  : "M80,36 Q110,20 140,22 T200,18"
                              }
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeDasharray="4 3"
                              className="text-primary transition-all duration-300"
                            />
                            <circle cx="80" cy="36" r="3" fill="currentColor" stroke="#11120d" strokeWidth="1.5" className="text-primary" />
                          </svg>
                        </div>

                        <div className="flex justify-between items-center text-[7px] font-mono text-muted-foreground/60 select-none pt-1">
                          <span>Horizon: {forecastHorizon} periods</span>
                          <span>Confidence Level: 95% threshold</span>
                        </div>
                      </div>
                    )}

                    {/* View 3: Outlier Log view */}
                    {previewTab === "anomaly" && (
                      <div className="flex-1 flex flex-col justify-between py-1 space-y-3 animate-fade-in">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-primary/90 font-mono">Select Outlier for Details</div>
                        <div className="space-y-1.5">
                          {[
                            { index: 428, desc: "Value Spike: +5.4× Rolling Mean", detail: "Row 428 (cpu_utilization = 98.42). Normal bounds: 10.0 - 65.0. Action: Replace with rolling median." },
                            { index: 1022, desc: "Duplicate index validation error", detail: "Row 1022 timestamp collision matching index 1021. Action: Drop duplicate item." },
                          ].map((anom) => {
                            const active = selectedAnomalyIndex === anom.index;
                            return (
                              <div key={anom.index}>
                                <button
                                  onClick={() => setSelectedAnomalyIndex(active ? null : anom.index)}
                                  className={`w-full text-left border rounded px-3 py-1.5 font-mono text-[9px] cursor-pointer transition-all flex justify-between items-center ${
                                    active
                                      ? "bg-primary/10 border-primary text-primary font-bold"
                                      : "border-border/30 hover:bg-muted/40 text-muted-foreground"
                                  }`}
                                >
                                  <span>Row {anom.index} — {anom.desc.substring(0, 16)}...</span>
                                  <span className="text-[8px] opacity-60">{active ? "Hide Details" : "View Details"}</span>
                                </button>
                                {active && (
                                  <div className="mt-1 p-2 bg-background border border-border/30 rounded text-[8px] font-mono text-muted-foreground leading-relaxed animate-slide-down">
                                    {anom.detail}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-[8px] font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Z-Score validation checks complete</span>
                        </div>
                      </div>
                    )}

                    {/* View 4: Chat assistant view */}
                    {previewTab === "chat" && (
                      <div className="flex-1 flex flex-col justify-between py-1 space-y-3 animate-fade-in">
                        {/* Chat suggestion prompts */}
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { q: "What caused the spike?", a: "Row 428 value exceeded 5.4× rolling mean bounds (outlier threshold)." },
                            { q: "Is the dataset healthy?", a: "Dataset health score is 98.4%. Standard deviation bounds are clean." },
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => triggerMockChat(item.q, item.a)}
                              disabled={isTypingChat}
                              className="text-[7.5px] font-mono border border-border hover:bg-muted/40 rounded-full px-2.5 py-0.5 cursor-pointer disabled:opacity-50 transition-colors"
                            >
                              &gt; {item.q}
                            </button>
                          ))}
                        </div>

                        {/* Typing / Query response box */}
                        <div className="border border-border/40 rounded-lg p-3 bg-background/40 flex-1 flex flex-col justify-between min-h-[90px]">
                          {mockChatQ ? (
                            <div className="space-y-2">
                              <div className="text-[8.5px] font-mono text-primary font-bold">&gt; {mockChatQ}</div>
                              <div className="text-[8.5px] font-mono text-muted-foreground leading-relaxed transition-all">
                                {mockChatA}
                                {isTypingChat && <span className="w-1.5 h-3 bg-primary inline-block ml-0.5 animate-pulse" />}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 font-mono text-[9px] select-none text-center">
                              <span>Select a prompt above to chat with Copilot</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CAPABILITY MARQUEE
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 border-y border-border bg-card/30 py-3 overflow-hidden">
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="flex gap-6 whitespace-nowrap"
        >
          {[...capabilities, ...capabilities].map((c, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground/50 shrink-0">
              <span className="w-1 h-1 rounded-full bg-primary/40" /> {c}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURES — horizontal bento grid
      ══════════════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-20 max-w-[1180px] mx-auto px-6">
        <Reveal className="mb-12 space-y-2">
          <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest">Platform capabilities</span>
          <h2 className="text-[1.9rem] md:text-[2.4rem] font-black uppercase tracking-tight leading-tight">Forensic profiling.<br />End to end.</h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              num: "01", title: "Schema Normalizer", body: "Polars-powered. Prunes nulls, drops duplicates, coerces types, and emits a clean typed dataframe in under 15ms.",
              icon: Database,
              visual: (
                <div className="h-8 border border-border/40 rounded bg-background/50 flex items-center justify-center gap-2 font-mono text-[8px] text-muted-foreground">
                  <span>[Raw CSV]</span><ArrowRight className="w-3 h-3 text-primary" /><span className="text-primary font-bold">[Polars DF]</span>
                </div>
              )
            },
            {
              num: "02", title: "Outlier Detection", body: "IQR and Z-score sweeps across every numeric column. Surfaces anomaly coordinates and drift clusters automatically.",
              icon: ShieldAlert,
              visual: (
                <div className="h-8 border border-border/40 rounded bg-background/50 flex items-center justify-center gap-1 px-3 font-mono text-[8px]">
                  {[0.2, 0.2, 1, 0.2, 0.2, 0.2].map((o, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${o === 1 ? "bg-primary" : "bg-muted-foreground/25"}`} />)}
                  <span className="text-primary font-bold ml-2">Z = +3.8σ</span>
                </div>
              )
            },
            {
              num: "03", title: "ARIMA Forecasting", body: "Auto-regressive integrated moving average models project 90 periods forward with 80% and 95% confidence intervals.",
              icon: LineChart,
              visual: (
                <div className="h-8 border border-border/40 rounded bg-background/50 overflow-hidden text-primary">
                  <ArimaChart />
                </div>
              )
            },
            {
              num: "04", title: "Significance Tests", body: "Run t-tests, ANOVA, and chi-square tests on any column. Results are explained in plain English automatically.",
              icon: CheckCircle2,
              visual: (
                <div className="h-8 border border-border/40 rounded bg-background/50 flex items-center px-3 gap-2 font-mono text-[8px]">
                  <span className="text-emerald-400 font-bold">p = 0.003</span><span className="text-muted-foreground">— Reject H₀ at α=0.05</span>
                </div>
              )
            },
            {
              num: "05", title: "AI Copilot", body: "Chat with your data in plain English. The assistant references actual column values and computed findings in every response.",
              icon: FileText,
              visual: (
                <div className="h-8 border border-border/40 rounded bg-background/50 p-2 font-mono text-[8px] text-muted-foreground">
                  <span className="text-primary font-bold">&gt; </span>Outlier at row 428 — +5.4× rolling mean.
                </div>
              )
            },
            {
              num: "06", title: "Report Compiler", body: "Compile every finding — anomalies, projections, test results, chat logs — into a download-ready PDF or Word report.",
              icon: FileText,
              visual: (
                <div className="h-8 flex gap-2 items-center font-mono text-[8px] font-bold text-primary">
                  <span className="px-2 py-0.5 rounded border border-primary/30 bg-primary/5">BRIEF.PDF</span>
                  <span className="px-2 py-0.5 rounded border border-border text-muted-foreground">BRIEF.DOCX</span>
                </div>
              )
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal key={i} delay={i * 0.04}
                className="group relative border border-border rounded-xl p-5 bg-card hover:border-primary/40 transition-all duration-300 flex flex-col gap-4 cursor-default overflow-hidden"
              >
                {/* Left accent bar on hover */}
                <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Icon className="w-2.5 h-2.5 text-primary" />
                      </span>
                      <span className="font-mono text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest">Step {card.num}</span>
                    </div>
                    <h3 className="text-[12px] font-bold uppercase tracking-wide text-foreground">{card.title}</h3>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-1.5">{card.body}</p>
                  </div>
                  <span className="font-mono text-[28px] font-black text-muted-foreground/8 select-none leading-none ml-2">{card.num}</span>
                </div>
                {card.visual}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS — vertical timeline
      ══════════════════════════════════════════════════════ */}
      <section id="process" className="relative z-10 py-20 border-t border-border bg-card/20">
        <div className="max-w-[1180px] mx-auto px-6">
          <Reveal className="mb-12 space-y-2">
            <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest">Four stages</span>
            <h2 className="text-[1.9rem] md:text-[2.4rem] font-black uppercase tracking-tight leading-tight">From file to briefing.</h2>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
            {/* Step selector */}
            <div className="flex flex-row lg:flex-col gap-2">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const active = activeStep === i;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`flex-1 lg:flex-none text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer ${active ? "bg-card border-primary/30 shadow-sm" : "border-border/30 hover:bg-card/50"}`}
                  >
                    <Icon className={`w-3.5 h-3.5 mb-1.5 transition-colors ${active ? "text-primary" : "text-muted-foreground/40"}`} />
                    <div className={`text-[10px] font-bold uppercase tracking-wide transition-colors hidden lg:block ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.title}</div>
                    <div className={`font-mono text-[8px] font-bold hidden lg:block transition-colors mt-0.5 ${active ? "text-primary/80" : "text-muted-foreground/30"}`}>{s.tag}</div>
                  </button>
                );
              })}
            </div>

            {/* Detail card */}
            <div className="border border-border bg-card rounded-xl p-8 md:p-10 min-h-[200px] flex flex-col justify-between relative">
              <div className="absolute top-5 right-5 font-mono text-[9px] text-muted-foreground/30 select-none">{String(activeStep + 1).padStart(2, "0")} / 04</div>
              <div className="space-y-3">
                {React.createElement(steps[activeStep].icon, { className: "w-5 h-5 text-primary" })}
                <h3 className="text-[18px] font-black uppercase tracking-tight">{steps[activeStep].title}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed max-w-lg">{steps[activeStep].detail}</p>
              </div>
              <div className="flex gap-2 pt-6">
                {steps.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full bg-primary rounded-full transition-all duration-300 ${i <= activeStep ? "w-full" : "w-0"}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PROCESSING CORE — live simulation
      ══════════════════════════════════════════════════════ */}
      <section id="core" className="relative z-10 py-20 border-t border-border">
        <div className="max-w-[1180px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal className="space-y-5">
            <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest">Pipeline Architecture</span>
            <h2 className="text-[1.9rem] md:text-[2.4rem] font-black uppercase tracking-tight leading-tight">The Processing Core</h2>
            <p className="text-[12px] text-muted-foreground leading-relaxed max-w-sm">
              High-performance stack: Polars for ingestion, Statsmodels for forecasting, zero-retention in-memory processing, and FastAPI backend — all deployed in a secure isolated sandbox.
            </p>
            <div className="space-y-3.5">
              {[
                { icon: Database, t: "Polars Engine", d: "Rust-backed dataframe allocator. Parses millions of rows in milliseconds." },
                { icon: Cpu, t: "ARIMA Forecaster", d: "Statsmodels integration — auto-regressive mathematical projection." },
                { icon: ShieldCheck, t: "Zero-Retention Sandbox", d: "Files analyzed in-memory. Deleted immediately after session ends." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <item.icon className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wide">{item.t}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{item.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="border border-border bg-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-mono text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider">ACTIVE_THREAD_POOL</span>
              <button
                onClick={runSim}
                disabled={simStatus === "running"}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary font-mono text-[9px] font-bold hover:bg-primary/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${simStatus === "running" ? "animate-spin" : ""}`} />
                {simStatus === "running" ? "RUNNING..." : "RUN SIMULATION"}
              </button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "> Ingesting spreadsheet...", val: simP.a, result: simP.a === 100 ? "COMPLETE (12ms)" : simP.a > 0 ? "RUNNING" : "WAITING", hi: false },
                { label: "> Profiling Z-score outliers...", val: simP.b, result: simP.b === 85 ? "2 ANOMALIES FOUND" : simP.b > 0 ? "RUNNING" : "WAITING", hi: simP.b === 85 },
                { label: "> Compiling ARIMA vector...", val: simP.c, result: simP.c === 60 ? "COMPLETE" : simP.c > 0 ? "RUNNING" : "WAITING", hi: false },
              ].map((row, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
                    <span>{row.label}</span>
                    <span className={row.hi ? "text-primary font-bold" : "text-foreground"}>{row.result}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-background border border-border/40 overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${row.val}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-2 p-3 rounded-lg bg-background border border-border/40 font-mono text-[8px] text-muted-foreground/80 space-y-0.5 max-h-[70px] overflow-y-auto">
                {simLogs.map((l, i) => (
                  <div key={i} className={l.startsWith("✓") ? "text-emerald-400" : l.startsWith("⚠") ? "text-primary font-bold" : ""}>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          DEVELOPER — code tabs + stdout
      ══════════════════════════════════════════════════════ */}
      <section id="api" className="relative z-10 py-20 border-t border-border bg-card/20">
        <div className="max-w-[1180px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <Reveal className="bg-[#0a0a09] border border-border rounded-xl overflow-hidden shadow-2xl">
            {/* Tab bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-card/30">
              {(["python", "bash"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedCodeTab(tab)}
                  className={`font-mono text-[9px] font-bold px-2.5 py-0.5 rounded cursor-pointer transition-colors ${selectedCodeTab === tab ? "bg-primary/12 border border-primary/25 text-primary" : "text-muted-foreground/50 hover:text-muted-foreground"}`}
                >
                  {tab === "python" ? "detective_api.py" : "setup.sh"}
                </button>
              ))}
              <Terminal className="w-3 h-3 text-muted-foreground/30 ml-auto" />
            </div>
            {/* Split editor */}
            <div className="grid grid-cols-[1.1fr_0.9fr]">
              <div className="p-5 font-mono text-[10px] leading-relaxed text-muted-foreground/80 border-r border-border/20 min-h-[200px]">
                {selectedCodeTab === "python" ? (
                  <pre>{`\u001b[35mimport\u001b[0m detective_ai as det

\u001b[90m# Ingest evidence parquet\u001b[0m
case = det.IngestionPipeline(
  \u001b[32m"telemetry.parquet"\u001b[0m
)

\u001b[90m# Scan + forecast\u001b[0m
res  = case.scan_anomalies()
fcst = case.project_arima(
  periods=\u001b[33m90\u001b[0m
)

print(res.health_score)`.split("\n").map((line, i) => (
                    <div key={i} className={
                      line.includes("import") ? "text-primary" :
                      line.includes("#") ? "text-muted-foreground/40" :
                      line.includes('"') ? "text-emerald-400" :
                      line.includes("90") ? "text-amber-400" :
                      ""
                    }>{line}</div>
                  ))}</pre>
                ) : (
                  <pre>
                    <div className="text-muted-foreground/40"># Install</div>
                    <div>pip install detective-ai-engine</div>
                    <div className="mt-3 text-muted-foreground/40"># Initialize</div>
                    <div>python -m detective_ai init</div>
                  </pre>
                )}
              </div>
              <div className="p-5 bg-[#060605] font-mono text-[9px] leading-relaxed">
                <div className="text-muted-foreground/30 mb-3 font-bold">// stdout</div>
                {selectedCodeTab === "python" ? (
                  <pre className="text-emerald-400 whitespace-pre-wrap">{JSON.stringify({ status: "completed", health_score: 98.4, anomalies: 2, forecast_periods: 90, latency_ms: 12 }, null, 2)}</pre>
                ) : (
                  <pre className="text-primary whitespace-pre-wrap">{`✓ Engine loaded\n✓ Sandbox active\n✓ API: :8000\n✓ Ready`}</pre>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="space-y-5">
            <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest">Developer API</span>
            <h2 className="text-[1.9rem] md:text-[2.4rem] font-black uppercase tracking-tight leading-tight">Built to integrate.</h2>
            <p className="text-[12px] text-muted-foreground leading-relaxed max-w-sm">
              The FastAPI backend exposes clean REST endpoints. Integrate with any backend pipeline, database, or reporting system using standard HTTP requests.
            </p>
            <Link href="/login">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-primary hover:underline cursor-pointer">
                Explore the API <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 border-t border-border">
        <Reveal className="max-w-[680px] mx-auto px-6 text-center space-y-6">
          <h2 className="text-[2rem] md:text-[2.6rem] font-black uppercase tracking-tight leading-tight">Ready to run your first investigation?</h2>
          <p className="text-[12px] text-muted-foreground max-w-md mx-auto leading-relaxed">
            Upload a file. Get a complete forensic briefing — anomalies, forecasts, significance tests, and a PDF report — in under 10 seconds.
          </p>
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            <motion.span
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground font-bold text-[11px] uppercase tracking-wider px-7 cursor-pointer hover:opacity-90 transition-opacity shadow-lg mt-2"
            >
              Start Investigation <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-border py-12 bg-card/20">
        <div className="max-w-[1180px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <LogoMark size={18} />
              <span className="font-mono font-bold text-[10px] uppercase tracking-[0.18em] text-foreground">DetectiveAI</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[240px]">
              Autonomous data forensics. Upload, scan, forecast, and brief — all in one secure sandbox.
            </p>
            <p className="text-[9px] font-mono text-muted-foreground/40">© {new Date().getFullYear()} DetectiveAI</p>
          </div>
          {[
            { title: "Engine", links: [{ l: "Case Profiler", h: "/dashboard" }, { l: "Anomaly Scan", h: "/dashboard" }, { l: "Forecasting", h: "/dashboard" }, { l: "Reports", h: "/dashboard" }] },
            { title: "Product", links: [{ l: "Case Archives", h: "/history" }, { l: "Upload File", h: "/upload" }, { l: "Settings", h: "/settings" }, { l: "Profile", h: "/profile" }] },
            { title: "Connect", links: [{ l: "GitHub", h: "https://github.com/mannaxsara/detective-ai" }, { l: "Email", h: "mailto:mannasarabilu@gmail.com" }] },
          ].map((col, i) => (
            <div key={i} className="space-y-3">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-foreground/70">{col.title}</span>
              <ul className="space-y-1.5">
                {col.links.map((lk, j) => (
                  <li key={j}><Link href={lk.h} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">{lk.l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
