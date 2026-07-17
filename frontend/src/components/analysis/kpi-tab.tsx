"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Activity,
  Grid,
  HardDrive,
  Copy,
  Layers,
  Database,
  CheckCircle,
  AlertTriangle,
  PieChart
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { datasetsAPI, analysisAPI } from "@/lib/api";

interface KPITabProps {
  datasetId: number | string;
}

export default function KPITab({ datasetId }: KPITabProps) {
  // Fetch standard KPIs
  const { data: kpis, isLoading: isKpiLoading } = useQuery({
    queryKey: ["analysis-kpis", datasetId],
    queryFn: () => analysisAPI.getKpis(datasetId),
  });

  // Fetch full dataset profile for detailed technical KPIs fallback
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["dataset-profile", datasetId],
    queryFn: () => datasetsAPI.getProfile(datasetId),
  });

  const isLoading = isKpiLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/[0.01] border border-zinc-900" />
          ))}
        </div>
        <div className="h-[200px] rounded-2xl bg-white/[0.01] border border-zinc-900" />
      </div>
    );
  }

  const kpiList = kpis || [];

  // 1. Calculate high-fidelity technical fallback KPIs if no business KPIs are returned
  const rowCount = profile?.row_count || 0;
  const colCount = profile?.column_count || 0;
  const memoryKb = profile ? (profile.memory_usage_bytes / 1024).toFixed(1) : "0";
  const duplicateCount = profile?.duplicate_row_count || 0;
  const duplicatePct = rowCount > 0 ? ((duplicateCount / rowCount) * 100).toFixed(2) : "0";
  const healthScore = profile?.health_score !== undefined ? Math.round(profile.health_score) : 100;

  // Calculate advanced column attributes
  const columns = profile?.columns || [];
  const missingCount = columns.reduce((acc: number, curr: any) => acc + (curr.null_count || 0), 0);
  const totalCells = rowCount * colCount;
  const missingPct = totalCells > 0 ? ((missingCount / totalCells) * 100).toFixed(2) : "0";
  
  const categoricalCols = columns.filter((c: any) => c.classification === "categorical" || c.dtype === "object" || c.dtype === "string").length;
  const numericCols = colCount - categoricalCols;

  // Find column with highest cardinality
  let highestCardinalityCol = "None";
  let maxUniqueCount = 0;
  columns.forEach((c: any) => {
    if (c.unique_count > maxUniqueCount) {
      maxUniqueCount = c.unique_count;
      highestCardinalityCol = c.name;
    }
  });

  // Construct a robust list of detailed technical KPIs
  const technicalKpis = [
    {
      name: "Schema Integrity Index",
      value: `${healthScore}%`,
      description: "Average data quality validation rating",
      icon: Activity,
      status: healthScore >= 80 ? "Optimal" : healthScore >= 50 ? "Warning" : "Critical",
      statusColor: healthScore >= 80 ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/30" : "text-amber-500 bg-amber-950/20 border-amber-900/30"
    },
    {
      name: "Structural Density",
      value: `${(100 - parseFloat(missingPct)).toFixed(1)}%`,
      description: `Cells filled (${(totalCells - missingCount).toLocaleString()} / ${totalCells.toLocaleString()})`,
      icon: Layers,
      status: parseFloat(missingPct) < 5 ? "Optimal" : "Warning",
      statusColor: parseFloat(missingPct) < 5 ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/30" : "text-amber-500 bg-amber-950/20 border-amber-900/30"
    },
    {
      name: "Data Redundancy Rating",
      value: `${duplicatePct}%`,
      description: `${duplicateCount.toLocaleString()} duplicate records found`,
      icon: Copy,
      status: parseFloat(duplicatePct) === 0 ? "Optimal" : "Warning",
      statusColor: parseFloat(duplicatePct) === 0 ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/30" : "text-amber-500 bg-amber-950/20 border-amber-900/30"
    },
    {
      name: "Categorical Balance",
      value: `${categoricalCols} / ${colCount}`,
      description: `${numericCols} numeric, ${categoricalCols} categorical`,
      icon: PieChart,
      status: "Informational",
      statusColor: "text-purple-400 bg-purple-950/20 border-purple-900/30"
    }
  ];

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Description */}
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">Key Performance Indicators & Integrity Metrics</h2>
        <p className="text-zinc-550 text-xs font-semibold mt-0.5 uppercase tracking-wider">
          Automatic data structure checks, cardinality indicators, and quality scores
        </p>
      </div>

      {/* 1. Core Technical KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {technicalKpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-zinc-900 bg-[#09090B] flex flex-col justify-between min-h-[125px] relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-900 to-transparent" />
              
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                  {kpi.name}
                </span>
                <div className="p-2 rounded-xl bg-black border border-zinc-900 text-[#ea580c]">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-2.5">
                <h3 className="text-2xl font-black text-white font-mono tracking-tight">{kpi.value}</h3>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2.5">
                <span className="text-[9px] text-zinc-500 font-bold truncate">{kpi.description}</span>
                <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${kpi.statusColor}`}>
                  {kpi.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Business KPIs Section (If present in dataset, e.g. financial metrics) */}
      {kpiList.length > 0 && (
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Calculated Business Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiList.map((kpi: any, idx: number) => {
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-zinc-900 bg-[#09090B] flex flex-col justify-between min-h-[120px] relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                      {kpi.name}
                    </span>
                    <div className="p-2 rounded-xl bg-black border border-zinc-900 text-[#ea580c]">
                      <Database className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <h3 className="text-xl font-bold text-white font-mono">{kpi.formatted_value}</h3>
                  </div>

                  {kpi.change_percentage !== null && kpi.change_percentage !== 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`text-[8px] font-mono font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        kpi.trend === "up" ? "text-green-400 bg-green-950/20 border-green-900/30" : "text-rose-400 bg-rose-950/20 border-rose-900/30"
                      }`}>
                        {kpi.trend === "up" ? "▲" : "▼"} {Math.abs(kpi.change_percentage)}%
                      </span>
                      <span className="text-[9px] text-zinc-600 font-semibold">vs prev period</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Detailed Statistical KPI Attributes Summary Table */}
      <div className="rounded-2xl border border-zinc-900 bg-[#09090B] overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-zinc-900/50 bg-black flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Dataset Profiling Analytics</span>
          <span className="text-[9px] font-mono text-zinc-600 font-bold uppercase">Technical Log</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-5 py-3">Metric Target</th>
                <th className="px-5 py-3">Computed Value</th>
                <th className="px-5 py-3">Reference Baseline</th>
                <th className="px-5 py-3">Evaluation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40">
              {[
                {
                  metric: "Total Ingested Volume",
                  value: `${rowCount.toLocaleString()} rows`,
                  baseline: "Unlimited Sandbox",
                  status: "Optimal",
                  statusColor: "text-emerald-400 bg-emerald-950/20 border-emerald-900/30"
                },
                {
                  metric: "Feature Schema Breadth",
                  value: `${colCount} attributes`,
                  baseline: "< 100 cols recommended",
                  status: colCount < 50 ? "Optimal" : "Warning",
                  statusColor: colCount < 50 ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/30" : "text-amber-500 bg-amber-950/20 border-amber-900/30"
                },
                {
                  metric: "Highest Cardinality Column",
                  value: `${highestCardinalityCol} (${maxUniqueCount} categories)`,
                  baseline: "Evaluates high-cardinality keys",
                  status: "Informational",
                  statusColor: "text-purple-400 bg-purple-950/20 border-purple-900/30"
                },
                {
                  metric: "Structural Sparsity Ratio",
                  value: `${missingPct}% Null values`,
                  baseline: "< 2% Target threshold",
                  status: parseFloat(missingPct) < 2 ? "Optimal" : "Warning",
                  statusColor: parseFloat(missingPct) < 2 ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/30" : "text-amber-500 bg-amber-950/20 border-amber-900/30"
                },
                {
                  metric: "Memory Footprint Shard",
                  value: `${memoryKb} KB`,
                  baseline: "Auto-caching limit 1 GB",
                  status: "Optimal",
                  statusColor: "text-emerald-400 bg-emerald-950/20 border-emerald-900/30"
                }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-950/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-zinc-300">{row.metric}</td>
                  <td className="px-5 py-3.5 font-mono text-zinc-400">{row.value}</td>
                  <td className="px-5 py-3.5 text-zinc-550 font-semibold">{row.baseline}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block text-[8px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
