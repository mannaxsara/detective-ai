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
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 relative overflow-hidden">
      {/* Dynamic Background Mesh Grid */}
      <div
        className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(86,84,73,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(86,84,73,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-70 pointer-events-none"
        aria-hidden="true"
      />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-mesh-gradient rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="border-b border-border bg-card/45 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <span className="font-mono text-xs font-bold tracking-widest text-primary">◆</span>
            <span className="font-black text-xs uppercase tracking-widest text-foreground font-mono">DetectiveAI</span>
          </div>
          <div>
            {loading ? null : isLoggedIn ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-8 rounded-small bg-primary hover:opacity-90 text-primary-foreground font-bold text-[10px] uppercase tracking-wider px-4 transition-colors cursor-pointer"
                >
                  Go to Dashboard
                </motion.button>
              </Link>
            ) : (
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-8 rounded-small bg-primary hover:opacity-90 text-primary-foreground font-bold text-[10px] uppercase tracking-wider px-4 transition-colors cursor-pointer"
                >
                  Sign In
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-24 md:py-36 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto px-6 text-center space-y-6"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex justify-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-[10px] font-mono font-semibold uppercase text-muted-foreground tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              V1.4.2 Active Ingestion Loop
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl md:text-6xl font-black text-foreground tracking-tight max-w-3xl mx-auto leading-tight"
          >
            The Autonomous Data <br />
            <span className="text-primary">Investigation Engine</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Upload CSV, Excel, or Parquet evidence files. Detective AI instantly profiles schemas, detects outliers, runs statistical tests, and forecasts metrics.
          </p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="pt-4 flex justify-center">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="h-11 rounded-small bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs uppercase tracking-wider px-7 flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  Open Dashboard
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            ) : (
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="h-11 rounded-small bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs uppercase tracking-wider px-7 flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  Start Investigation
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Grid with scroll animation */}
      <section className="py-20 border-t border-border bg-card/30 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-1.5"
          >
            <h2 className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Capabilities</h2>
            <p className="text-xl font-bold text-foreground">Equipped for Comprehensive Forensic Profiling</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Card 1 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, borderColor: "var(--primary)" }}
              className="p-6 rounded-cards border border-border bg-card flex flex-col justify-between min-h-[180px] transition-all duration-300 shadow-sm"
            >
              <Database className="w-5 h-5 text-primary" />
              <div className="mt-6 space-y-1.5 text-left">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Schema Ingestion & Profiling</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Automatic data type mapping, memory footprint analysis, and schema health scoring for files up to 500MB.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, borderColor: "var(--primary)" }}
              className="p-6 rounded-cards border border-border bg-card flex flex-col justify-between min-h-[180px] transition-all duration-300 shadow-sm"
            >
              <LineChart className="w-5 h-5 text-primary" />
              <div className="mt-6 space-y-1.5 text-left">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">ARIMA Forecasting</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Run advanced time-series forecasting with lower and upper confidence bounds in seconds.
                </p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, borderColor: "var(--primary)" }}
              className="p-6 rounded-cards border border-border bg-card flex flex-col justify-between min-h-[180px] transition-all duration-300 shadow-sm"
            >
              <ShieldAlert className="w-5 h-5 text-primary" />
              <div className="mt-6 space-y-1.5 text-left">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Anomaly Scanning</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Automatically flag distribution outliers, missing values, duplicates, and statistical test discrepancies.
                </p>
              </div>
            </motion.div>
          </motion.div>
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
