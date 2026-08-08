"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Database,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Loader2,
  Table,
  Sparkles,
  Zap,
  Activity,
  LineChart,
  PieChart,
  HelpCircle,
  CheckCircle,
  FileText,
  FileCode
} from "lucide-react";
import { toast } from "sonner";
import { datasetsAPI } from "@/lib/api";
import { useAnalysisStore } from "@/store/analysis-store";
import { GaugeChart } from "@/components/ui/gauge-chart";

import ProfileTab from "@/components/analysis/profile-tab";
import CleaningTab from "@/components/analysis/cleaning-tab";
import KpiTab from "@/components/analysis/kpi-tab";
import InsightsTab from "@/components/analysis/insights-tab";
import ChatTab from "@/components/analysis/chat-tab";
import ChartsTab from "@/components/analysis/charts-tab";
import ForecastTab from "@/components/analysis/forecast-tab";
import AnomaliesTab from "@/components/analysis/anomalies-tab";
import StatisticsTab from "@/components/analysis/statistics-tab";
import HypothesisTab from "@/components/analysis/hypothesis-tab";
import RootCauseTab from "@/components/analysis/root-cause-tab";
import RecommendationsTab from "@/components/analysis/recommendations-tab";
import ReportGenerator from "@/components/reports/report-generator";

const TABS_CONFIG = [
  { value: "profile", label: "Evidence", icon: Database },
  { value: "cleaning", label: "Cleaning", icon: Activity },
  { value: "kpis", label: "KPIs", icon: Zap },
  { value: "insights", label: "Insights", icon: Sparkles },
  { value: "chat", label: "Chat", icon: Table },
  { value: "charts", label: "Charts", icon: PieChart },
  { value: "forecast", label: "Forecast", icon: LineChart },
  { value: "anomalies", label: "Anomalies", icon: AlertTriangle },
  { value: "statistics", label: "Statistics", icon: Activity },
  { value: "hypothesis", label: "Hypothesis", icon: HelpCircle },
  { value: "rootcause", label: "Root Cause", icon: CheckCircle },
  { value: "recommendations", label: "Recommendations", icon: FileText },
  { value: "report", label: "Report", icon: FileCode },
];

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { activeTab, setActiveTab } = useAnalysisStore();
  const [downloading, setDownloading] = useState(false);

  const { data: dataset, isLoading, error } = useQuery({
    queryKey: ["dataset-detail", id],
    queryFn: () => datasetsAPI.getById(id),
    enabled: !!id,
  });

  const handleDownload = async () => {
    if (!dataset) return;
    setDownloading(true);
    try {
      const blob = await datasetsAPI.download(dataset.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${dataset.name}_cleaned.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Cleaned dataset downloaded successfully.");
    } catch (err) {
      toast.error("Failed to download dataset.");
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-6 animate-pulse font-sans">
        <div className="h-32 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
        <div className="h-12 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
        <div className="h-96 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4 font-sans text-black dark:text-white">
        <AlertTriangle className="w-10 h-10 text-[#bc3e3e] mx-auto" />
        <h2 className="text-lg font-bold">Case File Not Found</h2>
        <p className="text-black/70 dark:text-white/70 text-xs leading-relaxed font-medium">
          The requested evidence dataset case could not be located in the repository archive.
        </p>
        <button
          onClick={() => router.push("/history")}
          className="btn-ink-accent text-xs py-2.5 px-5 font-mono uppercase font-bold inline-flex items-center gap-2"
        >
          Return to Case Archives
        </button>
      </div>
    );
  }

  if (dataset.status === "failed") {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4 font-sans text-black dark:text-white">
        <AlertTriangle className="w-10 h-10 text-[#bc3e3e] mx-auto" />
        <h2 className="text-lg font-bold">Investigation Failed</h2>
        <p className="text-black/70 dark:text-white/70 text-xs leading-relaxed font-medium">
          An error occurred during dataset profiling. Please check that your file is formatted correctly or try uploading another case file.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans text-black dark:text-white bg-[#f9f9f7] dark:bg-[#11120d]">
      
      {/* Distinct Dataset Header Card */}
      <div className="border border-black/15 dark:border-white/15 bg-white dark:bg-[#181914] rounded-xl p-6 md:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl bg-[#edfe5e] border border-black flex items-center justify-center text-black shrink-0 font-bold shadow-xs">
              <Database className="w-6 h-6 text-black shrink-0 stroke-[2.2]" />
            </div>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                <h1 className="text-xl font-serif font-bold text-black dark:text-white tracking-tight truncate min-w-0 max-w-[280px] sm:max-w-[480px]">
                  {dataset.name}
                </h1>
                <span className="bg-[#edf0e9] dark:bg-[#262720] border border-black/10 dark:border-white/10 text-black dark:text-white text-[10px] px-2.5 py-0.5 rounded font-mono uppercase font-bold shrink-0">
                  {dataset.file_type}
                </span>
              </div>
              <p className="text-xs text-black/70 dark:text-white/70 font-mono font-bold uppercase mt-1.5 tracking-wider truncate">
                Size: <span className="text-black dark:text-white">{(dataset.file_size / (1024 * 1024)).toFixed(2)} MB</span> | 
                Rows: <span className="text-black dark:text-white">{dataset.row_count?.toLocaleString()}</span> | 
                Cols: <span className="text-black dark:text-white">{dataset.column_count}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap md:flex-nowrap shrink-0 justify-between md:justify-end">
            <GaugeChart value={Math.round(dataset.health_score || 100)} size={80} strokeWidth={7} label="Health Score" />

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-ink-accent inline-flex items-center gap-2 py-2.5 px-5 font-mono text-xs uppercase tracking-wider font-bold cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Export Cleaned Data
            </button>
          </div>
        </div>
      </div>

      {/* Spacious Tab Navigation Bar with No Visible Scrollbar Line */}
      <div className="border-b border-black/15 dark:border-white/15 flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1">
        {TABS_CONFIG.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? "bg-[#edfe5e] text-black border-black/30 shadow-xs"
                  : "bg-white dark:bg-[#181914] text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white border-black/15 dark:border-white/15 hover:bg-[#edf0e9] dark:hover:bg-[#262720]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === "profile" && <ProfileTab datasetId={dataset.id} />}
        {activeTab === "cleaning" && <CleaningTab datasetId={dataset.id} />}
        {activeTab === "kpis" && <KpiTab datasetId={dataset.id} />}
        {activeTab === "insights" && <InsightsTab datasetId={dataset.id} />}
        {activeTab === "chat" && <ChatTab datasetId={dataset.id} />}
        {activeTab === "charts" && <ChartsTab datasetId={dataset.id} />}
        {activeTab === "forecast" && <ForecastTab datasetId={dataset.id} />}
        {activeTab === "anomalies" && <AnomaliesTab datasetId={dataset.id} />}
        {activeTab === "statistics" && <StatisticsTab datasetId={dataset.id} />}
        {activeTab === "hypothesis" && <HypothesisTab datasetId={dataset.id} />}
        {activeTab === "rootcause" && <RootCauseTab datasetId={dataset.id} />}
        {activeTab === "recommendations" && <RecommendationsTab datasetId={dataset.id} />}
        {activeTab === "report" && <ReportGenerator analysisId={dataset.id} />}
      </div>
    </div>
  );
}
