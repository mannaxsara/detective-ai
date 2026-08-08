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
  let strokeColor = "#31e992"; // spring green
  if (normalizedValue >= 80) strokeColor = "#31e992";
  else if (normalizedValue >= 50) strokeColor = "#edfe5e";
  else strokeColor = "#bc3e3e";

  return (
    <div className={cn("flex flex-col items-center justify-center relative select-none shrink-0", className)}>
      <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size / 2 + 16 }}>
        <svg
          width={size}
          height={size / 2 + strokeWidth}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          className="overflow-visible"
        >
          {/* Background Track Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="rgba(0, 0, 0, 0.15)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Indicator Value Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Score Value */}
        <div className="absolute bottom-0 flex flex-col items-center justify-end text-center">
          <span className="text-lg font-mono font-extrabold text-black dark:text-white tracking-tight leading-none">
            {normalizedValue}%
          </span>
          {label && (
            <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-black/75 dark:text-white/75 mt-0.5">
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
