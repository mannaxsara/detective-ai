"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Database, ShieldAlert, LineChart } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
            <span className="font-mono text-xs font-bold tracking-widest text-primary">◆</span>
            <span className="font-black text-xs uppercase tracking-widest text-foreground font-mono">DetectiveAI</span>
          </div>
          <div>
            {loading ? null : isLoggedIn ? (
              <Link href="/dashboard">
                <button className="h-8 rounded-small bg-primary hover:opacity-90 text-primary-foreground font-bold text-[10px] uppercase tracking-wider px-4 transition-all cursor-pointer">
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <Link href="/login">
                <button className="h-8 rounded-small bg-primary hover:opacity-90 text-primary-foreground font-bold text-[10px] uppercase tracking-wider px-4 transition-all cursor-pointer">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-[10px] font-mono font-semibold uppercase text-muted-foreground tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            V1.4.2 Active Ingestion Loop
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight max-w-2xl mx-auto leading-tight">
            The Autonomous Data Investigation Engine
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Upload CSV, Excel, or Parquet evidence files. Detective AI instantly profiles schemas, detects outliers, runs statistical tests, and forecasts metrics.
          </p>
          <div className="pt-4 flex justify-center">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <button className="h-10 rounded-small bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs uppercase tracking-wider px-6 flex items-center gap-2 transition-all cursor-pointer">
                  Open Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            ) : (
              <Link href="/login">
                <button className="h-10 rounded-small bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs uppercase tracking-wider px-6 flex items-center gap-2 transition-all cursor-pointer">
                  Start Investigation
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div
          className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(86,84,73,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(86,84,73,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60"
          aria-hidden="true"
        />
      </section>

      {/* Feature Grid */}
      <section className="py-16 border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 space-y-1">
            <h2 className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Capabilities</h2>
            <p className="text-lg font-bold text-foreground">Equipped for Comprehensive Forensic Profiling</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-cards border border-border bg-card flex flex-col justify-between min-h-[160px]">
              <Database className="w-5 h-5 text-primary" />
              <div className="mt-4 space-y-1 text-left">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Schema Ingestion & Profiling</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Automatic data type mapping, memory footprint analysis, and schema health scoring for files up to 500MB.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-cards border border-border bg-card flex flex-col justify-between min-h-[160px]">
              <LineChart className="w-5 h-5 text-primary" />
              <div className="mt-4 space-y-1 text-left">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">ARIMA Forecasting</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Run advanced time-series forecasting with lower and upper confidence bounds in seconds.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-cards border border-border bg-card flex flex-col justify-between min-h-[160px]">
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
      <footer className="py-12 border-t border-border bg-card">
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
