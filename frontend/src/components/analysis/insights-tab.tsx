"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, Info, AlertTriangle, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analysisAPI } from "@/lib/api";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/animate-ui/components/base/accordion";

interface InsightsTabProps {
  datasetId: number | string;
}

function InsightCardItem({ insight, index }: { insight: any; index: number }) {
  let borderStyle = "border-l-[#27272A]";
  let labelColor = "text-zinc-300";
  
  if (insight.category === "Concentration") {
    borderStyle = "border-l-[#ea580c]";
    labelColor = "text-[#ea580c]";
  } else if (insight.category === "Correlation") {
    borderStyle = "border-l-[#10B981]";
    labelColor = "text-[#10B981]";
  } else if (insight.category === "Margin Warning" || insight.priority === "high") {
    borderStyle = "border-l-[#EF4444]";
    labelColor = "text-[#EF4444]";
  } else if (insight.priority === "medium") {
    borderStyle = "border-l-[#F59E0B]";
    labelColor = "text-[#F59E0B]";
  }

  let priorityColor = "bg-zinc-950 border-[#27272A] text-zinc-400";
  if (insight.priority === "high") {
    priorityColor = "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]";
  } else if (insight.priority === "medium") {
    priorityColor = "bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]";
  }

  return (
    <Card className={`border border-[#27272A] border-l-4 ${borderStyle} bg-[#111217] shadow-xl hover:border-zinc-700 transition-all duration-200`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className={`w-4.5 h-4.5 ${labelColor}`} />
            <span className="font-bold text-xs uppercase tracking-wider text-zinc-200">
              {insight.category || "General Discovery"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg border ${priorityColor}`}>
              {insight.priority} Priority
            </Badge>
            <Badge className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg bg-zinc-950 text-zinc-400 border border-[#27272A]">
              {insight.confidence_score}% Conf
            </Badge>
          </div>
        </div>

        <div>
          <p className="text-zinc-300 text-xs sm:text-sm font-semibold leading-relaxed">
            {insight.description}
          </p>
        </div>

        {insight.supporting_data && (
          <div className="border-t border-[#27272A]/50 pt-3">
            <Accordion multiple={false}>
              <AccordionItem value={`supporting-data-${index}`} className="border-none bg-transparent rounded-none">
                <AccordionTrigger className="p-0 text-[10px] font-bold text-[#ea580c] hover:text-[#f97316] transition-colors flex items-center gap-1">
                  Supporting Investigation Details
                </AccordionTrigger>
                <AccordionPanel className="mt-3 p-3.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs font-mono text-zinc-400 space-y-1.5 overflow-x-auto">
                  {Object.entries(insight.supporting_data).map(([key, val]) => (
                    <div key={key} className="flex justify-between gap-4 border-b border-[#27272A]/20 pb-1 last:border-0 last:pb-0">
                      <span className="text-zinc-500 capitalize">{key.replace("_", " ")}:</span>
                      <span className="text-[#ea580c] font-bold">{JSON.stringify(val)}</span>
                    </div>
                  ))}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function InsightsTab({ datasetId }: InsightsTabProps) {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["analysis-insights", datasetId],
    queryFn: () => analysisAPI.getInsights(datasetId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-[#111217]/50 border border-[#27272A]" />
        ))}
      </div>
    );
  }

  const insightList = insights || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-200">Discovered Business Insights</h2>
          <p className="text-xs text-zinc-500 mt-0.5 font-medium">
            Key statistical relationships, segmentation flags, or temporal spikes detected by DetectiveAI.
          </p>
        </div>
      </div>

      {insightList.length > 0 ? (
        <div className="space-y-4">
          {insightList.map((insight, idx) => (
            <InsightCardItem key={idx} index={idx} insight={insight} />
          ))}
        </div>
      ) : (
        <Card className="border-[#27272A] bg-[#111217]/30 border-dashed py-16 text-center">
          <CardContent className="space-y-4">
            <Lightbulb className="w-12 h-12 text-zinc-600 mx-auto" />
            <div>
              <h4 className="font-bold text-zinc-300">No insights discovered</h4>
              <p className="text-zinc-500 text-xs mt-1 font-semibold">
                This dataset does not show key value groupings or variable dependencies.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
