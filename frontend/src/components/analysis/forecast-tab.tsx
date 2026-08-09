"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { LoaderOne } from "@/components/ui/loader";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analysisAPI, datasetsAPI } from "@/lib/api";
import { useECharts } from "@/hooks/use-echarts";

import { AreaChart, Area, AreaGradient, AreaXAxis, AreaYAxis, AreaGrid, AreaTooltip } from "@/components/ui/chart-area";
import {
  Legend,
  LegendItemComponent,
  LegendMarker,
  LegendLabel,
  LegendValue,
  LegendProgress,
  type LegendItemData,
} from "@/components/ui/chart-legend";

interface ForecastTabProps {
  datasetId: number | string;
}

function ForecastChartItem({ forecast }: { forecast: any }) {
  const dates = forecast.dates || [];
  const values = forecast.values || [];
  const lower = forecast.lower_bound || [];
  const upper = forecast.upper_bound || [];

  const meanExpected = values.length ? Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length) : 0;
  const meanLower = lower.length ? Math.round(lower.reduce((a: number, b: number) => a + b, 0) / lower.length) : 0;
  const meanUpper = upper.length ? Math.round(upper.reduce((a: number, b: number) => a + b, 0) / upper.length) : 0;

  const maxVal = Math.max(...upper, 1);

  const forecastLegendItems: LegendItemData[] = [
    { label: "Expected Value Projections", value: meanExpected, maxValue: maxVal, color: "#edfe5e" },
    { label: "Lower Confidence Bound", value: meanLower, maxValue: maxVal, color: "#bc3e3e" },
    { label: "Upper Confidence Bound", value: meanUpper, maxValue: maxVal, color: "#31e992" },
  ];

  const option = {
    legend: { show: false },
    grid: { left: "4%", right: "4%", bottom: "6%", top: "10%", containLabel: true },
    xAxis: { type: "category", data: dates },
    yAxis: { type: "value" },
    series: [
      {
        name: "Forecasted Value",
        type: "line",
        data: values,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5, color: "#edfe5e" },
        itemStyle: { color: "#edfe5e" },
      },
      {
        name: "Confidence Bound (Upper)",
        type: "line",
        data: upper,
        lineStyle: { opacity: 0 },
        showSymbol: false,
      },
      {
        name: "Confidence Bound (Lower)",
        type: "line",
        data: lower,
        lineStyle: { opacity: 0 },
        showSymbol: false,
        stack: "confidence-stack",
        areaStyle: { color: "rgba(237, 254, 94, 0.2)" },
      },
    ],
  };

  const { chartRef } = useECharts(option as any);

  return (
    <div className="space-y-6 font-sans">
      <div className="relative w-full h-80 rounded-[12px] bg-[#f9f9f7] dark:bg-[#262720] border border-black dark:border-[#3b3a33] p-3 overflow-hidden">
        <div ref={chartRef} className="w-full h-full min-w-0" />
      </div>

      <div className="border border-black dark:border-[#3b3a33] rounded-[14px] bg-[#edf0e9] dark:bg-[#262720] p-4 shadow-[2px_2px_0px_#000000]">
        <Legend items={forecastLegendItems} title="Projection Statistics (80% Confidence Interval)">
          <LegendItemComponent className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 p-2 rounded-[8px] hover:bg-white dark:hover:bg-[#1c1d18] transition-all">
            <LegendMarker />
            <LegendLabel />
            <LegendValue />
            <div className="col-span-full">
              <LegendProgress />
            </div>
          </LegendItemComponent>
        </Legend>
      </div>
    </div>
  );
}

export default function ForecastTab({ datasetId }: ForecastTabProps) {
  const [periods, setPeriods] = useState<number>(30);
  const [targetCol, setTargetCol] = useState<string | null>(null);
  const [modelType, setModelType] = useState<string>("prophet");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["dataset-profile", datasetId],
    queryFn: () => datasetsAPI.getProfile(datasetId),
  });

  const numericColumns = profile?.columns?.filter((col: any) => col.classification === "numeric") || [];

  React.useEffect(() => {
    if (numericColumns.length > 0 && !targetCol) {
      setTargetCol(numericColumns[0]?.name);
    }
  }, [numericColumns, targetCol]);

  const { data: forecast, isLoading: forecastLoading, refetch } = useQuery({
    queryKey: ["analysis-forecast", datasetId, periods, targetCol, modelType],
    queryFn: () => analysisAPI.getForecast(datasetId, targetCol, periods, modelType),
    enabled: !!targetCol || numericColumns.length === 0,
  });

  const handleRunForecast = async () => {
    setIsGenerating(true);
    try {
      const res = await refetch();
      if (res.data) {
        toast.success(`Generated ${periods}-day ${modelType.toUpperCase()} forecast projection for "${targetCol || 'selected metric'}".`);
      } else {
        toast.error("Failed to generate forecast for this column.");
      }
    } catch (err) {
      toast.error("Forecast generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isLoading = profileLoading || forecastLoading;

  const areaData = forecast ? forecast.dates.map((date: string, i: number) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    predicted: forecast.values[i],
    lower: forecast.lower_bound[i],
    upper: forecast.upper_bound[i],
    band: Math.max(0, (forecast.upper_bound[i] ?? 0) - (forecast.lower_bound[i] ?? 0)),
  })) : [];

  if (isLoading && !forecast) {
    return (
      <div className="space-y-6 animate-pulse font-sans">
        <div className="h-16 rounded-[14px] bg-[#edf0e9] dark:bg-[#262720] border border-black" />
        <div className="h-96 rounded-[18px] bg-white dark:bg-[#1c1d18] border border-black" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-black dark:text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black dark:border-[#3b3a33] pb-4">
        <div>
          <h2 className="text-base font-serif font-bold tracking-tight">Predictive Time-Series Forecasting</h2>
          <p className="text-xs font-sans text-black/75 dark:text-white/75 mt-0.5">
            Auto-detect temporal dates and run Prophet or ARIMA statistical models to project future trends with 80% confidence bands.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={modelType}
            onValueChange={(val) => setModelType(val || "prophet")}
          >
            <SelectTrigger className="w-40 bg-white dark:bg-[#1c1d18] border border-black dark:border-[#3b3a33] text-black dark:text-white text-xs font-mono font-bold rounded-[8px]">
              <SelectValue placeholder="Algorithm" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#1c1d18] border border-black dark:border-[#3b3a33] text-black dark:text-white text-xs font-mono font-bold">
              <SelectItem value="prophet">Prophet Model</SelectItem>
              <SelectItem value="arima">ARIMA (1,1,1) Model</SelectItem>
            </SelectContent>
          </Select>

          {numericColumns.length > 0 && (
            <Select
              value={targetCol || ""}
              onValueChange={(val) => setTargetCol(val || null)}
            >
              <SelectTrigger className="w-44 bg-white dark:bg-[#1c1d18] border border-black dark:border-[#3b3a33] text-black dark:text-white text-xs font-mono font-bold rounded-[8px]">
                <SelectValue placeholder="Select Metric" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#1c1d18] border border-black dark:border-[#3b3a33] text-black dark:text-white text-xs font-mono font-bold">
                {numericColumns.map((col: any) => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={periods.toString()}
            onValueChange={(val) => setPeriods(parseInt(val || "30", 10))}
          >
            <SelectTrigger className="w-32 bg-white dark:bg-[#1c1d18] border border-black dark:border-[#3b3a33] text-black dark:text-white text-xs font-mono font-bold rounded-[8px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#1c1d18] border border-black dark:border-[#3b3a33] text-black dark:text-white text-xs font-mono font-bold">
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={handleRunForecast}
            disabled={isGenerating || forecastLoading}
            className="btn-ink-accent text-xs py-2 px-5 font-mono uppercase font-bold shadow-[2px_2px_0px_#000000] cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating || forecastLoading ? (
              <>
                <LoaderOne />
                <span>Predicting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Forecast</span>
              </>
            )}
          </button>
        </div>
      </div>

      {forecast ? (
        <>
          <div className="border border-black dark:border-[#3b3a33] rounded-[18px] bg-white dark:bg-[#1c1d18] p-6 space-y-4 shadow-[4px_4px_0px_#000000]">
            <div className="flex flex-row items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <h3 className="text-xs uppercase font-mono font-bold text-black dark:text-white">
                Future Projection: <span className="bg-[#edfe5e] text-black px-2 py-0.5 rounded border border-black">{forecast.metric_name}</span>
              </h3>
              <span className="text-[10px] uppercase font-mono font-bold bg-[#edf0e9] dark:bg-[#262720] text-black dark:text-white border border-black flex items-center gap-1.5 rounded py-1 px-2.5">
                <Calendar className="w-3.5 h-3.5 text-black dark:text-white" />
                {periods}-Day Horizon
              </span>
            </div>
            <ForecastChartItem forecast={forecast} />
          </div>

          {areaData.length > 0 && (
            <div className="border border-black dark:border-[#3b3a33] rounded-[18px] bg-white dark:bg-[#1c1d18] p-6 space-y-4 shadow-[4px_4px_0px_#000000]">
              <div>
                <h3 className="text-sm font-serif font-bold text-black dark:text-white">Confidence Interval Projection</h3>
                <p className="text-black/70 dark:text-white/70 text-xs font-sans mt-0.5">Predicted values with 80% confidence band</p>
              </div>
              <AreaChart data={areaData} xDataKey="date" height={260}>
                <defs>
                  <AreaGradient id="predictedGrad" color="#edfe5e" startOpacity={0.6} stopOpacity={0.05} />
                  <AreaGradient id="confidenceGrad" color="#31e992" startOpacity={0.25} stopOpacity={0.02} />
                </defs>
                <AreaGrid horizontal strokeDasharray="4 4" />
                <AreaXAxis dataKey="date" />
                <AreaYAxis numTicks={5} />
                <Area dataKey="lower" stackId="confidence" fill="transparent" stroke="transparent" />
                <Area dataKey="band" stackId="confidence" fill="url(#confidenceGrad)" stroke="transparent" fillOpacity={0.6} />
                <Area dataKey="predicted" fill="url(#predictedGrad)" stroke="#000000" strokeWidth={2} />
                <AreaTooltip />
              </AreaChart>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-[18px] border-2 border-dashed border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] py-16 text-center shadow-[4px_4px_0px_#000000]">
          <LineChart className="w-12 h-12 text-black/40 dark:text-white/40 mx-auto mb-3" />
          <h4 className="font-serif font-bold text-black dark:text-white text-base">Forecasting Unavailable</h4>
          <p className="text-black/75 dark:text-white/75 text-xs mt-1 font-sans max-w-xs mx-auto">
            Your dataset must contain at least one temporal (date/datetime) column and one numeric column.
          </p>
        </div>
      )}
    </div>
  );
}
