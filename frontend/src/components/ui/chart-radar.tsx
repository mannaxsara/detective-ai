"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface RadarMetric {
  key: string;
  label: string;
}

export interface RadarData {
  label: string;
  color?: string;
  values: Record<string, number>;
}

interface RadarChartContextType {
  data: RadarData[];
  metrics: RadarMetric[];
  size: number;
  levels: number;
  margin: number;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  getPointPosition: (metricIndex: number, value: number) => { x: number, y: number };
  center: number;
  radius: number;
}

const RadarChartContext = createContext<RadarChartContextType | null>(null);

export function useRadarChart() {
  const ctx = useContext(RadarChartContext);
  if (!ctx) throw new Error("useRadarChart must be used within <RadarChart />");
  return ctx;
}

export interface RadarChartProps {
  data: RadarData[];
  metrics: RadarMetric[];
  size?: number;
  levels?: number;
  margin?: number;
  className?: string;
  children: ReactNode;
}

export function RadarChart({
  data,
  metrics,
  size = 300,
  levels = 5,
  margin = 60,
  className,
  children,
}: RadarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const center = size / 2;
  const radius = center - margin;

  const getPointPosition = (metricIndex: number, value: number) => {
    const angle = (Math.PI * 2 * metricIndex) / metrics.length - Math.PI / 2;
    const distance = (value / 100) * radius;
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
    };
  };

  return (
    <RadarChartContext.Provider
      value={{
        data,
        metrics,
        size,
        levels,
        margin,
        hoveredIndex,
        setHoveredIndex,
        getPointPosition,
        center,
        radius,
      }}
    >
      <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
          {children}
        </svg>
      </div>
    </RadarChartContext.Provider>
  );
}

export function RadarGrid({ showLabels = true, stroke = "var(--border)" }: { showLabels?: boolean, stroke?: string }) {
  const { levels, metrics, getPointPosition, center } = useRadarChart();

  return (
    <g className="radar-grid">
      {Array.from({ length: levels }).map((_, levelIdx) => {
        const levelValue = ((levelIdx + 1) / levels) * 100;
        const points = metrics.map((_, i) => {
          const { x, y } = getPointPosition(i, levelValue);
          return `${x},${y}`;
        }).join(" ");

        return (
          <g key={`level-${levelIdx}`}>
            <motion.polygon
              points={points}
              fill="none"
              stroke={stroke}
              strokeDasharray={levelIdx !== levels - 1 ? "3 3" : "none"}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: levelIdx * 0.1, duration: 0.5, ease: "easeOut" }}
              style={{ transformOrigin: `${center}px ${center}px` }}
            />
            {showLabels && levelIdx > 0 && (
              <text
                x={center}
                y={center - (levelValue / 100) * useRadarChart().radius}
                dy={-4}
                className="text-[8px] fill-muted-foreground font-mono"
                textAnchor="middle"
              >
                {levelValue}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

export function RadarAxis({ stroke = "var(--border)" }: { stroke?: string }) {
  const { metrics, getPointPosition, center } = useRadarChart();

  return (
    <g className="radar-axis">
      {metrics.map((_, i) => {
        const { x, y } = getPointPosition(i, 100);
        return (
          <line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke={stroke}
            strokeDasharray="3 3"
          />
        );
      })}
    </g>
  );
}

export function RadarLabels({ offset = 24, fontSize = 10 }: { offset?: number, fontSize?: number }) {
  const { metrics, getPointPosition } = useRadarChart();

  return (
    <g className="radar-labels">
      {metrics.map((metric, i) => {
        const { x, y } = getPointPosition(i, 100 + (offset / useRadarChart().radius) * 100);
        
        return (
          <text
            key={`label-${i}`}
            x={x}
            y={y}
            className="fill-foreground font-sans font-bold text-xs uppercase tracking-wider"
            fontSize={fontSize}
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {metric.label}
          </text>
        );
      })}
    </g>
  );
}

export function RadarArea({ index, fill, stroke, strokeWidth = 2 }: { index: number, fill?: string, stroke?: string, strokeWidth?: number }) {
  const { data, metrics, getPointPosition, hoveredIndex, setHoveredIndex, center } = useRadarChart();
  
  const item = data[index];
  if (!item) return null;

  const areaColor = fill || item.color || "#d8cfbc";
  const strokeColor = stroke || item.color || "#d8cfbc";

  const isHovered = hoveredIndex === index;
  const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

  const points = metrics.map((m, i) => {
    const val = item.values[m.key] || 0;
    const { x, y } = getPointPosition(i, val);
    return `${x},${y}`;
  }).join(" ");

  const centerPoints = metrics.map(() => `${center},${center}`).join(" ");

  return (
    <g
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      className={cn("cursor-pointer transition-opacity duration-300", isDimmed && "opacity-10")}
    >
      <motion.polygon
        points={points}
        fill={areaColor}
        fillOpacity={isHovered ? 0.35 : 0.15}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        initial={{ points: centerPoints }}
        animate={{ points }}
        transition={{ type: "spring", bounce: 0, duration: 0.8 }}
      />
      {metrics.map((m, i) => {
        const val = item.values[m.key] || 0;
        const { x, y } = getPointPosition(i, val);
        return (
          <circle
            key={`point-${i}`}
            cx={x}
            cy={y}
            r={isHovered ? 4 : 3}
            fill={strokeColor}
            className="transition-all duration-200"
          />
        );
      })}
    </g>
  );
}
