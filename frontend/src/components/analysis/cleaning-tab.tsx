"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { cleaningAPI, datasetsAPI } from "@/lib/api";
import { LoaderOne } from "@/components/ui/loader";
import { FunnelChart, type FunnelStage } from "@/components/ui/chart-funnel";

interface CleaningTabProps {
  datasetId: number | string;
}

export default function CleaningTab({ datasetId }: CleaningTabProps) {
  const queryClient = useQueryClient();
  const [applying, setApplying] = useState<string | null>(null);
  const [appliedFixIds, setAppliedFixIds] = useState<string[]>([]);

  const { data: cleanData, isLoading, isError, refetch } = useQuery({
    queryKey: ["cleaning-suggestions", datasetId],
    queryFn: () => cleaningAPI.getSuggestions(datasetId),
  });

  const { data: profile } = useQuery({
    queryKey: ["dataset-profile", datasetId],
    queryFn: () => datasetsAPI.getProfile(datasetId),
  });

  const applyFixMutation = useMutation({
    mutationFn: (fixId: string) => cleaningAPI.applyFixes(datasetId, [fixId]),
    onSuccess: (data) => {
      toast.success(data.message || "Fix successfully applied!");
      if (data?.applied?.length) {
        setAppliedFixIds((prev) => [...new Set([...prev, ...data.applied])]);
      }
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
      <div className="space-y-4 animate-pulse font-sans">
        {[1, 2].map((i) => (
          <div key={i} className="h-28 rounded-[18px] bg-[#edf0e9] dark:bg-[#262720] border border-black/15 dark:border-white/15" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-8 text-center font-sans shadow-[4px_4px_0px_#000000]">
        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-[#bc3e3e]" />
        <h4 className="font-serif font-bold text-black dark:text-white">Failed to load cleaning suggestions</h4>
        <p className="text-black/70 dark:text-white/70 text-xs mt-1 font-medium">
          The data quality engine could not analyze this dataset.
        </p>
        <button
          onClick={() => refetch()}
          className="btn-ink-accent text-xs py-2 px-4 font-mono uppercase font-bold cursor-pointer mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  const suggestions = cleanData?.suggestions || [];
  const totalIssues = cleanData?.total_issues || 0;
  const appliedCount = appliedFixIds.length;
  const remainingIssues = Math.max(0, totalIssues - appliedCount);

  const cleaningPipeline: FunnelStage[] = [
    { label: 'Issues Found', value: totalIssues, displayValue: String(totalIssues) },
    { label: 'Issues Resolved', value: appliedCount, displayValue: String(appliedCount) },
    { label: 'Remaining Issues', value: remainingIssues, displayValue: String(remainingIssues) },
  ];

  return (
    <div className="space-y-6 font-sans text-black dark:text-white text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/15 dark:border-white/15 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#edfe5e] text-black px-2 py-0.5 rounded border border-black/20">
              Data Cleaning
            </span>
            <span className="text-xs font-mono text-black/60 dark:text-white/60">
              {totalIssues} Issues Tracked · {profile?.row_count?.toLocaleString() ?? "—"} Records Scanned
            </span>
          </div>
          <h2 className="text-lg font-serif font-bold text-black dark:text-white mt-1">
            Data Quality & Sanitization Directives
          </h2>
        </div>
      </div>

      {/* Render Pipeline Funnel ONLY if total issues exist */}
      {totalIssues > 0 && (
        <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-6 space-y-3 shadow-[4px_4px_0px_#000000]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">Cleaning Pipeline</h3>
          <FunnelChart data={cleaningPipeline} height={120} />
        </div>
      )}

      {/* Issues Listing */}
      {suggestions.length > 0 ? (
        <div className="space-y-4">
          {suggestions.map((issue: any) => {
            const severity = issue.severity === "critical" ? "critical" : issue.severity === "warning" ? "warning" : "info";
            const severityMeta = {
              critical: { Icon: AlertCircle, box: "bg-[#bc3e3e]/10 border-[#bc3e3e]/30 text-[#bc3e3e]" },
              warning: { Icon: AlertTriangle, box: "bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#b45309] dark:text-[#f59e0b]" },
              info: { Icon: Info, box: "bg-[#bed4fb]/20 border-[#bed4fb]/40 text-[#3b6fd4]" },
            } as const;
            const { Icon, box } = severityMeta[severity];

            return (
              <div key={issue.fix_id} className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-6 shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg border shrink-0 mt-0.5 ${box}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                        {(issue.issue_type || "quality_issue").replace(/_/g, " ").toUpperCase()}
                      </span>
                      {issue.column && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-black/10 dark:border-white/10 bg-[#edf0e9] dark:bg-[#262720] text-black dark:text-white uppercase">
                          {issue.column}
                        </span>
                      )}
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${box}`}>
                        {severity}
                      </span>
                    </div>
                    <p className="text-black/85 dark:text-white/85 text-xs sm:text-sm font-serif font-bold">{issue.description || "Data anomaly identified."}</p>
                    <p className="text-[11px] font-sans text-black/70 dark:text-white/70">
                      Suggested Action: <span className="text-black font-mono font-bold bg-[#edfe5e] px-1.5 py-0.5 rounded border border-black/20">{issue.suggested_fix || "Automated cleanup"}</span>
                    </p>
                    <p className="text-[11px] font-mono text-black/60 dark:text-white/60">
                      {typeof issue.affected_count === "number" && (
                        <span className="font-bold text-black dark:text-white">{issue.affected_count.toLocaleString()} rows</span>
                      )}
                      {typeof issue.affected_percentage === "number" && (
                        <span> ({issue.affected_percentage}%)</span>
                      )}
                      {" · "}
                      <span className="uppercase">fix {issue.fix_id}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleApplyFix(issue.fix_id)}
                  disabled={appliedFixIds.includes(issue.fix_id) || applying === issue.fix_id}
                  className="btn-ink-accent text-xs py-2.5 px-5 font-mono uppercase font-bold cursor-pointer shrink-0 w-full sm:w-auto mt-3 sm:mt-0 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {appliedFixIds.includes(issue.fix_id) ? (
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle className="w-4 h-4" />
                      Applied
                    </span>
                  ) : applying === issue.fix_id ? (
                    <span className="flex items-center gap-1.5 font-bold">
                      <LoaderOne />
                      Fixing...
                    </span>
                  ) : (
                    "Apply Fix"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[18px] border border-dashed border-black/30 dark:border-white/30 bg-white dark:bg-[#1c1d18] py-16 text-center shadow-[4px_4px_0px_#000000]">
          <div className="w-12 h-12 rounded-lg bg-[#31e992]/20 border border-[#31e992]/40 flex items-center justify-center mx-auto mb-3 text-[#31e992] font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="font-serif font-bold text-black dark:text-white text-base">Your dataset is perfectly clean!</h4>
          <p className="text-black/70 dark:text-white/70 text-xs mt-1 font-sans max-w-xs mx-auto font-medium">
            We couldn&apos;t detect any formatting, duplicates, missing values, or outlier issues.
          </p>
        </div>
      )}
    </div>
  );
}
