"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface AreaChartContextType {
  data: Record<string, any>[];
  xDataKey: string;
  width: number;
  height: number;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  yMin: number;
  yMax: number;
  stackBases: Record<string, Record<string, number[]>>;
}

const AreaChartContext = createContext<AreaChartContextType | null>(null);

export function useAreaChart() {
  const ctx = useContext(AreaChartContext);
  if (!ctx) {
    throw new Error("useAreaChart must be used within <AreaChart />");
  }
  return ctx;
}

export interface AreaChartProps {
  data: Record<string, any>[];
  xDataKey?: string;
  height?: number | string;
  className?: string;
  children: ReactNode;
}

export function AreaChart({ data, xDataKey = "date", height = 260, className, children }: AreaChartProps) {
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
  let yMin = allValues.length ? Math.min(...allValues, 0) : 0;
  let yMax = allValues.length ? Math.max(...allValues, 1) : 1;
  const numHeight = typeof height === 'number' ? height : 260;

  const stackGroups: Record<string, string[]> = {};
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === Area) {
      const props = child.props as AreaProps;
      if (props.stackId && props.dataKey) {
        (stackGroups[props.stackId] = stackGroups[props.stackId] || []).push(props.dataKey);
      }
    }
  });

  const stackBases: Record<string, Record<string, number[]>> = {};
  Object.entries(stackGroups).forEach(([sid, keys]) => {
    const totals = new Array(data.length).fill(0);
    keys.forEach((k) => {
      data.forEach((d, i) => {
        totals[i] += typeof d[k] === "number" ? d[k] : 0;
      });
    });
    if (totals.length) {
      yMin = Math.min(yMin, ...totals);
      yMax = Math.max(yMax, ...totals);
    }
    const bases: Record<string, number[]> = {};
    const running = new Array(data.length).fill(0);
    keys.forEach((k) => {
      bases[k] = running.slice();
      data.forEach((d, i) => {
        running[i] += typeof d[k] === "number" ? d[k] : 0;
      });
    });
    stackBases[sid] = bases;
  });

  return (
    <AreaChartContext.Provider value={{ data, xDataKey, width, height: numHeight, hoveredIndex, setHoveredIndex, yMin, yMax, stackBases }}>
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
    </AreaChartContext.Provider>
  );
}

export interface AreaProps {
  dataKey: string;
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  stackId?: string;
}

export function Area({ dataKey, fill, fillOpacity = 0.4, stroke, strokeWidth = 2, stackId }: AreaProps) {
  const { data, width, height, yMin, yMax, stackBases } = useAreaChart();
  
  if (data.length === 0) return null;

  const baseArr = stackId ? stackBases[stackId]?.[dataKey] : undefined;

  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    const val = typeof d[dataKey] === 'number' ? d[dataKey] : 0;
    const base = baseArr ? baseArr[i] : 0;
    const y = height - ((val + base - yMin) / Math.max(yMax - yMin, 1)) * height;
    const baseY = height - ((base - yMin) / Math.max(yMax - yMin, 1)) * height;
    return { x, y, baseY };
  });

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
  const areaD = `${pathD} L ${points.slice().reverse().map(p => `${p.x},${p.baseY}`).join(" L ")} Z`;

  return (
    <g>
      <motion.path
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        d={areaD}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke="none"
      />
      {stroke && stroke !== "transparent" && (
         <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            d={pathD}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      )}
    </g>
  );
}

export interface AreaGradientProps {
  id: string;
  color: string;
  startOpacity?: number;
  stopOpacity?: number;
}

export function AreaGradient({ id, color, startOpacity = 0.8, stopOpacity = 0.05 }: AreaGradientProps) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={color} stopOpacity={startOpacity} />
      <stop offset="95%" stopColor={color} stopOpacity={stopOpacity} />
    </linearGradient>
  );
}

export interface AreaXAxisProps {
  dataKey?: string;
  formatValue?: (v: any) => string;
}

export function AreaXAxis({ dataKey, formatValue }: AreaXAxisProps) {
  const { data, width, height, xDataKey } = useAreaChart();
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

export interface AreaYAxisProps {
  numTicks?: number;
  formatValue?: (v: any) => string;
}

export function AreaYAxis({ numTicks = 5, formatValue }: AreaYAxisProps) {
  const { height, yMin, yMax } = useAreaChart();
  const ticks = Array.from({ length: numTicks }).map((_, i) => yMin + (yMax - yMin) * (i / (numTicks - 1)));
  
  return (
    <g className="text-[10px] fill-muted-foreground font-mono">
      {ticks.map((t, i) => {
        const y = height - ((t - yMin) / Math.max(yMax - yMin, 1)) * height;
        return (
          <text key={i} x={0} y={y - 6} textAnchor="start">
            {formatValue ? formatValue(t) : typeof t === 'number' ? t.toFixed(0) : t}
          </text>
        );
      })}
    </g>
  );
}

export interface AreaGridProps {
  horizontal?: boolean;
  vertical?: boolean;
  strokeDasharray?: string;
}

export function AreaGrid({ horizontal = true, vertical = false, strokeDasharray = "4 4" }: AreaGridProps) {
  const { width, height, yMin, yMax } = useAreaChart();
  const numTicks = 5;
  const ticks = Array.from({ length: numTicks }).map((_, i) => yMin + (yMax - yMin) * (i / (numTicks - 1)));

  return (
    <g>
      {horizontal && ticks.map((t, i) => {
        const y = height - ((t - yMin) / Math.max(yMax - yMin, 1)) * height;
        return <line key={i} x1={0} y1={y} x2={width} y2={y} stroke="var(--border)" strokeOpacity={0.6} strokeDasharray={strokeDasharray} />;
      })}
    </g>
  );
}

export function AreaTooltip() {
  const { data, width, height, hoveredIndex, xDataKey } = useAreaChart();
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
            className="bg-white dark:bg-[#1c1d18] text-black dark:text-white border border-black dark:border-[#3b3a33] p-3 rounded-lg shadow-[4px_4px_0px_#000000] text-xs font-sans min-w-[130px] backdrop-blur-md"
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
