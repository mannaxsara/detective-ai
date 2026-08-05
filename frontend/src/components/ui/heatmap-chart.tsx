"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface HeatmapCellData {
  x: string | number;
  y: string | number;
  value: number; // e.g. correlation coefficient or count (-1 to 1, or 0 to 100)
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

  // Default color scale for correlation: from -1 (red/blue) to 0 (dark neutral) to 1 (ember gold/green)
  const defaultColorScale = (val: number) => {
    // Normalise from [-1, 1] to [0, 1]
    const norm = (val + 1) / 2;
    if (val > 0) {
      // Transition from neutral card color (#1c1d18) to primary gold (#d8cfbc)
      const r = Math.round(28 + (216 - 28) * val);
      const g = Math.round(29 + (207 - 29) * val);
      const b = Math.round(24 + (188 - 24) * val);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Transition from neutral card color (#1c1d18) to warning crimson (#bc3e3e)
      const absVal = Math.abs(val);
      const r = Math.round(28 + (188 - 28) * absVal);
      const g = Math.round(29 + (62 - 29) * absVal);
      const b = Math.round(24 + (62 - 24) * absVal);
      return `rgb(${r}, ${g}, ${b})`;
    }
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
      <div className={cn("relative w-full overflow-hidden flex flex-col gap-4", className)}>
        {children}
      </div>
    </HeatmapContext.Provider>
  );
}

interface HeatmapCellsProps {
  cornerRadius?: string;
  className?: string;
}

export function HeatmapCells({ cornerRadius = "rounded-[4px]", className = "" }: HeatmapCellsProps) {
  const { data, xKeys, yKeys, colorScale, hoveredCell, setHoveredCell } = useHeatmap();

  return (
    <div
      className={cn(
        "grid gap-1.5 w-full relative",
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${xKeys.length}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${yKeys.length}, minmax(0, 1fr))`,
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

          return (
            <motion.div
              key={`${xVal}-${yVal}`}
              onMouseEnter={() => setHoveredCell(cell)}
              onMouseLeave={() => setHoveredCell(null)}
              className={cn(
                "aspect-square flex items-center justify-center cursor-pointer border border-border/20 transition-all duration-200",
                cornerRadius,
                isFaded ? "opacity-30 scale-95" : "opacity-100 scale-100",
                isHovered && "border-foreground/50 ring-1 ring-foreground/20"
              )}
              style={{
                backgroundColor: colorScale(cell.value),
              }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Show value on hover or if space permits */}
              <span className="text-[10px] font-mono font-black text-background mix-blend-difference selection:bg-transparent">
                {cell.value.toFixed(2)}
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
      className={cn("grid gap-1.5 w-full text-center border-t border-border pt-2", className)}
      style={{ gridTemplateColumns: `repeat(${xKeys.length}, minmax(0, 1fr))` }}
    >
      {xKeys.map((key) => (
        <span key={key} className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground truncate px-1">
          {String(key)}
        </span>
      ))}
    </div>
  );
}

export function HeatmapYAxis({ className = "" }: { className?: string }) {
  const { yKeys } = useHeatmap();
  return (
    <div className={cn("flex flex-col gap-1.5 justify-between pr-3 border-r border-border text-right", className)}>
      {yKeys.map((key) => (
        <span key={key} className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground truncate h-8 flex items-center justify-end">
          {String(key)}
        </span>
      ))}
    </div>
  );
}

export function HeatmapLegend({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between text-[10px] font-mono text-muted-foreground border-t border-border/60 pt-3", className)}>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded bg-[#bc3e3e]" />
        <span>Negative Correlation (-1.0)</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded bg-[#1c1d18] border border-border" />
        <span>No Correlation (0.0)</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded bg-[#d8cfbc]" />
        <span>Positive Correlation (+1.0)</span>
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
          className="absolute z-50 bottom-14 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border border-border p-3.5 rounded-lg shadow-xl flex flex-col gap-1 text-xs font-sans min-w-[200px]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-border pb-1.5 mb-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Relation Pair</span>
            <span className="font-mono font-bold text-[10px] bg-muted px-1.5 py-0.5 rounded text-foreground">
              r = {hoveredCell.value.toFixed(4)}
            </span>
          </div>
          <p className="font-bold text-foreground truncate">{hoveredCell.x} & {hoveredCell.y}</p>
          <p className="text-muted-foreground text-[10px] leading-relaxed mt-0.5">
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
