"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, AlertOctagon, HelpCircle, CheckCircle2, ShieldAlert, Server } from "lucide-react";
import { analysisAPI } from "@/lib/api";
import { LineChart, Line, LineXAxis, LineYAxis, LineGrid, LineTooltip } from "@/components/ui/chart-line";

interface AnomaliesTabProps {
  datasetId: number | string;
}

export default function AnomaliesTab({ datasetId }: AnomaliesTabProps) {
  const [sensitivity, setSensitivity] = React.useState<number>(3.0);

  const { data: anomalies, isLoading } = useQuery({
    queryKey: ["analysis-anomalies", datasetId],
    queryFn: () => analysisAPI.getAnomalies(datasetId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 py-4 animate-pulse font-sans">
        <div className="h-24 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
        <div className="h-44 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
      </div>
    );
  }

  const rawAnomalyList = anomalies && anomalies.length > 0 ? anomalies : [];

  if (rawAnomalyList.length === 0) {
    return (
      <div className="space-y-4 py-4 text-left font-sans text-black dark:text-white">
        <div className="border-b border-black/10 dark:border-white/10 pb-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#edfe5e] text-black px-2 py-0.5 rounded border border-black/20">
            Anomaly Scan
          </span>
          <h2 className="text-lg font-serif font-bold text-black dark:text-white mt-1">
            Data Anomaly & Outlier Logs
          </h2>
        </div>
        <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-8 text-center space-y-2">
          <CheckCircle2 className="w-6 h-6 mx-auto text-[#31e992]" />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-black/60 dark:text-white/60">No Anomalies Detected</p>
          <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed max-w-md mx-auto">
            No rows exceeded the detection thresholds (Z-score &gt; 3.0σ, Isolation Forest, DBSCAN). Re-run the analysis
            after uploading data to scan for outliers.
          </p>
        </div>
      </div>
    );
  }

  const anomalyList = rawAnomalyList.filter((a: any) => {
    if (!a.z_score) return true;
    return Math.abs(a.z_score) >= sensitivity - 0.5;
  });

  const trendData = rawAnomalyList
    .filter((a: any) => a.z_score != null)
    .map((a: any, i: number) => ({
      index: `#${i + 1}`,
      z_score: Math.abs(a.z_score),
      threshold: sensitivity,
    }));

  return (
    <div className="space-y-6 text-left font-sans text-black dark:text-white">
      
      {/* Description Header + Switch-Lit Interactive Slider Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#edfe5e] text-black px-2 py-0.5 rounded border border-black/20">
              Anomaly Scan
            </span>
            <span className="text-xs font-mono text-black/60 dark:text-white/60">
              {anomalyList.length} Outliers Detected
            </span>
          </div>
          <h2 className="text-lg font-serif font-bold text-black dark:text-white mt-1">
            Data Anomaly & Outlier Logs
          </h2>
        </div>

        {/* Slider Control Container */}
          <div className="p-3 rounded-lg border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] flex items-center gap-4 shadow-[4px_4px_0px_#000000] text-xs font-mono">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-black/60 dark:text-white/60">
              <span>Z-Score Sensitivity</span>
              <span className="bg-[#edfe5e] text-black px-1.5 py-0.5 rounded font-bold">{sensitivity.toFixed(1)}σ</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="4.5"
              step="0.5"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-32 accent-[#edfe5e] cursor-pointer h-1.5 bg-[#edf0e9] dark:bg-[#262720] rounded"
            />
          </div>
        </div>
      </div>

      {/* Methodology Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Isolation Forest",
            desc: "Identifies anomalies by isolating feature pathways. Rapid isolation indicates structural abnormality.",
            icon: ShieldAlert
          },
          {
            title: "Z-Score Profiler",
            desc: "Measures standard deviations from feature mean. Deviations past 3.0 standard intervals are marked.",
            icon: AlertTriangle
          },
          {
            title: "DBSCAN Clustering",
            desc: "Groups data points by spatial density. Rows outside dense core clusters are classified as noise.",
            icon: Server
          }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-5 rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] shadow-[4px_4px_0px_#000000] space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-black dark:text-[#edfe5e]" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider">{item.title}</h4>
              </div>
              <p className="text-xs text-black/70 dark:text-white/70 leading-relaxed font-medium pt-1">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Anomaly Trend Chart */}
      {trendData.length > 0 && (
        <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-6 space-y-3 shadow-[4px_4px_0px_#000000]">
          <div>
            <h3 className="text-sm font-serif font-bold text-black dark:text-white">Anomaly Score Distribution</h3>
            <p className="text-black/60 dark:text-white/60 text-xs">Z-score magnitude across detected anomalies</p>
          </div>
          <LineChart data={trendData} xDataKey="index" height={200}>
            <LineGrid horizontal strokeDasharray="4 4" highlightRowValues={[sensitivity]} />
            <LineXAxis dataKey="index" />
            <LineYAxis numTicks={4} />
            <Line dataKey="z_score" stroke="#edfe5e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line dataKey="threshold" stroke="#bc3e3e" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
            <LineTooltip />
          </LineChart>
        </div>
      )}

      {/* Main Anomalies Listing */}
      <div className="space-y-3">
        {anomalyList.map((anomaly, idx) => {
          let isCritical = anomaly.severity === "critical";
          let Icon = isCritical ? AlertOctagon : AlertTriangle;

          return (
            <div
              key={idx}
              className="p-5 rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[4px_4px_0px_#000000]"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-lg border shrink-0 ${
                  isCritical ? "bg-[#bc3e3e]/10 border-[#bc3e3e]/30 text-[#bc3e3e]" : "bg-[#edfe5e]/20 border-black/20 text-black dark:text-white"
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-black dark:text-white">
                      Record ID #{anomaly.entity_id}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#edf0e9] dark:bg-[#262720] border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 rounded">
                      {anomaly.detection_method}
                    </span>
                  </div>
                  <p className="text-black/80 dark:text-white/80 text-xs font-medium leading-relaxed">{anomaly.description}</p>
                  <p className="text-[11px] text-black/60 dark:text-white/60 font-mono">
                    Reasoning: <span className="text-[#bc3e3e] font-bold">{anomaly.reason}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 self-stretch md:self-auto border-t md:border-t-0 border-black/10 dark:border-white/10 pt-3 md:pt-0 shrink-0 justify-end font-mono">
                <div className="text-right">
                  <p className="text-[10px] text-black/50 dark:text-white/50 uppercase">Confidence</p>
                  <p className="text-xs font-bold text-black dark:text-white mt-0.5">{(anomaly as any).confidence_score ?? "—"}%</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 border rounded-full ${
                  isCritical ? "bg-[#bc3e3e]/10 border-[#bc3e3e]/30 text-[#bc3e3e]" : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black/70 dark:text-white/70"
                }`}>
                  {anomaly.severity}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
