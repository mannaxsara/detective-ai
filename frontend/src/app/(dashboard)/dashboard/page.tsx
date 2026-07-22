"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  Database,
  Activity,
  ArrowUpRight,
  FolderOpen,
  MessageSquare,
  FileDown,
  Trash,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { historyAPI, datasetsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useAnalysisStore } from "@/store/analysis-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function DashboardMetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string | React.ReactNode;
  icon?: any;
}) {
  return (
    <div className="p-5 rounded-cards border border-border bg-card flex flex-col justify-between min-h-[120px] shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider">{title}</p>
        {Icon && <Icon className="w-4 h-4 text-primary" />}
      </div>
      
      <div className="mt-3">
        <p className="text-3xl font-bold text-foreground font-mono tracking-tight">
          {value}
        </p>
      </div>

      <div className="mt-2 text-xs">
        {description}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { setActiveTab } = useAnalysisStore();
  const [greeting, setGreeting] = useState("Good Evening");
  const [cardCoords, setCardCoords] = useState<{ [key: string]: { x: number; y: number } }>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good Morning");
    else if (hours < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const { data: datasetsData } = useQuery({
    queryKey: ["datasets"],
    queryFn: () => datasetsAPI.list(0, 10),
  });

  const datasetsList = datasetsData?.datasets || [];
  const totalCases = datasetsData?.total || 0;

  const totalRowsParsed = datasetsList.reduce((acc: number, curr: any) => acc + (curr.row_count || 0), 0);
  const totalColumnsScanned = datasetsList.reduce((acc: number, curr: any) => acc + (curr.column_count || 0), 0);
  
  const avgHealthScore = datasetsList.length
    ? Math.round(datasetsList.reduce((acc: number, curr: any) => acc + (curr.health_score || 0), 0) / datasetsList.length)
    : 100;

  const handleOpenCase = (identifier: string | number, tab: string) => {
    setActiveTab(tab);
    router.push(`/analysis/${identifier}`);
  };

  const handleCardMouseMove = (key: string, e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setCardCoords((prev) => ({
      ...prev,
      [key]: { x: e.clientX - left, y: e.clientY - top },
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-muted-foreground">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {greeting}, {user?.full_name || "Investigator"}
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Forensics workspace summary and active evidence archives.
          </p>
        </div>
        <Link href="/upload">
          <button className="h-9 rounded-cards bg-primary hover:opacity-90 text-primary-foreground font-mono text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-2 px-4 transition-all cursor-pointer shadow-sm active:scale-[0.98]">
            <Upload className="w-3.5 h-3.5 text-primary-foreground" />
            File New Case
          </button>
        </Link>
      </div>

      {/* Dynamic Data-First Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Dataset Health Gauge */}
        <div className="p-5 rounded-cards border border-border bg-card flex flex-col justify-between min-h-[120px] shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider">Average Case Health</p>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-muted-foreground">Average Index</span>
              <span className="text-foreground">{avgHealthScore}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${avgHealthScore}%` }}
              />
            </div>
            <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
              {avgHealthScore > 80 ? "Optimal Schema Integrity" : avgHealthScore > 50 ? "Quality Flags Present" : "Degraded Schema"}
            </p>
          </div>
        </div>

        {/* Metric 1: Total Rows */}
        <DashboardMetricCard
          title="Total Records Logged"
          value={totalRowsParsed.toLocaleString()}
          description={
            <span className="text-muted-foreground text-[11px] font-medium">Rows parsed across all files</span>
          }
          icon={Database}
        />

        {/* Metric 2: Total Columns */}
        <DashboardMetricCard
          title="Attributes Scanned"
          value={totalColumnsScanned}
          description={
            <span className="text-muted-foreground text-[11px] font-medium">Columns profiled & mapped</span>
          }
          icon={Activity}
        />

        {/* Metric 3: Total Cases */}
        <DashboardMetricCard
          title="Active Cases"
          value={totalCases}
          description={
            <span className="text-muted-foreground text-[11px] font-medium">Evidence datasets archived</span>
          }
          icon={FolderOpen}
        />
      </div>

      {/* Full Width Grid */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary" />
            Evidence Case Files
          </h2>
          <span className="text-xs font-mono text-muted-foreground">{datasetsList.length} cases</span>
        </div>

        {datasetsList.length > 0 ? (
          <div className="border border-border rounded-cards bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/30">
                    <th className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 text-left">Case ID</th>
                    <th className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 text-left">Dataset Name</th>
                    <th className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 text-left">Format</th>
                    <th className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 text-left">Status</th>
                    <th className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 text-left">Health</th>
                    <th className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 text-right">Rows</th>
                    <th className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 text-right">Cols</th>
                    <th className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {datasetsList.map((dataset: any) => {
                    return (
                      <tr
                        key={dataset.id}
                        onClick={() => handleOpenCase(dataset.slug || dataset.id, "profile")}
                        className="group border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-3.5 text-xs font-mono text-muted-foreground font-bold">
                          #{dataset.id}
                        </td>
                        <td className="px-6 py-3.5 text-xs font-semibold text-foreground truncate max-w-[220px]">
                          {dataset.name}
                        </td>
                        <td className="px-6 py-3.5 text-[10px] font-mono font-bold">
                          <span className="px-2 py-0.5 rounded border border-border bg-background uppercase text-foreground">
                            {dataset.file_type}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-[10px] font-mono font-bold">
                          <span className="inline-flex items-center gap-1.5 text-foreground uppercase">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              dataset.status === "completed"
                                ? "bg-emerald-500"
                                : dataset.status === "running"
                                ? "bg-amber-500 animate-ping"
                                : "bg-rose-500"
                            }`} />
                            {dataset.status || "uploaded"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-xs font-mono font-bold align-middle">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1 rounded-full bg-muted overflow-hidden relative">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${dataset.health_score || 0}%` }}
                              />
                            </div>
                            <span className="text-foreground">{dataset.health_score ? `${Math.round(dataset.health_score)}%` : "—"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-xs font-mono text-foreground text-right font-bold">
                          {dataset.row_count?.toLocaleString() || "—"}
                        </td>
                        <td className="px-6 py-3.5 text-xs font-mono text-foreground text-right font-bold">
                          {dataset.column_count || "—"}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-right align-middle">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCase(dataset.slug || dataset.id, "profile");
                              }}
                              className="h-7 px-2.5 rounded border border-border bg-background text-foreground text-[10px] font-mono font-bold hover:bg-muted transition-all cursor-pointer flex items-center gap-1"
                              title="Inspect Case Details"
                            >
                              Inspect <ArrowUpRight className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDatasetToDelete(dataset);
                                setDeleteConfirmOpen(true);
                              }}
                              className="h-7 w-7 rounded border border-border bg-background text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-all cursor-pointer flex items-center justify-center"
                              title="Delete Case File"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Link
            href="/upload"
            className="block rounded-cards border-2 border-dashed border-border bg-card hover:border-primary/40 transition-all duration-200 py-14 px-6 text-center group cursor-pointer relative overflow-hidden"
          >
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-cards bg-background border border-border flex items-center justify-center mx-auto text-muted-foreground group-hover:text-primary transition-all">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm tracking-tight">File new evidence case</h4>
                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                  Upload CSV, Excel, Parquet, or JSON datasets for automated forensic profiling and analysis.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {["CSV", "Excel", "Parquet", "JSON"].map((f) => (
                  <span key={f} className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-border bg-background text-muted-foreground">
                    {f}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center justify-center border border-border bg-background group-hover:bg-primary group-hover:text-primary-foreground text-foreground text-[10px] font-mono uppercase font-bold tracking-wider px-5 h-9 rounded-cards transition-all">
                Upload File
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="border-border bg-card text-muted-foreground max-w-sm rounded-cards p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
          
          <DialogHeader className="text-left gap-1.5">
            <DialogTitle className="text-sm font-black text-foreground tracking-tight uppercase">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-semibold leading-relaxed">
              Are you sure you want to delete the case file <span className="text-foreground font-bold">"{datasetToDelete?.name}"</span>? This action cannot be undone and all associated insights will be lost.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-row justify-end gap-2.5 bg-transparent border-t-0 p-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-xs font-bold px-4 h-9 rounded-cards transition-all cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!datasetToDelete) return;
                setIsDeleting(true);
                try {
                  await datasetsAPI.delete(datasetToDelete.id);
                  queryClient.invalidateQueries({ queryKey: ["datasets"] });
                  toast.success("Case file successfully deleted.");
                  setDeleteConfirmOpen(false);
                } catch (err) {
                  toast.error("Failed to delete case file.");
                } finally {
                  setIsDeleting(false);
                }
              }}
              disabled={isDeleting}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 h-9 rounded-cards transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Case"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

