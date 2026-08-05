"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const profitLossColor = (value: number, positiveColor = "#78c51c", negativeColor = "#bc3e3e") => {
  return value >= 0 ? positiveColor : negativeColor;
};

export function ProfitLossChart({
  data,
  dataKey,
  xDataKey = "period",
  positiveColor = "#78c51c",
  negativeColor = "#bc3e3e",
  strokeWidth = 2.5,
  height = 200,
  className
}: {
  data: Record<string, any>[];
  dataKey: string;
  xDataKey?: string;
  positiveColor?: string;
  negativeColor?: string;
  strokeWidth?: number;
  height?: number | string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const numHeight = typeof height === 'number' ? height : 200;
  
  const values = data.map(d => Number(d[dataKey]) || 0);
  const maxVal = Math.max(...values, 0);
  const minVal = Math.min(...values, 0);
  
  const padding = 20;
  const innerHeight = numHeight - padding * 2;
  const range = (maxVal - minVal) || 1;
  
  const getY = (val: number) => padding + innerHeight - ((val - minVal) / range) * innerHeight;
  const baselineY = getY(0);

  const getX = (i: number) => {
    if (data.length <= 1) return width / 2;
    return padding + (i / (data.length - 1)) * (width - padding * 2);
  };

  return (
    <div className={cn("w-full flex flex-col", className)}>
      <div ref={containerRef} className="relative w-full" style={{ height: numHeight }}>
        {width > 0 && (
          <svg width={width} height={numHeight} className="absolute inset-0 overflow-visible">
            {/* Baseline */}
            <line x1={0} y1={baselineY} x2={width} y2={baselineY} stroke="var(--muted)" strokeWidth={1} strokeDasharray="4 4" />
            
            {data.map((_, i) => {
              if (i === 0) return null;
              const v0 = values[i-1];
              const v1 = values[i];
              const x0 = getX(i-1);
              const y0 = getY(v0);
              const x1 = getX(i);
              const y1 = getY(v1);
              
              const color = profitLossColor(v1, positiveColor, negativeColor);
              
              return (
                <motion.line
                  key={`line-${i}`}
                  x1={x0} y1={y0} x2={x1} y2={y1}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                />
              );
            })}
            
            {data.map((d, i) => {
              const val = values[i];
              const cx = getX(i);
              const cy = getY(val);
              const color = profitLossColor(val, positiveColor, negativeColor);
              
              return (
                <motion.circle
                  key={`dot-${i}`}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={color}
                  stroke="var(--card)"
                  strokeWidth={2}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.05, type: "spring" }}
                />
              );
            })}
          </svg>
        )}
      </div>
      
      <div className="flex w-full justify-between mt-2">
        {data.map((d, i) => (
          <div key={i} className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            {d[xDataKey]}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfitLossLegend({ positiveColor = "#78c51c", negativeColor = "#bc3e3e", className }: { positiveColor?: string; negativeColor?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 text-[10px] font-mono font-bold text-muted-foreground", className)}>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: positiveColor }} />
        <span>PROFIT (≥0)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: negativeColor }} />
        <span>LOSS (&lt;0)</span>
      </div>
    </div>
  );
}
