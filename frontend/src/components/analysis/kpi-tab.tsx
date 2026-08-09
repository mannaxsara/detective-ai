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

import { datasetsAPI, analysisAPI } from "@/lib/api";
import {
  Legend,
  LegendItemComponent,
  LegendMarker,
  LegendLabel,
  LegendValue,
  LegendProgress,
  type LegendItemData,
} from "@/components/ui/chart-legend";
import { RingChart, Ring, RingCenter, type RingData } from "@/components/ui/chart-ring";
import { ProfitLossChart, ProfitLossLegend } from "@/components/ui/chart-profit-loss";

interface KPITabProps {
  datasetId: number | string;
}

export default function KPITab({ datasetId }: KPITabProps) {
  const { data: kpis, isLoading: isKpiLoading } = useQuery({
    queryKey: ["analysis-kpis", datasetId],
    queryFn: () => analysisAPI.getKpis(datasetId),
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["dataset-profile", datasetId],
    queryFn: () => datasetsAPI.getProfile(datasetId),
  });

  const isLoading = isKpiLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-[18px] bg-white dark:bg-[#1c1d18] border border-black dark:border-[#3b3a33]" />
          ))}
        </div>
      </div>
    );
  }

  const kpiList = kpis || [];
  const rowCount = profile?.row_count || 0;
  const colCount = profile?.column_count || 0;
  const memoryKb = profile ? (profile.memory_usage_bytes / 1024).toFixed(1) : "0";
  const duplicateCount = profile?.duplicate_row_count || 0;
  const duplicatePct = rowCount > 0 ? ((duplicateCount / rowCount) * 100).toFixed(2) : "0";
  const healthScore = profile?.health_score !== undefined ? Math.round(profile.health_score) : 100;

  const columns = profile?.columns || [];
  const missingCount = columns.reduce((acc: number, curr: any) => acc + (curr.null_count || 0), 0);
  const totalCells = rowCount * colCount;
  const missingPct = totalCells > 0 ? ((missingCount / totalCells) * 100).toFixed(2) : "0";
  
  const categoricalCols = columns.filter((c: any) => c.classification === "categorical" || c.dtype === "object" || c.dtype === "string").length;
  const numericCols = colCount - categoricalCols;

  let highestCardinalityCol = "None";
  let maxUniqueCount = 0;
  columns.forEach((c: any) => {
    if (c.unique_count > maxUniqueCount) {
      maxUniqueCount = c.unique_count;
      highestCardinalityCol = c.name;
    }
  });

  const technicalKpis = [
    {
      name: "Schema Integrity Index",
      value: `${healthScore}%`,
      description: "Validation rating",
      icon: Activity,
      status: healthScore >= 80 ? "Optimal" : healthScore >= 50 ? "Warning" : "Critical",
      statusColor: healthScore >= 80 ? "bg-[#31e992] text-black border-black" : "bg-[#edfe5e] text-black border-black"
    },
    {
      name: "Structural Density",
      value: `${(100 - parseFloat(missingPct)).toFixed(1)}%`,
      description: `Filled (${(totalCells - missingCount).toLocaleString()})`,
      icon: Layers,
      status: parseFloat(missingPct) < 5 ? "Optimal" : "Warning",
      statusColor: parseFloat(missingPct) < 5 ? "bg-[#31e992] text-black border-black" : "bg-[#edfe5e] text-black border-black"
    },
    {
      name: "Redundancy Rating",
      value: `${duplicatePct}%`,
      description: `${duplicateCount.toLocaleString()} duplicates`,
      icon: Copy,
      status: parseFloat(duplicatePct) === 0 ? "Optimal" : "Warning",
      statusColor: parseFloat(duplicatePct) === 0 ? "bg-[#31e992] text-black border-black" : "bg-[#edfe5e] text-black border-black"
    },
    {
      name: "Categorical Balance",
      value: `${categoricalCols} / ${colCount}`,
      description: `${numericCols} num, ${categoricalCols} cat`,
      icon: PieChart,
      status: "Info",
      statusColor: "bg-[#bed4fb] text-black border-black"
    }
  ];

  const kpiLegendData: LegendItemData[] = [
    { label: "Valid Cells", value: Math.max(0, totalCells - missingCount), maxValue: Math.max(1, totalCells), color: "#31e992" },
    { label: "Numeric Features", value: numericCols, maxValue: Math.max(1, colCount), color: "#edfe5e" },
    { label: "Categorical Features", value: categoricalCols, maxValue: Math.max(1, colCount), color: "#bed4fb" },
    { label: "Missing / Null Cells", value: missingCount, maxValue: Math.max(1, totalCells), color: "#bc3e3e" },
  ];

  return (
    <div className="space-y-8 text-left font-sans text-black dark:text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black dark:border-[#3b3a33] pb-4">
        <div>
          <h2 className="text-base font-serif font-bold tracking-tight">Key Performance Indicators & Scorecards</h2>
          <p className="text-xs font-sans text-black/75 dark:text-white/75 mt-0.5">
            Statistical integrity scores and dataset metrics calculated automatically.
          </p>
        </div>
      </div>

      {/* Technical KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {technicalKpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] flex flex-col justify-between min-h-[140px] shadow-[4px_4px_0px_#000000] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider opacity-85">
                  {kpi.name}
                </span>
                <div className="w-8 h-8 rounded-[6px] bg-[#edfe5e] text-black border border-black flex items-center justify-center shadow-[1px_1px_0px_#000000]">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-bold font-serif tracking-tight">{kpi.value}</h3>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono opacity-80 truncate">{kpi.description}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shadow-[1px_1px_0px_#000000] ${kpi.statusColor}`}>
                  {kpi.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composition Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-black dark:border-[#3b3a33] rounded-[18px] bg-white dark:bg-[#1c1d18] p-6 shadow-[4px_4px_0px_#000000] space-y-4">
          <Legend items={kpiLegendData} title="Dataset Feature Composition">
            <LegendItemComponent className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 p-2 rounded-[8px] hover:bg-[#edf0e9] dark:hover:bg-[#262720] transition-all">
              <LegendMarker />
              <LegendLabel />
              <LegendValue showPercentage />
              <div className="col-span-full">
                <LegendProgress />
              </div>
            </LegendItemComponent>
          </Legend>
        </div>

        <div className="border border-black dark:border-[#3b3a33] rounded-[18px] bg-white dark:bg-[#1c1d18] p-6 shadow-[4px_4px_0px_#000000] flex flex-col items-center justify-center space-y-4">
          <h3 className="text-sm font-serif font-bold w-full text-left">Cell Integrity Arc</h3>
          <RingChart 
            data={[
              { label: "Valid Cells", value: Math.max(0, totalCells - missingCount), maxValue: Math.max(1, totalCells), color: "#31e992" },
              { label: "Null Cells", value: missingCount, maxValue: Math.max(1, totalCells), color: "#bc3e3e" },
              { label: "Duplicate Rows", value: duplicateCount, maxValue: Math.max(1, rowCount), color: "#edfe5e" },
            ]}
          >
            <RingCenter />
          </RingChart>
        </div>
      </div>

      {/* Technical KPI Summary Table */}
      <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] overflow-hidden shadow-[4px_4px_0px_#000000]">
        <div className="px-6 py-4 border-b border-black dark:border-[#3b3a33] bg-[#edf0e9] dark:bg-[#262720] flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">Dataset Analytics Scorecard</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#f9f9f7] dark:bg-[#11120d] border-b border-black dark:border-[#3b3a33] font-mono text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                <th className="px-6 py-3.5">Metric Target</th>
                <th className="px-6 py-3.5">Computed Value</th>
                <th className="px-6 py-3.5">Reference Baseline</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10 text-black dark:text-white font-mono">
              {[
                {
                  metric: "Total Ingested Volume",
                  value: `${rowCount.toLocaleString()} rows`,
                  baseline: "Unlimited Sandbox",
                  status: "Optimal",
                  statusColor: "bg-[#31e992] text-black border-black"
                },
                {
                  metric: "Feature Schema Breadth",
                  value: `${colCount} attributes`,
                  baseline: "< 100 cols recommended",
                  status: colCount < 50 ? "Optimal" : "Warning",
                  statusColor: colCount < 50 ? "bg-[#31e992] text-black border-black" : "bg-[#edfe5e] text-black border-black"
                },
                {
                  metric: "Highest Cardinality Column",
                  value: `${highestCardinalityCol} (${maxUniqueCount} keys)`,
                  baseline: "Evaluates high-cardinality keys",
                  status: "Info",
                  statusColor: "bg-[#bed4fb] text-black border-black"
                },
                {
                  metric: "Structural Sparsity Ratio",
                  value: `${missingPct}% Null values`,
                  baseline: "< 2% Target threshold",
                  status: parseFloat(missingPct) < 2 ? "Optimal" : "Warning",
                  statusColor: parseFloat(missingPct) < 2 ? "bg-[#31e992] text-black border-black" : "bg-[#edfe5e] text-black border-black"
                },
                {
                  metric: "Memory Footprint Shard",
                  value: `${memoryKb} KB`,
                  baseline: "Auto-caching limit 1 GB",
                  status: "Optimal",
                  statusColor: "bg-[#31e992] text-black border-black"
                }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f9f9f7] dark:hover:bg-[#262720] transition-colors">
                  <td className="px-6 py-3.5 font-bold font-serif text-sm text-black dark:text-white">{row.metric}</td>
                  <td className="px-6 py-3.5 font-bold">{row.value}</td>
                  <td className="px-6 py-3.5 text-black/75 dark:text-white/75">{row.baseline}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shadow-[1px_1px_0px_#000000] ${row.statusColor}`}>
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
