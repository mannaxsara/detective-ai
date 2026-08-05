"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface RingData {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}

interface RingChartContextType {
  data: RingData[];
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  strokeWidth: number;
  ringGap: number;
  baseInnerRadius: number;
  center: number;
}

const RingChartContext = createContext<RingChartContextType | null>(null);

export function useRingChart() {
  const ctx = useContext(RingChartContext);
  if (!ctx) throw new Error("useRingChart must be used within <RingChart />");
  return ctx;
}

export function RingChart({
  data,
  strokeWidth = 12,
  ringGap = 6,
  baseInnerRadius = 55,
  hoveredIndex: externalHovered,
  onHoverChange,
  className,
  children
}: {
  data: RingData[];
  strokeWidth?: number;
  ringGap?: number;
  baseInnerRadius?: number;
  hoveredIndex?: number | null;
  onHoverChange?: (i: number | null) => void;
  className?: string;
  children?: React.ReactNode;
}) {
  const [internalHovered, setInternalHovered] = useState<number | null>(null);
  const hoveredIndex = externalHovered !== undefined ? externalHovered : internalHovered;
  
  const setHoveredIndex = (idx: number | null) => {
    if (onHoverChange) onHoverChange(idx);
    setInternalHovered(idx);
  };
  
  const numRings = data.length;
  const maxRadius = baseInnerRadius + (numRings - 1) * (strokeWidth + ringGap);
  const size = (maxRadius + strokeWidth) * 2;
  const center = size / 2;

  return (
    <RingChartContext.Provider value={{ data, hoveredIndex, setHoveredIndex, strokeWidth, ringGap, baseInnerRadius, center }}>
      <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((_, i) => <Ring key={i} index={i} />)}
        </svg>
        {children}
      </div>
    </RingChartContext.Provider>
  );
}

export function Ring({ index }: { index: number }) {
  const { data, hoveredIndex, setHoveredIndex, strokeWidth, ringGap, baseInnerRadius, center } = useRingChart();
  
  const item = data[index];
  const radius = baseInnerRadius + index * (strokeWidth + ringGap);
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(item.value / item.maxValue, 0), 1);
  const strokeDashoffset = circumference * (1 - progress);
  
  const isHovered = hoveredIndex === index;
  const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

  return (
    <g
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      className="cursor-pointer transition-opacity duration-300"
      style={{ opacity: isDimmed ? 0.3 : 1 }}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="transparent"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
        className="opacity-20"
      />
      <motion.circle
        cx={center}
        cy={center}
        r={radius}
        fill="transparent"
        stroke={item.color || "var(--primary)"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.7, delay: index * 0.1, ease: "easeOut" }}
      />
    </g>
  );
}

export function RingCenter({ defaultLabel = 'Total' }: { defaultLabel?: string }) {
  const { data, hoveredIndex } = useRingChart();
  
  const item = hoveredIndex !== null ? data[hoveredIndex] : null;
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
      {item ? (
        <>
          <span className="text-xl font-mono font-bold text-foreground leading-none">{item.value.toLocaleString()}</span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1 font-bold">{item.label}</span>
        </>
      ) : (
        <>
          <span className="text-xl font-mono font-bold text-foreground leading-none">
            {data.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1 font-bold">{defaultLabel}</span>
        </>
      )}
    </div>
  );
}
