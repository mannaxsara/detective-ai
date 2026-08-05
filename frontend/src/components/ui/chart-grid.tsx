"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface GridProps {
  horizontal?: boolean;
  vertical?: boolean;
  numTicksRows?: number;
  numTicksColumns?: number;
  rowTickValues?: number[];
  stroke?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeDasharray?: string;
  highlightRowValues?: number[];
  highlightRowStroke?: string;
  highlightRowStrokeOpacity?: number;
  highlightRowStrokeWidth?: number;
  highlightRowStrokeDasharray?: string;
  fadeHorizontal?: boolean;
  fadeVertical?: boolean;
  hideHorizontalEdgeLines?: boolean;
  hideVerticalEdgeLines?: boolean;
  className?: string;
}

export function Grid({
  horizontal = true,
  vertical = false,
  numTicksRows = 5,
  numTicksColumns = 10,
  rowTickValues,
  stroke = "var(--border, rgba(86, 84, 73, 0.25))",
  strokeOpacity = 0.6,
  strokeWidth = 1,
  strokeDasharray = "4,4",
  highlightRowValues = [],
  highlightRowStroke = "var(--primary, #d8cfbc)",
  highlightRowStrokeOpacity = 1,
  highlightRowStrokeWidth = 1.5,
  highlightRowStrokeDasharray = "0",
  fadeHorizontal = true,
  fadeVertical = false,
  hideHorizontalEdgeLines = false,
  hideVerticalEdgeLines = false,
  className = "",
}: GridProps) {
  const rowsCount = rowTickValues ? rowTickValues.length : numTicksRows;
  
  // Calculate rows positions (%)
  const rows = Array.from({ length: rowsCount }, (_, i) => {
    if (rowsCount <= 1) return 50;
    return (i / (rowsCount - 1)) * 100;
  }).filter((_, i) => {
    if (!hideHorizontalEdgeLines) return true;
    return i > 0 && i < rowsCount - 1;
  });

  // Calculate cols positions (%)
  const cols = Array.from({ length: numTicksColumns }, (_, i) => {
    if (numTicksColumns <= 1) return 50;
    return (i / (numTicksColumns - 1)) * 100;
  }).filter((_, i) => {
    if (!hideVerticalEdgeLines) return true;
    return i > 0 && i < numTicksColumns - 1;
  });

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        fadeHorizontal && "[mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]",
        fadeVertical && "[mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]",
        className
      )}
    >
      <svg className="w-full h-full">
        {/* Horizontal grid lines */}
        {horizontal &&
          rows.map((posPct, idx) => {
            const isHighlighted = highlightRowValues.length > 0 && idx === Math.floor(rows.length / 2);
            return (
              <line
                key={`h-${idx}`}
                x1="0%"
                y1={`${posPct}%`}
                x2="100%"
                y2={`${posPct}%`}
                stroke={isHighlighted ? highlightRowStroke : stroke}
                strokeOpacity={isHighlighted ? highlightRowStrokeOpacity : strokeOpacity}
                strokeWidth={isHighlighted ? highlightRowStrokeWidth : strokeWidth}
                strokeDasharray={isHighlighted ? highlightRowStrokeDasharray : strokeDasharray}
              />
            );
          })}

        {/* Vertical grid lines */}
        {vertical &&
          cols.map((posPct, idx) => (
            <line
              key={`v-${idx}`}
              x1={`${posPct}%`}
              y1="0%"
              x2={`${posPct}%`}
              y2="100%"
              stroke={stroke}
              strokeOpacity={strokeOpacity}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
            />
          ))}
      </svg>
    </div>
  );
}
