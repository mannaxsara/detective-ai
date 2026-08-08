"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";

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

interface ChartsTabProps {
  datasetId: number | string;
}

function ChartItem({ chart }: { chart: any }) {
  const { chartRef } = useECharts(chart.config);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Extract legend item data ONLY if available from pie/bar series data (not scatter plots)
  const legendItems: LegendItemData[] = React.useMemo(() => {
    if (chart.chart_type === "scatter" || chart.chart_type === "line" || chart.chart_type === "heatmap") {
      return [];
    }
    if (!chart.config?.series?.[0]?.data) return [];
    const seriesData = chart.config.series[0].data;
    const xAxisData = chart.config?.xAxis?.data || [];
    const colors = ["#edfe5e", "#31e992", "#bed4fb", "#f59e0b", "#a855f7", "#bc3e3e"];

    if (Array.isArray(seriesData)) {
      const items = seriesData
        .map((item: any, idx: number) => {
          const val = typeof item === "number" ? item : (item.value || 0);
          const label = typeof item === "object" && item.name ? item.name : (xAxisData[idx] || "");
          return {
            label: String(label),
            value: Number(val),
            color: colors[idx % colors.length],
          };
        })
        .filter((item) => item.label.trim() !== "" && item.value > 0);

      return items.slice(0, 6);
    }
    return [];
  }, [chart]);

  return (
    <div className="border border-black dark:border-[#3b3a33] rounded-[18px] bg-white dark:bg-[#1c1d18] p-6 shadow-[4px_4px_0px_#000000] space-y-4 min-w-0 overflow-hidden text-left">
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3 gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-serif font-bold text-black dark:text-white truncate">{chart.title}</h3>
          <p className="text-black/75 dark:text-white/75 text-xs font-sans mt-0.5 truncate">{chart.description}</p>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#edfe5e] text-black border border-black px-2.5 py-0.5 rounded shadow-[1px_1px_0px_#000000] shrink-0">
          {chart.chart_type}
        </span>
      </div>
      
      {/* Chart Canvas */}
      <div className="relative w-full h-80 rounded-[12px] bg-[#f9f9f7] dark:bg-[#262720] border border-black dark:border-[#3b3a33] p-3 overflow-hidden">
        <div ref={chartRef} className="w-full h-full min-w-0" />
      </div>

      {/* Legend Component (Rendered only when valid non-zero items exist) */}
      {legendItems.length > 0 && (
        <div className="pt-3 border-t border-black/10 dark:border-white/10">
          <Legend
            items={legendItems}
            title="Series Breakdown & Distribution"
            hoveredIndex={hoveredIndex}
            onHoverChange={setHoveredIndex}
          >
            <LegendItemComponent className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 p-2 rounded-[8px] hover:bg-[#edf0e9] dark:hover:bg-[#262720] transition-all">
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
    </div>
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
          <div key={i} className="h-96 rounded-[18px] bg-white dark:bg-[#1c1d18] border border-black dark:border-[#3b3a33]" />
        ))}
      </div>
    );
  }

  const chartList = charts || [];

  return (
    <div className="space-y-6 font-sans text-black dark:text-white text-left">
      <div className="flex items-center justify-between border-b border-black dark:border-[#3b3a33] pb-4 gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-serif font-bold tracking-tight">Exploratory Data Visualizations</h2>
          <p className="text-xs font-sans text-black/75 dark:text-white/75 mt-0.5">
            Automatically generated charts showing variable correlation, distribution, and top classes.
          </p>
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-wider bg-[#edfe5e] text-black border border-black px-3 py-1 rounded-[6px] shadow-[2px_2px_0px_#000000] shrink-0">
          {chartList.length} Charts Active
        </span>
      </div>

      {chartList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartList.map((chart, idx) => (
            <ChartItem key={idx} chart={chart} />
          ))}
        </div>
      ) : (
        <div className="rounded-[18px] border-2 border-dashed border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] py-16 text-center shadow-[4px_4px_0px_#000000]">
          <BarChart3 className="w-12 h-12 text-black/40 dark:text-white/40 mx-auto mb-3" />
          <h4 className="font-serif font-bold text-black dark:text-white text-base">No Visualizations Created</h4>
          <p className="text-black/75 dark:text-white/75 text-xs mt-1 font-sans max-w-xs mx-auto">
            This dataset does not contain sufficient columns for plotting charts.
          </p>
        </div>
      )}
    </div>
  );
}
