"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analysisAPI } from "@/lib/api";
import { useECharts } from "@/hooks/use-echarts";

interface ChartsTabProps {
  datasetId: number | string;
}

function ChartItem({ chart }: { chart: any }) {
  // Use direct ECharts custom hook
  const { chartRef } = useECharts(chart.config);

  return (
    <Card className="border-border bg-card hover:border-border/80 transition-all duration-200 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-sm font-bold text-foreground">{chart.title}</CardTitle>
          <p className="text-muted-foreground text-xs mt-0.5">{chart.description}</p>
        </div>
        <Badge variant="outline" className="text-[9px] uppercase bg-muted/50 text-muted-foreground border-border">
          {chart.chart_type}
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Container for chart */}
        <div ref={chartRef} className="w-full h-80 bg-muted/20 rounded-lg" />
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
