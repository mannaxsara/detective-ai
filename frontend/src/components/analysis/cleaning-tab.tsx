"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cleaningAPI } from "@/lib/api";
import { LoaderOne } from "@/components/ui/loader";

interface CleaningTabProps {
  datasetId: number | string;
}

export default function CleaningTab({ datasetId }: CleaningTabProps) {
  const queryClient = useQueryClient();
  const [applying, setApplying] = useState<string | null>(null);

  const { data: cleanData, isLoading, refetch } = useQuery({
    queryKey: ["cleaning-suggestions", datasetId],
    queryFn: () => cleaningAPI.getSuggestions(datasetId),
  });

  const applyFixMutation = useMutation({
    mutationFn: (fixId: string) => cleaningAPI.applyFixes(datasetId, [fixId]),
    onSuccess: (data) => {
      toast.success(data.message || "Fix successfully applied!");
      // Invalidate ALL cached queries for this dataset so every tab refetches
      queryClient.invalidateQueries({ queryKey: ["dataset", datasetId] });
      queryClient.invalidateQueries({ queryKey: ["dataset-profile", datasetId] });
      queryClient.invalidateQueries({ queryKey: ["analysis", datasetId] });
      queryClient.invalidateQueries({ queryKey: ["analysis-anomalies", datasetId] });
      queryClient.invalidateQueries({ queryKey: ["analysis-statistics", datasetId] });
      queryClient.invalidateQueries({ queryKey: ["analysis-kpis", datasetId] });
      queryClient.invalidateQueries({ queryKey: ["analysis-insights", datasetId] });
      queryClient.invalidateQueries({ queryKey: ["analysis-charts", datasetId] });
      queryClient.invalidateQueries({ queryKey: ["analysis-forecast", datasetId] });
      queryClient.invalidateQueries({ queryKey: ["analysis-recommendations", datasetId] });
      queryClient.invalidateQueries({ queryKey: ["analysis-rootcause", datasetId] });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to apply requested fix.");
    },
    onSettled: () => {
      setApplying(null);
    },
  });

  const handleApplyFix = (fixId: string) => {
    setApplying(fixId);
    applyFixMutation.mutate(fixId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-[#111217]/50 border border-[#27272A]" />
        ))}
      </div>
    );
  }

  const suggestions = cleanData?.suggestions || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-200">Data Cleaning Suggestions</h2>
          <p className="text-xs text-zinc-500 mt-0.5 font-medium">
            Identify formatting inconsistencies, missing values, duplicates, or negative quantities.
          </p>
        </div>
        <Badge className="text-xs bg-[#ea580c]/10 border border-[#ea580c]/20 text-[#ea580c] font-bold px-3 py-1 rounded-lg">
          {cleanData?.total_issues || 0} Quality Flags
        </Badge>
      </div>

      {suggestions.length > 0 ? (
        <div className="space-y-4">
          {suggestions.map((issue: any) => {
            let badgeColor = "bg-[#ea580c]/10 border-[#ea580c]/20 text-[#ea580c]";
            let Icon = Info;
            if (issue.severity === "critical") {
              badgeColor = "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]";
              Icon = AlertCircle;
            } else if (issue.severity === "warning") {
              badgeColor = "bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]";
              Icon = AlertTriangle;
            }

            return (
              <Card key={issue.fix_id} className="border-[#27272A] bg-[#111217] shadow-xl hover:border-zinc-700 transition-all duration-200">
                <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg border ${badgeColor} shrink-0 mt-0.5`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-zinc-200">
                          {issue.issue_type.replace("_", " ").toUpperCase()}
                        </span>
                        {issue.column && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-zinc-950 border-[#27272A] text-zinc-400 font-mono">
                            {issue.column}
                          </Badge>
                        )}
                      </div>
                      <p className="text-zinc-300 text-xs sm:text-sm mt-1.5 font-semibold">{issue.description}</p>
                      <p className="text-[11px] text-zinc-500 mt-1 font-semibold">
                        Suggested Action: <span className="text-[#ea580c] font-bold">{issue.suggested_fix}</span>
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleApplyFix(issue.fix_id)}
                    disabled={applying === issue.fix_id}
                    className="relative bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-[#f97316] hover:to-[#ea580c] text-zinc-950 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-lg hover:scale-[1.01] transition-all cursor-pointer shadow-md disabled:opacity-50 shrink-0"
                  >
                    {applying === issue.fix_id ? (
                      <span className="flex items-center gap-1.5 font-bold">
                        <LoaderOne />
                        Fixing...
                      </span>
                    ) : (
                      "Apply Fix"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-[#27272A] bg-[#111217]/30 border-dashed py-16 text-center">
          <CardContent className="space-y-4">
            <CheckCircle className="w-12 h-12 text-[#10B981] mx-auto" />
            <div>
              <h4 className="font-bold text-zinc-300 text-sm uppercase tracking-wide">Your dataset is perfectly clean!</h4>
              <p className="text-zinc-500 text-xs mt-1 font-semibold">
                We couldn't detect any formatting, duplicates, missing values, or outlier issues.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
