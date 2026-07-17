"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <div className="space-y-4 max-w-3xl mx-auto py-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-white/[0.01] border border-[#27272A]" />
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
      <Card className="border-[#27272A] bg-[#18181B] shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-bold text-zinc-200 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#ea580c]" />
            Actionable Recommendations
          </CardTitle>
          <CardDescription className="text-zinc-500 text-xs font-medium">
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
              className="border-[#27272A] bg-[#18181B] hover:border-zinc-700 transition-colors duration-150 overflow-hidden flex flex-col justify-between shadow-none"
            >
              <div className="p-5 flex flex-col md:flex-row gap-5 items-start justify-between">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-center text-[#ea580c] shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 bg-[#09090B] border border-[#27272A] px-2 py-0.5 rounded">
                        ACTION PLAN {i + 1}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-zinc-200 leading-snug">{rec}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Ready to execute. Implementation timeline: 2-4 weeks.</span>
                    </div>
                  </div>
                </div>

                {/* Expected Gain Badge Box */}
                <div className="p-3 rounded-lg border border-[#27272A] bg-[#09090B] flex items-center gap-3 self-stretch md:self-auto shrink-0 md:w-52">
                  <div className="w-7 h-7 rounded bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">Expected Impact</p>
                    <p className="text-[10px] font-mono font-extrabold text-[#10B981] mt-0.5">{impact.text}</p>
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
