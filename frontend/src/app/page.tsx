"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldAlert, LineChart, MessageSquare, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

// Abstract "D" magnifying glass logo representing Detective + Data Diagnostics
function LogoIcon() {
  return (
    <svg className="w-6 h-6 text-primary shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer bounding frame */}
      <rect x="15" y="15" width="70" height="70" rx="16" stroke="currentColor" strokeWidth="5" className="opacity-20" />
      {/* Abstract D shape */}
      <path d="M35 30 H55 C66 30 73 37 73 50 C73 63 66 70 55 70 H35 V30 Z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      {/* Inner magnifying glass lens */}
      <circle cx="45" cy="50" r="10" stroke="currentColor" strokeWidth="5" />
      {/* Magnifying handle */}
      <path d="M52 57 L68 73" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("detective_token");
    if (token) {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 relative overflow-hidden">
      
      {/* Background grid lines */}
      <div
        className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(212,110,85,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(212,110,85,0.012)_1px,transparent_1px)] bg-[size:40px_40px] opacity-65 pointer-events-none"
        aria-hidden="true"
      />

      {/* Navigation Header */}
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="border-b border-border bg-card/45 backdrop-blur-md sticky top-0 z-50 animate-fade-in"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            <LogoIcon />
            <span className="font-bold text-xs uppercase tracking-widest text-foreground font-mono">DetectiveAI</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/history" className="text-xs font-mono font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
              Case Archives
            </Link>
            {loading ? null : isLoggedIn ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="h-8 rounded-small bg-primary hover:opacity-95 text-primary-foreground font-bold text-[10px] uppercase tracking-wider px-4 transition-colors cursor-pointer"
                >
                  Workspace
                </motion.button>
              </Link>
            ) : (
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="h-8 rounded-small bg-primary hover:opacity-95 text-primary-foreground font-bold text-[10px] uppercase tracking-wider px-4 transition-colors cursor-pointer"
                >
                  Sign In
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      {/* Bento Grid Hero Layout */}
      <section className="py-12 md:py-20 max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          
          {/* Main Elevator Pitch Card (Span 2x2) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 md:row-span-2 p-8 md:p-12 bg-card border border-border rounded-cards flex flex-col justify-between min-h-[380px] relative overflow-hidden text-left"
          >
            <div className="absolute top-6 right-6 flex items-center gap-1.5 font-mono text-[9px] font-bold text-primary select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              FORENSIC WORKSPACE READY
            </div>

            <div className="space-y-6 pt-4">
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-none uppercase">
                Turn raw datasets <br />
                into <span className="text-primary font-bold">clean briefings.</span>
              </h1>
              
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold max-w-lg">
                DetectiveAI is an autonomous data diagnostics engine. Upload any CSV, Excel, or Parquet spreadsheet to automatically scan anomalies, run ARIMA projections, test hypotheses, and export professional PDF/Word briefs.
              </p>
            </div>

            <div className="pt-8 flex flex-wrap items-center gap-4">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-10 rounded-small bg-primary hover:opacity-95 text-primary-foreground font-bold text-xs uppercase tracking-wider px-6 flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    Open Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </Link>
              ) : (
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-10 rounded-small bg-primary hover:opacity-95 text-primary-foreground font-bold text-xs uppercase tracking-wider px-6 flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    Ingest Case File
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </Link>
              )}
              <span className="font-mono text-[9px] text-muted-foreground/60 font-bold select-none">
                SECURE SANDBOX INGESTION
              </span>
            </div>
          </motion.div>

          {/* Bento Card 2: Step 1 (Cleaning) */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px]"
          >
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>STEP 1 // DATA CLEANING</span>
              <Sparkles className="w-3.5 h-3.5 text-primary/70" />
            </div>
            
            <div className="space-y-1.5 my-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Automatic Schema Alignment</h3>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                Prune null values, Drop duplicate records, scale out-of-bounds metrics, and align raw data types automatically.
              </p>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[8px] text-primary font-bold">
              <CheckCircle2 className="w-2.5 h-2.5" />
              CLEAN PIPELINE READY
            </div>
          </motion.div>

          {/* Bento Card 3: Step 2 (Anomalies) */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px]"
          >
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>STEP 2 // ANOMALIES</span>
              <ShieldAlert className="w-3.5 h-3.5 text-primary/70" />
            </div>

            <div className="space-y-1.5 my-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Outlier Scanning</h3>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                Automatically isolate outlier spikes and statistical errors using IQR and Z-score distributions.
              </p>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[8px] text-primary font-bold">
              <CheckCircle2 className="w-2.5 h-2.5" />
              OUTLIER SHIELD ACTIVE
            </div>
          </motion.div>

          {/* Bento Card 4: Step 3 (ARIMA Waveform) */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px] overflow-hidden"
          >
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>STEP 3 // FORECASTING</span>
              <LineChart className="w-3.5 h-3.5 text-primary/70" />
            </div>

            {/* Glowing Shaded SVG Waveform */}
            <div className="h-12 w-full relative flex items-center justify-center my-1.5">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60" preserveAspectRatio="none">
                <path
                  d="M10,35 Q40,10 70,40 T130,20 T190,30 L190,55 L10,55 Z"
                  fill="url(#gradient-shade-home)"
                  className="opacity-20"
                />
                <path
                  d="M10,35 Q40,10 70,40 T130,20 T190,30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary"
                />
                <defs>
                  <linearGradient id="gradient-shade-home" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
              ARIMA time-series projections with confidence bounds.
            </div>
          </motion.div>

          {/* Bento Card 5: Step 4 (AI Q&A Chat) */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px]"
          >
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>STEP 4 // AI ASSISTANT</span>
              <MessageSquare className="w-3.5 h-3.5 text-primary/70" />
            </div>

            <div className="space-y-1.5 my-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Context-Aware Chat</h3>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                Ask natural language questions about your dataset anomalies, variables, or statistical significance tests.
              </p>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[8px] text-primary font-bold">
              <CheckCircle2 className="w-2.5 h-2.5" />
              COPILOT SYNCED
            </div>
          </motion.div>

          {/* Bento Card 6: Step 5 (Briefing Reports) */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px]"
          >
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>STEP 5 // COMPILER</span>
              <FileText className="w-3.5 h-3.5 text-primary/70" />
            </div>

            <div className="space-y-1.5 my-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Executive Briefing Files</h3>
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                Compile anomalies, forecasts, and statistical findings into download-ready PDF or Word reports instantly.
              </p>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[8px] text-primary font-bold">
              <CheckCircle2 className="w-2.5 h-2.5" />
              REPORTS ENCODED
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>◆</span>
            <span className="font-bold uppercase tracking-wider text-foreground">DetectiveAI</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-4">
            <span>Security Synced</span>
            <span>·</span>
            <span>Ingest Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
