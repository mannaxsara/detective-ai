"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, Sparkles, ShieldAlert, LineChart, MessageSquare,
  FileText, ChevronRight, Terminal, ShieldCheck, Database, Code,
  Cpu, Upload, ArrowUpRight, Play, CheckCircle2, RefreshCw
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
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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

  // Live Simulation state in the processing core
  const [simStatus, setSimStatus] = useState<"idle" | "running" | "complete">("idle");
  const [simProgress, setSimProgress] = useState({ ingest: 100, anomalies: 85, arima: 60 });
  const [simLogs, setSimLogs] = useState<string[]>([
    "System ready. Awaiting thread initialization.",
  ]);

  useEffect(() => {
    const token = localStorage.getItem("detective_token");
    if (token) setIsLoggedIn(true);
    setLoading(false);
  }, []);

  // Auto-rotate the "How It Works" carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHowStep((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const triggerCoreSimulation = () => {
    if (simStatus === "running") return;
    setSimStatus("running");
    setSimProgress({ ingest: 0, anomalies: 0, arima: 0 });
    setSimLogs(["[1/3] Incepting ingestion pipeline...", "Allocating Polars in-memory table context."]);

    setTimeout(() => {
      setSimProgress(prev => ({ ...prev, ingest: 100 }));
      setSimLogs(prev => [...prev, "✓ Ingested case file (10,240 rows parsed in 12ms)", "[2/3] Analyzing outliers..."]);
    }, 1000);

    setTimeout(() => {
      setSimProgress(prev => ({ ...prev, anomalies: 85 }));
      setSimLogs(prev => [...prev, "⚠️ Found 2 anomalies (Z-Score > 3.0 threshold)", "[3/3] Running ARIMA projection models..."]);
    }, 2200);

    setTimeout(() => {
      setSimProgress(prev => ({ ...prev, arima: 60 }));
      setSimLogs(prev => [...prev, "✓ ARIMA models converged successfully", "Diagnostics cycle complete. Report ready."]);
      setSimStatus("complete");
    }, 3500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const howItWorksSteps = [
    {
      title: "1. Upload Evidence",
      desc: "Drag any CSV, Excel, or Parquet spreadsheet into the secure sandbox. The Polars engine profiles every column, identifies mapping schemas, and rates data integrity values in milliseconds.",
      icon: Upload,
      stat: "12ms Polars ingest",
    },
    {
      title: "2. Scan & Diagnose",
      desc: "The scanner applies standard IQR and Z-score distributions across all dimensions. It isolates outlier coordinates, missing cell blocks, and duplicate items automatically.",
      icon: ShieldAlert,
      stat: "IQR / Z-Score indices",
    },
    {
      title: "3. Forecast & Test",
      desc: "ARIMA auto-regressive models project 90 periods forward with multi-layered confidence bounds. Instantly run t-tests, ANOVA, and significance checks on any dataset target.",
      icon: LineChart,
      stat: "Confidence waves",
    },
    {
      title: "4. Compile Briefings",
      desc: "Generate comprehensive reports instantly. Save executive briefings complete with anomaly charts, projection trends, and chat history as download-ready PDF or Word files.",
      icon: FileText,
      stat: "PDF + DOCX builders",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 relative overflow-hidden pt-24 pb-8">
      
      {/* Background grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(212,110,85,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(212,110,85,0.012)_1px,transparent_1px)] bg-[size:40px_40px] opacity-65 pointer-events-none" aria-hidden="true" />

      {/* Subtle radial glow for background depth */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none select-none z-0" />

      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 rounded-full border border-border/80 bg-card/60 backdrop-blur-md px-6 h-12 flex items-center justify-between shadow-md">
        <Link href="/" className="flex items-center gap-2 select-none group">
          <LogoIcon className="w-5 h-5 group-hover:scale-105 transition-transform" />
          <span className="font-bold text-[10px] uppercase tracking-widest text-foreground font-mono">DetectiveAI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          <a href="#architecture" className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">Architecture</a>
          <a href="#developer" className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">Developer</a>
          <Link href="/history" className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">Case Archives</Link>
        </nav>

        <div className="flex items-center gap-4">
          {loading ? null : isLoggedIn ? (
            <Link href="/dashboard">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="h-7 rounded-full bg-primary hover:opacity-95 text-primary-foreground font-bold text-[9px] uppercase tracking-wider px-3.5 cursor-pointer flex items-center gap-1">
                Workspace <ArrowUpRight className="w-3 h-3" />
              </motion.button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Sign in</Link>
              <Link href="/register">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="h-7 rounded-full bg-primary hover:opacity-95 text-primary-foreground font-bold text-[9px] uppercase tracking-wider px-3.5 cursor-pointer">
                  Get Started
                </motion.button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════ SPACIOUS HERO SECTION ═══════════════════ */}
      <section className="pt-8 pb-12 max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Active status indicator */}
          <motion.div variants={itemVariants} className="inline-flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/40 bg-card text-[9px] font-mono font-bold uppercase text-primary tracking-wider select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              FORENSIC LAB READY
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight leading-[1.05] uppercase max-w-3xl mx-auto"
          >
            Turn raw datasets <br />into <span className="text-primary font-bold">clean briefings.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xs md:text-sm text-muted-foreground leading-relaxed font-semibold max-w-xl mx-auto"
          >
            DetectiveAI is an autonomous data diagnostics engine. Upload any CSV, Excel, or Parquet spreadsheet to automatically scan anomalies, project ARIMA models, test hypotheses, and export professional PDF/Word briefs.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="pt-4 flex justify-center gap-3">
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-10 rounded-small bg-primary hover:opacity-95 text-primary-foreground font-bold text-xs uppercase tracking-wider px-6 flex items-center gap-2 cursor-pointer shadow-md"
              >
                {isLoggedIn ? "Open Workspace" : "Ingest Case File"}
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
            
            <Link href="/history">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-10 rounded-small border border-border bg-card hover:bg-background text-foreground font-bold text-xs uppercase tracking-wider px-6 cursor-pointer"
              >
                View Case Archives
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════ SYMMETRICAL BENTO GRID FEATURE GRID ═══════════════════ */}
      <section className="py-4 max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          
          {/* Card 1: Data Normalization (Col Span 2) */}
          <div className="md:col-span-2 p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[190px]">
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>STEP 1 // DATA CLEANING</span>
              <Sparkles className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <div className="my-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Interactive Normalization</h3>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-1">Prunes null points, drops duplicate records, scales metrics, and maps schemas instantly.</p>
            </div>
            <div className="h-7 border border-border/40 rounded bg-background/50 flex items-center justify-around font-mono text-[8px] text-muted-foreground">
              <span>[Raw Dataset]</span><ChevronRight className="w-3 h-3 text-primary" /><span className="text-primary font-bold">[Polars Clean]</span>
            </div>
          </div>

          {/* Card 2: Outlier Scan (Col Span 2) */}
          <div className="md:col-span-2 p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[190px]">
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>STEP 2 // ANOMALIES</span>
              <ShieldAlert className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <div className="my-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Forensic Outlier Scan</h3>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-1">Isolate data anomalies and drift spikes using dynamic Z-score calculations and IQR thresholds.</p>
            </div>
            <div className="h-7 border border-border/40 rounded bg-background/50 flex items-center justify-center gap-1.5 px-3 select-none">
              {[0.3, 0.3, 1, 0.3, 0.3, 0.3].map((o, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${o === 1 ? "bg-primary" : "bg-muted-foreground/30"}`} />)}
              <span className="font-mono text-[8px] text-primary font-bold ml-1.5">Z-Score = +3.8</span>
            </div>
          </div>

          {/* Card 3: ARIMA Waveform (Col Span 2) */}
          <div className="md:col-span-2 p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[190px] overflow-hidden">
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>STEP 3 // FORECASTING</span>
              <LineChart className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <div className="h-14 w-full relative my-1 border border-border/30 rounded bg-background/50 p-1 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 opacity-15 pointer-events-none">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="border-r border-b border-border/40" />
                ))}
              </div>
              <svg className="w-full h-full overflow-visible z-10 relative" viewBox="0 0 200 60" preserveAspectRatio="none">
                <path d="M5,35 Q35,5 70,30 T140,10 T195,20 L195,50 L140,40 L70,48 L35,25 L5,45 Z" fill="var(--primary)" className="opacity-[0.04]" />
                <path d="M5,35 Q35,10 70,32 T140,15 T195,22 L195,40 L140,30 L70,40 L35,20 L5,40 Z" fill="var(--primary)" className="opacity-[0.08]" />
                <path d="M5,35 L20,38 L35,22 L50,42 L70,32" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" />
                <path d="M70,32 Q105,15 140,25 T195,20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" className="text-primary animate-pulse" />
                <circle cx="70" cy="32" r="3" className="fill-primary stroke-background" strokeWidth="1" />
              </svg>
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold">Predictive ARIMA projections with 95% bounds.</div>
          </div>

          {/* Card 4: AI Q&A Chat (Col Span 3) */}
          <div className="md:col-span-3 p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[190px]">
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>STEP 4 // AI ASSISTANT</span>
              <MessageSquare className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <div className="my-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Intelligent Assistant</h3>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-1">Interact directly with findings in natural language. Copilot translates schema correlations instantly.</p>
            </div>
            <div className="p-2 border border-border/40 rounded bg-background/50 font-mono text-[8px] text-left text-muted-foreground space-y-0.5">
              <div className="text-primary font-bold">&gt; Any spikes in values?</div>
              <div>Outlier detected at index 428 (+5.4x mean).</div>
            </div>
          </div>

          {/* Card 5: Briefing Reports (Col Span 3) */}
          <div className="md:col-span-3 p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[190px]">
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>STEP 5 // COMPILER</span>
              <FileText className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <div className="my-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Briefing Generator</h3>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-1">Compile anomaly logs, projection paths, and significance tests into print-ready PDF/Word reports.</p>
            </div>
            <div className="flex gap-2 font-mono text-[8px] font-bold text-primary">
              <span className="px-2 py-0.5 rounded border border-primary/30 bg-primary/5">REPORT.PDF</span>
              <span className="px-2 py-0.5 rounded border border-border bg-background text-muted-foreground">REPORT.DOCX</span>
            </div>
          </div>

        </div>
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
                          ? "bg-card border-primary/40 shadow-sm"
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
                <button
                  onClick={triggerCoreSimulation}
                  disabled={simStatus === "running"}
                  className="px-2.5 py-1 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-[9px] font-bold flex items-center gap-1.5 hover:bg-primary/20 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${simStatus === "running" ? "animate-spin" : ""}`} />
                  {simStatus === "running" ? "SIMULATING..." : "RUN SIMULATION"}
                </button>
              </div>
              
              <div className="space-y-3 font-mono text-[10px] text-muted-foreground">
                <div>
                  <div className="flex items-center justify-between">
                    <span>&gt; Ingesting spreadsheet...</span>
                    <span className="text-foreground">{simProgress.ingest === 100 ? "COMPLETE (12ms)" : "RUNNING"}</span>
                  </div>
                  <div className="w-full bg-background border border-border/40 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${simProgress.ingest}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span>&gt; Profiling outlier Z-scores...</span>
                    <span className={simProgress.anomalies === 85 ? "text-primary font-bold" : "text-foreground"}>
                      {simProgress.anomalies === 85 ? "FOUND 2 ANOMALIES" : simProgress.ingest === 100 ? "RUNNING" : "PENDING"}
                    </span>
                  </div>
                  <div className="w-full bg-background border border-border/40 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${simProgress.anomalies}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span>&gt; Compiling ARIMA time vector...</span>
                    <span className="text-foreground">
                      {simProgress.arima === 60 ? "COMPLETE" : simProgress.anomalies === 85 ? "RUNNING" : "PENDING"}
                    </span>
                  </div>
                  <div className="w-full bg-background border border-border/40 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${simProgress.arima}%` }} />
                  </div>
                </div>
              </div>

              {/* Console log outputs */}
              <div className="mt-4 p-3 bg-background border border-border/40 rounded font-mono text-[9px] text-muted-foreground/80 space-y-1 max-h-[80px] overflow-y-auto">
                {simLogs.map((log, i) => (
                  <div key={i} className={log.startsWith("✓") ? "text-emerald-500" : log.startsWith("⚠️") ? "text-primary font-bold" : ""}>
                    {log}
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
          
          {/* Left Side: Code Editor with Console response view */}
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

            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-b border-border/20">
              <div className="md:col-span-7 p-6 font-mono text-[10px] text-left leading-relaxed text-muted-foreground/90 overflow-x-auto min-h-[180px] border-b md:border-b-0 md:border-r border-border/20">
                {selectedCodeTab === "python" ? (
                  <pre>
                    <span className="text-primary">import</span> detective_ai <span className="text-primary">as</span> det{"\n\n"}
                    <span className="text-muted-foreground/50"># Ingest parquet file</span>{"\n"}
                    case = det.IngestionPipeline(<br/>
                    &nbsp;&nbsp;<span className="text-emerald-500">&quot;case_telemetry.parquet&quot;</span><br/>
                    ){"\n\n"}
                    <span className="text-muted-foreground/50"># Run anomaly scan & ARIMA</span>{"\n"}
                    res = case.scan_anomalies()<br/>
                    f = case.project_arima(periods=<span className="text-amber-500">90</span>){"\n\n"}
                    print(res.health_score)
                  </pre>
                ) : (
                  <pre>
                    <span className="text-muted-foreground/50"># Install via pip manager</span>{"\n"}
                    pip install detective-ai-engine{"\n\n"}
                    <span className="text-muted-foreground/50"># Boot secure local worker</span>{"\n"}
                    python -m detective_ai initialize
                  </pre>
                )}
              </div>

              {/* API Response simulation panel */}
              <div className="md:col-span-5 p-6 bg-[#040405] font-mono text-[9px] text-left leading-relaxed text-muted-foreground">
                <span className="text-muted-foreground/40 uppercase block mb-3 font-bold select-none">// stdout response</span>
                {selectedCodeTab === "python" ? (
                  <pre className="text-emerald-500">
                    {JSON.stringify({
                      status: "completed",
                      health_score: 98.4,
                      anomalies_found: 2,
                      forecast_periods: 90,
                      latency: "12ms"
                    }, null, 2)}
                  </pre>
                ) : (
                  <pre className="text-primary">
                    [SYSTEM CONFIG]{"\n"}
                    ✓ Thread pooling initialized{"\n"}
                    ✓ Sandbox connection check OK{"\n"}
                    ✓ Host target: localhost:8000{"\n"}
                    ✓ Listening active...
                  </pre>
                )}
              </div>
            </div>
          </RevealSection>

          {/* Right Side: Description */}
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
              High-fidelity data diagnostics. Profile schemas, scan outliers, project ARIMA models, and compile executive briefings inside a secure sandbox.
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
