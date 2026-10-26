"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Database, AlertTriangle, Sparkles, Zap, ShieldCheck, ArrowRight, Loader2, Printer } from "lucide-react";
import { analysisAPI } from "@/lib/api";
import { GaugeChart } from "@/components/ui/gauge-chart";

export default function PublicSharePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: shareData, isLoading, error } = useQuery({
    queryKey: ["public-share", id],
    queryFn: () => analysisAPI.getPublic(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] dark:bg-[#11120d] text-black dark:text-white flex items-center justify-center font-sans">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-black dark:text-white" />
          <span className="font-mono text-xs uppercase font-bold tracking-wider">Decrypting Investigation Dossier...</span>
        </div>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-[#f9f9f7] dark:bg-[#11120d] text-black dark:text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-4 border border-black dark:border-[#3b3a33] rounded-[18px] bg-white dark:bg-[#1c1d18] p-8 shadow-[4px_4px_0px_#000000]">
          <AlertTriangle className="w-10 h-10 text-[#bc3e3e] mx-auto" />
          <h2 className="text-lg font-serif font-bold">Investigation Not Located</h2>
          <p className="text-xs text-black/70 dark:text-white/70">
            This case file snapshot does not exist, has expired, or is restricted.
          </p>
          <Link
            href="/"
            className="btn-ink-accent inline-flex items-center gap-2 py-2 px-4 text-xs font-mono font-bold uppercase mt-4"
          >
            Go to DetectiveAI Home
          </Link>
        </div>
      </div>
    );
  }

  const kpis = shareData.kpis || [];
  const insights = shareData.insights || [];
  const anomalies = shareData.anomalies || [];

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-[#11120d] text-black dark:text-white font-sans py-8 px-4 sm:px-6 lg:px-8 print:p-4 print:bg-white print:text-black">
      <div className="max-w-5xl mx-auto space-y-8 print:space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-black/15 dark:border-white/15 print:border-black/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#edfe5e] border border-black flex items-center justify-center text-black font-serif font-black text-xs shadow-xs">
              D
            </div>
            <span className="font-serif font-bold tracking-tight text-sm">DetectiveAI</span>
            <span className="text-[10px] font-mono uppercase bg-[#edf0e9] dark:bg-[#262720] border border-black/10 dark:border-white/10 px-2 py-0.5 rounded font-bold text-black/70 dark:text-white/70 print:border-black/20">
              Public Dossier
            </span>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-[#181914] text-black dark:text-white hover:bg-[#edf0e9] dark:hover:bg-[#262720] transition-colors cursor-pointer inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider"
              title="Print Dossier or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <Link
              href="/"
              className="text-xs font-mono font-bold uppercase tracking-wider text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white flex items-center gap-1.5"
            >
              <span>Analyze Your Data</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Case File Header Banner */}
        <div className="border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] rounded-[18px] p-6 sm:p-8 shadow-[4px_4px_0px_#000000] print:shadow-none print:border-black/30 flex flex-col md:flex-row md:items-center justify-between gap-6 print:break-inside-avoid">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#31e992]/20 text-[#31e992] border border-[#31e992]/40 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Verified Investigation
              </span>
              <span className="text-[10px] font-mono font-bold uppercase bg-[#edf0e9] dark:bg-[#262720] text-black dark:text-white px-2 py-0.5 rounded border border-black/10 dark:border-white/10">
                {shareData.file_type || "CSV"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-black dark:text-white">
              {shareData.dataset_name}
            </h1>
            <p className="text-xs font-mono text-black/70 dark:text-white/70 uppercase tracking-wider">
              Records: <strong className="text-black dark:text-white">{shareData.row_count?.toLocaleString() || "—"}</strong> | 
              Columns: <strong className="text-black dark:text-white">{shareData.column_count || "—"}</strong>
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-end">
            <GaugeChart value={Math.round(shareData.health_score || 100)} size={84} strokeWidth={7} label="Health Score" />
          </div>
        </div>

        {/* Key Metrics Grid */}
        {kpis.length > 0 && (
          <div className="space-y-3 text-left print:break-inside-avoid">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#edfe5e]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                Executive Key Performance Metrics
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.slice(0, 4).map((kpi: any, idx: number) => (
                <div key={idx} className="p-5 rounded-[14px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] shadow-[3px_3px_0px_#000000] print:shadow-none print:border-black/30 space-y-1">
                  <p className="text-[11px] font-mono uppercase font-bold text-black/60 dark:text-white/60 truncate">{kpi.name}</p>
                  <p className="text-2xl font-mono font-bold text-black dark:text-white">{kpi.formatted_value || kpi.value}</p>
                  <p className="text-[10px] font-mono text-black/60 dark:text-white/60">{kpi.description || "Primary signal"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discovered Insights */}
        {insights.length > 0 && (
          <div className="space-y-3 text-left print:break-inside-avoid">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#edfe5e]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                Discovered Data Patterns & Root Insights
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.slice(0, 4).map((item: any, idx: number) => (
                <div key={idx} className="p-5 rounded-[14px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] shadow-[3px_3px_0px_#000000] print:shadow-none print:border-black/30 space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold bg-[#edfe5e] text-black px-2 py-0.5 rounded border border-black/20">
                    {item.category || "Observation"}
                  </span>
                  <p className="text-xs leading-relaxed text-black/85 dark:text-white/85 font-medium">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anomalies Table */}
        {anomalies.length > 0 && (
          <div className="space-y-3 text-left print:break-inside-avoid">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#bc3e3e]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                Key Anomalies Detected
              </h2>
            </div>
            <div className="border border-black dark:border-[#3b3a33] rounded-[18px] bg-white dark:bg-[#1c1d18] overflow-hidden shadow-[4px_4px_0px_#000000] print:shadow-none print:border-black/30">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans min-w-[500px]">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 bg-[#edf0e9] dark:bg-[#262720] font-mono text-[10px] font-bold uppercase text-black/70 dark:text-white/70">
                      <th className="px-5 py-3">Severity</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                    {anomalies.slice(0, 5).map((anom: any, idx: number) => (
                      <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="px-5 py-3 font-mono font-bold uppercase">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${
                            anom.severity === "critical"
                              ? "bg-[#bc3e3e]/15 text-[#bc3e3e] border-[#bc3e3e]/30"
                              : "bg-[#f59e0b]/15 text-[#b45309] dark:text-[#f59e0b] border-[#f59e0b]/30"
                          }`}>
                            {anom.severity || "warning"}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-black dark:text-white">{anom.description}</td>
                        <td className="px-5 py-3 font-mono text-black/60 dark:text-white/60 text-[11px]">{anom.detection_method || "Statistical"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 border-t border-black/15 dark:border-white/15 text-center space-y-3">
          <p className="text-xs font-mono text-black/60 dark:text-white/60">
            Powered by <strong>DetectiveAI</strong> — Autonomous Forensic Intelligence
          </p>
        </div>
      </div>
    </div>
  );
}
