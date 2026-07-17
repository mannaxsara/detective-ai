"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, Sparkles, ShieldAlert, LineChart, MessageSquare,
  FileText, ChevronRight, Terminal, ShieldCheck, Database, Code,
  Cpu, Upload, ArrowUpRight
} from "lucide-react";
import { motion, useInView } from "framer-motion";

// Abstract "D" + magnifying glass logo
function LogoIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={`${className} text-primary shrink-0`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="15" width="70" height="70" rx="16" stroke="currentColor" strokeWidth="5" className="opacity-20" />
      <path d="M35 30 H55 C66 30 73 37 73 50 C73 63 66 70 55 70 H35 V30 Z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      <circle cx="45" cy="50" r="10" stroke="currentColor" strokeWidth="5" />
      <path d="M52 57 L68 73" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

// Reusable scroll-triggered section wrapper
function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCodeTab, setSelectedCodeTab] = useState<"python" | "bash">("python");
  const [activeHowStep, setActiveHowStep] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("detective_token");
    if (token) setIsLoggedIn(true);
    setLoading(false);
  }, []);

  // Auto-rotate the "How It Works" carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHowStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const howItWorksSteps = [
    {
      title: "Upload Evidence",
      desc: "Drag any CSV, Excel, or Parquet file into the secure sandbox. The Polars engine maps every column's type, detects encoding, and calculates a schema health index in under 12ms.",
      icon: Upload,
      stat: "12ms parse time",
    },
    {
      title: "Scan & Diagnose",
      desc: "The engine runs IQR and Z-score sweeps across every numeric dimension, flags statistical outliers, identifies missing value clusters, and surfaces duplicate records automatically.",
      icon: ShieldAlert,
      stat: "99.5% confidence",
    },
    {
      title: "Forecast & Test",
      desc: "ARIMA(1,1,1) models project 90 periods forward with upper/lower confidence bounds. Run t-tests, ANOVA, and chi-square significance checks with plain-English interpretation.",
      icon: LineChart,
      stat: "90 period vectors",
    },
    {
      title: "Export Briefing",
      desc: "Compile every finding — anomalies, forecasts, hypotheses, and AI chat logs — into a download-ready PDF or Word executive report with one click.",
      icon: FileText,
      stat: "PDF + DOCX",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 relative overflow-hidden">
      
      {/* Background grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(212,110,85,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(212,110,85,0.012)_1px,transparent_1px)] bg-[size:40px_40px] opacity-65 pointer-events-none" aria-hidden="true" />

      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="border-b border-border bg-card/45 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Left: Logo + Name */}
          <Link href="/" className="flex items-center gap-2.5 select-none group">
            <LogoIcon className="w-5 h-5 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-[11px] uppercase tracking-widest text-foreground font-mono">DetectiveAI</span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#architecture" className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors">Architecture</a>
            <a href="#developer" className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors">Developer</a>
            <Link href="/history" className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors">Case Archives</Link>
          </nav>

          {/* Right: CTA */}
          <div className="flex items-center gap-4">
            {loading ? null : isLoggedIn ? (
              <Link href="/dashboard">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="h-8 rounded-small bg-primary hover:opacity-95 text-primary-foreground font-bold text-[10px] uppercase tracking-wider px-4 cursor-pointer flex items-center gap-1.5">
                  Workspace <ArrowUpRight className="w-3 h-3" />
                </motion.button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Sign in</Link>
                <Link href="/register">
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="h-8 rounded-small bg-primary hover:opacity-95 text-primary-foreground font-bold text-[10px] uppercase tracking-wider px-4 cursor-pointer">
                    Get Started
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* ═══════════════════ HERO BENTO GRID ═══════════════════ */}
      <section className="py-12 md:py-20 max-w-6xl mx-auto px-6 relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Main Title Card (Span 2x2) */}
          <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-2 p-8 md:p-12 bg-card border border-border rounded-cards flex flex-col justify-between min-h-[380px] relative overflow-hidden text-left">
            <div className="absolute top-6 right-6 flex items-center gap-1.5 font-mono text-[9px] font-bold text-primary select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              FORENSIC ENGINE READY
            </div>
            <div className="space-y-6 pt-4">
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-none uppercase">
                Turn raw datasets <br />into <span className="text-primary">clean briefings.</span>
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold max-w-lg">
                DetectiveAI is a high-fidelity data forensics engine. Upload any CSV, Excel, or Parquet spreadsheet to automatically scan anomalies, run ARIMA projections, test hypotheses, and export professional PDF/Word briefs.
              </p>
            </div>
            <div className="pt-8 flex flex-wrap items-center gap-4">
              <Link href={isLoggedIn ? "/dashboard" : "/login"}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-10 rounded-small bg-primary hover:opacity-95 text-primary-foreground font-bold text-xs uppercase tracking-wider px-6 flex items-center gap-2 cursor-pointer shadow-sm">
                  {isLoggedIn ? "Open Workspace" : "Ingest Case File"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </Link>
              <span className="font-mono text-[9px] text-muted-foreground/60 font-bold select-none">SECURE SANDBOX INGESTION</span>
            </div>
          </motion.div>

          {/* Bento: Data Cleaning */}
          <motion.div variants={itemVariants} className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px]">
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>DATA CLEANING</span>
              <Sparkles className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <div className="my-3"><h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Schema Normalization</h3><p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-1">Prunes nulls, drops duplicates, scales outliers, and aligns data types automatically.</p></div>
            <div className="h-7 border border-border/40 rounded bg-background/50 flex items-center justify-around font-mono text-[8px] text-muted-foreground">
              <span>[Raw File]</span><ChevronRight className="w-3 h-3 text-primary" /><span className="text-primary font-bold">[Clean Output]</span>
            </div>
          </motion.div>

          {/* Bento: Anomaly */}
          <motion.div variants={itemVariants} className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px]">
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>ANOMALY SCAN</span>
              <ShieldAlert className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <div className="my-3"><h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Outlier Detection</h3><p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-1">IQR and Z-score sweeps isolate distribution failures and missing value clusters.</p></div>
            <div className="h-7 border border-border/40 rounded bg-background/50 flex items-center justify-center gap-1.5 px-3 select-none">
              {[0.3, 0.3, 1, 0.3, 0.3, 0.3].map((o, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${o === 1 ? "bg-primary" : "bg-muted-foreground/30"}`} />)}
              <span className="font-mono text-[8px] text-primary font-bold ml-1.5">Z = +3.8</span>
            </div>
          </motion.div>

          {/* Bento: Forecast Waveform */}
          <motion.div variants={itemVariants} className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px] overflow-hidden">
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>FORECASTING</span>
              <LineChart className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <div className="h-14 w-full relative my-1.5 border border-border/30 rounded bg-background/50 p-1 overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 opacity-[0.03] pointer-events-none">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="border border-foreground" />)}
              </div>
              <svg className="w-full h-full overflow-visible z-10 relative" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M5,30 Q35,8 70,35 T140,18 T195,25 L195,48 L5,48 Z" fill="url(#gs)" className="opacity-15" />
                <path d="M5,30 Q35,8 70,35 T140,18 T195,25" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
                <defs><linearGradient id="gs" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" /><stop offset="100%" stopColor="var(--primary)" stopOpacity="0" /></linearGradient></defs>
              </svg>
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold">90 periods forward with confidence bounds.</div>
          </motion.div>

          {/* Bento: Chat */}
          <motion.div variants={itemVariants} className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px]">
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>AI ASSISTANT</span>
              <MessageSquare className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <div className="my-3"><h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Source-Backed Chat</h3><p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-1">Ask questions in plain English — answers reference your actual data metrics.</p></div>
            <div className="p-2 border border-border/40 rounded bg-background/50 font-mono text-[8px] text-left text-muted-foreground space-y-0.5">
              <div className="text-primary font-bold">&gt; Any spikes in values?</div>
              <div>Outlier at row 428 (+5.4x mean deviation).</div>
            </div>
          </motion.div>

          {/* Bento: Reports */}
          <motion.div variants={itemVariants} className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px]">
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>REPORT COMPILER</span>
              <FileText className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <div className="my-3"><h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Executive Briefing</h3><p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-1">Compile anomalies, forecasts, and chat logs into download-ready professional reports.</p></div>
            <div className="flex gap-2 font-mono text-[8px] font-bold text-primary">
              <span className="px-2 py-0.5 rounded border border-primary/30 bg-primary/5">REPORT.PDF</span>
              <span className="px-2 py-0.5 rounded border border-border bg-background text-muted-foreground">REPORT.DOCX</span>
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* ═══════════════════ HOW IT WORKS CAROUSEL ═══════════════════ */}
      <section id="how-it-works" className="py-20 border-t border-border bg-card/10 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <RevealSection>
            <div className="text-center mb-12 space-y-2">
              <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest">How It Works</span>
              <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight">From file upload to executive report</h2>
              <p className="text-xs text-muted-foreground font-semibold max-w-lg mx-auto">Four automated stages transform a flat spreadsheet into a comprehensive diagnostic briefing.</p>
            </div>
          </RevealSection>

          <RevealSection>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Step Selector Carousel Controls */}
              <div className="lg:col-span-4 space-y-2">
                {howItWorksSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = activeHowStep === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveHowStep(i)}
                      className={`w-full text-left p-4 rounded-cards border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                        isActive
                          ? "bg-card border-primary/40"
                          : "bg-transparent border-border/40 hover:bg-card/50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground/50"}`} />
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wide block transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.title}
                        </span>
                        <span className={`font-mono text-[9px] font-bold mt-0.5 block transition-colors ${isActive ? "text-primary" : "text-muted-foreground/40"}`}>
                          {step.stat}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right: Active Step Detail */}
              <div className="lg:col-span-8 border border-border bg-card rounded-cards p-8 md:p-10 text-left min-h-[260px] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-4 right-4 font-mono text-[8px] font-bold text-muted-foreground/40 select-none">
                  {String(activeHowStep + 1).padStart(2, "0")} / 04
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {React.createElement(howItWorksSteps[activeHowStep].icon, { className: "w-5 h-5 text-primary" })}
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">
                      {howItWorksSteps[activeHowStep].title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold max-w-lg">
                    {howItWorksSteps[activeHowStep].desc}
                  </p>
                </div>

                {/* Progress bar showing auto-rotation */}
                <div className="flex gap-2 pt-6">
                  {howItWorksSteps.map((_, i) => (
                    <div key={i} className="flex-1 h-1 rounded-full bg-background border border-border/40 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${i === activeHowStep ? "bg-primary w-full" : i < activeHowStep ? "bg-primary/30 w-full" : "w-0"}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════ STATS BAR ═══════════════════ */}
      <section className="py-12 border-t border-b border-border bg-card relative z-10">
        <RevealSection className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "<10s", label: "Average diagnosis time" },
              { value: "500MB", label: "Max file size per case" },
              { value: "13", label: "Analysis modules loaded" },
              { value: "PDF + DOCX", label: "Export format support" },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-2xl md:text-3xl font-black text-foreground font-mono tracking-tight">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ═══════════════════ ARCHITECTURE ═══════════════════ */}
      <section id="architecture" className="py-20 border-b border-border bg-card/10 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <RevealSection className="lg:col-span-5 space-y-6 text-left">
            <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest">Pipeline Architecture</span>
            <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight">The Processing Core</h2>
            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
              DetectiveAI combines high-performance database technologies to execute forensic scans. Data is analyzed entirely in memory and isolated inside a secure browser sandbox.
            </p>
            <div className="space-y-4">
              {[
                { icon: Database, title: "Polars Engine", desc: "Rust-backed dataframe allocator. Parses millions of rows in milliseconds." },
                { icon: Cpu, title: "Statsmodels Forecaster", desc: "Integrated ARIMA mathematical modeling for statistical projection." },
                { icon: ShieldCheck, title: "Zero-Retention Sandbox", desc: "Uploads are analyzed in-memory and deleted immediately upon session end." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold uppercase tracking-wide">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </RevealSection>

          <RevealSection className="lg:col-span-7 border border-border bg-card p-6 rounded-cards">
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
                <span className="font-mono text-[9px] font-bold text-muted-foreground/60 uppercase">ACTIVE_THREAD_POOL</span>
                <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-[9px] font-bold">SYSTEM_OK</span>
              </div>
              <div className="space-y-3 font-mono text-[10px] text-muted-foreground">
                {[
                  { label: "> Ingesting spreadsheet...", result: "COMPLETE (12ms)", width: "100%" },
                  { label: "> Profiling outlier Z-scores...", result: "FOUND 2 ANOMALIES", width: "85%", highlight: true },
                  { label: "> Compiling ARIMA time vector...", result: "COMPLETE", width: "60%" },
                ].map((row, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between">
                      <span>{row.label}</span>
                      <span className={row.highlight ? "text-primary font-bold" : "text-foreground"}>{row.result}</span>
                    </div>
                    <div className="w-full bg-background border border-border/40 h-2 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: row.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════ DEVELOPER SANDBOX ═══════════════════ */}
      <section id="developer" className="py-20 border-b border-border bg-card/20 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <RevealSection className="lg:col-span-7 order-2 lg:order-1 bg-black border border-border rounded-cards overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-card/60 border-b border-border/40">
              <div className="flex gap-2">
                {(["python", "bash"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedCodeTab(tab)}
                    className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${selectedCodeTab === tab ? "bg-primary/10 border border-primary/30 text-primary" : "text-muted-foreground border border-transparent"}`}
                  >
                    {tab === "python" ? "detective_api.py" : "install.sh"}
                  </button>
                ))}
              </div>
              <Terminal className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
            <div className="p-6 font-mono text-[10px] text-left leading-relaxed text-muted-foreground/90 overflow-x-auto min-h-[180px]">
              {selectedCodeTab === "python" ? (
                <pre>
                  <span className="text-primary">import</span> detective_ai <span className="text-primary">as</span> det{"\n\n"}
                  <span className="text-muted-foreground/50"># Ingest evidence parquet dataset</span>{"\n"}
                  case = det.IngestionPipeline(<span className="text-emerald-500">&quot;case_telemetry.parquet&quot;</span>){"\n\n"}
                  <span className="text-muted-foreground/50"># Run automated anomaly detection</span>{"\n"}
                  report = case.scan_anomalies(iqr_threshold=<span className="text-amber-500">1.5</span>){"\n"}
                  forecast = case.project_arima(periods=<span className="text-amber-500">90</span>){"\n\n"}
                  <span className="text-muted-foreground/50"># Export diagnostic briefing</span>{"\n"}
                  case.export_report(format=<span className="text-emerald-500">&quot;pdf&quot;</span>)
                </pre>
              ) : (
                <pre>
                  <span className="text-muted-foreground/50"># Install the diagnostics worker</span>{"\n"}
                  pip install detective-ai-engine{"\n"}
                  python -m detective_ai initialize --sandbox{"\n\n"}
                  <span className="text-primary">✓ Diagnostics engine running</span>{"\n"}
                  <span className="text-primary">✓ Sandbox isolation confirmed</span>
                </pre>
              )}
            </div>
          </RevealSection>

          <RevealSection className="lg:col-span-5 order-1 lg:order-2 space-y-6 text-left">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-primary" />
              <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest">Developer Sandbox</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight">Flexible Integrations</h2>
            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
              The engine is built to scale. Integrate with backend databases or access metrics programmatically using clean scripting pipelines.
            </p>
            <Link href="/login">
              <span className="inline-flex items-center gap-2 text-xs font-mono font-bold text-primary hover:underline cursor-pointer">
                Generate Sandbox API Key <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════ CTA BEFORE FOOTER ═══════════════════ */}
      <section className="py-24 border-b border-border bg-card/5 relative z-10">
        <RevealSection className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight">Ready to investigate your data?</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed font-semibold">
            Upload a file. Get anomaly scans, ARIMA forecasts, and a PDF briefing in under ten seconds.
          </p>
          <div className="flex justify-center pt-2">
            <Link href="/login">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-11 rounded-small bg-primary hover:opacity-95 text-primary-foreground font-bold text-xs uppercase tracking-wider px-7 flex items-center gap-2 cursor-pointer">
                Start Free Investigation <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </RevealSection>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="py-16 border-t border-border bg-card relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <LogoIcon className="w-5 h-5" />
              <span className="font-bold text-[11px] uppercase tracking-widest text-foreground font-mono">DetectiveAI</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed max-w-sm font-semibold">
              High-fidelity autonomous data forensics. Profile schemas, scan outliers, project ARIMA models, and compile executive briefings inside a secure sandbox.
            </p>
            <span className="text-[10px] font-mono text-muted-foreground/50 block pt-2">
              © {new Date().getFullYear()} DetectiveAI. All evidence files sandboxed.
            </span>
          </div>

          {/* Link Columns */}
          {[
            { title: "Forensics Engine", links: [{ label: "Case Profiler", href: "/dashboard" }, { label: "Anomaly Audit", href: "/dashboard" }, { label: "Forecasting", href: "/dashboard" }, { label: "Root Cause", href: "/dashboard" }] },
            { title: "Product", links: [{ label: "Case Archives", href: "/history" }, { label: "Upload Evidence", href: "/upload" }, { label: "Settings", href: "/settings" }, { label: "Profile", href: "/profile" }] },
            { title: "Connect", links: [{ label: "GitHub", href: "https://github.com/mannaxsara/detective-ai" }, { label: "Contact", href: "mailto:mannasarabilu@gmail.com" }] },
          ].map((col, idx) => (
            <div key={idx} className="space-y-3.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground">{col.title}</span>
              <ul className="space-y-2 text-[11px] font-medium text-muted-foreground">
                {col.links.map((link, lidx) => (
                  <li key={lidx}>
                    <Link href={link.href} className="hover:text-foreground cursor-pointer transition-colors block">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
