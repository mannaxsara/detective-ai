"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Database, AlertTriangle, Loader2, Download } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { datasetsAPI, analysisAPI } from "@/lib/api";
import { useAnalysisStore } from "@/store/analysis-store";

// Import tab views
import ProfileTab from "@/components/analysis/profile-tab";
import CleaningTab from "@/components/analysis/cleaning-tab";
import ChartsTab from "@/components/analysis/charts-tab";
import KPITab from "@/components/analysis/kpi-tab";
import InsightsTab from "@/components/analysis/insights-tab";
import StatisticsTab from "@/components/analysis/statistics-tab";
import AnomaliesTab from "@/components/analysis/anomalies-tab";
import ForecastTab from "@/components/analysis/forecast-tab";
import ChatTab from "@/components/analysis/chat-tab";
import HypothesisTab from "@/components/analysis/hypothesis-tab";
import RootCauseTab from "@/components/analysis/root-cause-tab";
import RecommendationsTab from "@/components/analysis/recommendations-tab";
import ReportGenerator from "@/components/reports/report-generator";

const TABS_CONFIG = [
  { value: "profile", label: "Evidence" },
  { value: "cleaning", label: "Cleaning" },
  { value: "kpis", label: "KPIs" },
  { value: "insights", label: "Insights" },
  { value: "chat", label: "Chat" },
  { value: "charts", label: "Charts" },
  { value: "forecast", label: "Forecast" },
  { value: "anomalies", label: "Anomalies" },
  { value: "statistics", label: "Statistics" },
  { value: "hypothesis", label: "Hypothesis" },
  { value: "rootcause", label: "Root Cause" },
  { value: "recommendations", label: "Recommendations" },
  { value: "report", label: "Report" },
];

export default function AnalysisDetailPage() {
  const { id } = useParams() as { id: string };
  const datasetId = id;
  const { setDataset, setAnalysis, activeTab, setActiveTab } = useAnalysisStore();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!dataset) return;
    setDownloading(true);
    try {
      const blob = await datasetsAPI.download(datasetId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${dataset.name.toLowerCase().replace(/\s+/g, "_")}.${dataset.file_type.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Cleaned dataset downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download dataset file.");
    } finally {
      setDownloading(false);
    }
  };

  const { data: dataset, isLoading: datasetLoading, error: datasetError } = useQuery({
    queryKey: ["dataset", datasetId],
    queryFn: () => datasetsAPI.getById(datasetId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "running" || status === "pending" || status === "uploaded" ? 3000 : false;
    }
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["analysis", datasetId],
    queryFn: () => analysisAPI.getAnalysis(datasetId),
    enabled: dataset?.status === "completed"
  });

  useEffect(() => {
    if (dataset) setDataset(dataset);
    if (analysis) setAnalysis(analysis);
  }, [dataset, analysis, setDataset, setAnalysis]);

  if (datasetLoading || (analysisLoading && dataset?.status === "completed")) {
    return (
      <div className="flex flex-col gap-6 py-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-20 rounded-cards bg-card/45 border border-border" />
        <div className="h-10 rounded-cards bg-card/45 border border-border" />
        <div className="h-[400px] rounded-cards bg-card/45 border border-border" />
      </div>
    );
  }

  if (datasetError || !dataset) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Dataset case file not found</h2>
        <p className="text-muted-foreground text-xs font-medium leading-relaxed">
          We couldn't retrieve the requested case analysis. Please check cases archive or upload again.
        </p>
      </div>
    );
  }

  if (dataset.status === "running" || dataset.status === "pending" || dataset.status === "uploaded") {
    return (
      <div className="max-w-md mx-auto py-32 text-center space-y-6 flex flex-col items-center">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-widest">
            Investigating Evidence Case...
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
            Detective AI is profiling schema, scanning correlations, detecting anomalies, and running time-series forecasts in the background.
          </p>
        </div>
      </div>
    );
  }

  if (dataset.status === "failed") {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Investigation Failed</h2>
        <p className="text-muted-foreground text-xs leading-relaxed">
          An error occurred during dataset profiling. Please check that your file is formatted correctly or try uploading another case file.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans text-foreground">
      
      {/* Dataset Header Card */}
      <Card className="border-border bg-card shadow-sm rounded-cards">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-cards bg-background border border-border text-primary">
              <Database className="w-5.5 h-5.5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base font-bold text-foreground tracking-tight">{dataset.name}</h1>
                <Badge className="bg-background border border-border text-muted-foreground text-[9px] px-2.5 py-0.5 rounded font-mono uppercase font-bold">
                  {dataset.file_type}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1.5 tracking-wider">
                Size: <span className="font-mono text-foreground">{(dataset.file_size / (1024 * 1024)).toFixed(2)} MB</span> | 
                Rows: <span className="font-mono text-foreground">{dataset.row_count?.toLocaleString()}</span> | 
                Cols: <span className="font-mono text-foreground">{dataset.column_count}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Dataset Health</p>
                <p className="text-xs font-mono font-black text-foreground mt-0.5">{dataset.health_score ? `${Math.round(dataset.health_score)}%` : "N/A"}</p>
              </div>
              <div className="w-1.5 h-10 rounded-full bg-background border border-border relative overflow-hidden">
                {dataset.health_score && (
                  <div
                    className="absolute bottom-0 inset-x-0 bg-primary"
                    style={{ height: `${dataset.health_score}%` }}
                  />
                )}
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-cards bg-primary text-primary-foreground font-mono text-[9px] uppercase tracking-wider font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Export Cleaned Data
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Flat Horizontal Tab Navigation Bar */}
      <div className="border-b border-border flex gap-6 overflow-x-auto scrollbar-none">
        {TABS_CONFIG.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-3 text-xs font-bold transition-all duration-150 border-b-2 cursor-pointer relative shrink-0 ${
                isActive
                  ? "text-foreground border-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-tabs Panel + Child Views */}
      <div className="pt-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full min-w-0">
            <TabsContent value="profile" className="mt-0 outline-none">
              <ProfileTab datasetId={datasetId} />
            </TabsContent>
            <TabsContent value="cleaning" className="mt-0 outline-none">
              <CleaningTab datasetId={datasetId} />
            </TabsContent>
            <TabsContent value="charts" className="mt-0 outline-none">
              <ChartsTab datasetId={datasetId} />
            </TabsContent>
            <TabsContent value="kpis" className="mt-0 outline-none">
              <KPITab datasetId={datasetId} />
            </TabsContent>
            <TabsContent value="insights" className="mt-0 outline-none">
              <InsightsTab datasetId={datasetId} />
            </TabsContent>
            <TabsContent value="chat" className="mt-0 outline-none">
              <ChatTab datasetId={datasetId} />
            </TabsContent>
            <TabsContent value="hypothesis" className="mt-0 outline-none">
              <HypothesisTab datasetId={datasetId} />
            </TabsContent>
            <TabsContent value="rootcause" className="mt-0 outline-none">
              <RootCauseTab datasetId={datasetId} />
            </TabsContent>
            <TabsContent value="recommendations" className="mt-0 outline-none">
              <RecommendationsTab datasetId={datasetId} />
            </TabsContent>
            <TabsContent value="report" className="mt-0 outline-none">
              <ReportGenerator analysisId={datasetId} />
            </TabsContent>
            <TabsContent value="statistics" className="mt-0 outline-none">
              <StatisticsTab datasetId={datasetId} />
            </TabsContent>
            <TabsContent value="anomalies" className="mt-0 outline-none">
              <AnomaliesTab datasetId={datasetId} />
            </TabsContent>
            <TabsContent value="forecast" className="mt-0 outline-none">
              <ForecastTab datasetId={datasetId} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
