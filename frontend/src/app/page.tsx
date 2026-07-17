"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, ShieldAlert, LineChart, MessageSquare,
  FileText, Terminal, ShieldCheck, Database,
  Cpu, Upload, ArrowUpRight, RefreshCw,
  ExternalLink, BarChart3, Layers, HardDrive, Settings,
  CheckCircle2, Sun, Moon, Sparkles, ChevronRight, Play
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

/* ─────────────────────────────────────────────────────────────
   LOGO — geometric magnifying lens + neural data nodes
───────────────────────────────────────────────────────────── */
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="13" r="9.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="11" cy="12" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="15" r="1.2" fill="currentColor" />
      <line x1="11" y1="12" x2="15" y2="10" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="15" y1="10" x2="15" y2="15" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="11" y1="12" x2="15" y2="15" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
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
      {[16, 32, 48].map(y => (
        <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="currentColor" strokeWidth="0.4" className="text-primary/10" />
      ))}
      <path d="M0,44 Q50,12 80,36 T150,14 L200,22 L200,44 L150,36 L80,54 Q50,36 0,52 Z" fill="currentColor" className="text-primary/6" />
      <polyline points="0,44 25,40 50,28 75,38 80,36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/50" />
      <polyline points="80,36 110,20 140,22 170,16 200,18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" className="text-primary" />
      <circle cx="80" cy="36" r="3" fill="currentColor" stroke="#11120d" strokeWidth="1.5" className="text-primary" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   LIVE NETWORK TOPOLOGY SIMULATOR (CANVAS)
───────────────────────────────────────────────────────────── */
function NetworkSimulator({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const nodes = [
      { x: 30, y: 30, state: "idle" },
      { x: 80, y: 20, state: "idle" },
      { x: 130, y: 40, state: "idle" },
      { x: 180, y: 15, state: "idle" },
      { x: 50, y: 70, state: "idle" },
      { x: 100, y: 65, state: "idle" },
      { x: 150, y: 80, state: "idle" },
      { x: 220, y: 60, state: "idle" },
    ];

    const connections = [
      [0, 1], [0, 4], [1, 2], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [5, 6], [6, 7]
    ];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      nodes.forEach((n, idx) => {
        if (progress >= 100) {
          n.state = idx === 2 || idx === 5 ? "anomaly" : "done";
        } else if (progress > 30) {
          n.state = idx === 2 || idx === 5 ? "anomaly" : "active";
        } else if (progress > 5) {
          n.state = (idx * 12) < progress ? "active" : "idle";
        } else {
          n.state = "idle";
        }
      });

      connections.forEach(([s, e]) => {
        const from = nodes[s];
        const to = nodes[e];
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.lineWidth = 0.8;
        
        if (from.state === "anomaly" || to.state === "anomaly") {
          ctx.strokeStyle = "rgba(238, 96, 24, 0.25)";
        } else if (from.state === "active" || to.state === "active" || from.state === "done" || to.state === "done") {
          ctx.strokeStyle = "rgba(216, 207, 188, 0.4)";
        } else {
          ctx.strokeStyle = "rgba(86, 84, 73, 0.1)";
        }
        ctx.stroke();
      });

      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.state === "anomaly" ? 3.5 : 2.5, 0, Math.PI * 2);
        
        if (n.state === "anomaly") {
          ctx.fillStyle = "#bc3e3e";
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#bc3e3e";
        } else if (n.state === "done") {
          ctx.fillStyle = "#A0CA92";
          ctx.shadowBlur = 0;
        } else if (n.state === "active") {
          ctx.fillStyle = "#d8cfbc";
          ctx.shadowBlur = 4;
          ctx.shadowColor = "#d8cfbc";
        } else {
          ctx.fillStyle = "rgba(86, 84, 73, 0.3)";
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [progress]);

  return (
    <canvas ref={canvasRef} width={260} height={100} className="w-full h-[90px] border border-border/30 rounded-lg bg-background/20" />
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCodeTab, setSelectedCodeTab] = useState<"python" | "nodejs" | "curl">("python");
  const [activeStep, setActiveStep] = useState(0);
  const [simStatus, setSimStatus] = useState<"idle" | "running" | "done">("idle");
  const [simP, setSimP] = useState({ a: 100, b: 85, c: 60 });
  const [simLogs, setSimLogs] = useState(["System ready."]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Advanced Interactive Mockup Workspace States
  const [mockDataset, setMockDataset] = useState<"server_telemetry" | "retail_spikes" | "energy_drift" | null>(null);
  const [mockIngestProgress, setMockIngestProgress] = useState(0);
  const [mockIngestStatus, setMockIngestStatus] = useState("");
  const [previewTab, setPreviewTab] = useState<"database" | "chart" | "anomaly" | "chat">("database");
  const [forecastHorizon, setForecastHorizon] = useState<30 | 60 | 90>(90);
  const [selectedAnomalyIndex, setSelectedAnomalyIndex] = useState<number | null>(null);
  const [mockChatQ, setMockChatQ] = useState("");
  const [mockChatA, setMockChatA] = useState("");
  const [isTypingChat, setIsTypingChat] = useState(false);

  // Capability card interactive states
  const [cardFormat, setCardFormat] = useState<"CSV" | "Parquet" | "JSON">("CSV");
  const [cardSigma, setCardSigma] = useState<2.5 | 3.0 | 3.5>(3.0);
  const [cardPeriods, setCardPeriods] = useState<30 | 60 | 90>(90);
  const [cardAlpha, setCardAlpha] = useState(0.05);
  const [cardPrompt, setCardPrompt] = useState<0 | 1>(0);
  const [cardExport, setCardExport] = useState<"PDF" | "DOCX">("PDF");

  // Timeline interaction states
  const [timelineUploadDone, setTimelineUploadDone] = useState(false);
  const [timelineScanPercent, setTimelineScanPercent] = useState(0);
  const [timelineScanStatus, setTimelineScanStatus] = useState<"idle" | "scanning" | "done">("idle");
  const [timelineForecastPeriod, setTimelineForecastPeriod] = useState<30 | 60 | 90>(90);
  const [timelineExportStatus, setTimelineExportStatus] = useState<"idle" | "generating" | "done">("idle");

  // Footer interactive states
  const [footerEmail, setFooterEmail] = useState("");
  const [footerSubscribed, setFooterSubscribed] = useState(false);

  const runTimelineScan = () => {
    if (timelineScanStatus === "scanning") return;
    setTimelineScanStatus("scanning");
    setTimelineScanPercent(0);
    const interval = setInterval(() => {
      setTimelineScanPercent(prev => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(interval);
          setTimelineScanStatus("done");
        }
        return next;
      });
    }, 100);
  };

  const runTimelineExport = () => {
    if (timelineExportStatus === "generating") return;
    setTimelineExportStatus("generating");
    setTimeout(() => {
      setTimelineExportStatus("done");
    }, 1200);
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (localStorage.getItem("detective_token")) setIsLoggedIn(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(p => (p + 1) % 4), 4500);
    return () => clearInterval(t);
  }, []);

  // Multi-template loading simulator
  const loadMockDataset = (type: "server_telemetry" | "retail_spikes" | "energy_drift") => {
    setMockDataset(type);
    setMockIngestProgress(0);
    setMockIngestStatus("Initializing sandbox context...");
    
    const statuses = [
      "Reading binary byte frames...",
      "Mapping schema columns...",
      "Profiling outlier distributions...",
      "Converging ARIMA matrices...",
      "Case file diagnostics locked."
    ];

    let step = 0;
    const interval = setInterval(() => {
      setMockIngestProgress(prev => {
        const next = prev + 20;
        if (next >= 100) {
          clearInterval(interval);
          setMockIngestStatus("Ingestion complete.");
          // reset view tabs to default
          setPreviewTab("database");
          setSelectedAnomalyIndex(null);
          setMockChatQ("");
          setMockChatA("");
        } else {
          setMockIngestStatus(statuses[step]);
          step++;
        }
        return next;
      });
    }, 450);
  };

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

  // Dataset-specific mockup parameters
  const datasetMeta = {
    server_telemetry: {
      name: "server_telemetry.parquet",
      health: "98.4%",
      rows: "10.2k",
      cols: [
        { name: "timestamp", type: "datetime" },
        { name: "cpu_utilization", type: "float64" },
        { name: "status_code", type: "int64" }
      ],
      anomalies: [
        { index: 428, desc: "Value Spike: +5.4× Rolling Mean", detail: "Row 428 (cpu_utilization = 98.42). Normal bounds: 10.0 - 65.0. Action: Impute rolling median." },
        { index: 1022, desc: "Duplicate index validation error", detail: "Row 1022 timestamp collision matching index 1021. Action: Drop duplicate row." }
      ],
      chat: [
        { q: "What caused the spike at row 428?", a: "Row 428 CPU utilization exceeded 5.4× rolling mean bounds (Z-score outlier)." },
        { q: "Verify status_code health", a: "Zero null values found. status_code column maintains a 100% distinct data mapping." }
      ]
    },
    retail_spikes: {
      name: "retail_promos.csv",
      health: "94.2%",
      rows: "8.4k",
      cols: [
        { name: "date", type: "string" },
        { name: "revenue_usd", type: "float64" },
        { name: "discount_applied", type: "boolean" }
      ],
      anomalies: [
        { index: 1205, desc: "Extreme discount discount_applied", detail: "Row 1205 (revenue_usd = 12050.5). Discount applied field mismatch. Action: Flag for verification." },
        { index: 3411, desc: "Negative value drift check", detail: "Row 3411 revenue contains negative numeric float values. Action: Cap at zero baseline." }
      ],
      chat: [
        { q: "Analyze discount anomaly", a: "Discount field validation mismatch at row 1205. Suggested imputation: True." },
        { q: "Check seasonal trend", a: "Revenue shows cyclic weekend peaks. ARIMA forecasts a 12% rise over 30 periods." }
      ]
    },
    energy_drift: {
      name: "grid_stability.json",
      health: "91.8%",
      rows: "15.0k",
      cols: [
        { name: "timestamp", type: "datetime" },
        { name: "megawatts", type: "float64" },
        { name: "stability_index", type: "float64" }
      ],
      anomalies: [
        { index: 892, desc: "Sudden load drop (grid failure)", detail: "Row 892 (megawatts = 12.0). Drop deviation matches grid load failure. Action: Keep raw marker." },
        { index: 7401, desc: "Constant value drift warning", detail: "Stability index constant values mapped across 12 consecutive hours. Action: Impute rolling mean." }
      ],
      chat: [
        { q: "Explain stability drop", a: "Grid stability index dropped below 0.12 at index 892, matching load drop." },
        { q: "Forecasting capacity limit", a: "ARIMA projects negative power capacity drift for the next 90 periods." }
      ]
    }
  };

  const activeMeta = mockDataset ? datasetMeta[mockDataset] : null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">

      {/* ── BACKGROUND COORDINATE DRAWING GRID ── */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(216,207,188,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(216,207,188,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] rounded-full bg-primary/6 blur-[130px]" />
      </div>

      {/* ══════════════════════════════════════════════════════
          NAVBAR — floating capsule
      ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[1040px]"
      >
        <div className="rounded-full border border-border bg-card/75 backdrop-blur-xl px-5 h-[46px] flex items-center justify-between shadow-lg shadow-black/10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity select-none group">
            <LogoMark size={20} />
            <span className="font-mono font-bold text-[10px] uppercase tracking-[0.18em] text-foreground">DetectiveAI</span>
          </Link>

          {/* Nav Links */}
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
            {/* Theme Toggle */}
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
          HERO — left aligned asymmetric layout
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-[100svh] flex items-center">
        <div className="w-full max-w-[1180px] mx-auto px-6 pt-28 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-12 lg:gap-8 items-center">

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

              {/* Title display */}
              <motion.h1
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                className="text-[2.8rem] sm:text-[3.4rem] md:text-[3.8rem] font-black leading-[1.02] tracking-[-0.02em] uppercase"
              >
                Raw data.
                <br />
                <span className="bg-gradient-to-r from-primary to-[#8c8a7e] bg-clip-text text-transparent">Clean</span> briefings.
              </motion.h1>

              {/* Sub-text */}
              <motion.p
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55 } } }}
                className="text-[13px] text-muted-foreground leading-relaxed max-w-[420px]"
              >
                Upload any CSV, Excel, or Parquet spreadsheet. DetectiveAI automatically scans anomalies, projects ARIMA forecasts, and exports professional PDF/Word briefings — no code required.
              </motion.p>

              {/* Quick stats grid */}
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

            {/* ── RIGHT: Fully Interactive Product Preview Window (3D Perspective tilt) ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative perspective-1000"
            >
              {/* Glow Accent behind browser mockup */}
              <div className="absolute -inset-6 bg-primary/8 rounded-3xl blur-2xl pointer-events-none" />

              {/* Browser window with slight 3D perspective skew */}
              <div className="relative border border-border rounded-2xl overflow-hidden shadow-2xl bg-card transition-transform duration-500 hover:rotate-y-[-2deg] hover:rotate-x-[1deg] hover:scale-[1.01]">
                
                {/* Browser top chrome address bar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/40 select-none">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 h-5 rounded bg-muted/60 flex items-center px-3 justify-between">
                    <span className="text-[9px] font-mono text-muted-foreground/50 truncate">
                      {activeMeta ? `detective.ai/analysis/${activeMeta.name}` : "detective.ai/ingest_evidence"}
                    </span>
                    <span className="text-[7px] font-mono text-primary/60 animate-pulse uppercase tracking-wider font-bold">Interactive Case Sandbox</span>
                  </div>
                </div>

                {/* Dashboard layout structure */}
                <div className="grid grid-cols-[65px_1fr] min-h-[360px] text-left">
                  
                  {/* Left Mock Navigator Sidebar */}
                  <div className="border-r border-border p-2 space-y-4 bg-background/20 flex flex-col items-center select-none justify-between">
                    <div className="flex flex-col gap-1 w-full">
                      {[
                        { tab: "database" as const, icon: Database, label: "Data" },
                        { tab: "chart" as const, icon: LineChart, label: "Forecast" },
                        { tab: "anomaly" as const, icon: ShieldAlert, label: "Outliers" },
                        { tab: "chat" as const, icon: MessageSquare, label: "Copilot" },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        const active = previewTab === item.tab;
                        const disabled = !mockDataset;
                        return (
                          <button
                            key={i}
                            onClick={() => !disabled && setPreviewTab(item.tab)}
                            disabled={disabled}
                            className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                              active
                                ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-black/10"
                                : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/30"
                            }`}
                            title={item.label}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-[6.5px] font-mono tracking-tighter mt-1 block select-none scale-[0.85]">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Exit / Reset case selector */}
                    {mockDataset && (
                      <button
                        onClick={() => setMockDataset(null)}
                        className="w-full text-center text-[7px] font-mono text-muted-foreground/60 hover:text-primary transition-colors cursor-pointer border-t border-border/20 pt-3"
                      >
                        Reset Case
                      </button>
                    )}
                  </div>

                  {/* Main Work panel */}
                  <div className="p-5 flex flex-col justify-between overflow-hidden bg-background/10">
                    <AnimatePresence mode="wait">

                      {/* STAGE 0: Dataset Picker Dropzone */}
                      {!mockDataset && (
                        <motion.div
                          key="dropzone"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex-1 flex flex-col justify-between py-1 space-y-4 font-mono select-none"
                        >
                          {/* Geometric scan brackets targeting space */}
                          <div className="relative text-center p-6 border border-border/20 rounded-xl bg-background/25 flex flex-col items-center justify-center min-h-[140px] group transition-all duration-300 hover:border-primary/20">
                            {/* Target points */}
                            <div className="absolute top-2 left-2 text-muted-foreground/30 font-sans text-[10px] select-none">+</div>
                            <div className="absolute top-2 right-2 text-muted-foreground/30 font-sans text-[10px] select-none">+</div>
                            <div className="absolute bottom-2 left-2 text-muted-foreground/30 font-sans text-[10px] select-none">+</div>
                            <div className="absolute bottom-2 right-2 text-muted-foreground/30 font-sans text-[10px] select-none">+</div>

                            <Upload className="w-5 h-5 text-primary/50 mb-2 transition-transform duration-300 group-hover:-translate-y-0.5" />
                            <div className="text-[9px] font-bold uppercase tracking-widest text-foreground">ingest new evidence</div>
                            <p className="text-[7.5px] text-muted-foreground/50 mt-1 max-w-[210px] leading-relaxed font-sans">
                              Drop telemetry case files or select a diagnostic template record below to initiate parsing.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[7.5px] text-muted-foreground/55 uppercase tracking-wider block font-bold">Forensics Records templates</span>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                { id: "server_telemetry" as const, filename: "server_telemetry.parquet", label: "Server Logs", type: "PARQUET", size: "12.4 MB", density: [30, 70, 45, 90, 60, 40] },
                                { id: "retail_spikes" as const, filename: "retail_promos.csv", label: "Retail Sales", type: "CSV", size: "2.1 MB", density: [80, 20, 50, 40, 75, 90] },
                                { id: "energy_drift" as const, filename: "grid_stability.json", label: "Grid Load", type: "JSON", size: "5.8 MB", density: [15, 30, 70, 85, 45, 60] }
                              ].map(tpl => (
                                <button
                                  key={tpl.id}
                                  onClick={() => loadMockDataset(tpl.id)}
                                  className="group w-full border border-border/30 hover:border-primary/45 hover:bg-primary/5 rounded-xl p-3 text-left transition-all cursor-pointer flex items-center justify-between gap-4"
                                >
                                  <div className="flex-1 space-y-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9.5px] font-bold text-foreground truncate">{tpl.label}</span>
                                      <span className="text-[6.5px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">{tpl.type}</span>
                                    </div>
                                    <div className="text-[7.5px] text-muted-foreground/50 truncate">
                                      {tpl.filename} · {tpl.size}
                                    </div>
                                  </div>

                                  {/* Inline micro bar density visualization */}
                                  <div className="flex items-end gap-0.5 h-6 w-12 shrink-0 select-none font-sans">
                                    {tpl.density.map((val, idx) => (
                                      <div key={idx} className="flex-1 bg-muted-foreground/20 rounded-t-[1px] transition-all group-hover:bg-primary/30" style={{ height: `${val}%` }} />
                                    ))}
                                  </div>

                                  <div className="text-[9px] text-muted-foreground/45 group-hover:text-primary group-hover:translate-x-0.5 transition-all select-none">
                                    →
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* STAGE 1: Ingestion Progress Loader */}
                      {mockDataset && mockIngestProgress < 100 && (
                        <motion.div
                          key="loader"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex-1 flex flex-col justify-center items-center space-y-4 py-8"
                        >
                          <div className="relative flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                            <span className="absolute font-mono text-[8px] text-foreground font-bold">{mockIngestProgress}%</span>
                          </div>
                          <div className="text-center space-y-1">
                            <div className="text-[9px] font-bold uppercase tracking-wider">Parsing Case Evidence</div>
                            <div className="font-mono text-[8px] text-muted-foreground/60 transition-all">{mockIngestStatus}</div>
                          </div>
                        </motion.div>
                      )}

                      {/* STAGE 2: Interactive Tabs Dashboard */}
                      {mockDataset && mockIngestProgress === 100 && activeMeta && (
                        <motion.div
                          key="dashboard"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex-1 flex flex-col justify-between space-y-4"
                        >
                          {/* Case Header Info */}
                          <div className="flex justify-between items-start border-b border-border/20 pb-3 select-none">
                            <div>
                              <div className="text-[7px] font-mono text-muted-foreground/50 uppercase tracking-widest">Active Case File</div>
                              <h4 className="text-[11px] font-bold text-foreground mt-0.5 truncate max-w-[190px]">{activeMeta.name}</h4>
                            </div>
                            <div className="flex gap-1.5 text-[8px] font-mono">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{activeMeta.health} health</span>
                              <span className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border">{activeMeta.rows} rows</span>
                            </div>
                          </div>

                          {/* View A: Data Schema */}
                          {previewTab === "database" && (
                            <div className="space-y-3 animate-fade-in">
                              <div className="text-[8.5px] font-bold uppercase tracking-wider text-primary/80 font-mono">Mapped Schema Coordinates</div>
                              <div className="space-y-1.5">
                                {activeMeta.cols.map((col, i) => (
                                  <div key={i} className="flex items-center justify-between border border-border/30 rounded px-2.5 py-1.5 bg-background/20 font-mono text-[9px] text-muted-foreground">
                                    <span className="text-foreground font-bold">{col.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[7.5px] opacity-60">[{col.type}]</span>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* View B: ARIMA Forecasting with changing curves */}
                          {previewTab === "chart" && (
                            <div className="space-y-3 animate-fade-in">
                              <div className="flex items-center justify-between">
                                <span className="text-[8.5px] font-bold uppercase tracking-wider text-primary/80 font-mono">ARIMA Predictive Waves</span>
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

                              <div className="h-20 w-full border border-border/40 rounded-lg p-2 bg-background/30 text-primary">
                                <svg className="w-full h-full" viewBox="0 0 200 64" preserveAspectRatio="none">
                                  {/* Grid lines */}
                                  {[16, 32, 48].map(y => (
                                    <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="currentColor" strokeWidth="0.4" className="text-primary/10" />
                                  ))}
                                  {/* Confidence band scales dynamically depending on dataset selection & forecast horizon */}
                                  <path
                                    d={mockDataset === "server_telemetry"
                                      ? `M0,44 Q50,12 80,36 T150,${forecastHorizon === 30 ? 28 : forecastHorizon === 60 ? 20 : 14} L200,${forecastHorizon === 30 ? 32 : forecastHorizon === 60 ? 26 : 22} L200,44 L150,36 L80,54 Q50,36 0,52 Z`
                                      : mockDataset === "retail_spikes"
                                        ? `M0,32 Q40,4 80,24 T160,${forecastHorizon === 30 ? 34 : forecastHorizon === 60 ? 28 : 22} L200,${forecastHorizon === 30 ? 40 : forecastHorizon === 60 ? 34 : 28} L200,44 L160,40 L80,32 Q40,24 0,38 Z`
                                        : `M0,22 Q60,42 90,32 T150,${forecastHorizon === 30 ? 44 : forecastHorizon === 60 ? 48 : 52} L200,${forecastHorizon === 30 ? 48 : forecastHorizon === 60 ? 52 : 56} L200,56 L150,48 L90,44 Q60,56 0,34 Z`
                                    }
                                    fill="currentColor"
                                    className="text-primary/6 transition-all duration-300"
                                  />
                                  {/* Historical path */}
                                  <polyline
                                    points={mockDataset === "server_telemetry"
                                      ? "0,44 25,40 50,28 75,38 80,36"
                                      : mockDataset === "retail_spikes"
                                        ? "0,32 30,12 60,34 70,22 80,24"
                                        : "0,22 40,48 70,30 80,35 90,32"
                                    }
                                    fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/50"
                                  />
                                  {/* Forecast path updates dynamically based on forecastHorizon state */}
                                  <path
                                    d={mockDataset === "server_telemetry"
                                      ? (forecastHorizon === 30 ? "M80,36 Q110,28 140,30 T200,32" : forecastHorizon === 60 ? "M80,36 Q110,24 140,26 T200,26" : "M80,36 Q110,20 140,22 T200,18")
                                      : mockDataset === "retail_spikes"
                                        ? (forecastHorizon === 30 ? "M80,24 Q120,44 160,34 T200,40" : forecastHorizon === 60 ? "M80,24 Q120,38 160,28 T200,32" : "M80,24 Q120,32 160,22 T200,24")
                                        : (forecastHorizon === 30 ? "M90,32 Q120,42 160,44 T200,48" : forecastHorizon === 60 ? "M90,32 Q120,44 160,48 T200,52" : "M90,32 Q120,46 160,52 T200,56")
                                    }
                                    fill="none" stroke="currentColor" strokeWidth="1.8" strokeDasharray="4 3" className="text-primary transition-all duration-300"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}

                          {/* View C: Outlier Log with details selection drawer */}
                          {previewTab === "anomaly" && (
                            <div className="space-y-2 animate-fade-in">
                              <div className="text-[8.5px] font-bold uppercase tracking-wider text-primary/80 font-mono">Outliers Mapping Scan</div>
                              <div className="space-y-1.5">
                                {activeMeta.anomalies.map((anom) => {
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
                                        <span className="text-[8px] opacity-60">{active ? "Hide" : "View"}</span>
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
                            </div>
                          )}

                          {/* View D: AI Assistant Chat */}
                          {previewTab === "chat" && (
                            <div className="space-y-3 animate-fade-in">
                              <div className="flex flex-wrap gap-1.5">
                                {activeMeta.chat.map((item, idx) => (
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

                              <div className="border border-border/40 rounded-lg p-3 bg-background/40 min-h-[90px] flex flex-col justify-between">
                                {mockChatQ ? (
                                  <div className="space-y-2">
                                    <div className="text-[8.5px] font-mono text-primary font-bold">&gt; {mockChatQ}</div>
                                    <div className="text-[8.5px] font-mono text-muted-foreground leading-relaxed">
                                      {mockChatA}
                                      {isTypingChat && <span className="w-1.5 h-3 bg-primary inline-block ml-0.5 animate-pulse" />}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 font-mono text-[9px] select-none text-center">
                                    <span>Select query prompt to initialize Copilot</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}

                    </AnimatePresence>
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

            {/* Interactive detail card */}
            <div className="border border-border bg-card rounded-xl p-8 md:p-10 min-h-[250px] grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-8 relative overflow-hidden">
              <div className="absolute top-5 right-5 font-mono text-[9px] text-muted-foreground/30 select-none">{String(activeStep + 1).padStart(2, "0")} / 04</div>
              
              <div className="flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  {React.createElement(steps[activeStep].icon, { className: "w-5 h-5 text-primary" })}
                  <h3 className="text-[18px] font-black uppercase tracking-tight text-foreground">{steps[activeStep].title}</h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed max-w-md">{steps[activeStep].detail}</p>
                </div>
                <div className="flex gap-2 w-full pt-4">
                  {steps.map((_, i) => (
                    <div key={i} className="flex-1 h-0.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full bg-primary rounded-full transition-all duration-300 ${i <= activeStep ? "w-full" : "w-0"}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side: Dynamic Interactive Preview Widget */}
              <div className="border border-border/40 rounded-xl p-4 bg-background/25 flex flex-col justify-between min-h-[140px] font-mono text-[9px] relative">
                
                {activeStep === 0 && (
                  <div className="flex-1 flex flex-col justify-between animate-fade-in">
                    <span className="text-[7.5px] text-muted-foreground/50 uppercase tracking-wider block">Evidence Dropzone</span>
                    
                    {timelineUploadDone ? (
                      <div className="space-y-2 py-2">
                        <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> telemetry.parquet ingested
                        </div>
                        <div className="text-[8px] text-muted-foreground">10,240 rows parsed (12ms latency). Schema locked.</div>
                        <button onClick={() => setTimelineUploadDone(false)} className="text-[7.5px] text-primary underline cursor-pointer">Reset upload</button>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-center items-center py-4 space-y-2">
                        <Upload className="w-5 h-5 text-muted-foreground/40 animate-pulse" />
                        <button onClick={() => setTimelineUploadDone(true)} className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold text-[8px] uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer">
                          Browse files
                        </button>
                        <span className="text-[7px] text-muted-foreground/40">Drop CSV, JSON, or Parquet here</span>
                      </div>
                    )}
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="flex-1 flex flex-col justify-between animate-fade-in">
                    <span className="text-[7.5px] text-muted-foreground/50 uppercase tracking-wider block">Z-Score Outlier sweep</span>
                    
                    {timelineScanStatus === "idle" && (
                      <div className="flex-1 flex flex-col justify-center items-center py-4 space-y-2">
                        <ShieldAlert className="w-5 h-5 text-muted-foreground/40" />
                        <button onClick={runTimelineScan} className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold text-[8px] uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer">
                          Run Z-score Scan
                        </button>
                      </div>
                    )}

                    {timelineScanStatus === "scanning" && (
                      <div className="flex-1 flex flex-col justify-center space-y-2.5 py-3">
                        <div className="flex justify-between font-bold">
                          <span>Scanning rows...</span>
                          <span>{timelineScanPercent}%</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-border overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${timelineScanPercent}%` }} />
                        </div>
                      </div>
                    )}

                    {timelineScanStatus === "done" && (
                      <div className="space-y-2 py-2">
                        <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 2 anomalies located
                        </div>
                        <div className="text-[8px] text-muted-foreground">Row 428 spike detected. Imputation rules applied.</div>
                        <button onClick={() => setTimelineScanStatus("idle")} className="text-[7.5px] text-primary underline cursor-pointer">Run scan again</button>
                      </div>
                    )}
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="flex-1 flex flex-col justify-between animate-fade-in">
                    <div className="flex justify-between items-center">
                      <span className="text-[7.5px] text-muted-foreground/50 uppercase tracking-wider">ARIMA Regression</span>
                      <div className="flex border border-border rounded font-mono text-[7px]">
                        {([30, 60, 90] as const).map(d => (
                          <button key={d} onClick={() => setTimelineForecastPeriod(d)} className={`px-1 py-0.5 cursor-pointer ${timelineForecastPeriod === d ? "bg-primary text-primary-foreground" : "hover:bg-muted/40 text-muted-foreground"}`}>{d}d</button>
                        ))}
                      </div>
                    </div>

                    <div className="h-12 w-full text-primary border border-border/40 rounded bg-background/30 p-1.5 my-2">
                      <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                        <path d={`M0,30 Q40,12 80,24 T150,${timelineForecastPeriod === 30 ? 20 : timelineForecastPeriod === 60 ? 14 : 8} L200,30 L0,30 Z`} fill="currentColor" className="text-primary/6" />
                        <polyline points="0,30 30,26 60,18 80,24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-primary/50" />
                        <path d={timelineForecastPeriod === 30 ? "M80,24 Q110,20 140,22 T200,24" : timelineForecastPeriod === 60 ? "M80,24 Q110,14 140,16 T200,14" : "M80,24 Q110,8 140,10 T200,6"} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="text-primary transition-all duration-300" />
                      </svg>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="flex-1 flex flex-col justify-between animate-fade-in">
                    <span className="text-[7.5px] text-muted-foreground/50 uppercase tracking-wider block">Briefing compiler</span>
                    
                    {timelineExportStatus === "idle" && (
                      <div className="flex-1 flex flex-col justify-center items-center py-4 space-y-2">
                        <FileText className="w-5 h-5 text-muted-foreground/40 animate-pulse" />
                        <button onClick={runTimelineExport} className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold text-[8px] uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer">
                          Generate Briefing
                        </button>
                      </div>
                    )}

                    {timelineExportStatus === "generating" && (
                      <div className="flex-1 flex flex-col justify-center items-center py-4 space-y-2">
                        <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                        <span>Assembling PDF report...</span>
                      </div>
                    )}

                    {timelineExportStatus === "done" && (
                      <div className="space-y-2 py-2">
                        <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> PDF briefing ready
                        </div>
                        <div className="text-[8px] text-muted-foreground">forensic_brief.pdf successfully compiled.</div>
                        <button onClick={() => setTimelineExportStatus("idle")} className="text-[7.5px] text-primary underline cursor-pointer">Recompile report</button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ENGINE DIAGNOSTICS & TELEMETRY SPECS
      ══════════════════════════════════════════════════════ */}
      <section id="specs" className="relative z-10 py-20 border-t border-border">
        <div className="max-w-[1180px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-10 items-center">
          <Reveal className="space-y-5">
            <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest">Engine Diagnostics</span>
            <h2 className="text-[1.9rem] md:text-[2.4rem] font-black uppercase tracking-tight leading-tight">High Performance. By Design.</h2>
            <p className="text-[12px] text-muted-foreground leading-relaxed max-w-sm">
              DetectiveAI leverages native Rust execution runtimes and parallel thread scaling to analyze security telemetry records at line speed, bypassing heavy database persistence.
            </p>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-mono text-[8px] font-bold uppercase">FASTAPI</span>
              <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-mono text-[8px] font-bold uppercase">POLARS ENGINE</span>
              <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-mono text-[8px] font-bold uppercase">ARIMA CORES</span>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { val: "2.8 GB/s", label: "Polars Ingestion Rate", desc: "Parallel multi-threaded vector parsing skips slow Python loops completely.", status: "OPTIMAL" },
              { val: "< 12ms", label: "Schema Locking Latency", desc: "Core dataframe type coercions and validation metrics calculated on upload.", status: "SUB-MILLISECOND" },
              { val: "100%", label: "Zero-Retention Isolation", desc: "No disk storage persistence. Telemetry vectors reside entirely in-memory.", status: "SECURE" },
              { val: "4.5s", label: "AI Context Embedding", desc: "Vector indexing speeds mapping column coordinates directly into model contexts.", status: "LIVE PIPELINE" },
            ].map((spec, i) => (
              <div key={i} className="border border-border/40 bg-card rounded-xl p-5 space-y-3 hover:border-primary/20 transition-all cursor-default">
                <div className="flex justify-between items-center font-mono text-[8px]">
                  <span className="text-muted-foreground/40">METRIC_0{i+1}</span>
                  <span className="text-primary font-bold">{spec.status}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-[24px] font-black text-foreground tracking-tight leading-none">{spec.val}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-foreground">{spec.label}</div>
                </div>
                <p className="text-[9.5px] text-muted-foreground leading-relaxed leading-normal">{spec.desc}</p>
              </div>
            ))}
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
              {(["python", "nodejs", "curl"] as const).map(tab => (
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
      <footer className="relative z-10 border-t border-border py-16 bg-card/25">
        <div className="max-w-[1180px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr] gap-12 font-mono text-[9px]">
          
          {/* Logo & Operational Status */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-primary">
              <LogoMark size={16} />
              <span className="font-bold text-[10px] uppercase tracking-[0.2em] text-foreground">DetectiveAI</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[210px] font-sans">
              Autonomous data forensics pipelines. Upload, clean, forecast, and compile briefings inside a zero-retention memory-only sandbox.
            </p>
            <div className="space-y-1.5 pt-2 border-t border-border/20 max-w-[210px]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-[8px] font-bold text-foreground">ALL SYSTEMS OPTIMAL</span>
              </div>
              <div className="text-[7.5px] text-muted-foreground/50">
                latency: 9.4ms · sandbox: sandbox_active · ssl: verified
              </div>
            </div>
            <p className="text-[8px] text-muted-foreground/35 pt-4">© {new Date().getFullYear()} DetectiveAI. All rights reserved.</p>
          </div>

          {/* Links Col 1 */}
          <div className="space-y-4">
            <span className="font-bold uppercase tracking-wider text-foreground">Engine Tools</span>
            <ul className="space-y-2">
              {[
                { name: "Ingestion Pipeline", path: "/upload" },
                { name: "Anomaly Scan", path: "/dashboard" },
                { name: "ARIMA Forecast", path: "/dashboard" },
                { name: "Executive Compiler", path: "/dashboard" }
              ].map((lk, idx) => (
                <li key={idx}>
                  <Link href={lk.path} className="text-muted-foreground hover:text-primary transition-colors text-[9.5px] font-sans block">{lk.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-4">
            <span className="font-bold uppercase tracking-wider text-foreground">Account Archive</span>
            <ul className="space-y-2">
              {[
                { name: "Telemetry History", path: "/history" },
                { name: "System Settings", path: "/settings" },
                { name: "Developer Keys", path: "/profile" },
                { name: "Pricing Tiers", path: "/pricing" }
              ].map((lk, idx) => (
                <li key={idx}>
                  <Link href={lk.path} className="text-muted-foreground hover:text-primary transition-colors text-[9.5px] font-sans block">{lk.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Intel Channel */}
          <div className="space-y-4">
            <span className="font-bold uppercase tracking-wider text-foreground">Secure Intel Channel</span>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-sans max-w-[240px]">
              Subscribe to get weekly diagnostics logs, vulnerability insights, and platform capabilities briefings.
            </p>
            
            {footerSubscribed ? (
              <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded-xl space-y-1 max-w-[260px] animate-fade-in">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Channel active
                </div>
                <p className="text-[7.5px] text-muted-foreground font-sans">Secure telemetry alerts initialized. Welcome agent.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (footerEmail.trim()) setFooterSubscribed(true);
                }}
                className="flex items-center border border-border/40 hover:border-primary/45 focus-within:border-primary bg-background/25 rounded-xl overflow-hidden max-w-[260px] p-1 transition-all"
              >
                <input
                  type="email"
                  required
                  placeholder="agent@domain.com"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-0 ring-0 px-2.5 py-1 text-[9px] text-foreground font-mono placeholder:text-muted-foreground/30"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Join
                </button>
              </form>
            )}
            
            <div className="flex gap-3 items-center pt-2">
              <Link href="https://github.com/mannaxsara/detective-ai" target="_blank" className="text-muted-foreground hover:text-foreground transition-all">
                <span className="text-[7.5px] uppercase tracking-wider underline">GitHub record</span>
              </Link>
              <span className="text-muted-foreground/20">|</span>
              <a href="mailto:mannasarabilu@gmail.com" className="text-muted-foreground hover:text-foreground transition-all">
                <span className="text-[7.5px] uppercase tracking-wider underline">Direct COMMS</span>
              </a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
