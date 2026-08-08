"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  Database,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Trash2,
  ArrowUpRight,
  ShieldAlert,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { datasetsAPI, historyAPI } from "@/lib/api";
import { useAnalysisStore } from "@/store/analysis-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function DashboardMetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  progress,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: string;
  progress?: number;
}) {
  return (
    <div className="p-6 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#181914] text-black dark:text-white flex flex-col justify-between shadow-sm min-h-[175px] transition-all hover:-translate-y-0.5 hover:border-black/30 dark:hover:border-white/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-mono uppercase font-bold tracking-wider text-black/70 dark:text-white/70 leading-tight pt-1">{title}</p>
        <div className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl border-2 border-black bg-[#edfe5e] text-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]">
          <Icon size={26} className="text-black shrink-0 stroke-[2.5]" />
        </div>
      </div>
      
      <div className="my-3 space-y-2">
        <p className="text-3xl font-mono font-bold text-black dark:text-white tracking-tight">{value}</p>
        {progress !== undefined && (
          <div className="w-full h-2.5 rounded-full bg-[#edf0e9] dark:bg-[#262720] border border-black/10 dark:border-white/10 overflow-hidden">
            <div
              className="h-full bg-[#31e992] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-black/60 dark:text-white/60 pt-3 border-t border-black/10 dark:border-white/10">
        <span className="truncate">{description}</span>
        {trend && (
          <span className="text-black dark:text-[#31e992] font-bold bg-[#31e992]/20 border border-[#31e992]/40 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setDataset, setAnalysis, setActiveTab } = useAnalysisStore();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: datasetsData, isLoading: isDatasetsLoading } = useQuery({
    queryKey: ["datasets"],
    queryFn: () => datasetsAPI.list(0, 50),
  });

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["history-recent"],
    queryFn: () => historyAPI.list(1, 10),
  });

  const datasetsList = datasetsData?.datasets || [];
  const totalCases = datasetsData?.total || 0;

  const totalRowsParsed = datasetsList.reduce((acc: number, d: any) => acc + (d.row_count || 0), 0);
  const totalColumnsScanned = datasetsList.reduce((acc: number, d: any) => acc + (d.column_count || 0), 0);
  const avgHealthScore = datasetsList.length > 0
    ? Math.round(datasetsList.reduce((acc: number, d: any) => acc + (d.health_score || 95), 0) / datasetsList.length)
    : 100;

  const handleOpenCase = (caseId: string | number, tabName = "profile") => {
    setActiveTab(tabName);
    router.push(`/analysis/${caseId}`);
  };

  const promptDeleteDataset = (datasetItem: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setDatasetToDelete(datasetItem);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteDataset = async () => {
    if (!datasetToDelete) return;
    setIsDeleting(true);
    try {
      await datasetsAPI.delete(datasetToDelete.id);
      toast.success(`Case file "${datasetToDelete.name}" deleted from repository.`);
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      queryClient.invalidateQueries({ queryKey: ["history-recent"] });
      setDeleteConfirmOpen(false);
    } catch (err) {
      toast.error("Failed to delete case file.");
    } finally {
      setIsDeleting(false);
      setDatasetToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans text-black dark:text-white bg-[#f9f9f7] dark:bg-[#11120d]">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#edfe5e] text-black px-2 py-0.5 rounded border border-black/20">
              Active Session
            </span>
            <span className="text-xs font-mono text-black/60 dark:text-white/60">
              v2.4.0 Rust Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-black dark:text-white tracking-tight">
            Forensics Command Center
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/upload">
            <button className="btn-ink-accent text-xs py-2.5 px-5 font-mono uppercase tracking-wider font-bold cursor-pointer inline-flex items-center gap-2 shadow-sm">
              <Upload className="w-4 h-4 text-black" />
              File New Evidence
            </button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardMetricCard
          title="Average Case Health"
          value={`${avgHealthScore}%`}
          description="Overall dataset structural validity"
          icon={CheckCircle2}
          trend="+2.4%"
          progress={avgHealthScore}
        />
        <DashboardMetricCard
          title="Total Records Logged"
          value={totalRowsParsed.toLocaleString()}
          description="Total data rows parsed & profiled"
          icon={Database}
          trend="Polars SIMD"
        />
        <DashboardMetricCard
          title="Attributes Scanned"
          value={totalColumnsScanned}
          description="Features evaluated for 3-sigma drift"
          icon={Activity}
        />
        <DashboardMetricCard
          title="Active Cases"
          value={totalCases}
          description="Repository evidence datasets"
          icon={FolderOpen}
        />
      </div>

      {/* Main Content Split: Recent Cases Table + Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Active Case Files Table */}
        <div className="lg:col-span-2 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-black dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-black dark:text-[#edfe5e]" />
              Recent Evidence Repository
            </h2>
            <Link
              href="/history"
              className="text-xs font-mono font-bold uppercase text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white flex items-center gap-1 hover:underline"
            >
              View All Archives <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="border border-black/15 dark:border-white/15 rounded-xl bg-white dark:bg-[#181914] overflow-hidden shadow-sm">
            {isDatasetsLoading ? (
              <div className="p-8 text-center space-y-3 font-mono text-xs animate-pulse">
                <div className="h-6 bg-black/5 dark:bg-white/5 rounded max-w-sm mx-auto" />
                <div className="h-6 bg-black/5 dark:bg-white/5 rounded max-w-md mx-auto" />
              </div>
            ) : datasetsList.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#edfe5e]/20 border border-[#edfe5e] flex items-center justify-center mx-auto text-black dark:text-white">
                  <Upload className="w-6 h-6 text-[#31e992]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-serif font-bold text-black dark:text-white">No Evidence Uploaded Yet</h3>
                  <p className="text-xs font-sans text-black/60 dark:text-white/60 max-w-xs mx-auto">
                    Upload your first CSV, Excel, or Parquet file to begin forensic profiling.
                  </p>
                </div>
                <Link href="/upload" className="inline-block pt-2">
                  <button className="btn-ink-accent text-xs py-2 px-4 font-mono uppercase font-bold">
                    Upload First Case
                  </button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 bg-[#edf0e9]/50 dark:bg-[#262720]/50 text-black/60 dark:text-white/60 font-mono font-bold text-[10px] uppercase">
                      <th className="py-3 px-4">Dataset Name</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4 text-right">Rows</th>
                      <th className="py-3 px-4 text-right">Cols</th>
                      <th className="py-3 px-4 text-center">Health</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5 font-mono">
                    {datasetsList.slice(0, 6).map((item: any) => {
                      const health = item.health_score || 95;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => handleOpenCase(item.id)}
                          className="hover:bg-[#edf0e9]/40 dark:hover:bg-[#262720]/40 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4 font-sans font-bold text-black dark:text-white group-hover:underline truncate max-w-[200px]">
                            {item.name}
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-[#edf0e9] dark:bg-[#262720] border border-black/10 dark:border-white/10 text-black dark:text-white text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold">
                              {item.file_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold">{item.row_count?.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{item.column_count}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              health >= 85
                                ? "bg-[#31e992]/20 border-[#31e992]/40 text-black dark:text-[#31e992]"
                                : "bg-[#bc3e3e]/20 border-[#bc3e3e]/40 text-[#bc3e3e]"
                            }`}>
                              {health}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOpenCase(item.id); }}
                                className="px-2.5 py-1 rounded bg-[#edfe5e] text-black border border-black font-bold text-[10px] uppercase hover:opacity-90 cursor-pointer"
                              >
                                Inspect
                              </button>
                              <button
                                onClick={(e) => promptDeleteDataset(item, e)}
                                className="p-1 rounded text-black/40 hover:text-[#bc3e3e] dark:text-white/40 dark:hover:text-[#bc3e3e] transition-colors cursor-pointer"
                                title="Delete Case"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Forensics Tools */}
        <div className="space-y-4 text-left">
          <h2 className="text-base font-serif font-bold text-black dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black dark:text-[#edfe5e]" />
            Forensics Toolkit
          </h2>

          <div className="border border-black/15 dark:border-white/15 rounded-xl bg-white dark:bg-[#181914] p-5 space-y-4 shadow-sm">
            <Link href="/upload" className="block">
              <div className="p-4 rounded-lg bg-[#edf0e9]/50 dark:bg-[#262720]/50 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all cursor-pointer space-y-1.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-black dark:text-white group-hover:text-[#31e992] transition-colors">
                    Upload & Audit Evidence
                  </span>
                  <ArrowRight className="w-4 h-4 text-black/40 dark:text-white/40 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] font-sans text-black/60 dark:text-white/60 leading-relaxed">
                  Drop CSV, Excel, or Parquet files to trigger 3-sigma anomaly sweeps.
                </p>
              </div>
            </Link>

            <Link href="/history" className="block">
              <div className="p-4 rounded-lg bg-[#edf0e9]/50 dark:bg-[#262720]/50 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all cursor-pointer space-y-1.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-black dark:text-white group-hover:text-[#31e992] transition-colors">
                    Browse Case Archives
                  </span>
                  <ArrowRight className="w-4 h-4 text-black/40 dark:text-white/40 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] font-sans text-black/60 dark:text-white/60 leading-relaxed">
                  Access stored datasets, previous analysis runs, and briefing reports.
                </p>
              </div>
            </Link>

            <Link href="/settings" className="block">
              <div className="p-4 rounded-lg bg-[#edf0e9]/50 dark:bg-[#262720]/50 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all cursor-pointer space-y-1.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-black dark:text-white group-hover:text-[#31e992] transition-colors">
                    Terminal Preferences
                  </span>
                  <ArrowRight className="w-4 h-4 text-black/40 dark:text-white/40 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] font-sans text-black/60 dark:text-white/60 leading-relaxed">
                  Configure agent name, API keys, and dark theme defaults.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#bc3e3e]">
              <AlertTriangle className="w-5 h-5 text-[#bc3e3e]" />
              Confirm Case Deletion
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs leading-relaxed text-black/70 dark:text-white/70">
              Are you sure you want to delete case file <strong className="text-black dark:text-white font-mono">{datasetToDelete?.name}</strong>?
              All structural diagnostics, anomaly sweeps, and reports will be permanently purged.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-black/10 dark:border-white/10 mt-5">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#262720] text-black dark:text-white hover:bg-[#edf0e9] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteDataset}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg bg-[#bc3e3e] text-white border border-[#bc3e3e] hover:brightness-110 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isDeleting ? "Deleting..." : "Delete Case"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
