"use client";

import React, { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

export interface LegendItemData {
  label: string;
  value: number;
  maxValue?: number;
  color: string;
}

interface LegendContextType {
  items: LegendItemData[];
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}

const LegendContext = createContext<LegendContextType | null>(null);

export function useLegend() {
  const ctx = useContext(LegendContext);
  if (!ctx) {
    throw new Error("useLegend must be used within a <Legend /> component");
  }
  return ctx;
}

interface LegendItemContextType {
  item: LegendItemData;
  index: number;
  isHovered: boolean;
  isFaded: boolean;
  percentage: number;
}

const LegendItemContext = createContext<LegendItemContextType | null>(null);

export function useLegendItem() {
  const ctx = useContext(LegendItemContext);
  if (!ctx) {
    throw new Error("useLegendItem must be used within a <LegendItemComponent />");
  }
  return ctx;
}

export interface LegendProps {
  items: LegendItemData[];
  hoveredIndex?: number | null;
  onHoverChange?: (index: number | null) => void;
  title?: string;
  titleClassName?: string;
  className?: string;
  children: React.ReactNode;
}

export function Legend({
  items,
  hoveredIndex: controlledHoveredIndex,
  onHoverChange,
  title,
  titleClassName = "text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-3",
  className = "flex flex-col gap-2.5",
  children,
}: LegendProps) {
  const [internalHoveredIndex, setInternalHoveredIndex] = React.useState<number | null>(null);

  const hoveredIndex = controlledHoveredIndex !== undefined ? controlledHoveredIndex : internalHoveredIndex;
  const setHoveredIndex = (idx: number | null) => {
    if (onHoverChange) onHoverChange(idx);
    else setInternalHoveredIndex(idx);
  };

  return (
    <LegendContext.Provider value={{ items, hoveredIndex, setHoveredIndex }}>
      <div className="w-full">
        {title && <h4 className={titleClassName}>{title}</h4>}
        <div className={cn("w-full", className)}>
          {items.map((item, index) => {
            const maxValue = item.maxValue ?? Math.max(...items.map((i) => i.value), 1);
            const percentage = Math.min(100, Math.max(0, (item.value / maxValue) * 100));
            const isHovered = hoveredIndex === index;
            const isFaded = hoveredIndex !== null && !isHovered;

            return (
              <LegendItemContext.Provider
                key={index}
                value={{ item, index, isHovered, isFaded, percentage }}
              >
                {children}
              </LegendItemContext.Provider>
            );
          })}
        </div>
      </div>
    </LegendContext.Provider>
  );
}

export interface LegendItemComponentProps {
  className?: string;
  children: React.ReactNode;
}

export function LegendItemComponent({
  className = "flex items-center gap-3 p-2 rounded-lg border border-transparent hover:border-border/80 transition-all duration-150 cursor-pointer",
  children,
}: LegendItemComponentProps) {
  const { setHoveredIndex } = useLegend();
  const { index, isFaded } = useLegendItem();

  return (
    <div
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      className={cn(
        className,
        isFaded ? "opacity-40 filter grayscale-[40%]" : "opacity-100"
      )}
    >
      {children}
    </div>
  );
}

export function LegendMarker({ className = "h-2.5 w-2.5 rounded-full shrink-0" }: { className?: string }) {
  const { item } = useLegendItem();
  return (
    <span
      className={cn(className)}
      style={{ backgroundColor: item.color }}
    />
  );
}

export function LegendLabel({ className = "text-xs font-semibold text-foreground truncate" }: { className?: string }) {
  const { item } = useLegendItem();
  return <span className={cn(className)}>{item.label}</span>;
}

export interface LegendValueProps {
  className?: string;
  showPercentage?: boolean;
  percentageClassName?: string;
  formatValue?: (value: number) => string;
  formatPercentage?: (percentage: number) => string;
}

export function LegendValue({
  className = "text-xs font-mono font-bold text-foreground tabular-nums",
  showPercentage = false,
  percentageClassName = "text-[11px] font-mono text-muted-foreground ml-1.5 tabular-nums",
  formatValue = (v) => v.toLocaleString(),
  formatPercentage = (p) => `(${p.toFixed(0)}%)`,
}: LegendValueProps) {
  const { item, percentage } = useLegendItem();

  return (
    <div className="flex items-center">
      <span className={cn(className)}>{formatValue(item.value)}</span>
      {showPercentage && (
        <span className={cn(percentageClassName)}>{formatPercentage(percentage)}</span>
      )}
    </div>
  );
}

export interface LegendProgressProps {
  height?: string;
  trackClassName?: string;
  indicatorClassName?: string;
}

export function LegendProgress({
  height = "h-1.5",
  trackClassName = "w-full rounded-full bg-muted/60 overflow-hidden mt-1",
  indicatorClassName = "h-full rounded-full transition-all duration-300",
}: LegendProgressProps) {
  const { item, percentage } = useLegendItem();

  return (
    <div className={cn(height, trackClassName)}>
      <div
        className={cn(indicatorClassName)}
        style={{
          width: `${percentage}%`,
          backgroundColor: item.color,
        }}
      />
    </div>
  );
}
