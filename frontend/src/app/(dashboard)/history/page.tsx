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
          className="h-10 w-full rounded-cards border border-border bg-card pl-10 pr-12 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
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
        <div className="border border-border rounded-cards bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 text-left">Case ID</th>
                  <th className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 text-left">Dataset Name</th>
                  <th className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 text-left">Type</th>
                  <th className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 text-left">Status</th>
                  <th className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 text-left">Investigated Date</th>
                  <th className="text-[9.5px] font-mono font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyData.analyses.map((item: any) => {
                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleReopenAnalysis(item)}
                      className="group border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-3.5 text-xs font-mono text-muted-foreground font-bold">
                        #{item.dataset_id}
                      </td>
                      <td className="px-6 py-3.5 text-xs font-semibold text-foreground truncate max-w-[240px]">
                        {item.dataset_name}
                      </td>
                      <td className="px-6 py-3.5 text-[10px] font-mono font-bold">
                        <span className="px-2 py-0.5 rounded border border-border bg-background uppercase text-foreground">
                          {item.analysis_type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-[10px] font-mono font-bold">
                        <span className="inline-flex items-center gap-1.5 text-foreground uppercase">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.status === "completed"
                              ? "bg-emerald-500"
                              : item.status === "running"
                              ? "bg-amber-500 animate-ping"
                              : "bg-rose-500"
                          }`} />
                          {item.status || "uploaded"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs font-mono text-muted-foreground font-semibold">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-right align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleDelete(e, item.dataset_id)}
                            className="h-7 w-7 rounded border border-border bg-background text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-all cursor-pointer flex items-center justify-center"
                            title="Delete Case File"
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
