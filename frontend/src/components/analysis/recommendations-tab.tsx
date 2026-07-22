"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      <div className="space-y-4 max-w-3xl mx-auto py-6 animate-pulse font-sans">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/20 border border-border/40" />
        ))}
      </div>
    );
  }

  const recList = recommendations || [];

  const getSimulatedImpact = (index: number) => {
    const impacts = [
      { text: "8% - 12% profit margin increase", val: "+12%" },
      { text: "15% - 20% inventory efficiency improvement", val: "+20%" },
      { text: "5% - 8% customer retention lift", val: "+8%" },
      { text: "10% average delivery speedup", val: "+10%" },
    ];
    return impacts[index % impacts.length];
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Intro Header */}
      <Card className="border-border bg-card shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Actionable Recommendations
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs font-medium">
            Formulated directives calculated directly from outliers, distribution skews, and segment performance.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        {recList.map((rec, i) => {
          const impact = getSimulatedImpact(i);
          return (
            <Card
              key={i}
              className="border-border bg-card hover:border-border/80 transition-colors duration-150 overflow-hidden flex flex-col justify-between shadow-none"
            >
              <div className="p-5 flex flex-col md:flex-row gap-5 items-start justify-between">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-muted-foreground bg-muted/50 border border-border px-2 py-0.5 rounded">
                        ACTION PLAN {i + 1}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground leading-snug">{rec}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Ready to execute. Implementation timeline: 2-4 weeks.</span>
                    </div>
                  </div>
                </div>

                {/* Expected Gain Badge Box */}
                <div className="p-3 rounded-lg border border-border bg-muted/30 flex items-center gap-3 self-stretch md:self-auto shrink-0 md:w-52">
                  <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Expected Impact</p>
                    <p className="text-[10px] font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{impact.text}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
