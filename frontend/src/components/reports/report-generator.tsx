"use client";

import React, { useState } from "react";
import { FileText, Download, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { reportsAPI } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReportGeneratorProps {
  analysisId: number | string;
}

export default function ReportGenerator({ analysisId }: ReportGeneratorProps) {
  const [format, setFormat] = useState<"pdf" | "docx">("pdf");
  const [status, setStatus] = useState<"idle" | "generating" | "downloading" | "success" | "error">("idle");
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
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
      setStatus("success");
      toast.success("Download started successfully");
    } catch (err) {
      toast.error("Download failed.");
      setStatus("success");
    }
  };

  return (
    <div className="space-y-6 font-sans text-obsidian text-left">
      <Card>
        <CardHeader className="pb-3 border-b border-obsidian/10">
          <CardTitle className="text-xs font-mono font-medium text-obsidian/60 uppercase tracking-wider">
            Executive Briefing compiler
          </CardTitle>
          <CardDescription className="text-obsidian/75 text-[14px]">
            Generate dynamic PDF or Word briefings summarizing anomalies and clean actions.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
            {/* Format choice */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-mono text-obsidian/60 uppercase tracking-wider block">Briefing format</label>
              <div className="flex gap-2">
                {[
                  { id: "pdf", label: "Portable Document Format (PDF)" },
                  { id: "docx", label: "Microsoft Word (DOCX)" }
                ].map((type) => {
                  const active = format === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormat(type.id as any)}
                      className={`h-11 px-4 text-[13px] font-sans font-medium rounded-buttons border-[1.5px] cursor-pointer transition-all ${
                        active
                          ? "border-ember bg-limestone text-obsidian font-bold"
                          : "border-obsidian/20 bg-transparent text-obsidian/60 hover:border-obsidian"
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
              <Button
                onClick={handleGenerate}
                className="h-12 uppercase text-[12px] font-sans font-bold tracking-wider px-6 self-end sm:self-center"
              >
                Compile Briefing
              </Button>
            )}

            {status === "generating" && (
              <Button
                disabled
                className="h-12 uppercase text-[12px] font-sans font-bold tracking-wider px-6 self-end sm:self-center opacity-70"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Compiling...
              </Button>
            )}

            {status === "success" && (
              <div className="flex gap-2 self-end sm:self-center">
                <Button
                  onClick={handleDownload}
                  className="h-12 uppercase text-[12px] font-sans font-bold tracking-wider px-6"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-obsidian" strokeWidth={2} />
                  Download File
                </Button>
                <Button
                  onClick={() => setStatus("idle")}
                  variant="outline"
                  className="h-12 uppercase text-[12px] font-sans font-bold tracking-wider px-6"
                >
                  Compile New
                </Button>
              </div>
            )}

            {status === "downloading" && (
              <Button
                disabled
                className="h-12 uppercase text-[12px] font-sans font-bold tracking-wider px-6 self-end sm:self-center opacity-70"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Downloading...
              </Button>
            )}

            {status === "error" && (
              <Button
                onClick={() => setStatus("idle")}
                variant="outline"
                className="h-12 uppercase text-[12px] font-sans font-bold tracking-wider px-6 self-end sm:self-center border-ember text-ember hover:bg-ember/5"
              >
                Retry Compiler
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
