"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ChevronRight,
  Database,
  Activity,
  TrendingUp,
  BarChart3,
  ShieldAlert,
  Layers,
  Check,
  MessageSquare,
  FileText,
  Zap,
  ArrowRight,
  Upload,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import FluidBackground from "@/components/ui/fluid-background";

/* ─── Premium Glassmorphic Spotlight Card ─── */
function ProductCard({ title, desc, icon: Icon }: { title: string; desc: string; icon: any }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setCoords({ x: e.clientX - left, y: e.clientY - top });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group/feat p-6 rounded-cards border border-obsidian/10 bg-limestone hover:border-obsidian/25 transition-all duration-300 relative overflow-hidden text-left"
    >
      {/* Spotlight hover effect using theme variables */}
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(130px circle at ${coords.x}px ${coords.y}px, rgba(109, 60, 82, 0.04), transparent 80%)`,
          }}
        />
      )}

      {/* Subtle border bottom berry sweep */}
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-ember/0 to-transparent group-hover/feat:via-ember/40 transition-all duration-500" />
      
      {/* Icon with interactive dial */}
      <div className="w-10 h-10 rounded-xl bg-pumice/50 border border-obsidian/10 text-obsidian/60 group-hover/feat:text-ember flex items-center justify-center mb-5 transition-all group-hover/feat:scale-105 duration-300 relative">
        <Icon className="w-5 h-5 relative z-10" strokeWidth={1.5} />
        <div className="absolute inset-0 rounded-xl bg-ember/5 opacity-0 group-hover/feat:opacity-100 transition-opacity duration-300" />
      </div>

      <h4 className="text-xs font-bold text-obsidian uppercase tracking-wider mb-2">{title}</h4>
      <p className="text-xs text-obsidian/70 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─── Real-Time Live Server Console Stream Widget ─── */
function TerminalLogs() {
  const [logs, setLogs] = useState<string[]>([
    "DETECTIVE CORE v1.4.2 active.",
    "Awaiting dataset ingestion streams...",
  ]);

  useEffect(() => {
    const events = [
      "INGEST: Loaded transaction_log.parquet (248K rows)",
      "PROFILE: Computing correlation matrix (22 attributes)",
      "FORECAST: Initializing ARIMA time-series models",
      "CLEAN: Removed 12 duplicate coordinates",
      "ANOMALY: Flagged 4 outlier deviations in revenue",
      "STATS: Executing Chi-Square association checks",
      "REPORT: Compiling markdown summary to PDF output",
      "SYNC: Core repositories successfully cached."
    ];

    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setLogs((prev) => [...prev.slice(-5), `[${timestamp}] ${randomEvent}`]);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const parseLogLine = (line: string) => {
    const match = line.match(/^\[(.*?)\]\s+(.*?):\s+(.*)$/);
    if (!match) {
      if (line.includes("v1.4.2")) {
        return (
          <span>
            <span className="text-obsidian/45 font-bold">SYSTEM</span>{" "}
            <span className="text-obsidian/90 font-bold">{line}</span>
          </span>
        );
      }
      return <span className="text-obsidian/50 font-semibold">{line}</span>;
    }

    const [, timestamp, module, message] = match;
    
    let moduleColor = "text-obsidian/60";
    if (module === "INGEST") moduleColor = "text-emerald-400 font-black";
    else if (module === "PROFILE") moduleColor = "text-ember font-black";
    else if (module === "FORECAST") moduleColor = "text-plasma-violet font-black";
    else if (module === "ANOMALY") moduleColor = "text-ember/80 font-black";
    else if (module === "STATS") moduleColor = "text-plasma-violet/80 font-black";
    else if (module === "REPORT") moduleColor = "text-plasma-violet font-black";
    else if (module === "SYNC" || module === "CLEAN") moduleColor = "text-emerald-400/80 font-black";

    return (
      <span className="font-mono">
        <span className="text-obsidian/30">[{timestamp}]</span>{" "}
        <span className={moduleColor}>{module}:</span>{" "}
        <span className="text-obsidian/85">{message}</span>
      </span>
    );
  };

  return (
    <div className="rounded-cards border border-obsidian/10 bg-limestone/80 backdrop-blur-md p-5 font-mono text-[10px] text-obsidian/60 space-y-1.5 shadow-2xl relative overflow-hidden min-h-[250px] flex flex-col justify-between">
      {/* Title Bar */}
      <div className="absolute top-0 inset-x-0 bg-pumice/80 backdrop-blur-sm border-b border-obsidian/10 px-4 py-2.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-5">
          {/* OS Windows Dots */}
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-obsidian/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-obsidian/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-obsidian/10" />
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-pumice text-obsidian/80 text-[8px] font-bold uppercase tracking-wider border border-obsidian/10">
              case_stream.log
            </span>
            <span className="text-obsidian/30 text-[8px] font-bold uppercase tracking-wider cursor-default hover:text-obsidian/60 transition-colors">
              telemetry.err
            </span>
          </div>
        </div>

        <span className="flex items-center gap-1.5 text-obsidian/45 text-[8px] font-bold uppercase tracking-widest">
          <span>STREAM ACTIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
        </span>
      </div>

      {/* Terminal Output */}
      <div className="space-y-1.5 pt-8 overflow-hidden flex-1 flex flex-col justify-end">
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-2 text-left">
            <span className="text-ember/60 shrink-0 select-none">&gt;</span>
            <span className="truncate">{parseLogLine(log)}</span>
          </div>
        ))}

        {/* Input Prompter */}
        <div className="flex gap-2 text-obsidian/50 pt-0.5 border-t border-obsidian/5">
          <span className="text-ember shrink-0 select-none">&gt;</span>
          <span className="flex items-center gap-1.5">
            <span className="text-obsidian/40 font-bold uppercase tracking-wider text-[8px]">Awaiting telemetry frame</span>
            <span className="w-1.5 h-3 bg-ember animate-pulse" />
          </span>
        </div>
      </div>
    </div>
  );
}

function PricingSection() {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="pricing" className="w-full border-t border-obsidian/10 bg-transparent py-28 z-30 relative">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-ember">PRICING</span>
        <h2 className="text-4xl md:text-5xl font-display font-black text-obsidian tracking-tight mt-3">Coming Soon</h2>
        <p className="text-obsidian/70 text-sm max-w-lg mx-auto font-medium mt-4 leading-relaxed font-sans">
          We&apos;re crafting flexible plans designed around how data teams actually work. 
          Join the waitlist to get early access and exclusive launch pricing.
        </p>

        {/* Feature Preview Pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-8">
          {[
            "Free tier included",
            "Unlimited datasets",
            "ARIMA forecasts",
            "Team collaboration",
            "API access",
            "Priority support"
          ].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-obsidian/10 bg-limestone text-[11px] font-bold text-obsidian/85"
            >
              <Check className="w-3.5 h-3.5 text-ember shrink-0" />
              {item}
            </span>
          ))}
        </div>

        {/* Waitlist Email Input */}
        <div className="mt-10 max-w-md mx-auto">
          {submitted ? (
            <div className="flex items-center justify-center gap-2 py-3 px-5 rounded-full border border-ember/30 bg-ember/5 text-obsidian">
              <Check className="w-4 h-4 text-ember" />
              <span className="text-sm font-bold">You&apos;re on the list! We&apos;ll be in touch.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-1.5 rounded-full border border-obsidian/15 bg-limestone focus-within:border-obsidian/30 transition-colors">
              <input
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-transparent border-none outline-none text-sm text-obsidian placeholder:text-obsidian/45 px-4 font-medium"
              />
              <button
                onClick={() => {
                  if (waitlistEmail.includes("@")) setSubmitted(true);
                }}
                className="shrink-0 h-9 px-6 rounded-full bg-ember hover:opacity-90 text-chalk text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-0"
              >
                Notify Me
              </button>
            </div>
          )}
          <p className="text-[10px] text-obsidian/50 mt-3 font-medium">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}

function AuditWorkspaceMockup() {
  const [activeTab, setActiveTab] = useState<"grid" | "chat" | "forecast">("grid");

  return (
    <div className="w-full bg-[#181a1f] border border-obsidian/10 rounded-cards overflow-hidden font-mono text-[12px] leading-relaxed shadow-2xl h-[400px] flex flex-col">
      {/* Window Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-[#111215] border-b border-obsidian/10 gap-3 select-none">
        {/* Mac Dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-obsidian/15" />
            <div className="w-2.5 h-2.5 rounded-full bg-obsidian/15" />
            <div className="w-2.5 h-2.5 rounded-full bg-obsidian/15" />
          </div>
          <span className="text-[10px] text-obsidian/45 uppercase tracking-widest font-bold ml-2">case_0821.csv</span>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-pumice/5 p-0.5 rounded-lg border border-obsidian/10">
          {(["grid", "chat", "forecast"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-[4px] text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-ember text-chalk shadow-sm"
                  : "text-obsidian/60 hover:text-obsidian hover:bg-pumice/5"
              }`}
            >
              {tab === "grid" ? "Table Grid" : tab === "chat" ? "AI Chat" : "Forecast"}
            </button>
          ))}
        </div>

        <div className="hidden sm:block w-8" />
      </div>

      {/* Workspace Body */}
      <div className="flex-1 p-5 overflow-y-auto relative bg-[#14161b] scrollbar-thin">
        <AnimatePresence mode="wait">
          {activeTab === "grid" && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 h-full flex flex-col justify-between"
            >
              {/* Spreadsheet Grid Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-obsidian/10 text-obsidian/45 font-mono text-[9px] uppercase tracking-wider">
                      <th className="pb-2 font-bold">TX_ID</th>
                      <th className="pb-2 font-bold">MERCHANT</th>
                      <th className="pb-2 font-bold">AMOUNT</th>
                      <th className="pb-2 font-bold">INTEGRITY</th>
                      <th className="pb-2 font-bold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-obsidian/5 font-sans">
                    <tr>
                      <td className="py-2.5 font-mono text-obsidian/50">#0821</td>
                      <td className="py-2.5 font-medium text-obsidian">Stripe Inc.</td>
                      <td className="py-2.5 font-bold text-ember">$48,200.00</td>
                      <td className="py-2.5 font-mono text-ember font-bold">12%</td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-ember bg-ember/5 border border-ember/15 px-1.5 py-0.5 rounded-[3px]">
                          Anomaly
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-obsidian/50">#0822</td>
                      <td className="py-2.5 text-obsidian/75">AWS Cloud</td>
                      <td className="py-2.5 text-obsidian/90 font-mono">$4,812.50</td>
                      <td className="py-2.5 text-obsidian/75 font-mono">98%</td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-obsidian/50 bg-obsidian/5 border border-obsidian/10 px-1.5 py-0.5 rounded-[3px]">
                          Clean
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-obsidian/50">#0823</td>
                      <td className="py-2.5 text-obsidian/75">Vercel Inc.</td>
                      <td className="py-2.5 text-obsidian/90 font-mono">$1,200.00</td>
                      <td className="py-2.5 text-obsidian/75 font-mono">99%</td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-obsidian/50 bg-obsidian/5 border border-obsidian/10 px-1.5 py-0.5 rounded-[3px]">
                          Clean
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-mono text-obsidian/50">#0824</td>
                      <td className="py-2.5 text-obsidian/80">Framer Corp.</td>
                      <td className="py-2.5 text-ember font-bold font-mono">$18,500.00</td>
                      <td className="py-2.5 text-plasma-violet font-bold font-mono">42%</td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-plasma-violet bg-plasma-violet/5 border border-plasma-violet/15 px-1.5 py-0.5 rounded-[3px]">
                          Audit Needed
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Interactive Outlier Analysis Card Overlay */}
              <div className="p-3.5 bg-[#1a1c23] border border-ember/20 rounded-lg flex items-start gap-3 text-left">
                <span className="w-2 h-2 rounded-full bg-ember mt-1.5 shrink-0 animate-pulse" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-ember uppercase">Forensic Audit Alert</span>
                    <span className="text-[9px] font-mono text-obsidian/40">TX #0821</span>
                  </div>
                  <p className="text-[11px] text-obsidian/75 leading-relaxed mt-1 font-sans">
                    Outlier amount identified on Stripe merchant key: Z-Score = 4.86, deviation exceeds dynamic standard bounds. Action recommended: impute or quarantine.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 h-full flex flex-col justify-between"
            >
              {/* Dialogue History */}
              <div className="space-y-3.5 text-[11.5px]">
                {/* User Prompt */}
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  <div className="w-5 h-5 rounded-full bg-pumice flex items-center justify-center font-bold text-[9px] text-obsidian font-mono select-none">U</div>
                  <div className="bg-[#1c1e24] border border-obsidian/10 rounded-lg px-3 py-2 text-left text-obsidian/90 font-sans">
                    Flag billing zipcode correlation leaks in the dataset.
                  </div>
                </div>

                {/* Assistant Answer */}
                <div className="flex items-start gap-2.5 max-w-[90%]">
                  <div className="w-5 h-5 rounded-full bg-ember flex items-center justify-center font-bold text-[9px] text-chalk font-mono select-none">AI</div>
                  <div className="space-y-2 text-left font-sans flex-1">
                    <p className="text-obsidian/85 leading-relaxed">
                      Analyzing 28 attributes. Pearson matrix identifies a structural correlation leak between `billing_zipcode` and `shipping_region` (coeff = 0.94).
                    </p>
                    {/* Inline Mini Chart */}
                    <div className="border border-obsidian/10 rounded-lg p-2.5 bg-[#111215]/50 flex items-center justify-center h-20">
                      <svg className="w-full h-full text-ember" viewBox="0 0 200 60" fill="none">
                        <path d="M10,50 L40,48 L70,42 L100,20 L130,12 L160,5 L190,4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M10,50 L40,48 L70,42 L100,20 L130,12 L160,5 L190,4 L190,55 L10,55 Z" fill="currentColor" fillOpacity="0.05" />
                        <circle cx="100" cy="20" r="3" fill="currentColor" />
                        <circle cx="160" cy="5" r="3" fill="currentColor" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input Field */}
              <div className="flex items-center gap-2 border-t border-obsidian/10 pt-3 bg-transparent">
                <input
                  type="text"
                  placeholder="Ask a question about case_0821..."
                  readOnly
                  className="flex-1 bg-[#111215] border border-obsidian/10 rounded-[4px] px-3 py-1.5 text-[11px] text-obsidian/75 outline-none placeholder:text-obsidian/30 select-none font-sans"
                />
                <button className="bg-ember text-chalk px-3 py-1.5 rounded-[4px] font-bold text-[10px] uppercase hover:opacity-90 select-none cursor-pointer">
                  Query
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "forecast" && (
            <motion.div
              key="forecast"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 h-full flex flex-col justify-between"
            >
              {/* Forecast Plot Area */}
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-ember uppercase">ARIMA (1, 1, 0) Horizon Prediction</span>
                  <span className="text-[9px] font-mono text-obsidian/40">30-day confidence horizon</span>
                </div>

                <div className="border border-obsidian/10 rounded-lg p-4 bg-[#111215]/50 flex items-center justify-center h-44">
                  <svg className="w-full h-full text-obsidian/75" viewBox="0 0 300 120" fill="none">
                    <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(234,234,234,0.03)" strokeWidth="1" />
                    <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(234,234,234,0.03)" strokeWidth="1" />
                    <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(234,234,234,0.03)" strokeWidth="1" />
                    <line x1="180" y1="0" x2="180" y2="120" stroke="rgba(234,234,234,0.08)" strokeDasharray="3 3" />

                    <path d="M180,60 L210,48 L240,32 L270,18 L300,10 L300,110 L270,95 L240,82 L210,74 L180,60 Z" fill="rgba(196,154,136,0.08)" />

                    <path d="M10,95 L40,85 L70,90 L100,75 L130,82 L160,65 L180,60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

                    <path d="M180,60 L210,58 L240,55 L270,52 L300,50" stroke="#c49a88" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 1" />

                    <text x="12" y="112" fill="rgba(234,234,234,0.3)" fontSize="8" fontFamily="monospace">HISTORICAL OBSERVED</text>
                    <text x="190" y="112" fill="#c49a88" fillOpacity="0.7" fontSize="8" fontFamily="monospace">FORECAST HORIZON</text>
                  </svg>
                </div>
              </div>

              {/* Prediction Statistics Bar */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="bg-[#1a1c23] border border-obsidian/10 rounded p-2">
                  <div className="text-obsidian/40 uppercase font-bold text-[8px]">Mean Forecast</div>
                  <div className="text-obsidian font-bold mt-0.5">$62,810.00</div>
                </div>
                <div className="bg-[#1a1c23] border border-obsidian/10 rounded p-2">
                  <div className="text-obsidian/40 uppercase font-bold text-[8px]">Confidence Bound</div>
                  <div className="text-obsidian font-bold mt-0.5">± 8.4%</div>
                </div>
                <div className="bg-[#1a1c23] border border-obsidian/10 rounded p-2">
                  <div className="text-obsidian/40 uppercase font-bold text-[8px]">P-Value</div>
                  <div className="text-ember font-bold mt-0.5">0.018</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { initialize } = useAuthStore();
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    initialize();
    const token = localStorage.getItem("detective_token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router, initialize]);

  const productFeatures = [
    {
      title: "Data Profile & Health",
      desc: "Instantly profile file schemas, count null coordinates, and evaluate dataset integrity scores.",
      icon: Database,
    },
    {
      title: "Natural Language Chat",
      desc: "Converse directly with tables in plain English. The compiler translates statements to SQL answers.",
      icon: Sparkles,
    },
    {
      title: "Predictive ARIMA Forecasts",
      desc: "Apply ARIMA algorithms automatically to trace predictive future bounds on historical metrics.",
      icon: TrendingUp,
    },
    {
      title: "Dynamic Visual Charts",
      desc: "Generate responsive scatter plots, bar charts, and line summaries to isolate data shifts.",
      icon: BarChart3,
    },
    {
      title: "Outlier Anomaly Detection",
      desc: "Isolate abnormal payments or data entries using Z-Score and dynamic statistical bounds.",
      icon: ShieldAlert,
    },
    {
      title: "Automated Data Cleaning",
      desc: "Standardize formatting, resolve missing elements, and trim dataset rows in a single step.",
      icon: Layers,
    },
  ];

  return (
    <div className="relative min-h-screen bg-pumice text-obsidian font-sans overflow-x-hidden selection:bg-ember selection:text-chalk">
      <FluidBackground opacity="opacity-[0.08]" blur="64px" />
      
      {/* ───── 1. Top Announcement Ribbon ───── */}
      <div className="w-full bg-ember text-chalk text-center py-2 px-4 text-xs font-bold tracking-wide z-50 relative select-none">
        <span className="flex items-center justify-center gap-1.5">
          <span>📊 New Release: Intelligent Schema Profiler and Forecast Engine v1.4.2 is live</span>
          <ChevronRight className="w-3.5 h-3.5 text-chalk" />
        </span>
      </div>

      {/* ───── 2. Floating Navigation Header ───── */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-40 relative">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-[14px] font-display font-black uppercase tracking-widest text-obsidian">
            DETECTIVEAI
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-obsidian/75 relative">
            <button
              onClick={() => scrollTo("products")}
              className="hover:text-ember transition-colors flex items-center gap-1 cursor-pointer py-2 bg-transparent border-none text-[13px] font-medium text-obsidian/75"
            >
              Products
            </button>
            <Link href="/blog" className="hover:text-ember transition-colors py-2 text-[13px] font-medium text-obsidian/75">
              Blog
            </Link>
            <Link href="/pricing" className="hover:text-ember transition-colors py-2 text-[13px] font-medium text-obsidian/75">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-[12px] font-bold text-obsidian/70 hover:text-obsidian transition-colors uppercase tracking-wider font-sans"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-pills bg-ember hover:opacity-90 px-5 py-2.5 text-[12px] font-bold text-chalk transition-all shadow-none group uppercase tracking-wider font-sans"
            >
              Get Started
              <span className="h-5 w-5 rounded-full bg-chalk/20 flex items-center justify-center">
                <ChevronRight className="h-3.5 w-3.5 text-chalk transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ───── 3. Split-Screen Hero Layout ───── */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-140px)] z-30 relative text-left">
        
        {/* Left Side: Brand Context, Headline & Action CTAs */}
        <div className="flex flex-col justify-center space-y-6 lg:pr-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-mono font-bold bg-ember/5 border border-ember/15 text-ember uppercase tracking-widest w-fit">
            <span>◆ DetectiveAI v1.4.2</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-display font-black tracking-tight leading-[1.05] text-obsidian max-w-xl">
              Forensic dataset auditing <br />
              <span className="text-ember">for software teams.</span>
            </h1>

            <p className="text-[14.5px] leading-relaxed text-obsidian/75 max-w-[480px] font-sans">
              Reconstruct schemas, isolate high-severity anomalies, fit dynamic time-series regressions, and compile stakeholder audit report cards—all without writing code.
            </p>

            {/* CTA Action Row */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link href="/register">
                <Button className="h-12 uppercase text-[12px] font-sans font-bold tracking-wider px-6">
                  Open case workspace
                </Button>
              </Link>
              <button 
                onClick={() => scrollTo("products")}
                className="inline-flex h-12 items-center justify-center rounded-buttons border-[1.5px] border-obsidian/20 bg-transparent hover:bg-limestone/50 px-6 text-[12px] font-sans font-bold uppercase text-obsidian transition-colors cursor-pointer"
              >
                View capabilities
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Animated Interactive Terminal Console Mockup */}
        <div className="w-full h-full flex flex-col justify-center lg:pl-6">
          <AuditWorkspaceMockup />
        </div>

      </main>

      {/* ───── 4. Products Feature Grid Section (`#products`) ───── */}
      <section id="products" className="w-full border-t border-obsidian/10 bg-transparent py-24 z-30 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-2 mb-16 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ember">CORE ENGINES</span>
            <h2 className="text-3xl font-display font-black text-obsidian tracking-tight">Our Analytical Capabilities</h2>
            <p className="text-obsidian/60 text-xs max-w-md font-semibold font-sans">Real backend modules running in DetectiveAI core to parse and profile your datasets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productFeatures.map((feat, idx) => (
              <ProductCard
                key={idx}
                title={feat.title}
                desc={feat.desc}
                icon={feat.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ───── 5. How It Works Section ───── */}
      <section className="w-full border-t border-obsidian/10 bg-transparent py-28 z-30 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-3 mb-20">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ember">WORKFLOW</span>
            <h2 className="text-4xl font-display font-black text-obsidian tracking-tight">Three steps to case resolution</h2>
            <p className="text-obsidian/60 text-xs max-w-sm mx-auto font-semibold font-sans">From raw tabular parameters to executive insights in under a minute.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative">
            {[{
              step: "01",
              icon: Upload,
              title: "Upload Dataset",
              desc: "Drag and drop any CSV, Excel, Parquet, or JSON file. DetectiveAI parses the structure and validates formatting instantly.",
            }, {
              step: "02",
              icon: Activity,
              title: "Automated Profiling",
              desc: "Fast analytical pipelines scan variables, isolate anomaly clusters, and run predictive ARIMA forecasts automatically.",
            }, {
              step: "03",
              icon: MessageSquare,
              title: "QA Investigation",
              desc: "Query the data in plain English. Get back detailed charts and download compiled markdown case report cards.",
            }].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.step} 
                  className="group/step relative p-8 rounded-cards border border-obsidian/10 bg-limestone hover:border-obsidian/25 hover:bg-limestone/80 transition-all duration-300 text-center flex flex-col justify-between overflow-hidden min-h-[250px]"
                >
                  <span className="absolute right-4 bottom-2 text-8xl font-black text-obsidian/[0.02] group-hover/step:text-ember/[0.04] transition-colors duration-300 select-none font-mono">
                    {item.step}
                  </span>

                  <div>
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-pumice/50 border border-obsidian/10 group-hover/step:border-ember/30 flex items-center justify-center mb-6 transition-all duration-300 relative">
                      <Icon className="w-6 h-6 text-obsidian/60 group-hover/step:text-ember transition-colors duration-300 z-10" />
                      <div className="absolute inset-0 rounded-2xl bg-ember/5 opacity-0 group-hover/step:opacity-100 transition-opacity duration-300" />
                    </div>

                    <span className="text-[10px] font-mono text-ember font-black uppercase tracking-wider">
                      Step {item.step}
                    </span>
                    <h4 className="text-sm font-bold text-obsidian uppercase tracking-wider mt-1.5">{item.title}</h4>
                    <p className="text-xs text-obsidian/75 leading-relaxed mt-3.5 font-sans">{item.desc}</p>
                  </div>
                  
                  {idx < 2 && (
                    <div className="hidden md:flex items-center gap-1 absolute -right-4.5 top-[38%] -translate-y-1/2 z-10 text-obsidian/30">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── 6. Developer Blog Section (`#blog`) ───── */}
      <section id="blog" className="w-full border-t border-obsidian/10 bg-transparent py-24 z-30 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 text-left">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ember">INSIGHT FEED</span>
              <h2 className="text-3xl font-display font-black text-obsidian tracking-tight">Developer Log & Research</h2>
              <p className="text-obsidian/65 text-xs max-w-md font-semibold font-sans">Technical deep-dives on data profiling, statistical analysis, and forecasting.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[{
              date: "July 14, 2026",
              tag: "FORECASTING",
              tagBg: "bg-ember/10 text-ember border-ember/20",
              title: "ARIMA vs. Prophet: Choosing time-series forecasting models for tabular datasets",
              desc: "A detailed study on caching and building dynamic forecasts over tabular parameters without overloading analytical pipelines.",
            }, {
              date: "June 28, 2026",
              tag: "PROFILING",
              tagBg: "bg-sulfur/10 text-sulfur border-sulfur/20",
              title: "Automated schema profiling and anomaly detection across multi-column datasets",
              desc: "How we achieve 98% accuracy on statistical pattern detection across wide tabular datasets without manual configuration.",
            }, {
              date: "June 10, 2026",
              tag: "CLEANING",
              tagBg: "bg-plasma-violet/10 text-plasma-violet border-plasma-violet/20",
              title: "Building a zero-config data cleaning pipeline for messy CSV uploads",
              desc: "How DetectiveAI auto-detects duplicates, null patterns, and formatting inconsistencies with zero manual rules.",
            }].map((article, idx) => (
              <div
                key={idx}
                className="group/card p-6 rounded-cards border border-obsidian/10 bg-limestone hover:border-obsidian/25 hover:bg-limestone/80 transition-all duration-300 flex flex-col justify-between relative overflow-hidden text-left"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className={`text-[8px] font-extrabold uppercase tracking-widest border px-2 py-0.5 rounded-full ${article.tagBg}`}>
                      {article.tag}
                    </span>
                    <span className="text-[9px] font-mono text-obsidian/50 font-bold">{article.date}</span>
                  </div>
                  <h4 className="text-[13px] font-bold text-obsidian group-hover/card:text-ember transition-colors leading-snug mb-2.5">
                    {article.title}
                  </h4>
                  <p className="text-[11px] text-obsidian/75 leading-relaxed font-sans">{article.desc}</p>
                </div>

                <span className="relative z-10 text-[9px] font-mono font-bold uppercase text-ember cursor-pointer inline-flex items-center gap-1 mt-5 group-hover/card:gap-2 transition-all">
                  Read article <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ))}
          </div>

          {/* Terminal widget below */}
          <div className="mt-12">
            <TerminalLogs />
          </div>
        </div>
      </section>

      {/* ───── 7. Pricing Section ───── */}
      <PricingSection />

      {/* ───── 8. Expanded Footer ───── */}
      <footer className="w-full border-t border-obsidian/10 bg-transparent z-20 relative text-left">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Top: Brand + Columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
            {/* Brand Column */}
            <div className="col-span-2">
              <span className="text-sm font-display font-black uppercase tracking-widest text-obsidian">DetectiveAI</span>
              <p className="text-xs text-obsidian/60 mt-3 leading-relaxed max-w-[260px] font-sans">
                Autonomous AI data analyst. Upload any tabular file and get instant profiling, anomaly detection, forecasts, and natural language insights.
              </p>
              <div className="flex items-center gap-2 mt-5">
                {["Polars", "FastAPI", "Next.js"].map((t) => (
                  <span key={t} className="text-[8px] font-bold uppercase tracking-widest text-obsidian/60 border border-obsidian/10 rounded-full px-2.5 py-1 bg-limestone">{t}</span>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-obsidian/60 mb-4">Product</h5>
              <ul className="space-y-2.5">
                <li><button onClick={() => scrollTo('products')} className="text-xs text-obsidian/50 hover:text-ember transition-colors bg-transparent border-none cursor-pointer p-0 font-sans">Schema Profiler</button></li>
                <li><button onClick={() => scrollTo('products')} className="text-xs text-obsidian/50 hover:text-ember transition-colors bg-transparent border-none cursor-pointer p-0 font-sans">NL Chat</button></li>
                <li><button onClick={() => scrollTo('products')} className="text-xs text-obsidian/50 hover:text-ember transition-colors bg-transparent border-none cursor-pointer p-0 font-sans">ARIMA Forecasts</button></li>
                <li><button onClick={() => scrollTo('products')} className="text-xs text-obsidian/50 hover:text-ember transition-colors bg-transparent border-none cursor-pointer p-0 font-sans">Anomaly Detection</button></li>
                <li><button onClick={() => scrollTo('products')} className="text-xs text-obsidian/50 hover:text-ember transition-colors bg-transparent border-none cursor-pointer p-0 font-sans">Data Cleaning</button></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-obsidian/60 mb-4">Resources</h5>
              <ul className="space-y-2.5">
                <li><Link href="/blog" className="text-xs text-obsidian/50 hover:text-ember transition-colors font-sans">Developer Blog</Link></li>
                <li><span className="text-xs text-obsidian/45 font-sans">Documentation <span className="text-[8px] ml-1 text-obsidian/30 uppercase font-bold">soon</span></span></li>
                <li><span className="text-xs text-obsidian/45 font-sans">API Reference <span className="text-[8px] ml-1 text-obsidian/30 uppercase font-bold">soon</span></span></li>
                <li><span className="text-xs text-obsidian/45 font-sans">Changelog <span className="text-[8px] ml-1 text-obsidian/30 uppercase font-bold">soon</span></span></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-obsidian/60 mb-4">Company</h5>
              <ul className="space-y-2.5">
                <li><span className="text-xs text-obsidian/45 font-sans">About <span className="text-[8px] ml-1 text-obsidian/30 uppercase font-bold">soon</span></span></li>
                <li><span className="text-xs text-obsidian/45 font-sans">Privacy Policy <span className="text-[8px] ml-1 text-obsidian/30 uppercase font-bold">soon</span></span></li>
                <li><span className="text-xs text-obsidian/45 font-sans">Terms of Service <span className="text-[8px] ml-1 text-obsidian/30 uppercase font-bold">soon</span></span></li>
                <li><Link href="/login" className="text-xs text-obsidian/50 hover:text-ember transition-colors font-sans">Sign In</Link></li>
                <li><Link href="/register" className="text-xs text-obsidian/50 hover:text-ember transition-colors font-sans">Create Account</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-obsidian/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-obsidian/50 font-mono">
              © {new Date().getFullYear()} DetectiveAI. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] text-obsidian/50 font-medium">
                <Globe className="w-3.5 h-3.5 text-obsidian/40" /> Open Source
              </span>
              <span className="text-obsidian/20">·</span>
              <span className="text-[10px] text-obsidian/50 font-mono">v1.4.2</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
