"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Terminal as TerminalIcon, ArrowRight, Database, ShieldAlert, LineChart, Play, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandOutput {
  id: string;
  type: "command" | "response" | "system";
  text: string;
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Interactive Terminal State
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<CommandOutput[]>([
    { id: "1", type: "system", text: "DETECTIVE CORE v1.4.2 INGESTION LOOP INITIALIZED." },
    { id: "2", type: "system", text: "TYPE 'help' TO VIEW FORENSIC COMMANDS." }
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("detective_token");
    if (token) {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    const newHistory = [...terminalHistory, { id: Date.now().toString(), type: "command" as const, text: `detective@core:~$ ${terminalInput}` }];
    
    let responseText = "";
    if (cmd === "help") {
      responseText = "AVAILABLE ACTIONS:\n  ingest    - Mock parse case_data.parquet (10,240 rows)\n  profile   - Display schema details & data types\n  anomalies - Scan outliers via t-test & Z-score checks\n  forecast  - Generate ARIMA projection vector\n  clear     - Clear terminal logs";
    } else if (cmd === "ingest") {
      responseText = "INGESTING case_data.parquet...\n✓ Parsed 10,240 records in 12ms\n✓ Target index matched: [Timestamp, Value]\n✓ Health Score: 94.2% [Optimal]";
    } else if (cmd === "profile") {
      responseText = "SCHEMA ARCHITECTURE:\n  Timestamp      - DateTime64 (Index)\n  Transaction_ID - Int64\n  Value          - Float64\n  Location_Code  - Categorical\n  Status_Flag    - Utf8";
    } else if (cmd === "anomalies") {
      responseText = "SCANNING FOR OUTLIERS...\n✓ T-Test confidence: 99.5%\n⚠️ Anomaly detected: Row 428 is a 5.4x deviation from mean\n⚠️ Anomaly detected: Row 1022 shows missing Location_Code";
    } else if (cmd === "forecast") {
      responseText = "EXECUTING ARIMA(1,1,1) PROJECTION...\n✓ 90 periods forecasted\n✓ Confidence bounds computed (yhat_upper/lower)\n✓ Trend profile: STABLE CONVERGENCE";
    } else if (cmd === "clear") {
      setTerminalHistory([]);
      setTerminalInput("");
      return;
    } else {
      responseText = `Command not recognized: '${cmd}'. Type 'help' for instructions.`;
    }

    setTerminalHistory([...newHistory, { id: (Date.now() + 1).toString(), type: "response" as const, text: responseText }]);
    setTerminalInput("");
  };

  const runQuickCommand = (cmd: string) => {
    setTerminalInput(cmd);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
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
        className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(212,110,85,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(212,110,85,0.015)_1px,transparent_1px)] bg-[size:50px_50px] opacity-50 pointer-events-none"
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
          <div className="flex items-center gap-2 select-none">
            <span className="font-mono text-xs font-bold tracking-widest text-primary">◆</span>
            <span className="font-black text-xs uppercase tracking-widest text-foreground font-mono">DetectiveAI</span>
          </div>
          <div className="flex items-center gap-6">
            {loading ? null : isLoggedIn ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="h-8 rounded-small bg-primary hover:opacity-95 text-primary-foreground font-bold text-[10px] uppercase tracking-wider px-4 transition-colors cursor-pointer"
                >
                  Go to Dashboard
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

      {/* Main Terminal Workspace Hero */}
      <section className="py-12 md:py-24 max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-border bg-card rounded-cards overflow-hidden shadow-sm">
          
          {/* Left Panel: Description & Actions */}
          <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-border text-left">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Badge */}
              <motion.div variants={itemVariants}>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/40 bg-background text-[9px] font-mono font-bold uppercase text-primary tracking-wider select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Forensic Ingest Mode Active
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={itemVariants}
                className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-none uppercase"
              >
                Autonomous Data <br />
                <span className="text-primary">Investigation.</span>
              </motion.h1>

              {/* Tech Stack Specs */}
              <motion.div variants={itemVariants} className="flex flex-wrap gap-2 pt-1 font-mono text-[9px] text-muted-foreground font-bold">
                <span className="px-2.5 py-0.5 rounded border border-border bg-background">FASTAPI</span>
                <span className="px-2.5 py-0.5 rounded border border-border bg-background">POLARS</span>
                <span className="px-2.5 py-0.5 rounded border border-border bg-background">ARIMA</span>
                <span className="px-2.5 py-0.5 rounded border border-border bg-background">REACT 19</span>
              </motion.div>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-xs text-muted-foreground leading-relaxed font-semibold max-w-md"
              >
                A high-fidelity data forensics engine. Upload evidence files to profile schemas, detect statistical anomalies, calculate ARIMA time-series projections, and output executive report briefings instantly.
              </motion.p>

              {/* Primary Workspace Trigger CTAs */}
              <motion.div variants={itemVariants} className="pt-4 flex flex-wrap gap-3">
                {isLoggedIn ? (
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="h-10 rounded-small bg-primary hover:opacity-95 text-primary-foreground font-bold text-xs uppercase tracking-wider px-6 flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      Open Dashboard
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
                      Enter Workspace
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </Link>
                )}
                <Link href="/history">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-10 rounded-small border border-border bg-background hover:bg-card text-foreground font-bold text-xs uppercase tracking-wider px-6 cursor-pointer"
                  >
                    View Case Archive
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Panel: Interactive Terminal */}
          <div className="lg:col-span-6 p-6 md:p-8 bg-background/40 flex flex-col justify-between">
            <div className="w-full h-full flex flex-col justify-between space-y-4">
              
              {/* Terminal Screen Container */}
              <div className="w-full bg-black border border-border/80 rounded-cards overflow-hidden shadow-2xl flex flex-col h-[280px]">
                {/* Header controls bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-card/60 border-b border-border/40 select-none">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                    terminal - detective@core:~
                  </span>
                  <div className="w-10" />
                </div>

                {/* Logs Screen */}
                <div className="p-4 flex-grow overflow-y-auto font-mono text-[10px] text-left space-y-2 scrollbar-none">
                  {terminalHistory.map((item) => (
                    <div
                      key={item.id}
                      className={
                        item.type === "command"
                          ? "text-foreground font-bold"
                          : item.type === "system"
                          ? "text-primary/70"
                          : "text-muted-foreground/90 whitespace-pre-wrap leading-relaxed"
                      }
                    >
                      {item.text}
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>

                {/* Input Prompt Form */}
                <form
                  onSubmit={handleTerminalSubmit}
                  className="flex items-center px-4 py-2 border-t border-border/30 bg-card/30 font-mono text-[10px]"
                >
                  <span className="text-primary font-bold mr-2 select-none">detective@core:~$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Type 'help' or click buttons below..."
                    className="flex-1 bg-transparent border-0 outline-none text-foreground caret-primary placeholder:text-muted-foreground/30 font-bold"
                  />
                </form>
              </div>

              {/* Quick CLI Shortcuts Pane */}
              <div className="space-y-2.5 text-left">
                <span className="text-[9px] font-mono font-bold text-muted-foreground/60 uppercase tracking-widest select-none block">
                  Quick Actions (Click to Run)
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[9px] font-bold">
                  {[
                    { label: "help", cmd: "help" },
                    { label: "ingest file", cmd: "ingest" },
                    { label: "profile schema", cmd: "profile" },
                    { label: "scan outliers", cmd: "anomalies" },
                    { label: "forecast vector", cmd: "forecast" }
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      onClick={() => runQuickCommand(btn.cmd)}
                      className="px-3 py-1 rounded bg-card border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center gap-1 active:scale-[0.98]"
                    >
                      <Play className="w-2 h-2 text-primary/80" />
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Product Capability Modules */}
      <section className="py-16 border-t border-border bg-card/20 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 space-y-1.5 select-none">
            <h2 className="text-[9px] font-mono font-bold text-primary uppercase tracking-widest">Capabilities</h2>
            <p className="text-lg font-bold text-foreground">Equipped for Comprehensive Forensic Profiling</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-cards border border-border bg-card flex flex-col justify-between min-h-[160px] shadow-sm">
              <Database className="w-5 h-5 text-primary" />
              <div className="mt-4 space-y-1 text-left">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Schema Ingestion & Profiling</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Automatic data type mapping, memory footprint analysis, and schema health scoring for files up to 500MB.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-cards border border-border bg-card flex flex-col justify-between min-h-[160px] shadow-sm">
              <LineChart className="w-5 h-5 text-primary" />
              <div className="mt-4 space-y-1 text-left">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">ARIMA Forecasting</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Run advanced time-series forecasting with lower and upper confidence bounds in seconds.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-cards border border-border bg-card flex flex-col justify-between min-h-[160px] shadow-sm">
              <ShieldAlert className="w-5 h-5 text-primary" />
              <div className="mt-4 space-y-1 text-left">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Anomaly Scanning</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Automatically flag distribution outliers, missing values, duplicates, and statistical test discrepancies.
                </p>
              </div>
            </div>
          </div>
        </div>
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
