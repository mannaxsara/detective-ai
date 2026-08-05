"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analysisAPI } from "@/lib/api";
import { useECharts } from "@/hooks/use-echarts";

import {
  Legend,
  LegendItemComponent,
  LegendMarker,
  LegendLabel,
  LegendValue,
  LegendProgress,
  LegendItemData,
} from "@/components/ui/chart-legend";
import { Grid } from "@/components/ui/chart-grid";

interface ChartsTabProps {
  datasetId: number | string;
}

function ChartItem({ chart }: { chart: any }) {
  const { chartRef } = useECharts(chart.config);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Extract legend item data if available from config series/data
  const legendItems: LegendItemData[] = React.useMemo(() => {
    if (!chart.config?.series?.[0]?.data) return [];
    const seriesData = chart.config.series[0].data;
    const xAxisData = chart.config?.xAxis?.data || [];
    const colors = ["#d8cfbc", "#565449", "#8c8a7e", "#bc3e3e", "#78c51c", "#bed4fb"];

    if (Array.isArray(seriesData)) {
      return seriesData.slice(0, 5).map((item: any, idx: number) => {
        const val = typeof item === "number" ? item : item.value || 0;
        const label = typeof item === "object" && item.name ? item.name : xAxisData[idx] || `Item ${idx + 1}`;
        return {
          label: String(label),
          value: Number(val),
          color: colors[idx % colors.length],
        };
      });
    }
    return [];
  }, [chart]);

  return (
    <Card className="border border-border bg-card shadow-xs hover:border-foreground/40 transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
        <div>
          <CardTitle className="text-sm font-serif font-bold text-foreground">{chart.title}</CardTitle>
          <p className="text-muted-foreground text-xs font-medium mt-0.5">{chart.description}</p>
        </div>
        <Badge variant="outline" className="text-[9px] uppercase font-mono">
          {chart.chart_type}
        </Badge>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Chart Canvas with Grid Overlay */}
        <div className="relative w-full h-72 rounded-lg bg-background/50 border border-border p-2 overflow-hidden">
          <Grid horizontal vertical numTicksRows={5} numTicksColumns={8} fadeHorizontal strokeDasharray="4,4" />
          <div ref={chartRef} className="w-full h-full relative z-10" />
        </div>

        {/* Legend Component */}
        {legendItems.length > 0 && (
          <div className="pt-2 border-t border-border/60">
            <Legend
              items={legendItems}
              title="Series Breakdown & Distribution"
              hoveredIndex={hoveredIndex}
              onHoverChange={setHoveredIndex}
            >
              <LegendItemComponent className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 p-2 rounded-md hover:bg-muted/40 transition-all">
                <LegendMarker />
                <LegendLabel />
                <LegendValue showPercentage />
                <div className="col-span-full">
                  <LegendProgress />
                </div>
              </LegendItemComponent>
            </Legend>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ChartsTab({ datasetId }: ChartsTabProps) {
  const { data: charts, isLoading } = useQuery({
    queryKey: ["analysis-charts", datasetId],
    queryFn: () => analysisAPI.getCharts(datasetId),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse font-sans">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-96 rounded-xl bg-muted/20 border border-border/40" />
        ))}
      </div>
    );
  }

  const chartList = charts || [];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground font-sans">Exploratory Data Visualizations</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automatically generated charts showing variables correlation, distribution and top classes.
          </p>
        </div>
      </div>

      {chartList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartList.map((chart, idx) => (
            <ChartItem key={idx} chart={chart} />
          ))}
        </div>
      ) : (
        <Card className="border-border bg-card/50 border-dashed py-16 text-center shadow-none">
          <CardContent className="space-y-4">
            <BarChart3 className="w-12 h-12 text-muted-foreground/60 mx-auto" />
            <div>
              <h4 className="font-bold text-foreground">No visualizations created</h4>
              <p className="text-muted-foreground text-xs mt-1">This dataset does not contain sufficient columns for plotting charts.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
