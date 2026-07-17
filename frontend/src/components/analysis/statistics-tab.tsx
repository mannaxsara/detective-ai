"use client";
 
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Calculator, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { analysisAPI, datasetsAPI } from "@/lib/api";

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

  const isLoading = profileLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4 py-6 animate-pulse">
        <div className="h-32 rounded-2xl bg-[#111217]/50 border border-zinc-900" />
        <div className="h-32 rounded-2xl bg-[#111217]/50 border border-zinc-900" />
      </div>
    );
  }

  const statList = stats || [];

  const getStarRating = (pVal: number) => {
    if (pVal < 0.001) return "⭐⭐⭐ (Extremely Significant)";
    if (pVal < 0.01) return "⭐⭐ (Highly Significant)";
    if (pVal < 0.05) return "⭐ (Significant)";
    return "ns (Not Significant)";
  };

  // Hypotheses details mapper based on test type names
  const getHypothesisDetails = (testName: string) => {
    const name = testName.toLowerCase();
    if (name.includes("chi") || name.includes("independence")) {
      return {
        h0: "There is NO association between the tested variables. They are completely independent.",
        h1: "There IS a statistically significant association between the variables. One column correlates with the other.",
        concept: "Chi-Square Independence test: Evaluates whether categorical relationships happen by pure chance."
      };
    }
    if (name.includes("t-test") || name.includes("mean")) {
      return {
        h0: "The average values (means) of the two tested groups are equal.",
        h1: "The average values (means) of the two tested groups are significantly different.",
        concept: "Student's T-Test: Compares means between two numerical cohorts to check if they differ significantly."
      };
    }
    if (name.includes("anova") || name.includes("variance")) {
      return {
        h0: "All compared groups share the exact same average value.",
        h1: "At least one group's average value is significantly different from the others.",
        concept: "One-Way ANOVA: Compares average variances across 3 or more categorical segments."
      };
    }
    return {
      h0: "No relationship exists or data values fit standard distributions.",
      h1: "A relationship exists or values deviate from baseline expectations.",
      concept: "Statistical Significance Test: Validates pattern likelihood against random variance."
    };
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">Statistical Summary & Model Diagnostics</h2>
        <p className="text-zinc-555 text-xs font-semibold mt-0.5 uppercase tracking-wider">
          Automatic mathematical verification of variable independence and distribution skew
        </p>
      </div>

      {/* Descriptive Statistics Table */}
      {profile && profile.columns && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Descriptive Column Statistics</h3>
          <div className="rounded-2xl border border-zinc-900 bg-[#09090B] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-black/60 border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Column</th>
                    <th className="p-4">Type</th>
                    <th className="p-4 text-right">Mean</th>
                    <th className="p-4 text-right">Median</th>
                    <th className="p-4 text-right">Std Dev</th>
                    <th className="p-4 text-right">Min</th>
                    <th className="p-4 text-right">Max</th>
                    <th className="p-4 text-right">Missing %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-950/40">
                  {profile.columns.map((col: any, idx: number) => {
                    const isNum = col.classification === "numeric";
                    return (
                      <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="p-4 font-bold text-zinc-250">{col.name}</td>
                        <td className="p-4">
                          <Badge className="bg-black border border-zinc-900 text-zinc-400 text-[9px] px-2 py-0.5 rounded uppercase font-bold">
                            {col.dtype}
                          </Badge>
                        </td>
                        <td className="p-4 text-right font-mono text-zinc-350">
                          {isNum && col.mean != null ? col.mean.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                        </td>
                        <td className="p-4 text-right font-mono text-zinc-350">
                          {isNum && col.median != null ? col.median.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                        </td>
                        <td className="p-4 text-right font-mono text-zinc-350">
                          {isNum && col.std != null ? col.std.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                        </td>
                        <td className="p-4 text-right font-mono text-zinc-350">
                          {isNum && col.min != null ? col.min.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                        </td>
                        <td className="p-4 text-right font-mono text-zinc-350">
                          {isNum && col.max != null ? col.max.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                        </td>
                        <td className={`p-4 text-right font-mono font-bold ${col.null_percentage > 20 ? "text-[#EF4444]" : col.null_percentage > 0 ? "text-[#F59E0B]" : "text-zinc-650"}`}>
                          {col.null_percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Model Diagnostics Section Title */}
      {statList.length > 0 && (
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 pt-4">Model Diagnostics & Inference Tests</h3>
      )}

      {/* Stats List */}
      {statList.length > 0 ? (
        <div className="space-y-5">
          {statList.map((test, idx) => {
            const hInfo = getHypothesisDetails(test.test_name);
            const rating = getStarRating(test.p_value);
            const isSig = !!test.significant;

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-zinc-900 bg-[#09090B] flex flex-col lg:flex-row gap-5 relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-900 to-transparent" />
                
                {/* Left Section: Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 text-[#ea580c]">
                    <Calculator className="w-5 h-5" />
                    <h4 className="font-black text-xs uppercase tracking-widest text-zinc-150">{test.test_name}</h4>
                  </div>
                  
                  <p className="text-zinc-350 text-xs font-semibold leading-relaxed">{test.description}</p>
                  
                  {/* Hypothesis box */}
                  <div className="p-4 rounded-xl border border-zinc-950 bg-black/45 space-y-2 text-[10px] leading-relaxed">
                    <p className="text-zinc-500 font-bold uppercase tracking-wide">{hInfo.concept}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-left">
                      <div>
                        <span className="text-[#EF4444] font-black uppercase tracking-wider block">Null Hypothesis (H₀):</span>
                        <span className="text-zinc-400 font-medium">{hInfo.h0}</span>
                      </div>
                      <div>
                        <span className="text-[#10B981] font-black uppercase tracking-wider block">Alternative Hypothesis (H₁):</span>
                        <span className="text-zinc-400 font-medium">{hInfo.h1}</span>
                      </div>
                    </div>
                  </div>

                  {/* ELI5 Plain English Interpretation */}
                  <div className="p-3 bg-zinc-950/50 border-l-2 border-[#ea580c] pl-3.5 rounded-r-xl">
                    <span className="text-[8px] text-[#ea580c] font-black uppercase tracking-wider block">Plain English Interpretation</span>
                    <p className="text-zinc-300 text-xs font-semibold mt-1 italic">
                      "{test.interpretation}"
                    </p>
                  </div>
                </div>

                {/* Right Section: Scores Box */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 shrink-0 bg-zinc-950 border border-zinc-900 p-4.5 rounded-xl min-w-[220px]">
                  <div className="text-left lg:text-right w-full border-b border-zinc-900/60 pb-2.5">
                    <span className="text-[8px] text-zinc-500 uppercase font-black tracking-wider block">Test Statistic</span>
                    <span className="text-sm font-mono font-black text-zinc-200 mt-0.5">{(test.statistic ?? 0).toFixed(4)}</span>
                  </div>
                  
                  <div className="text-left lg:text-right w-full border-b border-zinc-900/60 pb-2.5">
                    <span className="text-[8px] text-zinc-500 uppercase font-black tracking-wider block">Calculated p-value</span>
                    <span className="text-sm font-mono font-black text-[#ea580c] mt-0.5">{test.p_value.toFixed(4)}</span>
                  </div>

                  <div className="flex flex-col gap-1.5 items-start lg:items-end w-full pt-1">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">{rating}</span>
                    <Badge className={`text-[8px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                      isSig ? "bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]" : "bg-zinc-950 border-zinc-900 text-zinc-500"
                    }`}>
                      {isSig ? "Significant (Reject H₀)" : "Insignificant (Fail to Reject H₀)"}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-2xl border border-zinc-900 bg-[#09090B] text-center max-w-sm mx-auto space-y-4">
          <Calculator className="w-12 h-12 text-zinc-650 mx-auto" />
          <div>
            <h4 className="font-bold text-zinc-300">No tests executed</h4>
            <p className="text-zinc-500 text-xs mt-1 font-semibold">
              This dataset does not show proper distributions to run regression or ANOVA tests.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
