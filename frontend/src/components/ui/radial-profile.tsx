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
  const colors = ["#edfe5e", "#31e992", "#bed4fb", "#f59e0b", "#a855f7"];

  return (
    <div className={cn("p-6 rounded-[16px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] shadow-[4px_4px_0px_#000000] space-y-4", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-black/15 dark:border-white/15 pb-3">
          <h4 className="text-sm font-serif font-bold text-black dark:text-white tracking-tight">{title}</h4>
          <span className="text-[10px] font-mono text-black dark:text-white uppercase font-bold tracking-wider bg-[#edf0e9] dark:bg-[#262720] px-2.5 py-0.5 rounded border border-black">
            {metrics.length} Dimensions
          </span>
        </div>
      )}

      <div className="space-y-3.5">
        {metrics.map((metric, idx) => {
          const color = metric.color || colors[idx % colors.length];
          const pct = Math.min(100, Math.max(0, metric.score));

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-black"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-bold font-serif text-black dark:text-white text-xs">{metric.label}</span>
                </div>
                <span className="font-mono font-bold text-black dark:text-white text-xs">{pct}%</span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-[#edf0e9] dark:bg-[#262720] overflow-hidden relative border border-black">
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
