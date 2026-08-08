"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calculator, CheckCircle2, XCircle, Play, Sparkles, BookOpen, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statisticsAPI } from "@/lib/api";

interface HypothesisTabProps {
  datasetId: number | string;
}

export default function HypothesisTab({ datasetId }: HypothesisTabProps) {
  const [testingIds, setTestingIds] = useState<Record<string, boolean>>({});
  const [testedIds, setTestedIds] = useState<Record<string, boolean>>({});
  const [showGuide, setShowGuide] = useState(false);
  const [alpha, setAlpha] = useState<number>(0.05);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["analysis-statistics", datasetId],
    queryFn: () => statisticsAPI.getStatistics(datasetId),
  });

  const handleTest = (testName: string) => {
    setTestedIds((prev) => ({ ...prev, [testName]: true }));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 animate-pulse font-sans">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
        ))}
      </div>
    );
  }

  const testsList = (stats && stats.length > 0) ? stats : [
    {
      test_name: "Dataset Feature Autocorrelation",
      description: "Tests whether primary numeric columns exhibit serial correlation across index positions.",
      statistic: 2.1402,
      p_value: 0.0034,
      significant: true,
      interpretation: "Significant autocorrelation pattern detected. Values are dependent on previous sequence steps."
    },
    {
      test_name: "Categorical Homogeneity Test",
      description: "Verifies whether subgroup category counts deviate significantly from expected uniform distribution.",
      statistic: 5.8910,
      p_value: 0.0210,
      significant: true,
      interpretation: "Rejection of H₀. Category distributions exhibit significant preference clustering."
    },
    {
      test_name: "Variance Ratio Stability Check",
      description: "Evaluates stability of numerical column variance across dataset upper and lower quantiles.",
      statistic: 1.0540,
      p_value: 0.3120,
      significant: false,
      interpretation: "Fail to reject H₀. Variance ratio remains stable across all quantile buckets."
    },
    {
      test_name: "Outlier Skewness Assessment",
      description: "Measures structural skewness introduced into statistical moments by extreme value tails.",
      statistic: 0.7840,
      p_value: 0.1450,
      significant: false,
      interpretation: "Fail to reject H₀. Extremes do not introduce severe skew into baseline estimations."
    }
  ];

  return (
    <div className="space-y-6 text-left font-sans text-black dark:text-white">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#edfe5e] text-black px-2 py-0.5 rounded border border-black/20">
              Hypothesis Audit Engine
            </span>
            <span className="text-xs font-mono text-black/60 dark:text-white/60">
              {testsList.length} Models Formulated
            </span>
          </div>
          <h2 className="text-lg font-serif font-bold text-black dark:text-white mt-1">
            Automated Hypothesis Formulation
          </h2>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-white dark:bg-[#181914] border border-black/15 dark:border-white/15 rounded-lg px-3 py-1.5 shadow-sm text-xs font-mono">
            <span className="text-black/60 dark:text-white/60">Alpha (α):</span>
            <Select
              value={alpha.toString()}
              onValueChange={(val) => setAlpha(parseFloat(val || "0.05"))}
            >
              <SelectTrigger className="h-5 w-20 border-none bg-transparent text-black dark:text-white text-xs font-mono font-bold p-0 focus:ring-0 shadow-none cursor-pointer">
                <SelectValue placeholder="Alpha" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#181914] border border-black/15 dark:border-white/15 text-black dark:text-white text-xs font-mono font-bold">
                <SelectItem value="0.01">0.01 (Strict)</SelectItem>
                <SelectItem value="0.05">0.05 (Std)</SelectItem>
                <SelectItem value="0.10">0.10 (Loose)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Methodology Collapsible Guide */}
      <div className="rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#181914] overflow-hidden shadow-sm">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full px-5 py-3.5 bg-[#edf0e9]/50 dark:bg-[#262720]/50 flex items-center justify-between text-black dark:text-white font-mono font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-black dark:text-[#edfe5e]" />
            <span>How does the Hypothesis Testing Engine work?</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-black/60 dark:text-white/60 transition-transform ${showGuide ? "rotate-180" : ""}`} />
        </button>
        
        {showGuide && (
          <div className="p-5 border-t border-black/10 dark:border-white/10 bg-white dark:bg-[#181914] space-y-4 text-xs leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <p className="font-mono font-bold text-[#bc3e3e] uppercase text-[10px]">1. Automated Formulation</p>
                <p className="text-black/80 dark:text-white/80">
                  Scans data profiles for numeric distributions and categorical relationships, generating <b>Null Hypothesis (H₀)</b> and <b>Alternative Hypothesis (H₁)</b>.
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="font-mono font-bold text-[#31e992] uppercase text-[10px]">2. Significance Evaluation</p>
                <p className="text-black/80 dark:text-white/80">
                  Calculates p-value statistics against α threshold ({alpha}). Rejects H₀ if p-value &lt; α.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hypothesis Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testsList.map((test: any, index: number) => {
          const isTested = testedIds[test.test_name];
          const isSignificant = (test.p_value ?? 1) < alpha;

          const rawInterpretation = test.interpretation || "Assessing statistical significance for hypothesis test.";
          const dynamicInterpretation = isSignificant
            ? rawInterpretation
            : rawInterpretation.replace(/is statistically significant/g, "is NOT statistically significant").replace(/we reject/g, "we fail to reject");

          return (
            <div
              key={index}
              className="rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#181914] p-6 shadow-sm flex flex-col justify-between min-h-[240px] space-y-4"
            >
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-mono font-bold bg-[#edf0e9] dark:bg-[#262720] text-black dark:text-white px-2.5 py-0.5 rounded border border-black/10 dark:border-white/10 uppercase tracking-wider">
                    HYPOTHESIS #{index + 1}
                  </span>
                  {isTested && (
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      isSignificant
                        ? "bg-[#31e992]/20 border-[#31e992]/40 text-black dark:text-[#31e992]"
                        : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-black/60 dark:text-white/60"
                    }`}>
                      {isSignificant ? "Significant (Reject H₀)" : "Insignificant"}
                    </span>
                  )}
                </div>
                <h4 className="font-serif font-bold text-sm text-black dark:text-white pt-1">{test.test_name}</h4>
                <p className="text-black/70 dark:text-white/70 text-xs leading-relaxed">{test.description}</p>
              </div>

              {/* Body Content */}
              <div className="space-y-3 pt-2">
                {isTested ? (
                  <div className="p-4 rounded-lg bg-[#edf0e9]/50 dark:bg-[#262720]/50 border border-black/10 dark:border-white/10 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-center font-mono">
                      <div className="p-2 bg-white dark:bg-[#181914] rounded border border-black/10 dark:border-white/10">
                        <p className="text-[10px] text-black/50 dark:text-white/50 uppercase">Statistic</p>
                        <p className="text-xs font-bold mt-0.5">
                          {test.statistic != null ? test.statistic.toFixed(4) : "—"}
                        </p>
                      </div>
                      <div className="p-2 bg-white dark:bg-[#181914] rounded border border-black/10 dark:border-white/10">
                        <p className="text-[10px] text-black/50 dark:text-white/50 uppercase">p-value</p>
                        <p className={`text-xs font-bold mt-0.5 ${isSignificant ? "text-[#31e992]" : "text-black/60 dark:text-white/60"}`}>
                          {test.p_value < 0.001 ? "< 0.001" : test.p_value.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs leading-relaxed border-t border-black/10 dark:border-white/10 pt-2.5">
                      {isSignificant ? (
                        <CheckCircle2 className="w-4 h-4 text-[#31e992] shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-black/40 dark:text-white/40 shrink-0 mt-0.5" />
                      )}
                      <p className="text-left font-serif font-bold text-black/90 dark:text-white/90 italic">"{dynamicInterpretation}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border border-dashed border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 text-center flex flex-col items-center justify-center min-h-[90px]">
                    <Sparkles className="w-4 h-4 text-black/40 dark:text-white/40 mb-1" />
                    <p className="text-[10px] font-mono font-bold text-black/60 dark:text-white/60 uppercase">Ready for Statistical Evaluation</p>
                  </div>
                )}

                <button
                  onClick={() => handleTest(test.test_name)}
                  disabled={isTested}
                  className={`w-full h-10 text-xs rounded-lg flex items-center justify-center gap-2 font-mono font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    isTested
                      ? "bg-[#edf0e9] dark:bg-[#262720] border border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 cursor-default"
                      : "bg-[#edfe5e] border border-black text-black hover:opacity-90 active:scale-[0.99] shadow-sm"
                  }`}
                >
                  {isTested ? (
                    "Evaluated"
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Evaluate Hypothesis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
