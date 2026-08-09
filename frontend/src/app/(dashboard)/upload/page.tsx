"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Database,
  ArrowRight,
  Sparkles,
  FileCode,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { datasetsAPI, analysisAPI } from "@/lib/api";
import { useAnalysisStore } from "@/store/analysis-store";

export default function UploadPage() {
  const router = useRouter();
  const { setDataset, setAnalysis, setActiveTab } = useAnalysisStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [datasetId, setDatasetId] = useState<number | string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/json": [".json"],
      "application/octet-stream": [".parquet"],
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setStatus("idle");
        setUploadProgress(0);
      }
    },
    onDropRejected: (rejections) => {
      const error = rejections[0]?.errors[0];
      if (error?.code === "file-too-large") {
        toast.error("File is too large. Max size is 100 MB.");
      } else {
        toast.error("Invalid file format. Please upload CSV, Excel, JSON, or Parquet.");
      }
    },
  });

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setUploadProgress(10);
    try {
      const dataset = await datasetsAPI.upload(file, (progressEvent) => {
        const total = progressEvent.total || progressEvent.loaded || 1;
        const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
        setUploadProgress(10 + Math.round(percentCompleted * 0.8));
      });
      
      const caseIdentifier = dataset.slug || dataset.id;
      setDatasetId(caseIdentifier);
      setStatus("processing");
      setUploadProgress(95);

      const analysis = await analysisAPI.triggerAnalysis(caseIdentifier);
      
      setDataset(dataset);
      setAnalysis(analysis);
      
      setUploadProgress(100);
      setStatus("success");
      toast.success("Evidence loaded. Starting analysis...");
    } catch (err: any) {
      setUploadProgress(0);
      setStatus("error");
      toast.error(err.response?.data?.detail || "Upload or profiling failed.");
    }
  };

  const handleSampleUpload = (sampleName: string) => {
    // Generate a sample CSV file
    const sampleCsvContent = `TransactionID,Date,CustomerName,Category,Amount,Quantity,Status,StoreRegion
TXN1001,2026-08-01,Alpha Enterprises,Electronics,1250.50,5,Completed,North
TXN1002,2026-08-02,Beta Logistics,Software,840.00,2,Completed,West
TXN1003,2026-08-02,Gamma Retail,Hardware,310.25,1,Pending,South
TXN1004,2026-08-03,Delta Corp,Services,-150.00,1,Refunded,East
TXN1005,2026-08-04,Epsilon Trading,Electronics,4200.00,12,Completed,North
TXN1006,2026-08-05,Zeta Systems,Software,950.75,3,Completed,West
TXN1007,2026-08-05,Eta Global,Hardware,180.00,2,Completed,Central
TXN1008,2026-08-06,Theta Solutions,Services,2300.00,8,Completed,North
TXN1009,2026-08-06,Iota Ventures,Electronics,620.00,4,Completed,South
TXN1010,2026-08-07,Kappa Industries,Software,1500.00,5,Completed,West`;

    const sampleBlob = new Blob([sampleCsvContent], { type: "text/csv" });
    const sampleFile = new File([sampleBlob], `${sampleName.toLowerCase().replace(/\s+/g, "_")}.csv`, { type: "text/csv" });
    setFile(sampleFile);
    toast.success(`Loaded ${sampleName} dataset! Click 'Start Investigation' to analyze.`);
  };

  const handleViewAnalysis = () => {
    if (!datasetId) return;
    setActiveTab("profile");
    router.push(`/analysis/${datasetId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-black dark:text-white bg-[#f9f9f7] dark:bg-[#11120d]">
      
      {/* Title */}
      <div className="space-y-1 text-left">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#edfe5e] text-black px-2 py-0.5 rounded border border-black/20">
            Forensics Pipeline
          </span>
          <span className="text-xs font-mono text-black/60 dark:text-white/60">
            Automated Polars SIMD Profiling
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-black dark:text-white mt-1">
          File New Evidence Case
        </h1>
        <p className="text-xs font-sans text-black/70 dark:text-white/70">
          Upload CSV, Excel, JSON, or Apache Parquet dataset files up to 100MB for automated forensic profiling.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="border border-black dark:border-[#3b3a33] rounded-[18px] bg-white dark:bg-[#1c1d18] p-7 sm:p-9 shadow-[4px_4px_0px_#000000] space-y-6">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-10 sm:p-14 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? "border-black dark:border-white bg-[#edfe5e]/20"
                    : "border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white bg-[#f9f9f7] dark:bg-[#262720]"
                }`}
              >
                <input {...getInputProps()} />
                
                {/* Prominent Upload Icon Box */}
                <div className="w-16 h-16 min-w-[64px] min-h-[64px] rounded-2xl bg-[#edfe5e] border-2 border-black flex items-center justify-center mx-auto mb-5 text-black shadow-[3px_3px_0px_#000000] shrink-0">
                  <Upload className="w-8 h-8 min-w-[32px] min-h-[32px] text-black shrink-0 stroke-[2.2]" />
                </div>

                <h3 className="font-serif font-bold text-lg text-black dark:text-white">
                  {isDragActive ? "Drop evidence file here..." : "Drag & drop evidence dataset here, or click to browse"}
                </h3>
                <p className="text-xs font-mono text-black/60 dark:text-white/60 mt-1.5 font-medium max-w-md mx-auto">
                  Supports CSV, Excel (.xlsx/.xls), JSON, & Apache Parquet files up to 100MB
                </p>

                {/* Visual Format Pills */}
                <div className="flex flex-wrap justify-center gap-2 pt-5">
                  {[
                    { ext: "CSV", icon: FileText },
                    { ext: "EXCEL", icon: FileSpreadsheet },
                    { ext: "JSON", icon: FileCode },
                    { ext: "PARQUET", icon: Database },
                  ].map((fmt) => {
                    const FmtIcon = fmt.icon;
                    return (
                      <span
                        key={fmt.ext}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#181914] text-[11px] font-mono font-bold text-black dark:text-white"
                      >
                        <FmtIcon className="w-3.5 h-3.5 text-black dark:text-[#edfe5e]" />
                        {fmt.ext}
                      </span>
                    );
                  })}
                </div>

                <div className="pt-4">
                  <span className="btn-ink-accent text-xs py-2.5 px-6 rounded-xl font-mono uppercase font-bold inline-flex items-center gap-2 shadow-[2px_2px_0px_#000000]">
                    <Upload className="w-4 h-4 text-black" />
                    Browse Files
                  </span>
                </div>
              </div>

              {/* Selected File Bar */}
              {file && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-black/15 dark:border-white/15 bg-[#edf0e9] dark:bg-[#262720] shadow-[4px_4px_0px_#000000]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-lg bg-[#edfe5e] text-black border border-black/20 shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-bold font-mono text-black dark:text-white truncate max-w-sm">{file.name}</p>
                      <p className="text-[10px] font-mono text-black/60 dark:text-white/60 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={handleUpload}
                    className="btn-ink-accent w-full sm:w-auto text-xs py-2.5 px-6 rounded-xl font-mono uppercase font-bold inline-flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer"
                  >
                    <span>Start Investigation</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {(status === "uploading" || status === "processing") && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-10 text-center"
            >
              <div className="w-16 h-16 min-w-[64px] min-h-[64px] rounded-2xl bg-[#edfe5e] border-2 border-black flex items-center justify-center mx-auto mb-2 text-black shadow-[3px_3px_0px_#000000] animate-spin shrink-0">
                <Database className="w-8 h-8 min-w-[32px] min-h-[32px] text-black shrink-0" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-serif font-bold text-black dark:text-white">
                  {status === "uploading" ? "Uploading evidence file..." : "Executing Polars profiling sweep..."}
                </h3>
                <p className="text-xs font-sans text-black/70 dark:text-white/70 max-w-xs mx-auto">
                  {status === "uploading"
                     ? "Ingesting binary data into encrypted workspace repository."
                     : "Scanning schema health, isolating 3-sigma anomalies, and mapping correlations."}
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <div className="h-3 w-full rounded-full bg-[#edf0e9] dark:bg-[#262720] border border-black/15 dark:border-white/15 overflow-hidden">
                  <div
                    className="h-full bg-[#31e992] transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-black dark:text-white">{uploadProgress}%</span>
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-10 text-center"
            >
              <div className="w-16 h-16 min-w-[64px] min-h-[64px] rounded-2xl bg-[#31e992]/20 border-2 border-[#31e992] text-[#31e992] flex items-center justify-center mx-auto shadow-sm shrink-0">
                <CheckCircle className="w-8 h-8 min-w-[32px] min-h-[32px] text-[#31e992] shrink-0 stroke-[2.2]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-black dark:text-white">Evidence Analyzed — Case Ready</h3>
                <p className="text-xs font-sans text-black/70 dark:text-white/70 max-w-sm mx-auto">
                  Profiling completed. 3-sigma outliers identified, health scores computed, and case workspace initialized.
                </p>
              </div>

              {/* Redesigned Clean Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle");
                    setFile(null);
                  }}
                  className="h-11 px-6 rounded-xl border-2 border-black dark:border-white/40 bg-white dark:bg-[#262720] hover:bg-[#edf0e9] dark:hover:bg-[#32332a] text-black dark:text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer inline-flex items-center justify-center shadow-[2px_2px_0px_#000000] transition-all hover:translate-y-[-1px] active:scale-[0.98] shrink-0"
                >
                  File New Evidence
                </button>
                <button
                  type="button"
                  onClick={handleViewAnalysis}
                  className="btn-ink-accent text-xs h-11 px-6 rounded-xl border-2 border-black font-mono font-bold uppercase tracking-wider shadow-[3px_3px_0px_#000000] cursor-pointer inline-flex items-center justify-center gap-2 transition-all hover:translate-y-[-1px] active:scale-[0.98] shrink-0"
                >
                  <span>Inspect Case File</span>
                  <ArrowRight className="w-4 h-4 text-black shrink-0" />
                </button>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-10 text-center"
            >
              <div className="w-16 h-16 min-w-[64px] min-h-[64px] rounded-2xl bg-[#bc3e3e]/20 border-2 border-[#bc3e3e] text-[#bc3e3e] flex items-center justify-center mx-auto shadow-sm shrink-0">
                <AlertCircle className="w-8 h-8 min-w-[32px] min-h-[32px] text-[#bc3e3e] shrink-0 stroke-[2.2]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-black dark:text-white">Investigation Failed</h3>
                <p className="text-xs font-sans text-black/70 dark:text-white/70 max-w-sm mx-auto">
                  An error occurred during evidence import. Please check dataset formatting and retry.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setFile(null);
                }}
                className="h-11 px-6 rounded-xl border-2 border-black dark:border-white/40 bg-white dark:bg-[#262720] hover:bg-[#edf0e9] text-black dark:text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_#000000] transition-all hover:translate-y-[-1px] shrink-0"
              >
                Retry Upload
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Test Sample Datasets Bar */}
      <div className="border border-black dark:border-[#3b3a33] rounded-[18px] bg-white dark:bg-[#1c1d18] p-5 shadow-[4px_4px_0px_#000000] space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-black dark:text-[#edfe5e]" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">Quick Test Sample Datasets</h3>
        </div>
        <p className="text-xs font-sans text-black/70 dark:text-white/70">
          Don&apos;t have a file ready? Click below to instantly load a pre-formatted sample dataset for investigation.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={() => handleSampleUpload("Retail Transactions")}
            className="h-9 px-4 rounded-lg border border-black/20 dark:border-white/20 bg-[#edf0e9] dark:bg-[#262720] hover:bg-[#edfe5e] hover:text-black hover:border-black text-black dark:text-white text-xs font-mono font-bold inline-flex items-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Load Sales Transactions (CSV)</span>
          </button>
          <button
            onClick={() => handleSampleUpload("Customer Metrics")}
            className="h-9 px-4 rounded-lg border border-black/20 dark:border-white/20 bg-[#edf0e9] dark:bg-[#262720] hover:bg-[#31e992] hover:text-black hover:border-black text-black dark:text-white text-xs font-mono font-bold inline-flex items-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Load Customer Analytics (CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
