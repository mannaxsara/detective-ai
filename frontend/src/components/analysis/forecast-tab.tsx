"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Calendar } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { analysisAPI, datasetsAPI } from "@/lib/api";
import { useECharts } from "@/hooks/use-echarts";

import { Grid } from "@/components/ui/chart-grid";
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
    { label: "Expected Value Projections", value: meanExpected, maxValue: maxVal, color: "#d8cfbc" },
    { label: "Lower Confidence Bound", value: meanLower, maxValue: maxVal, color: "#bc3e3e" },
    { label: "Upper Confidence Bound", value: meanUpper, maxValue: maxVal, color: "#78c51c" },
  ];

  const option = {
    legend: {
      show: false,
    },
    grid: {
      left: "4%",
      right: "4%",
      bottom: "6%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dates,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Forecasted Value",
        type: "line",
        data: values,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2.5,
          color: "#d8cfbc",
        },
        itemStyle: {
          color: "#d8cfbc",
        },
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
        areaStyle: {
          color: "rgba(216, 207, 188, 0.15)",
        },
      },
    ],
  };

  const { chartRef } = useECharts(option as any);

  return (
    <div className="space-y-6 font-sans">
      {/* Chart Canvas with Grid Overlay */}
      <div className="relative w-full h-80 rounded-xl bg-background/50 border border-border p-2 overflow-hidden">
        <Grid horizontal vertical numTicksRows={6} numTicksColumns={8} fadeHorizontal strokeDasharray="4,4" />
        <div ref={chartRef} className="w-full h-full relative z-10" />
      </div>

      {/* Composed Chart Legend */}
      <Card className="border border-border bg-card p-4 shadow-none">
        <Legend items={forecastLegendItems} title="Projection Statistics (80% Confidence Interval)">
          <LegendItemComponent className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 p-2 rounded-md hover:bg-muted/40 transition-all">
            <LegendMarker />
            <LegendLabel />
            <LegendValue />
            <div className="col-span-full">
              <LegendProgress />
            </div>
          </LegendItemComponent>
        </Legend>
      </Card>
    </div>
  );
}

export default function ForecastTab({ datasetId }: ForecastTabProps) {
  const [periods, setPeriods] = useState<number>(30);
  const [targetCol, setTargetCol] = useState<string | null>(null);

  // Fetch dataset profile to populate column dropdown
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["dataset-profile", datasetId],
    queryFn: () => datasetsAPI.getProfile(datasetId),
  });

  const numericColumns = profile?.columns?.filter((col: any) => col.classification === "numeric") || [];

  // Set default column once profile is loaded
  React.useEffect(() => {
    if (numericColumns.length > 0 && !targetCol) {
      setTargetCol(numericColumns[0]?.name);
    }
  }, [numericColumns, targetCol]);

  const { data: forecast, isLoading: forecastLoading, refetch } = useQuery({
    queryKey: ["analysis-forecast", datasetId, periods, targetCol],
    queryFn: () => analysisAPI.getForecast(datasetId, targetCol, periods),
    enabled: !!targetCol || numericColumns.length === 0,
  });

  const handleRunForecast = () => {
    refetch();
  };

  const isLoading = profileLoading || forecastLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse font-sans">
        <div className="h-16 rounded-xl bg-muted/20 border border-border/40" />
        <div className="h-96 rounded-xl bg-muted/20 border border-border/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Prophet Predictive Forecasting</h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Auto-detect temporal dates and run Facebook Prophet to predict 30-day or 90-day future trends.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {numericColumns.length > 0 && (
            <Select
              value={targetCol || ""}
              onValueChange={(val) => setTargetCol(val || null)}
            >
              <SelectTrigger className="w-48 bg-muted/30 border-border text-foreground text-xs font-bold rounded-lg">
                <SelectValue placeholder="Select Metric" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground text-xs font-bold">
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
            <SelectTrigger className="w-32 bg-muted/30 border-border text-foreground text-xs font-bold rounded-lg">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground text-xs font-bold">
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleRunForecast}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg hover:scale-[1.01] transition-all cursor-pointer shadow-sm"
          >
            Generate Forecast
          </Button>
        </div>
      </div>

      {forecast ? (
        <Card className="border-border bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs uppercase tracking-wider font-bold text-foreground">
                Future Projection: <span className="text-primary">"{forecast.metric_name}"</span>
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold bg-muted/50 text-muted-foreground border-border flex items-center gap-1.5 rounded-lg py-1 px-2.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              {periods}-Day Horizon
            </Badge>
          </CardHeader>
          <CardContent>
            <ForecastChartItem forecast={forecast} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card/50 border-dashed py-16 text-center shadow-none">
          <CardContent className="space-y-4">
            <LineChart className="w-12 h-12 text-muted-foreground/60 mx-auto" />
            <div>
              <h4 className="font-bold text-foreground text-sm uppercase tracking-wide">Forecasting unavailable</h4>
              <p className="text-muted-foreground text-xs mt-1 font-semibold">
                Your dataset must contain at least one temporal (date/datetime) column and one numeric column.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
