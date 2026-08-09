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
  getPointPosition: (metricIndex: number, value: number) => { x: number; y: number };
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
  size = 320,
  levels = 5,
  margin = 70,
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
      <div className={cn("relative flex items-center justify-center select-none font-sans", className)} style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
          {children}
        </svg>
      </div>
    </RadarChartContext.Provider>
  );
}

export function RadarGrid({ showLabels = true, stroke = "currentColor" }: { showLabels?: boolean; stroke?: string }) {
  const { levels, metrics, getPointPosition, center, radius } = useRadarChart();

  return (
    <g className="radar-grid opacity-60 dark:opacity-40">
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
              strokeWidth={1}
              strokeDasharray={levelIdx !== levels - 1 ? "3 3" : "none"}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: levelIdx * 0.08, duration: 0.4, ease: "easeOut" }}
              style={{ transformOrigin: `${center}px ${center}px` }}
            />
            {showLabels && levelIdx > 0 && levelIdx < levels - 1 && (
              <text
                x={center}
                y={center - (levelValue / 100) * radius + 10}
                className="text-[9px] fill-black/60 dark:fill-white/60 font-mono font-bold"
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

export function RadarAxis({ stroke = "currentColor" }: { stroke?: string }) {
  const { metrics, getPointPosition, center } = useRadarChart();

  return (
    <g className="radar-axis opacity-50 dark:opacity-30">
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
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        );
      })}
    </g>
  );
}

export function RadarLabels({ offset = 26, fontSize = 10 }: { offset?: number; fontSize?: number }) {
  const { metrics, getPointPosition } = useRadarChart();

  return (
    <g className="radar-labels">
      {metrics.map((metric, i) => {
        const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
        const { x, y } = getPointPosition(i, 100);
        
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        let textAnchor: "start" | "middle" | "end" = "middle";
        let dx = 0;
        let dy = 0;

        if (cos > 0.3) {
          textAnchor = "start";
          dx = 10;
        } else if (cos < -0.3) {
          textAnchor = "end";
          dx = -10;
        }

        if (sin < -0.8) {
          textAnchor = "middle";
          dy = -12;
          dx = 0;
        } else if (sin > 0.8) {
          textAnchor = "middle";
          dy = 16;
          dx = 0;
        }

        return (
          <text
            key={`label-${i}`}
            x={x + dx}
            y={y + dy}
            className="fill-black dark:fill-white font-mono font-bold tracking-wider"
            style={{ fontSize: `${fontSize}px` }}
            textAnchor={textAnchor}
            dominantBaseline="central"
          >
            {metric.label}
          </text>
        );
      })}
    </g>
  );
}

export function RadarArea({ index, fill, stroke, strokeWidth = 2 }: { index: number; fill?: string; stroke?: string; strokeWidth?: number }) {
  const { data, metrics, getPointPosition, hoveredIndex, setHoveredIndex, center } = useRadarChart();
  
  const item = data[index];
  if (!item) return null;

  const areaColor = fill || item.color || "#edfe5e";
  const strokeColor = stroke || item.color || "#edfe5e";

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
      className={cn("cursor-pointer transition-opacity duration-300", isDimmed && "opacity-20")}
    >
      <motion.polygon
        points={points}
        fill={areaColor}
        fillOpacity={isHovered ? 0.45 : 0.25}
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
            r={isHovered ? 5 : 4}
            fill={strokeColor}
            stroke="#000000"
            strokeWidth={1.5}
            className="transition-all duration-200"
          />
        );
      })}
    </g>
  );
}
