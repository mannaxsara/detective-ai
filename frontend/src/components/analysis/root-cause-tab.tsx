"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowDown, ClipboardList, Lightbulb, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { analysisAPI } from "@/lib/api";

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
      <div className="space-y-4 animate-pulse max-w-2xl mx-auto py-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className="h-16 w-full rounded-2xl bg-white/[0.01] border border-zinc-900" />
            {i < 5 && <ArrowDown className="w-4 h-4 text-zinc-800" />}
          </div>
        ))}
      </div>
    );
  }

  const nodes = rootCause || [];
  const rootNode = nodes[nodes.length - 1] || {};

  // Custom action plan builder based on final root cause
  const getActionPlan = (rootCauseReason: string) => {
    const text = (rootCauseReason || "").toLowerCase();
    
    if (text.includes("odor") || text.includes("poisonous")) {
      return {
        title: "Feature Correlation Action Plan",
        steps: [
          "Deploy odor feature checks as a primary classifier filter.",
          "Perform double-verification checks on scent-neutral classifications.",
          "Correlate primary cluster patterns across adjacent categorical fields."
        ]
      };
    }
    
    return {
      title: "Data Variance Correction Action Plan",
      steps: [
        "Audit data collection sources for the flagged outlier column.",
        "Implement verification validation rules to block future skewed values.",
        "Run statistical verification checks on the updated data segment weekly."
      ]
    };
  };

  const actionPlan = getActionPlan(rootNode.reason || "");

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left font-sans">
      
      {/* Description Header */}
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">Root Cause Diagnosis (5 Whys Investigation)</h2>
        <p className="text-zinc-555 text-xs font-semibold mt-0.5 uppercase tracking-wider">
          Traces data variances and categorical skew down to core structural reasons
        </p>
      </div>

      {/* Vertical Diagnostic Timeline */}
      {nodes.length > 0 ? (
        <div className="space-y-3">
          <div className="relative flex flex-col items-center space-y-3">
            {nodes.map((node: any, i: number) => {
              const isLast = i === nodes.length - 1;
              return (
                <React.Fragment key={i}>
                  <div className="w-full relative group">
                    <div
                      className={`p-4 rounded-2xl border transition-all duration-200 relative flex items-start gap-4 ${
                        isLast
                          ? "border-[#EF4444]/30 bg-[#EF4444]/[0.01]"
                          : "border-zinc-900 bg-zinc-950/45 hover:border-zinc-800"
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                        isLast
                          ? "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]"
                          : "bg-black border-zinc-900 text-[#ea580c]"
                      }`}>
                        <span className="text-xs font-mono font-bold">W{i + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-zinc-550 text-[9px] font-bold uppercase tracking-wider">Why Level {i + 1}</span>
                          <Badge className={`text-[8px] px-2 py-0.5 border font-mono font-bold rounded-full uppercase tracking-wider ${
                            isLast
                              ? "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]"
                              : "bg-black border-zinc-900 text-zinc-400"
                          }`}>
                            {node.confidence}% Confidence
                          </Badge>
                        </div>
                        <h4 className="font-bold text-xs text-zinc-200 mt-1.5">{node.why}</h4>
                        <p className="text-zinc-400 text-xs mt-1 leading-relaxed font-semibold">{node.reason}</p>
                      </div>
                    </div>
                  </div>
                  
                  {!isLast && (
                    <div className="flex items-center justify-center h-6">
                      <ArrowDown className="w-4 h-4 text-zinc-800" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Actionable Remediation Summary Card */}
          <div className="p-5.5 rounded-2xl border border-zinc-900 bg-[#09090B] mt-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#ea580c]/15 to-transparent" />
            
            <div className="flex items-center gap-2.5 text-[#ea580c] border-b border-zinc-900/60 pb-3">
              <ClipboardList className="w-5 h-5" />
              <h4 className="font-black text-xs uppercase tracking-widest text-zinc-150">Actionable Remediation Summary</h4>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-black/45 border border-zinc-900 rounded-xl">
                <span className="text-[8px] text-zinc-550 font-bold uppercase tracking-wider block">Identified Root Cause (Level 5)</span>
                <p className="text-zinc-300 text-xs font-bold mt-1.5">
                  "{rootNode.reason}"
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[8px] text-[#ea580c] font-black uppercase tracking-wider block">{actionPlan.title}</span>
                <div className="space-y-2 pt-1">
                  {actionPlan.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 pl-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-zinc-400 text-xs font-semibold">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl border border-zinc-900 bg-[#09090B] text-center max-w-sm mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-zinc-650 mx-auto" />
          <div>
            <h4 className="font-bold text-zinc-300">Root Cause Diagnosis Unavailable</h4>
            <p className="text-zinc-555 text-xs mt-1 font-semibold">
              This dataset does not show sufficient variables to compute structural root cause tracks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
