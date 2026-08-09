"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, CheckCircle2, ArrowRight } from "lucide-react";
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

  const recList = recommendations && recommendations.length > 0 ? recommendations : [];

  if (recList.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 font-sans text-black dark:text-white text-left">
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#edfe5e] text-black px-2 py-0.5 rounded border border-black/20">
                Formulated Directives
              </span>
              <span className="text-xs font-mono text-black/60 dark:text-white/60">
                0 Directives Formulated
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-black dark:text-white mt-1">
              Actionable Recommendations
            </h2>
          </div>
        </div>
        <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-8 text-center space-y-2">
          <Lightbulb className="w-6 h-6 mx-auto text-black/40 dark:text-white/40" />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-black/60 dark:text-white/60">No Directives Available</p>
          <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed max-w-md mx-auto">
            Recommendations are generated from detected insights (concentration, correlations, temporal patterns,
            margin warnings, distribution imbalance). Run an analysis to produce them.
          </p>
        </div>
      </div>
    );
  }

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
          return (
            <div
              key={i}
              className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-5 shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row gap-5 items-start justify-between"
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
                    <span>Derived from detected insights</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
