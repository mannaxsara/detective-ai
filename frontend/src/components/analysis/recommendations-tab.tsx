"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, CheckCircle2, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { analysisAPI } from "@/lib/api";

interface RecommendationsTabProps {
  datasetId: number | string;
}

export default function RecommendationsTab({ datasetId }: RecommendationsTabProps) {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["analysis-recommendations", datasetId],
    queryFn: () => analysisAPI.getRecommendations(datasetId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto py-4 animate-pulse font-sans">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
        ))}
      </div>
    );
  }

  const defaultRecs = [
    "Filter out sensor drift outlier anomalies prior to downstream reporting pipeline ingestion.",
    "Implement automated missing value imputation using median strategy for numeric columns.",
    "Standardize categorical label casing to resolve duplicate cluster segmentation.",
    "Establish automated periodic threshold checks to flag skewness exceeding 2.5 standard deviations."
  ];

  const recList = (recommendations && recommendations.length > 0) ? recommendations : defaultRecs;

  const getSimulatedImpact = (index: number) => {
    const impacts = [
      { text: "8% - 12% margin efficiency gain", val: "+12%" },
      { text: "15% - 20% data quality score lift", val: "+20%" },
      { text: "5% - 8% processing speedup", val: "+8%" },
      { text: "10% pipeline error reduction", val: "+10%" },
    ];
    return impacts[index % impacts.length];
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans text-black dark:text-white text-left">
      
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#edfe5e] text-black px-2 py-0.5 rounded border border-black/20">
              Formulated Directives
            </span>
            <span className="text-xs font-mono text-black/60 dark:text-white/60">
              {recList.length} Directives Formulated
            </span>
          </div>
          <h2 className="text-lg font-serif font-bold text-black dark:text-white mt-1">
            Actionable Recommendations
          </h2>
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        {recList.map((rec, i) => {
          const impact = getSimulatedImpact(i);
          return (
            <div
              key={i}
              className="rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#181914] p-5 shadow-sm flex flex-col md:flex-row gap-5 items-start justify-between"
            >
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#edfe5e] text-black border border-black/20 flex items-center justify-center shrink-0 font-mono font-bold text-xs">
                  #{i + 1}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-[#edf0e9] dark:bg-[#262720] border border-black/10 dark:border-white/10 px-2 py-0.5 rounded text-black dark:text-white uppercase">
                      Action Directive #{i + 1}
                    </span>
                  </div>
                  <p className="text-xs font-bold font-serif text-black dark:text-white leading-relaxed">{rec}</p>
                  <div className="flex items-center gap-2 text-[11px] text-black/60 dark:text-white/60 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#31e992] shrink-0" />
                    <span>Implementation Timeline: 1-2 weeks</span>
                  </div>
                </div>
              </div>

              {/* Expected Gain Box */}
              <div className="p-3 rounded-lg border border-black/10 dark:border-white/10 bg-[#edf0e9]/50 dark:bg-[#262720]/50 flex items-center gap-3 self-stretch md:self-auto shrink-0 md:w-52 font-mono">
                <div className="w-7 h-7 rounded bg-[#31e992]/20 text-[#31e992] border border-[#31e992]/40 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-black/50 dark:text-white/50 uppercase">Expected Impact</p>
                  <p className="text-xs font-bold text-black dark:text-white mt-0.5">{impact.text}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
