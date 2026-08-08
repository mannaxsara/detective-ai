"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface LineChartContextType {
  data: Record<string, any>[];
  xDataKey: string;
  width: number;
  height: number;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  yMin: number;
  yMax: number;
}

const LineChartContext = createContext<LineChartContextType | null>(null);

export function useLineChart() {
  const ctx = useContext(LineChartContext);
  if (!ctx) {
    throw new Error("useLineChart must be used within <LineChart />");
  }
  return ctx;
}

export interface LineChartProps {
  data: Record<string, any>[];
  xDataKey?: string;
  height?: number | string;
  className?: string;
  children: ReactNode;
}

export function LineChart({ data, xDataKey = "index", height = 200, className, children }: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const allValues = data.flatMap(d => Object.values(d).filter(v => typeof v === 'number')) as number[];
  const yMin = allValues.length ? Math.min(...allValues, 0) : 0;
  const yMax = allValues.length ? Math.max(...allValues, 1) : 1;
  const numHeight = typeof height === 'number' ? height : 200;

  return (
    <LineChartContext.Provider value={{ data, xDataKey, width, height: numHeight, hoveredIndex, setHoveredIndex, yMin, yMax }}>
      <div 
        ref={containerRef} 
        className={cn("relative w-full overflow-visible", className)} 
        style={{ height }}
        onMouseLeave={() => setHoveredIndex(null)}
        onMouseMove={(e) => {
          if (!containerRef.current || data.length === 0) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const step = width / Math.max(data.length - 1, 1);
          let idx = Math.round(x / step);
          if (idx < 0) idx = 0;
          if (idx >= data.length) idx = data.length - 1;
          setHoveredIndex(idx);
        }}
      >
        <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
          {children}
        </svg>
      </div>
    </LineChartContext.Provider>
  );
}

export interface LineProps {
  dataKey: string;
  type?: 'monotone' | 'linear';
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  dot?: boolean | { r?: number };
  activeDot?: boolean | { r?: number };
}

export function Line({ dataKey, type = 'monotone', stroke = "var(--primary)", strokeWidth = 2, strokeDasharray, dot = false, activeDot = false }: LineProps) {
  const { data, width, height, yMin, yMax, hoveredIndex } = useLineChart();
  
  if (data.length === 0) return null;

  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    const val = typeof d[dataKey] === 'number' ? d[dataKey] : 0;
    const y = height - ((val - yMin) / Math.max(yMax - yMin, 1)) * height;
    return { x, y, val };
  });

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
  
  return (
    <g>
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {dot && points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={typeof dot === 'object' ? dot.r : 3} fill={stroke} />
      ))}
      {activeDot && hoveredIndex !== null && points[hoveredIndex] && (
        <motion.circle
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          cx={points[hoveredIndex].x}
          cy={points[hoveredIndex].y}
          r={typeof activeDot === 'object' ? activeDot.r : 5}
          fill={stroke}
        />
      )}
    </g>
  );
}

export interface LineXAxisProps {
  dataKey?: string;
  formatValue?: (v: any) => string;
}

export function LineXAxis({ dataKey, formatValue }: LineXAxisProps) {
  const { data, width, height, xDataKey } = useLineChart();
  const key = dataKey || xDataKey;
  if (data.length === 0) return null;

  const ticks = [0, Math.floor((data.length - 1) / 2), data.length - 1].filter((v, i, a) => a.indexOf(v) === i);
  
  return (
    <g className="text-[10px] fill-muted-foreground font-mono">
      {ticks.map(i => {
        if (!data[i]) return null;
        const x = (i / Math.max(data.length - 1, 1)) * width;
        const val = data[i][key];
        const text = formatValue ? formatValue(val) : val;
        let anchor: "start" | "middle" | "end" = "middle";
        if (i === 0) anchor = "start";
        if (i === data.length - 1) anchor = "end";
        return (
          <text key={i} x={x} y={height + 16} textAnchor={anchor}>
            {text}
          </text>
        );
      })}
    </g>
  );
}

export interface LineYAxisProps {
  numTicks?: number;
  formatValue?: (v: any) => string;
}

export function LineYAxis({ numTicks = 5, formatValue }: LineYAxisProps) {
  const { height, yMin, yMax } = useLineChart();
  const ticks = Array.from({ length: numTicks }).map((_, i) => yMin + (yMax - yMin) * (i / (numTicks - 1)));
  
  return (
    <g className="text-[10px] fill-muted-foreground font-mono">
      {ticks.map((t, i) => {
        const y = height - ((t - yMin) / Math.max(yMax - yMin, 1)) * height;
        return (
          <text key={i} x={0} y={y - 6} textAnchor="start">
            {formatValue ? formatValue(t) : typeof t === 'number' ? t.toFixed(1) : t}
          </text>
        );
      })}
    </g>
  );
}

export interface LineGridProps {
  horizontal?: boolean;
  strokeDasharray?: string;
  highlightRowValues?: number[];
}

export function LineGrid({ horizontal = true, strokeDasharray = "4 4", highlightRowValues }: LineGridProps) {
  const { width, height, yMin, yMax } = useLineChart();
  const numTicks = 4;
  const ticks = Array.from({ length: numTicks }).map((_, i) => yMin + (yMax - yMin) * (i / (numTicks - 1)));

  return (
    <g>
      {horizontal && ticks.map((t, i) => {
        const y = height - ((t - yMin) / Math.max(yMax - yMin, 1)) * height;
        return <line key={i} x1={0} y1={y} x2={width} y2={y} stroke="var(--border)" strokeOpacity={0.6} strokeDasharray={strokeDasharray} />;
      })}
      {highlightRowValues && highlightRowValues.map((t: number, i: number) => {
        const y = height - ((t - yMin) / Math.max(yMax - yMin, 1)) * height;
        return <rect key={`h-${i}`} x={0} y={y} width={width} height={height - y} fill="var(--destructive)" fillOpacity={0.1} />;
      })}
    </g>
  );
}

export function LineTooltip() {
  const { data, width, height, hoveredIndex, xDataKey } = useLineChart();
  if (hoveredIndex === null || !data[hoveredIndex]) return null;
  
  const x = (hoveredIndex / Math.max(data.length - 1, 1)) * width;
  const datum = data[hoveredIndex];
  const keys = Object.keys(datum).filter(k => k !== xDataKey && typeof datum[k] === 'number');

  return (
    <AnimatePresence>
      <g>
        <motion.line
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          x1={x} y1={0} x2={x} y2={height}
          stroke="var(--foreground)"
          strokeOpacity={0.3}
          strokeDasharray="4 4"
        />
        <foreignObject x={x > width / 2 ? x - 150 : x + 10} y={0} width={140} height={200} className="overflow-visible pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="bg-white/95 dark:bg-[#181914]/95 text-black dark:text-white border border-black/20 dark:border-white/20 p-3 rounded-lg shadow-xl text-xs font-sans min-w-[130px] backdrop-blur-md"
          >
            <p className="font-bold text-black dark:text-white mb-1.5 border-b border-black/10 dark:border-white/10 pb-1 font-mono">{datum[xDataKey]}</p>
            {keys.map(k => (
              <div key={k} className="flex justify-between items-center gap-3 mt-1">
                <span className="text-black/60 dark:text-white/60 capitalize text-[10px] font-mono font-bold tracking-wider">{k}</span>
                <span className="font-mono text-black dark:text-white font-bold">{Number(datum[k]).toFixed(2)}</span>
              </div>
            ))}
          </motion.div>
        </foreignObject>
      </g>
    </AnimatePresence>
  );
}
