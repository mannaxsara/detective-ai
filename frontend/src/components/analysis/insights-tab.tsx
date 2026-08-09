"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb } from "lucide-react";
import { analysisAPI } from "@/lib/api";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/animate-ui/components/base/accordion";
import { PieChart, PieSlices, PieTooltip, PieLegend, PieDataItem } from "@/components/ui/chart-pie";

interface InsightsTabProps {
  datasetId: number | string;
}

function InsightCardItem({ insight, index }: { insight: any; index: number }) {
  let labelColor = "text-black dark:text-white";
  let iconBg = "bg-[#edf0e9] dark:bg-[#262720] border-black dark:border-[#3b3a33] text-black dark:text-white";
  
  if (insight.category === "Concentration") {
    labelColor = "text-black dark:text-white";
    iconBg = "bg-[#edfe5e] border-black text-black";
  } else if (insight.category === "Correlation") {
    labelColor = "text-black dark:text-white";
    iconBg = "bg-[#78c51c] border-black text-black";
  } else if (insight.category === "Margin Warning" || insight.priority === "high") {
    labelColor = "text-[#bc3e3e]";
    iconBg = "bg-[#f6d9d9] dark:bg-[#3a1f1f] border-[#bc3e3e] text-[#bc3e3e]";
  } else if (insight.priority === "medium") {
    labelColor = "text-[#b45309] dark:text-[#fbbf24]";
    iconBg = "bg-[#fdeed3] dark:bg-[#3a2e16] border-[#f59e0b] text-[#b45309] dark:text-[#fbbf24]";
  }

  let priorityColor = "bg-[#edf0e9] dark:bg-[#262720] border-black dark:border-[#3b3a33] text-black dark:text-white";
  if (insight.priority === "high") {
    priorityColor = "bg-[#f6d9d9] dark:bg-[#3a1f1f] border-[#bc3e3e] text-[#bc3e3e]";
  } else if (insight.priority === "medium") {
    priorityColor = "bg-[#fdeed3] dark:bg-[#3a2e16] border-[#f59e0b] text-[#b45309] dark:text-[#fbbf24]";
  }

  return (
    <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] shadow-[4px_4px_0px_#000000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] transition-all duration-200">
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-[8px] border shadow-[1px_1px_0px_#000000] ${iconBg}`}>
              <Lightbulb className="w-4 h-4" />
            </div>
            <span className={`font-bold text-xs uppercase tracking-wider ${labelColor}`}>
              {insight.category || "General Discovery"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border shadow-[1px_1px_0px_#000000] shrink-0 ${priorityColor}`}>
              {insight.priority} Priority
            </span>
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border border-black dark:border-[#3b3a33] bg-[#edf0e9] dark:bg-[#262720] text-black dark:text-white shrink-0">
              {insight.confidence_score}% Conf
            </span>
          </div>
        </div>

        <div>
          <p className="text-black/90 dark:text-white/90 text-xs sm:text-sm font-semibold leading-relaxed break-words">
            {insight.description}
          </p>
        </div>

        {insight.supporting_data && (
          <div className="border-t border-black/15 dark:border-white/15 pt-3">
            <Accordion multiple={false}>
              <AccordionItem value={`supporting-data-${index}`} className="border-none bg-transparent rounded-none">
                <AccordionTrigger className="p-0 text-[10px] font-bold text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 transition-colors flex items-center gap-1">
                  Supporting Investigation Details
                </AccordionTrigger>
                <AccordionPanel className="mt-3 p-3.5 rounded-lg bg-[#edf0e9] dark:bg-[#262720] border border-black/20 dark:border-white/20 text-xs font-mono text-black/80 dark:text-white/80 space-y-1.5 overflow-x-auto">
                  {Object.entries(insight.supporting_data).map(([key, val]) => (
                    <div key={key} className="flex justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-1 last:border-0 last:pb-0">
                      <span className="text-black/60 dark:text-white/60 capitalize">{key.replace("_", " ")}:</span>
                      <span className="font-bold text-black dark:text-white">{JSON.stringify(val)}</span>
                    </div>
                  ))}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InsightsTab({ datasetId }: InsightsTabProps) {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["analysis-insights", datasetId],
    queryFn: () => analysisAPI.getInsights(datasetId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse font-sans">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-[18px] bg-[#edf0e9] dark:bg-[#262720] border border-black/15 dark:border-white/15" />
        ))}
      </div>
    );
  }

  const insightList = insights || [];

  const categoryBreakdown: PieDataItem[] = Object.entries(
    (insightList).reduce((acc: Record<string,number>, ins: any) => {
      const cat = ins.category || 'General';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string,number>)
  ).map(([name, value], i) => ({
    name,
    value: value as number,
    fill: ['#d8cfbc', '#78c51c', '#bed4fb', '#f59e0b', '#a855f7', '#bc3e3e'][i % 6],
  }));

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-black dark:border-[#3b3a33] pb-4">
        <div>
          <h2 className="text-base font-bold text-black dark:text-white">Discovered Business Insights</h2>
          <p className="text-xs text-black/75 dark:text-white/75 mt-0.5 font-medium">
            Key statistical relationships, segmentation flags, or temporal spikes detected by DetectiveAI.
          </p>
        </div>
      </div>

      {insightList.length > 0 && categoryBreakdown.length > 0 && (
        <div className="rounded-[18px] border border-black dark:border-[#3b3a33] p-5 bg-white dark:bg-[#1c1d18] space-y-3 shadow-[4px_4px_0px_#000000]">
          <div>
            <h3 className="text-xs font-serif font-bold text-black dark:text-white">Insight Categories</h3>
            <p className="text-black/60 dark:text-white/60 text-[10px] mt-0.5">Distribution of discovered insights</p>
          </div>
          <PieChart data={categoryBreakdown} innerRadius={40} outerRadius={75} paddingAngle={2} height={240}>
            <PieSlices />
            <PieTooltip />
            <PieLegend />
          </PieChart>
        </div>
      )}

      {insightList.length > 0 ? (
        <div className="space-y-4">
          {insightList.map((insight, idx) => (
            <InsightCardItem key={idx} index={idx} insight={insight} />
          ))}
        </div>
      ) : (
        <div className="rounded-[18px] border border-dashed border-black dark:border-[#3b3a33] bg-white/50 dark:bg-[#1c1d18]/50 py-16 text-center shadow-none">
          <div className="space-y-4">
            <Lightbulb className="w-12 h-12 text-black/40 dark:text-white/40 mx-auto" />
            <div>
              <h4 className="font-bold text-black dark:text-white">No insights discovered</h4>
              <p className="text-black/60 dark:text-white/60 text-xs mt-1 font-semibold">
                This dataset does not show key value groupings or variable dependencies.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
