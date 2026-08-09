"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Calculator, BarChart2, CheckCircle2, XCircle, Info, Sparkles } from "lucide-react";
import { analysisAPI, datasetsAPI } from "@/lib/api";

import {
  HeatmapChart,
  HeatmapCells,
  HeatmapXAxis,
  HeatmapLegend,
  HeatmapTooltip,
  type HeatmapCellData,
} from "@/components/ui/heatmap-chart";
import {
  ScatterChart,
  ScatterGrid,
  ScatterXAxis,
  ScatterYAxis,
  ScatterSeries,
  ScatterTooltip,
} from "@/components/ui/chart-scatter";

interface StatisticsTabProps {
  datasetId: number | string;
}

export default function StatisticsTab({ datasetId }: StatisticsTabProps) {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["dataset-profile", datasetId],
    queryFn: () => datasetsAPI.getProfile(datasetId),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["analysis-statistics", datasetId],
    queryFn: () => analysisAPI.getStatistics(datasetId),
  });

  const { data: correlations, isLoading: corrLoading } = useQuery({
    queryKey: ["analysis-correlations", datasetId],
    queryFn: () => analysisAPI.getCorrelations(datasetId),
  });

  const isLoading = profileLoading || statsLoading || corrLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 py-4 animate-pulse font-sans">
        <div className="h-40 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
        <div className="h-64 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
      </div>
    );
  }

  const numericColumns = profile?.columns?.filter((c: any) => c.classification === "numeric") || [];
  const numCols = numericColumns.map((c: any) => c.name);

  // Real correlation matrix from backend
  const matrixColumns = correlations?.matrix?.columns ?? [];
  const matrixValues = correlations?.matrix?.values ?? [];
  const heatmapData: HeatmapCellData[] = matrixColumns.flatMap((colX: string, i: number) =>
    matrixColumns.map((colY: string, j: number) => ({
      x: colX,
      y: colY,
      value: matrixValues[i]?.[j] ?? 0,
    }))
  );

  // Real strongest-pair scatter from backend (null when no valid pair exists)
  const scatter = correlations?.scatter ?? null;
  const scatterData: { x: number; y: number }[] = scatter?.points ?? [];

  const statList = stats && stats.length > 0 ? stats : null;

  const getHypothesisDetails = (testName?: string) => {
    const name = (testName || "").toLowerCase();
    if (name.includes("chi") || name.includes("independence")) {
      return {
        h0: "Variables are completely independent.",
        h1: "Statistically significant correlation exists.",
        concept: "Chi-Square Independence Test"
      };
    }
    if (name.includes("t-test") || name.includes("mean")) {
      return {
        h0: "Group means are equal across cohorts.",
        h1: "Group means differ significantly.",
        concept: "Student's T-Test"
      };
    }
    if (name.includes("anova") || name.includes("variance")) {
      return {
        h0: "Variance is identical across all subgroups.",
        h1: "At least one subgroup variance differs.",
        concept: "One-Way ANOVA Test"
      };
    }
    return {
      h0: "No significant relationship exists (Status Quo).",
      h1: "A statistically significant pattern exists.",
      concept: "Statistical Diagnostic Model"
    };
  };

  return (
    <div className="space-y-6 text-left font-sans text-black dark:text-white">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#edfe5e] text-black px-2 py-0.5 rounded border border-black/20">
              Statistical Diagnostics
            </span>
            <span className="text-xs font-mono text-black/60 dark:text-white/60">
              {numericColumns.length} Numeric Features Evaluated
            </span>
          </div>
          <h2 className="text-lg font-serif font-bold text-black dark:text-white mt-1">
            Correlation & Hypothesis Tests
          </h2>
        </div>
      </div>

      {/* Pearson Correlation Heatmap */}
      {numCols.length > 1 && (
        <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-6 space-y-4 shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-black dark:text-white">Pearson Correlation Matrix</h3>
              <p className="text-black/60 dark:text-white/60 text-xs mt-0.5">
                Linear correlation coefficients (-1.0 to +1.0) between numerical columns
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#edf0e9] dark:bg-[#262720] px-2.5 py-1 rounded border border-black/10 dark:border-white/10">
              {numCols.length}x{numCols.length} Matrix
            </span>
          </div>
          <HeatmapChart data={heatmapData} xKeys={numCols} yKeys={numCols}>
            <HeatmapCells />
            <HeatmapXAxis />
            <HeatmapLegend />
            <HeatmapTooltip />
          </HeatmapChart>
        </div>
      )}

      {/* Scatter & Descriptive Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bivariate Scatter Plot */}
        {scatter && scatter.points.length >= 2 && (
          <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-6 space-y-4 shadow-[4px_4px_0px_#000000]">
            <div>
              <h3 className="text-sm font-serif font-bold text-black dark:text-white">Bivariate Scatter Plot</h3>
              <p className="text-black/60 dark:text-white/60 text-xs mt-0.5">
                Observed distribution pair: <span className="font-mono font-bold text-black dark:text-white">{scatter.x_column}</span> vs <span className="font-mono font-bold text-black dark:text-white">{scatter.y_column}</span>
              </p>
            </div>
            <ScatterChart data={scatterData} xDataKey="x" height={220}>
              <ScatterGrid horizontal vertical />
              <ScatterSeries dataKey="y" radius={4} fadeOnHover inactiveOpacity={0.3} fill="#edfe5e" />
              <ScatterXAxis label={scatter.x_column} />
              <ScatterYAxis label={scatter.y_column} numTicks={4} />
              <ScatterTooltip />
            </ScatterChart>
          </div>
        )}

        {/* Descriptive Summary Stats */}
        {profile && profile.columns && (
          <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-6 space-y-4 shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-black dark:text-white">Feature Profile Overview</h3>
              <p className="text-black/60 dark:text-white/60 text-xs mt-0.5">
                Summary metric bounds computed across all dataset attributes
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 font-mono font-bold text-[10px] uppercase">
                    <th className="py-2.5 px-3">Column</th>
                    <th className="py-2.5 px-3 text-right">Mean</th>
                    <th className="py-2.5 px-3 text-right">Std Dev</th>
                    <th className="py-2.5 px-3 text-right">Null %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 font-mono">
                  {profile.columns.slice(0, 6).map((col: any, idx: number) => {
                    const isNum = col.classification === "numeric";
                    return (
                      <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-2 px-3 font-sans font-bold text-black dark:text-white">{col.name}</td>
                        <td className="py-2 px-3 text-right">
                          {isNum && col.mean != null ? col.mean.toFixed(2) : "—"}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {isNum && col.std != null ? col.std.toFixed(2) : "—"}
                        </td>
                        <td className={`py-2 px-3 text-right font-bold ${col.null_percentage > 10 ? "text-[#bc3e3e]" : "text-black/70 dark:text-white/70"}`}>
                          {col.null_percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] font-mono text-black/50 dark:text-white/50 text-right pt-2 border-t border-black/5 dark:border-white/5">
              Showing top {Math.min(6, profile.columns.length)} of {profile.columns.length} columns
            </p>
          </div>
        )}
      </div>

      {/* Model Diagnostic Tests */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black/70 dark:text-white/70">
          Statistical Hypothesis & Diagnostic Audits
        </h3>

        {statList ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statList.map((test: any, idx: number) => {
            const hInfo = getHypothesisDetails(test.test_name);
            const isSig = test.significant !== false && (test.p_value == null || test.p_value < 0.05);

            return (
              <div
                key={idx}
                className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-5 space-y-4 shadow-[4px_4px_0px_#000000] flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-[#edf0e9] dark:bg-[#262720] border border-black/10 dark:border-white/10 px-2 py-0.5 rounded text-black dark:text-white">
                      {hInfo.concept}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isSig ? "bg-[#31e992]/20 border-[#31e992]/40 text-black dark:text-[#31e992]" : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black/60 dark:text-white/60"
                    }`}>
                      {isSig ? "Significant (Reject H₀)" : "Insignificant"}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-black dark:text-white pt-1">{test.test_name}</h4>
                  <p className="text-xs text-black/70 dark:text-white/70 leading-relaxed">{test.description}</p>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Hypothesis H0/H1 box */}
                  <div className="p-3 rounded-lg bg-[#edf0e9]/50 dark:bg-[#262720]/50 border border-black/10 dark:border-white/10 text-xs space-y-1.5 font-mono">
                    <p className="text-black/80 dark:text-white/80">
                      <strong className="text-[#bc3e3e]">H₀:</strong> {hInfo.h0}
                    </p>
                    <p className="text-black/80 dark:text-white/80">
                      <strong className="text-[#31e992]">H₁:</strong> {hInfo.h1}
                    </p>
                  </div>

                  {/* Metrics Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-black/50 dark:text-white/50 uppercase block">Statistic</span>
                      <span className="font-bold">{test.statistic != null ? test.statistic.toFixed(4) : "—"}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-black/50 dark:text-white/50 uppercase block">p-value</span>
                      <span className={`font-bold ${isSig ? "text-black dark:text-[#edfe5e]" : "text-black/70 dark:text-white/70"}`}>
                        {test.p_value != null ? (test.p_value < 0.001 ? "< 0.001" : test.p_value.toFixed(4)) : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-8 text-center space-y-2">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-black/60 dark:text-white/60">
              No Tests Computed
            </p>
            <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
              No statistical hypothesis tests could be computed for this dataset (needs at least 2 numeric columns with sufficient overlapping rows).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
