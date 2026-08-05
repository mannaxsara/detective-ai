"use client";

import React, { createContext, useContext, useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BarChartContextType {
  data: Record<string, any>[];
  xDataKey: string;
  layout: 'vertical' | 'horizontal';
  barGap: number;
  width: number;
  height: number;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  maxValue: number;
}

const BarChartContext = createContext<BarChartContextType | null>(null);

export function useBarChart() {
  const ctx = useContext(BarChartContext);
  if (!ctx) throw new Error("useBarChart must be used within <BarChart />");
  return ctx;
}

export function BarChart({
  data = [],
  xDataKey = "label",
  layout = "vertical",
  barGap = 4,
  height = 200,
  className,
  children
}: {
  data: Record<string, any>[];
  xDataKey?: string;
  layout?: 'vertical' | 'horizontal';
  barGap?: number;
  height?: number | string;
  className?: string;
  children: React.ReactNode;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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

  const maxValue = useMemo(() => {
    let max = 0;
    data.forEach(d => {
      Object.values(d).forEach(v => {
        if (typeof v === 'number' && v > max) max = v;
      });
    });
    return max || 1;
  }, [data]);

  const numHeight = typeof height === 'number' ? height : 200;

  return (
    <BarChartContext.Provider value={{ data, xDataKey, layout, barGap, width, height: numHeight, hoveredIndex, setHoveredIndex, maxValue }}>
      <div ref={containerRef} className={cn("relative w-full flex flex-col", className)} style={{ height: numHeight }}>
        {width > 0 && children}
      </div>
    </BarChartContext.Provider>
  );
}

export function BarGrid({ horizontal = true, strokeDasharray = "4 4", className }: { horizontal?: boolean; strokeDasharray?: string; className?: string }) {
  const { height, width } = useBarChart();
  const ticks = 4;
  return (
    <svg className={cn("absolute inset-0 pointer-events-none", className)} width={width} height={height}>
      {horizontal && Array.from({ length: ticks + 1 }).map((_, i) => {
        const y = (height / ticks) * i;
        return (
          <line key={i} x1={0} y1={y} x2={width} y2={y} stroke="var(--border)" strokeOpacity={0.4} strokeDasharray={strokeDasharray} />
        );
      })}
    </svg>
  );
}

export function Bar({ dataKey, fill = "#d8cfbc", radius = [4,4,0,0], activeBar = true }: { dataKey: string; fill?: string; radius?: number | [number,number,number,number]; stackId?: string; activeBar?: boolean }) {
  const { data, width, height, layout, barGap, hoveredIndex, setHoveredIndex, maxValue } = useBarChart();
  
  const count = data.length;
  const barWidth = layout === 'vertical' ? (width - (count - 1) * barGap) / count : height;
  
  const [rTopLeft, rTopRight, rBottomRight, rBottomLeft] = Array.isArray(radius) ? radius : [radius, radius, radius, radius];
  
  return (
    <svg className="absolute inset-0 overflow-visible" width={width} height={height}>
      {data.map((d, i) => {
        const val = d[dataKey] || 0;
        const barHeight = (val / maxValue) * height;
        const x = layout === 'vertical' ? i * (barWidth + barGap) : 0;
        const y = layout === 'vertical' ? height - barHeight : i * (barWidth + barGap);
        
        const isHovered = hoveredIndex === i;
        const isDimmed = activeBar && hoveredIndex !== null && hoveredIndex !== i;
        
        return (
          <motion.path
            key={i}
            d={`M${x},${y + rTopLeft} 
                a${rTopLeft},${rTopLeft} 0 0 1 ${rTopLeft},-${rTopLeft}
                h${Math.max(0, barWidth - rTopLeft - rTopRight)}
                a${rTopRight},${rTopRight} 0 0 1 ${rTopRight},${rTopRight}
                v${Math.max(0, barHeight - rTopRight - rBottomRight)}
                a${rBottomRight},${rBottomRight} 0 0 1 -${rBottomRight},${rBottomRight}
                h-${Math.max(0, barWidth - rBottomRight - rBottomLeft)}
                a${rBottomLeft},${rBottomLeft} 0 0 1 -${rBottomLeft},-${rBottomLeft}
                Z`}
            fill={fill}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1, opacity: isDimmed ? 0.4 : 1 }}
            style={{ transformOrigin: "bottom" }}
            transition={{ delay: i * 0.04, duration: 0.5, type: "spring", bounce: 0 }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer transition-opacity duration-200"
          />
        );
      })}
    </svg>
  );
}

export function BarXAxis({ dataKey, className }: { dataKey?: string; className?: string }) {
  const { data, xDataKey, width, barGap } = useBarChart();
  const key = dataKey || xDataKey;
  const count = data.length;
  const barWidth = (width - (count - 1) * barGap) / count;
  
  return (
    <div className={cn("flex w-full mt-2 relative", className)}>
      {data.map((d, i) => (
        <div key={i} className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground truncate text-center" style={{ width: barWidth, marginRight: i < count - 1 ? barGap : 0 }}>
          {d[key]}
        </div>
      ))}
    </div>
  );
}

export function BarYAxis({ numTicks = 4, className }: { numTicks?: number; className?: string }) {
  return null;
}

export function BarTooltip() {
  const { data, xDataKey, hoveredIndex } = useBarChart();
  return (
    <AnimatePresence>
      {hoveredIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute z-50 pointer-events-none top-0 left-1/2 -translate-x-1/2 -translate-y-full bg-card text-card-foreground border border-border px-3 py-2 rounded-lg shadow-xl text-xs flex flex-col gap-1 min-w-[120px]"
        >
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{data[hoveredIndex][xDataKey]}</span>
          {Object.entries(data[hoveredIndex]).map(([k, v]) => {
            if (k === xDataKey) return null;
            return (
              <div key={k} className="flex justify-between items-center font-mono text-[10px] font-bold">
                <span className="text-muted-foreground">{k}</span>
                <span className="text-foreground">{v}</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
