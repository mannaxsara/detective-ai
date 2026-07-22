"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  let labelColor = "text-muted-foreground";
  let iconBg = "bg-muted/50 border-border text-muted-foreground";
  
  if (insight.category === "Concentration") {
    labelColor = "text-primary";
    iconBg = "bg-primary/10 border-primary/20 text-primary";
  } else if (insight.category === "Correlation") {
    labelColor = "text-emerald-600 dark:text-emerald-400";
    iconBg = "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
  } else if (insight.category === "Margin Warning" || insight.priority === "high") {
    labelColor = "text-destructive";
    iconBg = "bg-destructive/10 border-destructive/20 text-destructive";
  } else if (insight.priority === "medium") {
    labelColor = "text-amber-600 dark:text-amber-400";
    iconBg = "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400";
  }

  let priorityColor = "bg-muted/50 border-border text-muted-foreground";
  if (insight.priority === "high") {
    priorityColor = "bg-destructive/10 border-destructive/20 text-destructive";
  } else if (insight.priority === "medium") {
    priorityColor = "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400";
  }

  return (
    <Card className="border border-border bg-card shadow-sm hover:border-border/80 transition-all duration-200">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border ${iconBg}`}>
              <Lightbulb className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs uppercase tracking-wider text-foreground">
              {insight.category || "General Discovery"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg border ${priorityColor}`}>
              {insight.priority} Priority
            </Badge>
            <Badge variant="outline" className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg bg-muted/50 text-muted-foreground border-border">
              {insight.confidence_score}% Conf
            </Badge>
          </div>
        </div>

        <div>
          <p className="text-foreground/90 text-xs sm:text-sm font-semibold leading-relaxed">
            {insight.description}
          </p>
        </div>

        {insight.supporting_data && (
          <div className="border-t border-border/50 pt-3">
            <Accordion multiple={false}>
              <AccordionItem value={`supporting-data-${index}`} className="border-none bg-transparent rounded-none">
                <AccordionTrigger className="p-0 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  Supporting Investigation Details
                </AccordionTrigger>
                <AccordionPanel className="mt-3 p-3.5 rounded-lg bg-muted/30 border border-border text-xs font-mono text-muted-foreground space-y-1.5 overflow-x-auto">
                  {Object.entries(insight.supporting_data).map(([key, val]) => (
                    <div key={key} className="flex justify-between gap-4 border-b border-border/20 pb-1 last:border-0 last:pb-0">
                      <span className="text-muted-foreground capitalize">{key.replace("_", " ")}:</span>
                      <span className="text-primary font-bold">{JSON.stringify(val)}</span>
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
      <div className="space-y-4 animate-pulse font-sans">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/20 border border-border/40" />
        ))}
      </div>
    );
  }

  const insightList = insights || [];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Discovered Business Insights</h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
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
        <Card className="border-border bg-card/50 border-dashed py-16 text-center shadow-none">
          <CardContent className="space-y-4">
            <Lightbulb className="w-12 h-12 text-muted-foreground/60 mx-auto" />
            <div>
              <h4 className="font-bold text-foreground">No insights discovered</h4>
              <p className="text-muted-foreground text-xs mt-1 font-semibold">
                This dataset does not show key value groupings or variable dependencies.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
