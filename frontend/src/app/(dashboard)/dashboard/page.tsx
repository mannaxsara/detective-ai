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
  sparklinePath,
}: {
  title: string;
  value: string | number;
  description: string | React.ReactNode;
  icon?: any;
  sparklinePath?: string;
}) {
  return (
    <div
      className="group/metric shadow-sm flex flex-col justify-between p-5 rounded-cards border border-border bg-card transition-all duration-300 relative overflow-hidden min-h-[120px]"
    >
      <div className="relative z-10 flex flex-col justify-between h-full w-full">
        <div className="flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground/60 uppercase font-bold tracking-widest">{title}</p>
          {Icon && <Icon className="w-4 h-4 text-muted-foreground/40 group-hover/metric:text-primary group-hover/metric:scale-105 transition-all duration-300" />}
        </div>
        
        <div className="flex items-end justify-between mt-3">
          <p className="text-3xl font-black text-foreground font-mono tracking-tight transition-colors">
            {value}
          </p>
          {sparklinePath && (
            <svg className="w-12 h-6 text-primary/30 group-hover/metric:text-primary/60 transition-colors shrink-0 mb-1" viewBox="0 0 40 10" fill="none">
              <path d={sparklinePath} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        <div className="text-[10px] text-muted-foreground font-bold mt-4 flex items-center gap-1.5">
          {description}
        </div>
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            {greeting}, {user?.full_name || "Agent"}
          </h1>
          <p className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-wider">
            Your data intelligence center
          </p>
        </div>
        <Link href="/upload">
          <button className="h-9 rounded-full bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 px-5 transition-all cursor-pointer shadow-md active:scale-[0.98]">
            <Upload className="w-3.5 h-3.5 text-primary-foreground" />
            File New Case
          </button>
        </Link>
      </div>

      {/* System Status Banner */}
      <div className="p-3.5 border border-border bg-card rounded-cards flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[9px] font-mono text-muted-foreground shadow-sm relative overflow-hidden">
        <div className="absolute left-0 inset-y-0 w-1 bg-primary" />
        
        <div className="flex items-center gap-2 relative z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-primary font-black uppercase">DETECTIVE CORE:</span>
          <span>Analyst nodes synchronized. Ingest loop online.</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground/50 font-bold relative z-10">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground/60">CPU:</span>
            <span className="text-primary/80">1.2%</span>
          </div>
          <span className="text-muted-foreground/30">|</span>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground/60">SHARDS:</span>
            <span className="text-muted-foreground/80">4/4 ACTIVE</span>
          </div>
          <span className="text-muted-foreground/30">|</span>
          <span>v1.4.2</span>
        </div>
      </div>

      {/* Dynamic Data-First Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Dataset Health Gauge */}
        <div
          className="group/metric shadow-sm p-5 rounded-cards border border-border bg-card transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[120px]"
        >
          <div className="relative z-10 flex flex-col justify-between h-full w-full">
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-muted-foreground/60 uppercase font-bold tracking-widest">Average Case Health</p>
              <Activity className="w-3.5 h-3.5 text-muted-foreground/40 group-hover/metric:text-primary transition-colors" />
            </div>
            
            <div className="space-y-2 mt-4 w-full">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                <span className="text-muted-foreground/60 uppercase">Avg Index</span>
                <span className="text-foreground">{avgHealthScore}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-background border border-border overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                  style={{ width: `${avgHealthScore}%` }}
                />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-0.5">
                {avgHealthScore > 80 ? "Optimal Schema" : avgHealthScore > 50 ? "Warning Schema" : "Degraded Schema"}
              </p>
            </div>
          </div>
        </div>

        {/* Metric 1: Total Rows */}
        <DashboardMetricCard
          title="Total Records Logged"
          value={totalRowsParsed.toLocaleString()}
          description={
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary" />
              <span>Rows parsed across all files</span>
            </div>
          }
          sparklinePath="M0 8 Q10 4 20 5 T40 1"
        />

        {/* Metric 2: Total Columns */}
        <DashboardMetricCard
          title="Attributes Scanned"
          value={totalColumnsScanned}
          description={
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary" />
              <span>Columns profiled & mapped</span>
            </div>
          }
          sparklinePath="M0 6 L10 6 L20 4 L30 5 L40 3"
        />

        {/* Metric 3: Total Cases */}
        <DashboardMetricCard
          title="Active Investigations"
          value={totalCases}
          description={
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary" />
              <span>Evidence datasets archived</span>
            </div>
          }
          sparklinePath="M0 8 L15 8 L15 5 L30 5 L30 2 L40 2"
        />
      </div>

      {/* Full Width Grid */}
      <div className="space-y-4 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-primary" />
          Active Case Files Archive
        </h2>

        {datasetsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {datasetsList.map((dataset: any, datasetIdx: number) => {
              const isExcel = dataset.file_type === "xlsx" || dataset.file_type === "xls";
              const isCSV = dataset.file_type === "csv";
              const isParquet = dataset.file_type === "parquet";
              const isJSON = dataset.file_type === "json";

              let badgeColor = "border-border text-muted-foreground/60 bg-background";
              if (isExcel) badgeColor = "border-emerald-900/30 text-emerald-400 bg-emerald-950/20";
              else if (isCSV) badgeColor = "border-primary/30 text-primary bg-primary/5";
              else if (isParquet) badgeColor = "border-purple-900/30 text-purple-400 bg-purple-950/20";
              else if (isJSON) badgeColor = "border-cyan-900/30 text-primary bg-cyan-950/20";

              return (
                <div
                  key={dataset.id}
                  onClick={() => handleOpenCase(dataset.id, "profile")}
                  className="p-5 rounded-cards border border-border bg-card hover:bg-background/80 hover:border-border/60 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[190px] group/item cursor-pointer"
                >
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-cards bg-background border border-border text-muted-foreground shrink-0 group-hover/item:border-primary/20 group-hover/item:scale-105 transition-all duration-300">
                      {isExcel || isCSV ? (
                        <Upload className="w-4.5 h-4.5 text-primary" />
                      ) : (
                        <Database className="w-4.5 h-4.5 text-primary" />
                      )}
                    </div>
                    
                    <div className="space-y-1.5 text-left flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2.5">
                        <h4 className="font-bold text-xs text-foreground group-hover/item:text-primary transition-colors truncate">{dataset.name}</h4>
                        <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${badgeColor}`}>
                          {dataset.file_type}
                        </span>
                      </div>
                      
                      {/* Health Indicator slider */}
                      <div className="flex justify-between items-center pt-2 text-[9px] font-bold text-muted-foreground/60">
                        <span>Schema Health</span>
                        <span className="text-primary font-black">{Math.round(dataset.health_score)}%</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-background overflow-hidden mt-1 relative">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${dataset.health_score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="relative z-10 flex justify-between border-t border-border pt-3 mt-3 text-[10px] text-muted-foreground font-bold">
                    <div>
                      <span className="text-[8px] text-muted-foreground/50 block uppercase">Rows</span>
                      <span className="font-mono text-foreground">{dataset.row_count?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-muted-foreground/50 block uppercase">Columns</span>
                      <span className="font-mono text-foreground">{dataset.column_count || "0"}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="relative z-10 grid grid-cols-4 gap-1.5 border-t border-border pt-3 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCase(dataset.slug || dataset.id, "profile");
                      }}
                      className="border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-[9px] uppercase font-bold tracking-wider h-7.5 rounded-cards transition-all cursor-pointer text-center"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCase(dataset.slug || dataset.id, "chat");
                      }}
                      className="border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-[9px] uppercase font-bold tracking-wider h-7.5 rounded-cards transition-all cursor-pointer flex items-center justify-center gap-0.5"
                    >
                      <MessageSquare className="w-2.5 h-2.5 text-primary/85" />
                      Chat
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCase(dataset.slug || dataset.id, "report");
                      }}
                      className="border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-[9px] uppercase font-bold tracking-wider h-7.5 rounded-cards transition-all cursor-pointer flex items-center justify-center gap-0.5"
                    >
                      <FileDown className="w-2.5 h-2.5 text-primary/85" />
                      Report
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDatasetToDelete(dataset);
                        setDeleteConfirmOpen(true);
                      }}
                      className="border border-rose-950/30 bg-rose-950/10 hover:bg-rose-500/10 text-rose-500 hover:text-rose-400 text-[9px] uppercase font-bold tracking-wider h-7.5 rounded-cards transition-all cursor-pointer flex items-center justify-center gap-0.5"
                    >
                      <Trash className="w-2.5 h-2.5 text-rose-500" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Link
            href="/upload"
            className="block rounded-cards border-2 border-dashed border-border bg-card/10 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-300 py-14 px-6 text-center group/uploader cursor-pointer relative overflow-hidden"
          >
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-cards bg-background border border-border flex items-center justify-center mx-auto text-muted-foreground group-hover/uploader:text-primary group-hover/uploader:border-primary/20 group-hover/uploader:scale-105 transition-all duration-300">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-xs tracking-wide">Ingest new case file</h4>
                <p className="text-muted-foreground/60 text-[10px] mt-1.5 leading-relaxed font-semibold">
                  Drag and drop your dataset here, or click to browse files from your computer.
                </p>
              </div>
              {/* Supported formats */}
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {["CSV", "Excel", "Parquet", "JSON"].map((f) => (
                  <span key={f} className="text-[8px] font-mono font-bold px-2 py-0.5 rounded bg-background border border-border text-muted-foreground">
                    {f}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center justify-center border border-border bg-background group-hover/uploader:bg-primary group-hover/uploader:text-primary-foreground text-muted-foreground text-[9px] uppercase font-bold tracking-wider px-5 h-8 rounded-full transition-all">
                Upload Case File
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

