"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Database, ArrowRight, Trash2, HelpCircle, FileSpreadsheet, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { useAnalysisStore } from "@/store/analysis-store";
import { historyAPI, datasetsAPI } from "@/lib/api";

export default function HistoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setActiveTab } = useAnalysisStore();
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: historyData, isLoading, refetch } = useQuery({
    queryKey: ["history-list", search],
    queryFn: () => (search ? historyAPI.search(search) : historyAPI.list()),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => datasetsAPI.delete(id),
    onSuccess: () => {
      toast.success("Case file successfully deleted.");
      queryClient.invalidateQueries({ queryKey: ["history-list"] });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Delete operation failed.");
    },
  });

  const handleReopenAnalysis = (item: any) => {
    setActiveTab("profile");
    const target = item.slug || item.dataset_id;
    router.push(`/analysis/${target}`);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to close and delete this case file?")) {
      deleteMutation.mutate(id);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-muted-foreground">
      
      {/* Title */}
      <div className="space-y-1 text-left">
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Case Files Archive
        </h1>
        <p className="text-muted-foreground/60 text-xs font-bold uppercase tracking-wider">
          Review, reopen, or close active data investigations
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground/60" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search cases by name... (Press '/' to focus)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-12 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
        />
        <div className="absolute right-3.5 top-2.5 px-2 py-0.5 rounded border border-border bg-background font-mono text-[9px] text-muted-foreground/45 font-bold select-none">
          /
        </div>
      </div>

      {/* Cases List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-cards bg-card/40 border border-border" />
          ))}
        </div>
      ) : historyData?.analyses && historyData.analyses.length > 0 ? (
        <div className="space-y-3">
          {historyData.analyses.map((item: any) => {
            const isExcel = item.dataset_name?.toLowerCase().endsWith(".xlsx") || item.dataset_name?.toLowerCase().endsWith(".xls");
            const isCSV = item.dataset_name?.toLowerCase().endsWith(".csv");
            
            return (
              <div
                key={item.id}
                onClick={() => handleReopenAnalysis(item)}
                className="group/item flex items-center justify-between p-4.5 rounded-cards border border-border bg-card hover:bg-background/80 hover:border-border/65 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                <div className="relative z-10 flex items-center gap-4 text-left">
                  <div className="flex items-center justify-center w-10 h-10 rounded-cards bg-background border border-border text-muted-foreground group-hover/item:border-primary/20 group-hover/item:scale-105 transition-all duration-300">
                    {isExcel || isCSV ? (
                      <FileSpreadsheet className="w-5 h-5 text-primary" />
                    ) : (
                      <Database className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground group-hover/item:text-primary transition-colors">{item.dataset_name}</h4>
                    <p className="text-[10px] text-muted-foreground/60 font-bold mt-1">
                      Investigated on {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-4.5">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-border bg-background text-muted-foreground/80">
                    {item.analysis_type} Case
                  </span>
                  
                  {item.status && (
                    <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      item.status === "completed"
                        ? "border-emerald-900/30 text-emerald-400 bg-emerald-950/20"
                        : item.status === "running"
                        ? "border-amber-900/30 text-amber-400 bg-amber-950/20 animate-pulse"
                        : "border-rose-900/30 text-rose-400 bg-rose-950/20"
                    }`}>
                      {item.status}
                    </span>
                  )}
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleDelete(e, item.dataset_id)}
                      className="text-muted-foreground/45 hover:text-rose-500 hover:bg-rose-500/5 transition-all duration-200 rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer border border-transparent hover:border-rose-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/45 group-hover/item:text-primary group-hover/item:translate-x-0.5 transition-all duration-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-cards border border-dashed border-border bg-card/30 py-16 text-center">
          <HelpCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-bold text-foreground text-sm">No Active Cases Found</h3>
          <p className="text-muted-foreground text-xs mt-1.5 font-medium max-w-xs mx-auto">
            Upload dataset evidence to start archiving files and generating investigation logs.
          </p>
        </div>
      )}
    </div>
  );
}
