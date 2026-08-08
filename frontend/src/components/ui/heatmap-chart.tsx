"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface HeatmapCellData {
  x: string | number;
  y: string | number;
  value: number;
  label?: string;
}

interface HeatmapContextType {
  data: HeatmapCellData[];
  xKeys: string[];
  yKeys: string[];
  hoveredCell: HeatmapCellData | null;
  setHoveredCell: (cell: HeatmapCellData | null) => void;
  colorScale: (val: number) => string;
}

const HeatmapContext = createContext<HeatmapContextType | null>(null);

export function useHeatmap() {
  const ctx = useContext(HeatmapContext);
  if (!ctx) {
    throw new Error("useHeatmap must be used within <HeatmapChart />");
  }
  return ctx;
}

interface HeatmapChartProps {
  data: HeatmapCellData[];
  xKeys: string[];
  yKeys: string[];
  colorScale?: (val: number) => string;
  className?: string;
  children: React.ReactNode;
}

export function HeatmapChart({
  data,
  xKeys,
  yKeys,
  colorScale,
  className = "",
  children,
}: HeatmapChartProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCellData | null>(null);

  const defaultColorScale = (val: number) => {
    if (val >= 0.8) return "#edfe5e";
    if (val >= 0.4) return "#31e992";
    if (val >= 0.05) return "#262720";
    if (val <= -0.4) return "#bc3e3e";
    return "#1c1d18";
  };

  const finalColorScale = colorScale || defaultColorScale;

  return (
    <HeatmapContext.Provider
      value={{
        data,
        xKeys,
        yKeys,
        hoveredCell,
        setHoveredCell,
        colorScale: finalColorScale,
      }}
    >
      <div className={cn("relative w-full overflow-hidden flex flex-col gap-4 text-black dark:text-white max-w-lg mx-auto", className)}>
        {children}
      </div>
    </HeatmapContext.Provider>
  );
}

interface HeatmapCellsProps {
  cornerRadius?: string;
  className?: string;
}

export function HeatmapCells({ cornerRadius = "rounded-xl", className = "" }: HeatmapCellsProps) {
  const { data, xKeys, yKeys, colorScale, hoveredCell, setHoveredCell } = useHeatmap();

  return (
    <div
      className={cn(
        "grid gap-2 w-full relative max-w-md mx-auto",
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${xKeys.length}, minmax(0, 1fr))`,
      }}
    >
      {yKeys.map((yVal) =>
        xKeys.map((xVal) => {
          const cell = data.find((d) => d.x === xVal && d.y === yVal) || {
            x: xVal,
            y: yVal,
            value: 0,
          };

          const isHovered = hoveredCell && hoveredCell.x === xVal && hoveredCell.y === yVal;
          const isFaded = hoveredCell && !isHovered;
          const bg = colorScale(cell.value);
          const isBright = bg === "#edfe5e" || bg === "#31e992";

          return (
            <motion.div
              key={`${xVal}-${yVal}`}
              onMouseEnter={() => setHoveredCell(cell)}
              onMouseLeave={() => setHoveredCell(null)}
              className={cn(
                "h-24 sm:h-28 flex flex-col items-center justify-center p-2 cursor-pointer border border-black/20 dark:border-white/20 transition-all duration-200 shadow-sm",
                cornerRadius,
                isFaded ? "opacity-30 scale-95" : "opacity-100 scale-100",
                isHovered && "border-black dark:border-white ring-2 ring-[#edfe5e]"
              )}
              style={{
                backgroundColor: bg,
              }}
              whileHover={{ scale: 1.03 }}
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-75 truncate max-w-full text-black">
                {String(xVal).slice(0, 10)}
              </span>
              <span className={cn(
                "text-sm font-mono font-extrabold mt-1",
                isBright ? "text-black" : "text-white"
              )}>
                {cell.value >= 0 ? `+${cell.value.toFixed(2)}` : cell.value.toFixed(2)}
              </span>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

export function HeatmapXAxis({ className = "" }: { className?: string }) {
  const { xKeys } = useHeatmap();
  return (
    <div
      className={cn("grid gap-2 w-full text-center border-t border-black/10 dark:border-white/10 pt-2 max-w-md mx-auto", className)}
      style={{ gridTemplateColumns: `repeat(${xKeys.length}, minmax(0, 1fr))` }}
    >
      {xKeys.map((key) => (
        <span key={key} className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/70 dark:text-white/70 truncate px-1">
          {String(key)}
        </span>
      ))}
    </div>
  );
}

export function HeatmapYAxis({ className = "" }: { className?: string }) {
  const { yKeys } = useHeatmap();
  return (
    <div className={cn("flex flex-col gap-2 justify-between pr-3 border-r border-black/10 dark:border-white/10 text-right", className)}>
      {yKeys.map((key) => (
        <span key={key} className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/70 dark:text-white/70 truncate h-8 flex items-center justify-end">
          {String(key)}
        </span>
      ))}
    </div>
  );
}

export function HeatmapLegend({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-black/70 dark:text-white/70 border-t border-black/10 dark:border-white/10 pt-3 max-w-md mx-auto", className)}>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-[#bc3e3e] border border-black/20" />
        <span>Negative (-1.0)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-[#262720] border border-black/20" />
        <span>Neutral (0.0)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-[#31e992] border border-black/20" />
        <span>Positive (+0.5)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-[#edfe5e] border border-black/20" />
        <span>High (+1.0)</span>
      </div>
    </div>
  );
}

export function HeatmapTooltip() {
  const { hoveredCell } = useHeatmap();

  return (
    <AnimatePresence>
      {hoveredCell && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute z-50 bottom-14 left-1/2 -translate-x-1/2 bg-white dark:bg-[#181914] text-black dark:text-white border border-black/20 dark:border-white/20 p-3.5 rounded-xl shadow-2xl backdrop-blur-md flex flex-col gap-1 text-xs font-sans min-w-[220px]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-1.5 mb-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-black/60 dark:text-white/60">Correlation Pair</span>
            <span className="font-mono font-bold text-[10px] bg-[#edfe5e] text-black px-2 py-0.5 rounded border border-black/20">
              r = {hoveredCell.value.toFixed(4)}
            </span>
          </div>
          <p className="font-bold text-black dark:text-white truncate">{hoveredCell.x} & {hoveredCell.y}</p>
          <p className="text-black/70 dark:text-white/70 text-[10px] leading-relaxed mt-0.5 font-medium">
            {hoveredCell.value > 0.7
              ? "Strong positive linear relationship."
              : hoveredCell.value > 0.3
              ? "Moderate positive linear relationship."
              : hoveredCell.value > -0.3
              ? "Negligible linear relationship."
              : hoveredCell.value > -0.7
              ? "Moderate negative linear relationship."
              : "Strong negative linear relationship."}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
