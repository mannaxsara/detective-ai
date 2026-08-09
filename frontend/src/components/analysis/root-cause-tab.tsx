"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowDown, ClipboardList, ShieldCheck, GitCommit } from "lucide-react";
import { analysisAPI } from "@/lib/api";
import { SankeyChart, SankeyNode, SankeyLink, SankeyTooltip, type SankeyData } from "@/components/ui/chart-sankey";

interface RootCauseTabProps {
  datasetId: number | string;
}

export default function RootCauseTab({ datasetId }: RootCauseTabProps) {
  const { data: rootCause, isLoading } = useQuery({
    queryKey: ["analysis-rootcause", datasetId],
    queryFn: () => analysisAPI.getRootCause(datasetId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto py-4 font-sans animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className="h-16 w-full rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
            {i < 4 && <ArrowDown className="w-4 h-4 text-black/30 dark:text-white/30" />}
          </div>
        ))}
      </div>
    );
  }

  const nodes = rootCause && rootCause.length > 0 ? rootCause : [];

  if (nodes.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-6 text-left font-sans">
        <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-8 text-center space-y-2">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-black/60 dark:text-white/60">No Root Cause Traced</p>
          <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed max-w-md mx-auto">
            A 5-Whys trace requires at least one numeric metric column (e.g. profit, revenue) and one categorical
            dimension column (e.g. Region, Category) in your dataset. Adjust your data, then re-run the analysis.
          </p>
        </div>
      </div>
    );
  }

  const rootNode = nodes[nodes.length - 1] || {};
  const lastData = rootNode.supporting_data || {};

  const actionPlan: { title: string; steps: string[] } = { title: "Next Diagnostic Steps", steps: [] };
  if (lastData.factor && lastData.sub_average != null) {
    actionPlan.title = `Investigate ${String(lastData.factor).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`;
    actionPlan.steps = [
      `Audit ${lastData.factor} values for "${lastData.sub_segment}" against the dataset average (${Number(lastData.overall_average).toFixed(2)}).`,
      "Verify whether the difference is a data-entry artifact or a genuine business driver.",
      "If genuine, review pricing or terms for the segment; if artifactual, correct the source data.",
    ];
  } else if (lastData.segment) {
    actionPlan.title = `Investigate "${lastData.segment}"`;
    actionPlan.steps = [
      `Review transactions for segment "${lastData.segment}" (${Number(lastData.value).toFixed(2)} total${lastData.percentage != null ? `, ${Number(lastData.percentage).toFixed(1)}% of dataset total` : ""}).`,
      "Drill into sub-categories or date ranges to isolate the drop.",
      "Add segment-level detail columns (discounts, costs) and re-run the analysis for a deeper trace.",
    ];
  } else {
    actionPlan.steps = [
      "Use the Statistics tab to review correlation and hypothesis tests for data-backed relationships.",
      "Use the Cleaning tab to fix missing values, duplicates, and type issues before re-analyzing.",
      "Re-run the analysis once the dataset is cleaned.",
    ];
  }

  const causalFlow: SankeyData = {
    nodes: nodes.map((w: any, i: number) => ({
      name: w.why || `Why ${i + 1}`,
      category: `level-${i}`,
    })),
    links: nodes.slice(1).map((_: any, i: number) => ({
      source: i,
      target: i + 1,
      value: Math.max(1, Number(((nodes as any[])[i]?.supporting_data?.percentage) ?? 1)),
    })),
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left font-sans text-black dark:text-white">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#edfe5e] text-black px-2 py-0.5 rounded border border-black/20">
              5 Whys Root Cause Diagnosis
            </span>
            <span className="text-xs font-mono text-black/60 dark:text-white/60">
              {nodes.length} Causality Steps Traced
            </span>
          </div>
          <h2 className="text-lg font-serif font-bold text-black dark:text-white mt-1">
            Structural Root Cause Investigation
          </h2>
        </div>
      </div>

      {/* Vertical Diagnostic Timeline */}
      <div className="space-y-3">
        {nodes.map((node: any, i: number) => {
          const isLast = i === nodes.length - 1;
          const supporting = node.supporting_data || {};
          const supportLabel =
            supporting.percentage != null
              ? `${Number(supporting.percentage).toFixed(1)}% of total`
              : supporting.sub_average != null
                ? `avg ${Number(supporting.sub_average).toFixed(2)}`
                : supporting.value != null
                  ? `${Number(supporting.value).toFixed(2)}`
                  : "Data-backed";

          return (
            <React.Fragment key={i}>
              <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-5 shadow-[4px_4px_0px_#000000] flex items-start gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                  isLast ? "bg-[#bc3e3e] text-white border border-[#bc3e3e]/40" : "bg-[#edfe5e] text-black border border-black/20"
                }`}>
                  W{i + 1}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-black/60 dark:text-white/60 uppercase tracking-wider">
                      Why Level {i + 1}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isLast ? "bg-[#bc3e3e]/20 border-[#bc3e3e]/40 text-[#bc3e3e]" : "bg-[#31e992]/20 border-[#31e992]/40 text-[#31e992]"
                    }`}>
                      {supportLabel}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-black dark:text-white">{node.why}</h4>
                  <p className="text-black/70 dark:text-white/70 text-xs leading-relaxed">{node.reason}</p>
                </div>
              </div>
              
              {!isLast && (
                <div className="flex items-center justify-center h-4">
                  <ArrowDown className="w-4 h-4 text-black/30 dark:text-white/30" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Actionable Remediation Summary Card */}
      <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-6 space-y-4 shadow-[4px_4px_0px_#000000]">
        <div className="flex items-center gap-2.5 border-b border-black/10 dark:border-white/10 pb-3">
          <ClipboardList className="w-5 h-5 text-black dark:text-[#edfe5e]" />
          <h4 className="font-serif font-bold text-sm text-black dark:text-white">Actionable Remediation Summary</h4>
        </div>

        <div className="space-y-4">
          <div className="p-3.5 bg-[#edf0e9]/50 dark:bg-[#262720]/50 border border-black/10 dark:border-white/10 rounded-lg text-xs space-y-1">
            <span className="text-[10px] font-mono font-bold text-black/50 dark:text-white/50 uppercase block">Identified Root Cause (Level {nodes.length})</span>
            <p className="font-serif font-bold text-black dark:text-white italic">
              &quot;{rootNode.reason}&quot;
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-black dark:text-white block">{actionPlan.title}</span>
            <div className="space-y-2 pt-1">
              {actionPlan.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#31e992] shrink-0 mt-0.5" />
                  <p className="text-black/80 dark:text-white/80 font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
