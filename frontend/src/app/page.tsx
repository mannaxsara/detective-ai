"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Database, ShieldAlert, LineChart } from "lucide-react";
import { motion } from "framer-motion";

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
          <div className="flex items-center gap-3 select-none">
            <img
              src="/logo.jpg"
              alt="DetectiveAI Logo"
              className="w-7 h-7 rounded-cards border border-border object-cover"
            />
            <span className="font-bold text-sm tracking-tight text-foreground uppercase">DetectiveAI</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/history" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Case Archives
            </Link>
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

      {/* Project Hero Section */}
      <section className="py-12 md:py-24 max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-border bg-card rounded-cards overflow-hidden shadow-sm">
          
          {/* Left Panel: Project Branding & Meta */}
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
                  Forensic Ingestion Online
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={itemVariants}
                className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-none uppercase"
              >
                Autonomous Data <br />
                <span className="text-primary font-bold">Diagnostics Lab.</span>
              </motion.h1>

              {/* Tech Stack Specs */}
              <motion.div variants={itemVariants} className="flex flex-wrap gap-2 pt-1 font-mono text-[9px] text-muted-foreground font-bold select-none">
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
                A high-fidelity data forensics workspace designed to profile file schemas, audit statistical outliers, execute hypothesis test scenarios, and project time-series ARIMA vectors instantly.
              </motion.p>

              {/* Primary Action buttons */}
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

          {/* Right Panel: High-Fidelity Data Illustration (No Terminal) */}
          <div className="lg:col-span-6 p-6 md:p-8 flex items-center justify-center bg-background/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm rounded-cards border border-border/80 overflow-hidden bg-card shadow-2xl relative select-none"
            >
              <img
                src="/hero-mockup.jpg"
                alt="DetectiveAI Ingestion Forensics Visualization Mockup"
                className="w-full h-auto object-cover"
              />
            </motion.div>
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
