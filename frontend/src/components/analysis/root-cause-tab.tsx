"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowDown, ClipboardList, ShieldCheck } from "lucide-react";
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
      <div className="space-y-4 animate-pulse max-w-2xl mx-auto py-6 font-sans">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className="h-16 w-full rounded-2xl bg-muted/20 border border-border/40" />
            {i < 5 && <ArrowDown className="w-4 h-4 text-muted-foreground/40" />}
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
        <h2 className="text-base font-bold text-foreground tracking-tight">Root Cause Diagnosis (5 Whys Investigation)</h2>
        <p className="text-muted-foreground text-xs font-semibold mt-0.5 uppercase tracking-wider">
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
                          ? "border-destructive/30 bg-destructive/10"
                          : "border-border bg-card hover:border-border/80"
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                        isLast
                          ? "bg-destructive/10 border-destructive/20 text-destructive"
                          : "bg-primary/10 border-primary/20 text-primary"
                      }`}>
                        <span className="text-xs font-mono font-bold">W{i + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">Why Level {i + 1}</span>
                          <Badge variant="outline" className={`text-[8px] px-2 py-0.5 border font-mono font-bold rounded-full uppercase tracking-wider ${
                            isLast
                              ? "bg-destructive/10 border-destructive/20 text-destructive"
                              : "bg-muted/50 border-border text-muted-foreground"
                          }`}>
                            {node.confidence}% Confidence
                          </Badge>
                        </div>
                        <h4 className="font-bold text-xs text-foreground mt-1.5">{node.why}</h4>
                        <p className="text-muted-foreground text-xs mt-1 leading-relaxed font-semibold">{node.reason}</p>
                      </div>
                    </div>
                  </div>
                  
                  {!isLast && (
                    <div className="flex items-center justify-center h-6">
                      <ArrowDown className="w-4 h-4 text-muted-foreground/60" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Actionable Remediation Summary Card */}
          <div className="p-5.5 rounded-2xl border border-border bg-card mt-6 space-y-4 relative overflow-hidden shadow-none">
            <div className="flex items-center gap-2.5 text-primary border-b border-border pb-3">
              <ClipboardList className="w-5 h-5" />
              <h4 className="font-black text-xs uppercase tracking-widest text-foreground">Actionable Remediation Summary</h4>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-muted/30 border border-border rounded-xl">
                <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider block">Identified Root Cause (Level 5)</span>
                <p className="text-foreground text-xs font-bold mt-1.5">
                  "{rootNode.reason}"
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[8px] text-primary font-black uppercase tracking-wider block">{actionPlan.title}</span>
                <div className="space-y-2 pt-1">
                  {actionPlan.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 pl-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-muted-foreground text-xs font-semibold">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl border border-border bg-card/50 text-center max-w-sm mx-auto space-y-4 shadow-none">
          <AlertCircle className="w-12 h-12 text-muted-foreground/60 mx-auto" />
          <div>
            <h4 className="font-bold text-foreground">Root Cause Diagnosis Unavailable</h4>
            <p className="text-muted-foreground text-xs mt-1 font-semibold">
              This dataset does not show sufficient variables to compute structural root cause tracks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
