"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface PieDataItem {
  name: string;
  value: number;
  fill?: string;
}

interface PieChartContextType {
  data: PieDataItem[];
  innerRadius: number;
  outerRadius: number;
  paddingAngle: number;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  total: number;
  height: number | string;
}

const PieChartContext = createContext<PieChartContextType | null>(null);

export function usePieChart() {
  const ctx = useContext(PieChartContext);
  if (!ctx) throw new Error("usePieChart must be used within <PieChart />");
  return ctx;
}

export interface PieChartProps {
  data: PieDataItem[];
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  height?: number | string;
  className?: string;
  children: ReactNode;
}

const DEFAULT_COLORS = ['#edfe5e', '#31e992', '#bed4fb', '#f59e0b', '#a855f7', '#bc3e3e'];

export function PieChart({
  data,
  innerRadius = 0,
  outerRadius = 90,
  paddingAngle = 0,
  height = 300,
  className,
  children,
}: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const filledData = data.map((d, i) => ({
    ...d,
    fill: d.fill || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  return (
    <PieChartContext.Provider
      value={{
        data: filledData,
        innerRadius,
        outerRadius,
        paddingAngle,
        hoveredIndex,
        setHoveredIndex,
        total,
        height,
      }}
    >
      <div className={cn("relative w-full flex flex-col items-center justify-center text-black dark:text-white", className)} style={{ height }}>
        {children}
      </div>
    </PieChartContext.Provider>
  );
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const startOuter = polarToCartesian(x, y, outerRadius, endAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const startInner = polarToCartesian(x, y, innerRadius, endAngle);
  const endInner = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  if (innerRadius === 0) {
    return [
      "M", startOuter.x, startOuter.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
      "L", x, y,
      "Z"
    ].join(" ");
  }

  return [
    "M", startOuter.x, startOuter.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
    "Z"
  ].join(" ");
}

export function PieSlices({ dataKey = 'value', nameKey = 'name' }: { dataKey?: string; nameKey?: string }) {
  const { data, innerRadius, outerRadius, paddingAngle, hoveredIndex, setHoveredIndex, total } = usePieChart();

  let currentAngle = 0;
  const viewBoxSize = outerRadius * 2 + 40;
  const center = viewBoxSize / 2;

  return (
    <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full overflow-visible">
      <AnimatePresence>
        {data.map((item, index) => {
          const sliceAngle = (item.value / total) * 360;
          if (sliceAngle === 0) return null;

          const startAngle = currentAngle + paddingAngle / 2;
          const endAngle = currentAngle + sliceAngle - paddingAngle / 2;
          currentAngle += sliceAngle;

          const isHovered = hoveredIndex === index;
          const isDimmed = hoveredIndex !== null && hoveredIndex !== index;
          
          const currentOuterRadius = isHovered ? outerRadius + 6 : outerRadius;
          
          const d = describeArc(center, center, innerRadius, currentOuterRadius, startAngle, endAngle);

          return (
            <motion.path
              key={`${item.name}-${index}`}
              d={d}
              fill={item.fill}
              stroke="#000000"
              strokeWidth={1}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn("cursor-pointer transition-all duration-200", isDimmed && "opacity-40")}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
            />
          );
        })}
      </AnimatePresence>
    </svg>
  );
}

export function PieCenter({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {children}
    </div>
  );
}

export function PieTooltip() {
  const { data, hoveredIndex, total } = usePieChart();

  return (
    <AnimatePresence>
      {hoveredIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute z-50 bottom-4 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-[#181914]/95 text-black dark:text-white border border-black/20 dark:border-white/20 p-3 rounded-lg shadow-xl backdrop-blur-md flex flex-col gap-1 text-xs font-sans pointer-events-none min-w-[140px]"
        >
          <div className="flex items-center gap-2 mb-1 border-b border-black/10 dark:border-white/10 pb-1">
            <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: data[hoveredIndex].fill }} />
            <span className="font-bold text-black dark:text-white truncate">{data[hoveredIndex].name}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-black/60 dark:text-white/60 font-mono">
            <span>Value:</span>
            <span className="font-bold text-black dark:text-white">{data[hoveredIndex].value}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-black/60 dark:text-white/60 font-mono">
            <span>Share:</span>
            <span className="font-bold text-black dark:text-white">{((data[hoveredIndex].value / total) * 100).toFixed(1)}%</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PieLegend() {
  const { data } = usePieChart();

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 text-[10px] font-mono text-black/70 dark:text-white/70">
      {data.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm border border-black/20" style={{ backgroundColor: item.fill }} />
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
}
