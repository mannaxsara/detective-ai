"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Database, ArrowRight, Trash2, HelpCircle, FileSpreadsheet, FolderOpen, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { useAnalysisStore } from "@/store/analysis-store";
import { historyAPI, datasetsAPI } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HistoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setActiveTab } = useAnalysisStore();
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: historyData, isLoading, refetch } = useQuery({
    queryKey: ["history-list", search],
    queryFn: () => (search ? historyAPI.search(search) : historyAPI.list()),
  });

  const handleReopenAnalysis = (item: any) => {
    setActiveTab("profile");
    const target = item.slug || item.dataset_id;
    router.push(`/analysis/${target}`);
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
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-black dark:text-white bg-[#f9f9f7] dark:bg-[#11120d] py-2">
      
      {/* Title */}
      <div className="space-y-1 text-left">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
          Case Files Archive
        </h1>
        <p className="text-xs font-sans text-black/70 dark:text-white/70">
          Review, reopen, or delete archived evidence investigations.
        </p>
      </div>

      {/* Search Bar with Generous pl-12 Padding to Prevent Icon Overlap */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50 dark:text-white/50 pointer-events-none shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search cases by name... (Press '/' to focus)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 w-full rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] pl-11 pr-12 text-xs font-mono text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#edfe5e] transition-all shadow-[4px_4px_0px_#000000]"
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded border border-black/10 dark:border-white/10 bg-[#edf0e9] dark:bg-[#262720] font-mono text-[10px] font-bold select-none text-black/70 dark:text-white/70">
          /
        </div>
      </div>

      {/* Cases List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white dark:bg-[#181914] border border-black/15 dark:border-white/15" />
          ))}
        </div>
      ) : historyData?.analyses && historyData.analyses.length > 0 ? (
        <div className="border border-black dark:border-[#3b3a33] rounded-[18px] bg-white dark:bg-[#1c1d18] overflow-hidden shadow-[4px_4px_0px_#000000]">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 bg-[#edf0e9] dark:bg-[#262720] text-black/70 dark:text-white/70 uppercase font-bold text-[10px] font-mono">
                  <th className="px-6 py-3.5">Case ID</th>
                  <th className="px-6 py-3.5">Dataset Name</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Investigated Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 text-black dark:text-white font-medium">
                {historyData.analyses.map((item: any) => {
                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleReopenAnalysis(item)}
                      className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-3.5 text-xs font-mono font-bold">
                        #{item.dataset_id}
                      </td>
                      <td className="px-6 py-3.5 text-xs font-serif font-bold truncate max-w-[240px]">
                        {item.dataset_name}
                      </td>
                      <td className="px-6 py-3.5 text-[10px] font-mono font-bold">
                        <span className="px-2.5 py-0.5 rounded border border-black/10 dark:border-white/10 bg-[#edf0e9] dark:bg-[#262720] uppercase text-black dark:text-white">
                          {item.analysis_type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-[10px] font-mono font-bold">
                        <span className="inline-flex items-center gap-1.5 uppercase">
                          <span className={`w-2 h-2 rounded-full border border-black/20 ${
                            item.status === "completed"
                              ? "bg-[#31e992]"
                              : item.status === "running"
                              ? "bg-[#edfe5e] animate-ping"
                              : "bg-[#bc3e3e]"
                          }`} />
                          {item.status || "uploaded"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs font-mono font-semibold text-black/70 dark:text-white/70">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-right align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReopenAnalysis(item);
                            }}
                            className="btn-ink-accent inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-mono font-bold uppercase shrink-0 cursor-pointer"
                            title="Inspect Case Details"
                          >
                            <span>Inspect</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-black shrink-0" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDatasetToDelete(item);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-[#262720] text-black dark:text-white hover:bg-[#bc3e3e] hover:text-white transition-colors cursor-pointer"
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
        <div className="rounded-[18px] border border-dashed border-black/30 dark:border-white/30 bg-white dark:bg-[#1c1d18] py-16 px-6 text-center shadow-[4px_4px_0px_#000000] space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#edf0e9] dark:bg-[#262720] border border-black/15 dark:border-white/15 flex items-center justify-center mx-auto text-black dark:text-[#edfe5e] shrink-0">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-black dark:text-white text-base">No Active Cases Found</h3>
            <p className="text-black/70 dark:text-white/70 text-xs mt-1 font-sans max-w-xs mx-auto">
              Upload dataset evidence to start archiving files and generating investigation logs.
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#181914] text-black dark:text-white max-w-md rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="text-lg font-serif font-bold tracking-tight text-black dark:text-white">Confirm Case Deletion</DialogTitle>
            <DialogDescription className="text-xs text-black/70 dark:text-white/70 font-sans leading-relaxed">
              Are you sure you want to delete the case file <strong className="font-mono font-bold text-black dark:text-white">&quot;{datasetToDelete?.dataset_name}&quot;</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-black/10 dark:border-white/10 mt-5">
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(false)}
              className="h-9 px-4.5 rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-[#262720] hover:bg-[#edf0e9] dark:hover:bg-[#2e2f27] text-black dark:text-white text-xs font-mono font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!datasetToDelete) return;
                setIsDeleting(true);
                try {
                  await datasetsAPI.delete(datasetToDelete.dataset_id);
                  queryClient.invalidateQueries({ queryKey: ["history-list"] });
                  refetch();
                  toast.success("Case file successfully deleted.");
                  setDeleteConfirmOpen(false);
                } catch (err) {
                  toast.error("Failed to delete case file.");
                } finally {
                  setIsDeleting(false);
                }
              }}
              disabled={isDeleting}
              className="h-9 px-4.5 rounded-lg bg-[#bc3e3e] text-white border border-[#bc3e3e]/40 font-mono font-bold text-xs uppercase shadow-[4px_4px_0px_#000000] hover:brightness-110 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? "Deleting..." : "Delete Case"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
