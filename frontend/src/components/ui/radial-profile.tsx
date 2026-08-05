"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface RadialMetric {
  label: string;
  score: number; // 0 to 100
  color?: string;
}

interface RadialProfileProps {
  metrics: RadialMetric[];
  title?: string;
  className?: string;
}

export function RadialProfile({
  metrics,
  title = "Schema Dimension Radar",
  className = "",
}: RadialProfileProps) {
  const colors = ["#d8cfbc", "#78c51c", "#bed4fb", "#f59e0b", "#a855f7"];

  return (
    <div className={cn("p-5 rounded-xl border border-border bg-card shadow-xs space-y-4", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <h4 className="text-xs font-serif font-bold text-foreground tracking-tight">{title}</h4>
          <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-wider">
            {metrics.length} Dimensions
          </span>
        </div>
      )}

      <div className="space-y-3">
        {metrics.map((metric, idx) => {
          const color = metric.color || colors[idx % colors.length];
          const pct = Math.min(100, Math.max(0, metric.score));

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-foreground text-xs">{metric.label}</span>
                </div>
                <span className="font-mono font-bold text-foreground text-xs">{pct}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden relative border border-border/30">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
