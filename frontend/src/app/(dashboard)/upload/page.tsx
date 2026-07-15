"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Database,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
    maxSize: 500 * 1024 * 1024, // 500MB
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
        toast.error("File is too large. Max size is 500 MB.");
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
      
      // Auto-redirect to the case page immediately
      setActiveTab("profile");
      router.push(`/analysis/${caseIdentifier}`);
    } catch (err: any) {
      setStatus("error");
      toast.error(err.response?.data?.detail || "Upload or profiling failed.");
    }
  };

  const handleViewAnalysis = () => {
    if (!datasetId) return;
    setActiveTab("profile");
    router.push(`/analysis/${datasetId}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 font-sans text-muted-foreground">
      
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          New Case File
        </h1>
        <p className="text-muted-foreground/60 text-xs font-bold uppercase tracking-wider">
          Upload evidence data to initiate an investigation log
        </p>
      </div>

      <Card className="border-border bg-card rounded-cards shadow-none">
        <CardContent className="p-8">
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
                  className={`border-2 border-dashed rounded-cards p-14 text-center cursor-pointer transition-all duration-150 ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/30 bg-background"
                  }`}
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="w-12 h-12 text-primary mx-auto mb-4" />
                  <p className="text-foreground font-bold text-sm">
                    {isDragActive ? "Drop evidence file here..." : "Drag & drop evidence dataset here, or browse"}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1.5 font-medium">
                    CSV, Excel, JSON, or Parquet formats up to 500MB
                  </p>
                </div>

                {file && (
                  <div className="flex items-center justify-between p-4 rounded-cards border border-border bg-background">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-card text-primary border border-border">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground truncate max-w-sm">{file.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleUpload}
                      className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs px-5 h-9 rounded-full transition-colors active:scale-[0.98]"
                    >
                      Start Investigation
                    </Button>
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
                className="space-y-6 py-8 text-center"
              >
                <div className="relative w-14 h-14 rounded-cards bg-background border border-border flex items-center justify-center mx-auto mb-2 animate-pulse">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground">
                    {status === "uploading" ? "Uploading evidence..." : "Running investigation checks..."}
                  </h3>
                  <p className="text-muted-foreground text-xs max-w-xs mx-auto font-medium">
                    {status === "uploading"
                       ? "Storing source file to core repository."
                       : "Scanning features, building contingency tables, and profiling health indices."}
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <Progress value={uploadProgress} className="h-1.5 bg-background border border-border [&>div]:bg-primary" />
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">{uploadProgress}%</span>
                </div>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 py-8 text-center"
              >
                <CheckCircle className="w-12 h-12 text-primary mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-foreground">Evidence Analyzed — Case Ready</h3>
                  <p className="text-muted-foreground text-xs max-w-sm mx-auto font-medium">
                    Profiling completed. Outliers identified, categories correlated, and case files formatted.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => {
                      setStatus("idle");
                      setFile(null);
                    }}
                    variant="outline"
                    className="border-border bg-background hover:bg-card text-foreground text-xs font-bold px-5 h-9 rounded-full"
                  >
                    File New Evidence
                  </Button>
                  <Button
                    onClick={handleViewAnalysis}
                    className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs px-5 h-9 rounded-full shadow-sm"
                  >
                    Inspect Case File
                  </Button>
                </div>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 py-8 text-center"
              >
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground">Investigation failed</h3>
                  <p className="text-muted-foreground text-xs max-w-sm mx-auto font-medium">
                    An error occurred during evidence import. Please check dataset integrity and retry.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setStatus("idle");
                    setFile(null);
                  }}
                  className="bg-background hover:bg-card border border-border text-foreground text-xs font-bold px-5 h-9 rounded-full"
                >
                  Retry Upload
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
