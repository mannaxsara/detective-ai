"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calculator, CheckCircle2, XCircle, Play, Sparkles, HelpCircle, BookOpen, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statisticsAPI } from "@/lib/api";

interface HypothesisTabProps {
  datasetId: number | string;
}

export default function HypothesisTab({ datasetId }: HypothesisTabProps) {
  const [testingIds, setTestingIds] = useState<Record<string, boolean>>({});
  const [testedIds, setTestedIds] = useState<Record<string, boolean>>({});
  const [showGuide, setShowGuide] = useState(true);
  const [alpha, setAlpha] = useState<number>(0.05);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["analysis-statistics", datasetId],
    queryFn: () => statisticsAPI.getStatistics(datasetId),
  });

  const handleTest = (testName: string) => {
    setTestingIds((prev) => ({ ...prev, [testName]: true }));
    
    // Simulate testing calculation duration
    setTimeout(() => {
      setTestingIds((prev) => ({ ...prev, [testName]: false }));
      setTestedIds((prev) => ({ ...prev, [testName]: true }));
    }, 1200);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 animate-pulse font-sans">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 rounded-2xl bg-muted/20 border border-border/40" />
        ))}
      </div>
    );
  }

  const testsList = stats || [];

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Description Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight">Interactive Hypothesis Generator & Tester</h2>
          <p className="text-muted-foreground text-xs font-semibold mt-0.5 uppercase tracking-wider">
            Execute machine learning audit models to statistically validate core assumptions
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-muted/30 border border-border rounded-full px-3 py-1.5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Alpha (α):</span>
            <Select
              value={alpha.toString()}
              onValueChange={(val) => setAlpha(parseFloat(val || "0.05"))}
            >
              <SelectTrigger className="h-5 w-20 border-none bg-transparent text-foreground text-[11px] font-mono font-bold p-0 focus:ring-0 shadow-none cursor-pointer">
                <SelectValue placeholder="Alpha" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground text-[11px] font-mono font-bold">
                <SelectItem value="0.01">0.01 (Strict)</SelectItem>
                <SelectItem value="0.05">0.05 (Std)</SelectItem>
                <SelectItem value="0.10">0.10 (Loose)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="bg-muted/50 border border-border text-muted-foreground text-xs font-bold px-3 py-2 rounded-full shadow-none">
            {testsList.length} Hypotheses Active
          </Badge>
        </div>
      </div>

      {/* Methodology Guide (FAQ Section) */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-none">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full px-5 py-4 bg-muted/30 flex items-center justify-between text-foreground font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>How does the Hypothesis Testing Engine work?</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showGuide ? "rotate-180" : ""}`} />
        </button>
        
        {showGuide && (
          <div className="p-5 border-t border-border/50 bg-muted/20 space-y-4 text-xs leading-relaxed text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <p className="font-extrabold text-primary uppercase text-[10px] tracking-wide">1. Automated Hypothesis Formulation</p>
                <p className="font-semibold text-muted-foreground">
                  Our system scans data profiles for numeric distributions and categorical cross-relations, generating the 
                  <b>Null Hypothesis (H₀ - status quo)</b> and <b>Alternative Hypothesis (H₁ - pattern exists)</b> for you.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-extrabold text-primary uppercase text-[10px] tracking-wide">2. Adjustable Significance Threshold</p>
                <p className="font-semibold text-muted-foreground">
                  You can set α to 0.01, 0.05, or 0.10. A lower alpha requires stronger evidence to reject H₀, while a higher alpha allows softer correlation patterns.
                </p>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border/50 flex flex-wrap gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              <span>⚡ Statistical Standard: α = {alpha}</span>
              <span>•</span>
              <span>✔ Confidence Interval: {(100 - alpha * 100).toFixed(0)}%</span>
              <span>•</span>
              <span>⚙ Methods: ANOVA, Pearson, Chi2</span>
            </div>
          </div>
        )}
      </div>

      {/* Tests Grid */}
      {testsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testsList.map((test: any, index: number) => {
            const isTesting = testingIds[test.test_name];
            const isTested = testedIds[test.test_name];
            const isSignificant = test.p_value < alpha;

            // Dynamically adjust plain-English interpretation based on alpha
            const dynamicInterpretation = isSignificant
              ? test.interpretation
              : test.interpretation.replace(/is statistically significant/g, "is NOT statistically significant").replace(/we reject/g, "we fail to reject");

            return (
              <div
                key={index}
                className={`p-5 rounded-2xl border bg-card hover:border-border/80 transition-all duration-200 flex flex-col justify-between min-h-[220px] relative overflow-hidden shadow-none ${
                  isTested ? "border-primary/30" : "border-border"
                }`}
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[8px] font-mono font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      HYPOTHESIS {index + 1}
                    </span>
                    {isTested && (
                      <Badge
                        variant="outline"
                        className={`text-[8px] uppercase px-2 py-0.5 rounded-full border font-bold tracking-wider ${
                          isSignificant
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-destructive/10 border-destructive/20 text-destructive"
                        }`}
                      >
                        {isSignificant ? "Significant" : "Insignificant"}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-foreground">{test.test_name}</h4>
                  <p className="text-muted-foreground text-[10px] leading-relaxed font-semibold">
                    {test.description}
                  </p>
                </div>

                {/* Body Content */}
                <div className="mt-4 space-y-4">
                  {isTested ? (
                    <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2.5">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-2 bg-muted/50 rounded-lg border border-border">
                          <p className="text-[8px] text-muted-foreground uppercase font-bold">Statistic</p>
                          <p className="text-xs font-mono font-bold text-foreground mt-0.5">
                            {test.statistic != null ? test.statistic.toFixed(4) : "N/A"}
                          </p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg border border-border">
                          <p className="text-[8px] text-muted-foreground uppercase font-bold">p-value</p>
                          <p className={`text-xs font-mono font-bold mt-0.5 ${isSignificant ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                            {test.p_value < 0.0001 ? "< 0.0001" : test.p_value.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-foreground/90 text-[11px] leading-relaxed border-t border-border/60 pt-2.5 font-medium">
                        {isSignificant ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        )}
                        <p className="text-left font-semibold text-muted-foreground italic">"{dynamicInterpretation}"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 text-center flex flex-col items-center justify-center min-h-[90px]">
                      <HelpCircle className="w-5 h-5 text-muted-foreground/60 mb-1.5" />
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Hypothesis generated but not evaluated</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleTest(test.test_name)}
                    disabled={isTesting || isTested}
                    className={`w-full h-10 text-xs rounded-xl flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                      isTested
                        ? "bg-muted/50 border border-border text-muted-foreground cursor-default"
                        : "bg-primary/10 border border-primary/20 hover:bg-primary/20 text-foreground"
                    }`}
                  >
                    {isTesting ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-primary animate-spin" />
                        Executing Test...
                      </>
                    ) : isTested ? (
                      "Evaluated"
                    ) : (
                      <>
                        <Play className="w-3 h-3 text-primary fill-primary/10" />
                        Execute Test
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-2xl border border-border bg-card/50 text-center max-w-sm mx-auto space-y-4 shadow-none">
          <Calculator className="w-12 h-12 text-muted-foreground/60 mx-auto" />
          <div>
            <h4 className="font-bold text-foreground">No hypotheses created</h4>
            <p className="text-muted-foreground text-xs mt-1 font-semibold">
              This dataset does not show proper distributions to formulate test models.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
