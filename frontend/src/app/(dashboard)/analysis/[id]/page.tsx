"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Database, AlertTriangle } from "lucide-react";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { datasetsAPI, analysisAPI } from "@/lib/api";
import { useAnalysisStore } from "@/store/analysis-store";

// Import GooeyNav
import GooeyNav from "@/components/ui/GooeyNav";

// Import tabs
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

const TAB_GROUPS = [
  {
    title: "Data Foundation",
    tabs: [
      { value: "profile", label: "Profile & Health" },
      { value: "cleaning", label: "Automatic Cleaning" },
      { value: "kpis", label: "KPI Summary" },
    ]
  },
  {
    title: "AI Analysis & Chat",
    tabs: [
      { value: "chat", label: "Q&A Chat Assistant" },
      { value: "insights", label: "Key Insights" },
      { value: "recommendations", label: "Recommendations" },
    ]
  },
  {
    title: "Advanced Analytics",
    tabs: [
      { value: "charts", label: "Charts & EDA" },
      { value: "forecast", label: "Time-Series Forecast" },
      { value: "anomalies", label: "Anomalies Detection" },
      { value: "statistics", label: "Statistical Summary" },
      { value: "hypothesis", label: "Hypothesis Tester" },
      { value: "rootcause", label: "Root Cause (5 Whys)" },
    ]
  },
  {
    title: "Outputs",
    tabs: [
      { value: "report", label: "Executive Report" },
    ]
  }
];

export default function AnalysisDetailPage() {
  const { id } = useParams() as { id: string };
  const datasetId = id;
  const { setDataset, setAnalysis, activeTab, setActiveTab } = useAnalysisStore();

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

  const getGroupIndex = (tab: string): number => {
    if (["profile", "cleaning", "kpis"].includes(tab)) return 0;
    if (["chat", "insights", "recommendations"].includes(tab)) return 1;
    if (["charts", "forecast", "anomalies", "statistics", "hypothesis", "rootcause"].includes(tab)) return 2;
    return 3;
  };

  const handleGooeyChange = (index: number) => {
    const defaultTabs = ["profile", "chat", "charts", "report"];
    setActiveTab(defaultTabs[index]);
  };

  if (datasetLoading || (analysisLoading && dataset?.status === "completed")) {
    return (
      <div className="flex flex-col gap-6 py-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-16 rounded-xl bg-white/[0.01] border border-zinc-900" />
        <div className="h-12 rounded-xl bg-white/[0.01] border border-zinc-900" />
        <div className="h-[400px] rounded-xl bg-white/[0.01] border border-zinc-900" />
      </div>
    );
  }

  if (datasetError || !dataset) {
    return (
      <div className="py-12 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-[#ea580c] mx-auto" />
        <h2 className="text-xl font-bold text-zinc-100">Dataset not found</h2>
        <p className="text-zinc-550 text-sm">We couldn't retrieve the requested case analysis. Please check cases archive or upload again.</p>
      </div>
    );
  }

  if (dataset.status === "running" || dataset.status === "pending" || dataset.status === "uploaded") {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-6">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-[#ea580c]/20 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-t-[#ea580c] animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Investigating Evidence Case...</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Detective AI is profiling schema, scanning correlations, detecting anomalies, and running ARIMA forecasting in the background.
          </p>
        </div>
      </div>
    );
  }

  if (dataset.status === "failed") {
    return (
      <div className="py-12 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-100">Investigation Failed</h2>
        <p className="text-zinc-550 text-sm">An error occurred during dataset profiling. Please check that your file is formatted correctly or try uploading another case file.</p>
      </div>
    );
  }

  const currentGroupIndex = getGroupIndex(activeTab);
  const activeGroup = TAB_GROUPS[currentGroupIndex];

  const gooeyItems = TAB_GROUPS.map((g) => ({
    label: g.title,
    href: "#"
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans text-zinc-300">
      
      {/* Dataset Header Card */}
      <Card className="border-zinc-900 bg-[#09090B] shadow-none">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-black border border-zinc-900 text-[#ea580c]">
              <Database className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm font-black text-white tracking-tight">{dataset.name}</h1>
                <Badge className="bg-black border border-zinc-900 text-zinc-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold">
                  {dataset.file_type}
                </Badge>
              </div>
              <p className="text-[10px] text-zinc-500 font-semibold uppercase mt-1 tracking-wider">
                Size: <span className="font-mono text-zinc-300">{(dataset.file_size / (1024 * 1024)).toFixed(2)} MB</span> | 
                Rows: <span className="font-mono text-zinc-300">{dataset.row_count?.toLocaleString()}</span> | 
                Cols: <span className="font-mono text-zinc-300">{dataset.column_count}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Dataset Health</p>
              <p className="text-xs font-mono font-black text-zinc-300 mt-0.5">{dataset.health_score ? `${Math.round(dataset.health_score)}%` : "N/A"}</p>
            </div>
            <div className="w-1.5 h-10 rounded-full bg-zinc-900 relative">
              {dataset.health_score && (
                <div
                  className="absolute left-[-2px] w-2.5 h-2.5 rounded-full bg-[#ea580c] border border-zinc-950 shadow-md"
                  style={{ bottom: `${dataset.health_score}%` }}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gooey Stage Navigation Tab Bar */}
      <div className="border border-zinc-900 bg-[#09090B] p-2 rounded-xl flex items-center justify-between shadow-none overflow-x-auto scrollbar-none">
        <GooeyNav
          items={gooeyItems}
          initialActiveIndex={currentGroupIndex}
          onChange={handleGooeyChange}
          particleCount={12}
          particleDistances={[60, 5]}
          particleR={80}
        />
      </div>

      {/* Sub-tabs Panel + Child Views */}
      <div className="space-y-4">
        {/* Flat Horizontal Sub-nav list */}
        <div className="flex gap-2 border-b border-zinc-900/60 pb-2.5 overflow-x-auto scrollbar-none">
          {activeGroup.tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-1.5 text-[11px] font-bold rounded-full border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#ea580c]/5 text-white border-[#ea580c]/35 shadow-[0_0_10px_rgba(234,88,12,0.03)]"
                    : "text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-zinc-900/30"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Renderers */}
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
