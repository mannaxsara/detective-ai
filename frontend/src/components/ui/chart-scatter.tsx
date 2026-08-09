"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface ScatterContextType {
  data: Record<string, any>[];
  xDataKey: string;
  xScale: (val: number) => number;
  yScale: (val: number) => number;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
}

const ScatterContext = createContext<ScatterContextType | null>(null);

export function useScatter() {
  const ctx = useContext(ScatterContext);
  if (!ctx) throw new Error("useScatter must be used within <ScatterChart />");
  return ctx;
}

interface ScatterChartProps {
  data: Record<string, any>[];
  xDataKey?: string;
  height?: number | string;
  className?: string;
  children: React.ReactNode;
}

export function ScatterChart({
  data,
  xDataKey = "x",
  height = 300,
  className = "",
  children,
}: ScatterChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 1000; 
  const svgHeight = typeof height === "number" ? height : 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };

  const { xScale, yScale } = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    data.forEach((d) => {
      const x = d[xDataKey];
      if (typeof x === "number") {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
      Object.keys(d).forEach(k => {
        if (k !== xDataKey && typeof d[k] === "number") {
          if (d[k] < minY) minY = d[k];
          if (d[k] > maxY) maxY = d[k];
        }
      });
    });

    if (minX === Infinity) minX = 0;
    if (maxX === -Infinity) maxX = 100;
    if (minY === Infinity) minY = 0;
    if (maxY === -Infinity) maxY = 100;

    const xRange = maxX - minX || 1;
    const yRange = maxY - minY || 1;

    const xScale = (val: number) => padding.left + ((val - minX) / xRange) * (width - padding.left - padding.right);
    const yScale = (val: number) => svgHeight - padding.bottom - ((val - minY) / yRange) * (svgHeight - padding.top - padding.bottom);

    return { xScale, yScale };
  }, [data, xDataKey, width, svgHeight, padding]);

  return (
    <ScatterContext.Provider
      value={{ data, xDataKey, xScale, yScale, hoveredIndex, setHoveredIndex, width, height: svgHeight, padding }}
    >
      <div className={cn("relative w-full overflow-hidden text-black dark:text-white", className)} style={{ height }}>
        <svg viewBox={`0 0 ${width} ${svgHeight}`} className="w-full h-full overflow-visible">
          {children}
        </svg>
      </div>
    </ScatterContext.Provider>
  );
}

export function ScatterGrid({ horizontal = true, vertical = false }: { horizontal?: boolean; vertical?: boolean }) {
  const { width, height, padding } = useScatter();
  return (
    <g className="text-black/10 dark:text-white/10">
      {horizontal && Array.from({ length: 5 }).map((_, i) => {
        const y = padding.top + (i / 4) * (height - padding.top - padding.bottom);
        return <line key={`h-${i}`} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="currentColor" strokeWidth={1} strokeDasharray="4 4" />;
      })}
      {vertical && Array.from({ length: 5 }).map((_, i) => {
        const x = padding.left + (i / 4) * (width - padding.left - padding.right);
        return <line key={`v-${i}`} x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="currentColor" strokeWidth={1} strokeDasharray="4 4" />;
      })}
    </g>
  );
}

export function ScatterXAxis({ label }: { label?: string }) {
  const { width, height, padding } = useScatter();
  return (
    <g className="text-black/60 dark:text-white/60 text-[10px] font-mono font-bold uppercase tracking-wider">
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="currentColor" strokeWidth={1} />
      {label && (
        <text x={width / 2} y={height - 5} fill="currentColor" textAnchor="middle">{label}</text>
      )}
    </g>
  );
}

export function ScatterYAxis({ label, numTicks = 5 }: { label?: string; numTicks?: number }) {
  const { height, padding } = useScatter();
  return (
    <g className="text-black/60 dark:text-white/60 text-[10px] font-mono font-bold uppercase tracking-wider">
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="currentColor" strokeWidth={1} />
      {label && (
        <text x={15} y={height / 2} fill="currentColor" textAnchor="middle" transform={`rotate(-90 15 ${height / 2})`}>{label}</text>
      )}
    </g>
  );
}

export function ScatterSeries({
  dataKey,
  radius = 4,
  fadeOnHover = true,
  inactiveOpacity = 0.3,
  fill = "#edfe5e"
}: {
  dataKey: string;
  radius?: number;
  fadeOnHover?: boolean;
  inactiveOpacity?: number;
  fill?: string;
}) {
  const { data, xDataKey, xScale, yScale, hoveredIndex, setHoveredIndex } = useScatter();

  return (
    <g>
      {data.map((d, i) => {
        const cx = xScale(d[xDataKey]);
        const cy = yScale(d[dataKey]);
        const isHovered = hoveredIndex === i;
        const isFaded = fadeOnHover && hoveredIndex !== null && !isHovered;

        return (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={isHovered ? radius * 1.5 : radius}
            fill={fill}
            stroke="#000000"
            strokeWidth={1}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: isFaded ? inactiveOpacity : 1 
            }}
            transition={{
              scale: { type: "spring", stiffness: 300, damping: 20, delay: i * 0.015 },
              opacity: { duration: 0.2 }
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer transition-colors"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        );
      })}
    </g>
  );
}

export function ScatterTooltip() {
  const { data, xDataKey, xScale, yScale, hoveredIndex } = useScatter();

  return (
    <AnimatePresence>
      {hoveredIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute z-50 bg-white dark:bg-[#1c1d18] text-black dark:text-white border border-black dark:border-[#3b3a33] p-3 rounded-lg shadow-[4px_4px_0px_#000000] backdrop-blur-md text-xs font-sans min-w-[140px] pointer-events-none"
          style={{
            left: xScale(data[hoveredIndex][xDataKey]) + 20,
            top: yScale(data[hoveredIndex].y || Object.values(data[hoveredIndex]).find(v => typeof v === 'number' && v !== data[hoveredIndex][xDataKey]) as number) - 40,
          }}
        >
          <div className="font-mono text-[9px] uppercase tracking-wider text-black/60 dark:text-white/60 mb-1 font-bold">Point Details</div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {Object.entries(data[hoveredIndex]).map(([k, v]) => (
              <React.Fragment key={k}>
                <span className="font-bold text-black/70 dark:text-white/70 font-mono text-[10px]">{k}:</span>
                <span className="font-mono font-bold text-black dark:text-white text-right text-[10px]">{typeof v === 'number' ? v.toFixed(2) : v}</span>
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
