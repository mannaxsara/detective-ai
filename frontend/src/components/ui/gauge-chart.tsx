"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GaugeChartProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function GaugeChart({
  value,
  size = 120,
  strokeWidth = 10,
  label = "Health Index",
  className = "",
}: GaugeChartProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Semi-circle gauge arc (180deg)
  const arcLength = circumference / 2;
  const strokeDashoffset = arcLength - (arcLength * normalizedValue) / 100;

  // Determine stroke color based on health score %
  let strokeColor = "#d8cfbc"; // primary gold/cream
  if (normalizedValue >= 80) strokeColor = "#78c51c"; // emerald/green
  else if (normalizedValue >= 50) strokeColor = "#f59e0b"; // amber
  else strokeColor = "#bc3e3e"; // crimson

  return (
    <div className={cn("flex flex-col items-center justify-center relative", className)}>
      <div className="relative" style={{ width: size, height: size / 2 + 10 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background Track Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--muted, rgba(86, 84, 73, 0.2))"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Indicator Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Score Value */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end text-center pb-1">
          <span className="text-xl font-mono font-black text-foreground tracking-tight">
            {normalizedValue}%
          </span>
          {label && (
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
