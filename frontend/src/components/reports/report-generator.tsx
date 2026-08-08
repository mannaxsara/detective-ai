"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { reportsAPI } from "@/lib/api";

interface ReportGeneratorProps {
  analysisId: number | string;
}

export default function ReportGenerator({ analysisId }: ReportGeneratorProps) {
  const [format, setFormat] = useState<"pdf" | "docx">("pdf");
  const [status, setStatus] = useState<"idle" | "generating" | "downloading" | "success" | "error">("idle");
  const [reportId, setReportId] = useState<number | null>(null);

  const handleGenerate = async () => {
    setStatus("generating");
    try {
      const report = await reportsAPI.generate(analysisId, format);
      setReportId(report.report_id);
      setStatus("success");
      toast.success("Executive Briefing successfully compiled");
    } catch (err: any) {
      setStatus("error");
      toast.error(err.response?.data?.detail || "Report compilation failed.");
    }
  };

  const handleDownload = async () => {
    if (!reportId) return;
    setStatus("downloading");
    try {
      const blob = await reportsAPI.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `evidence-forensics-report-${analysisId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      setStatus("success");
      toast.success("Download started successfully");
    } catch (err) {
      toast.error("Download failed.");
      setStatus("success");
    }
  };

  return (
    <div className="space-y-8 font-sans text-black dark:text-white text-left max-w-2xl mx-auto">
      <div className="p-7 rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] shadow-[4px_4px_0px_#000000] space-y-6">
        <div className="pb-4 border-b border-black/20 dark:border-[#3b3a33]">
          <h3 className="text-xs font-mono font-bold text-black dark:text-white uppercase tracking-wider">
            Executive Briefing Compiler
          </h3>
          <p className="text-black/75 dark:text-white/75 text-xs mt-1.5 leading-relaxed font-medium">
            Generate dynamic PDF or Word briefings summarizing anomalies, data profiling metrics, and active data cleansing actions.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Format choice */}
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-mono text-black/70 dark:text-white/70 uppercase tracking-wider font-bold block">
              Briefing format
            </label>
            <div className="flex flex-row gap-3">
              {[
                { id: "pdf", label: "PDF" },
                { id: "docx", label: "DOCX" }
              ].map((type) => {
                const active = format === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormat(type.id as any)}
                    className={`h-10 px-5 text-xs font-mono font-bold uppercase rounded-[10px] border border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000000] ${
                      active
                        ? "bg-[#edfe5e] text-black"
                        : "bg-[#edf0e9] dark:bg-[#262720] text-black dark:text-white hover:bg-[#edfe5e] hover:text-black"
                    }`}
                  >
                    {type.id.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* CTA action */}
          {status === "idle" && (
            <button
              onClick={handleGenerate}
              className="btn-ink-accent text-xs py-3 px-6 font-mono uppercase font-bold cursor-pointer shadow-[2px_2px_0px_#000000] self-end sm:self-center"
            >
              Compile Briefing
            </button>
          )}

          {status === "generating" && (
            <button
              disabled
              className="h-11 px-6 text-xs font-mono font-bold uppercase rounded-[10px] border border-black bg-[#edf0e9] dark:bg-[#262720] text-black/50 dark:text-white/50 opacity-70 flex items-center gap-2 self-end sm:self-center"
            >
              <Loader2 className="w-4 h-4 animate-spin text-black dark:text-white" />
              <span>Compiling...</span>
            </button>
          )}

          {status === "success" && (
            <div className="flex gap-3 self-end sm:self-center">
              <button
                onClick={handleDownload}
                className="btn-ink-accent text-xs py-3 px-5 font-mono uppercase font-bold flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000]"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
              <button
                onClick={() => setStatus("idle")}
                className="h-11 px-4 text-xs font-mono font-bold uppercase rounded-[10px] border border-black bg-[#edf0e9] dark:bg-[#262720] text-black dark:text-white cursor-pointer shadow-[2px_2px_0px_#000000]"
              >
                New
              </button>
            </div>
          )}

          {status === "downloading" && (
            <button
              disabled
              className="h-11 px-6 text-xs font-mono font-bold uppercase rounded-[10px] border border-black bg-[#edf0e9] dark:bg-[#262720] text-black/50 dark:text-white/50 opacity-70 flex items-center gap-2 self-end sm:self-center"
            >
              <Loader2 className="w-4 h-4 animate-spin text-black dark:text-white" />
              <span>Downloading...</span>
            </button>
          )}

          {status === "error" && (
            <button
              onClick={() => setStatus("idle")}
              className="h-11 px-5 text-xs font-mono font-bold uppercase rounded-[10px] border border-black bg-[#bc3e3e] text-white cursor-pointer shadow-[2px_2px_0px_#000000] self-end sm:self-center"
            >
              Retry Compiler
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
