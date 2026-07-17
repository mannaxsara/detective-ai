"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Database, ShieldAlert, LineChart, Cpu, BarChart3, Activity } from "lucide-react";
import { motion } from "framer-motion";

function LogoIcon() {
  return (
    <svg className="w-6 h-6 text-primary shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L95 50 L50 95 L5 50 Z" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="opacity-30" />
      <circle cx="45" cy="45" r="20" stroke="currentColor" strokeWidth="4" />
      <path d="M59 59 L82 82" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M45 10 L45 18 M45 72 L45 80 M10 45 L18 45 M72 45 L80 45" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-70" />
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
        className="border-b border-border bg-card/45 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 select-none">
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
          
          {/* Main Title Card (Span 2x2) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 md:row-span-2 p-8 md:p-12 bg-card border border-border rounded-cards flex flex-col justify-between min-h-[380px] relative overflow-hidden text-left"
          >
            {/* Corner status light */}
            <div className="absolute top-6 right-6 flex items-center gap-1.5 font-mono text-[9px] font-bold text-primary select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              FORENSICS GATEWAY ONLINE
            </div>

            <div className="space-y-6 pt-4">
              <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-none uppercase">
                Autonomous Data <br />
                <span className="text-primary">Diagnostics Lab.</span>
              </h1>
              
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold max-w-lg">
                A high-fidelity data diagnostics project engine. Ingest flat evidence files to map schemas, detect anomalies, execute hypothesis test scenarios, and run ARIMA forecasting models instantly.
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
              
              <div className="flex gap-2 font-mono text-[8px] text-muted-foreground/70 font-bold select-none">
                <span>FASTAPI</span>
                <span>·</span>
                <span>POLARS</span>
                <span>·</span>
                <span>ARIMA</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 2: Live Telemetry Status */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px]"
          >
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>SYSTEM PROFILE</span>
              <Cpu className="w-3.5 h-3.5 text-primary/70" />
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-baseline border-b border-border/30 pb-1.5">
                <span className="text-[10px] text-muted-foreground font-semibold">Engine Ingestion</span>
                <span className="font-mono text-xs font-bold text-foreground">POLARS THREADS</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-border/30 pb-1.5">
                <span className="text-[10px] text-muted-foreground font-semibold">Memory Limit</span>
                <span className="font-mono text-xs font-bold text-foreground">500MB / FILE</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] text-muted-foreground font-semibold">Diagnosis Latency</span>
                <span className="font-mono text-xs font-bold text-foreground">&lt; 10 SECONDS</span>
              </div>
            </div>

            <div className="text-[9px] font-mono text-primary font-bold mt-2">
              ✓ PIPELINE READY FOR COMPILATION
            </div>
          </motion.div>

          {/* Bento Card 3: ARIMA Shaded Waveform Projection */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px] overflow-hidden relative"
          >
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>ARIMA TIME-SERIES MODEL</span>
              <Activity className="w-3.5 h-3.5 text-primary/70" />
            </div>

            {/* Glowing Shaded SVG Waveform */}
            <div className="h-16 w-full relative flex items-center justify-center my-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60" preserveAspectRatio="none">
                {/* Confidence Shaded Region */}
                <path
                  d="M10,35 Q40,10 70,40 T130,20 T190,30 L190,55 L10,55 Z"
                  fill="url(#gradient-shade)"
                  className="opacity-20"
                />
                {/* Forecast Line */}
                <path
                  d="M10,35 Q40,10 70,40 T130,20 T190,30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary"
                />
                <defs>
                  <linearGradient id="gradient-shade" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="text-[9px] font-mono text-muted-foreground font-bold select-none">
              90 PERIODS MODEL CONVERGENCE OUTPUT
            </div>
          </motion.div>

          {/* Bento Card 4: Statistical Ingestion */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px]"
          >
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>DATA INGEST SCORES</span>
              <Database className="w-3.5 h-3.5 text-primary/70" />
            </div>

            <div className="space-y-1 my-3">
              <div className="text-3xl font-black text-foreground font-mono tracking-tight">10.2K</div>
              <p className="text-[10px] text-muted-foreground font-semibold">
                Simulated database records mapped, audited and computed locally per thread run.
              </p>
            </div>

            <div className="text-[9px] font-mono text-primary font-bold">
              ✓ SCHEMA HEALTH SCORING RUNNING
            </div>
          </motion.div>

          {/* Bento Card 5: Hypothesis & ANOVA Tests */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px]"
          >
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>STATISTICAL TESTING</span>
              <BarChart3 className="w-3.5 h-3.5 text-primary/70" />
            </div>

            <div className="space-y-1 my-3">
              <div className="text-3xl font-black text-foreground font-mono tracking-tight">p &lt; 0.05</div>
              <p className="text-[10px] text-muted-foreground font-semibold">
                Automatic ANOVA, t-tests, and chi-square significance testing with clean textual p-value summaries.
              </p>
            </div>

            <div className="text-[9px] font-mono text-primary font-bold">
              ✓ HYPOTHESIS LAB LOADED
            </div>
          </motion.div>

          {/* Bento Card 6: Anomaly Diagnostics */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-card border border-border rounded-cards flex flex-col justify-between text-left min-h-[180px]"
          >
            <div className="flex items-center justify-between font-mono text-[9px] font-bold text-muted-foreground/60 tracking-wider">
              <span>OUTLIER SCANNER</span>
              <ShieldAlert className="w-3.5 h-3.5 text-primary/70" />
            </div>

            <div className="space-y-1 my-3">
              <div className="text-3xl font-black text-foreground font-mono tracking-tight">IQR + Z</div>
              <p className="text-[10px] text-muted-foreground font-semibold">
                Interquartile ranges and Z-score distributions scanned to isolate missing values, duplicates and outlier spikes.
              </p>
            </div>

            <div className="text-[9px] font-mono text-primary font-bold">
              ✓ ANOMALY ISOLATION PIPELINE
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
