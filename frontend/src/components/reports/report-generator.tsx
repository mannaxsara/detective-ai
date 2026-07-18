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
    <div className="space-y-6 font-sans text-foreground text-left max-w-2xl mx-auto">
      <Card className="border-border bg-card shadow-sm rounded-cards">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
            Executive Briefing compiler
          </CardTitle>
          <CardDescription className="text-muted-foreground/80 text-xs mt-1.5 leading-relaxed">
            Generate dynamic PDF or Word briefings summarizing anomalies, data profiling metrics, and active data cleansing actions.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Format choice */}
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest font-bold block">Briefing format</label>
              <div className="flex gap-2">
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
                      className={`h-9 px-4 text-[10px] font-mono font-bold uppercase tracking-wider rounded-cards border transition-all cursor-pointer ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-transparent text-muted-foreground hover:border-border/40"
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
                className="h-10 font-mono text-[9px] font-bold uppercase tracking-wider px-5 rounded-cards bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all self-end sm:self-center"
              >
                Compile Briefing
              </Button>
            )}

            {status === "generating" && (
              <Button
                disabled
                className="h-10 font-mono text-[9px] font-bold uppercase tracking-wider px-5 rounded-cards bg-primary text-primary-foreground opacity-70 self-end sm:self-center"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Compiling...
              </Button>
            )}

            {status === "success" && (
              <div className="flex gap-2 self-end sm:self-center">
                <Button
                  onClick={handleDownload}
                  className="h-10 font-mono text-[9px] font-bold uppercase tracking-wider px-5 rounded-cards bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                  Download File
                </Button>
                <Button
                  onClick={() => setStatus("idle")}
                  variant="outline"
                  className="h-10 font-mono text-[9px] font-bold uppercase tracking-wider px-5 rounded-cards border border-border bg-transparent text-muted-foreground hover:border-border/40"
                >
                  Compile New
                </Button>
              </div>
            )}

            {status === "downloading" && (
              <Button
                disabled
                className="h-10 font-mono text-[9px] font-bold uppercase tracking-wider px-5 rounded-cards bg-primary text-primary-foreground opacity-70 self-end sm:self-center"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Downloading...
              </Button>
            )}

            {status === "error" && (
              <Button
                onClick={() => setStatus("idle")}
                variant="outline"
                className="h-10 font-mono text-[9px] font-bold uppercase tracking-wider px-5 rounded-cards border border-destructive bg-transparent text-destructive hover:bg-destructive/5 self-end sm:self-center"
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
