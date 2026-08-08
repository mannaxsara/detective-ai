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
  size = 110,
  strokeWidth = 10,
  label = "Health Score",
  className = "",
}: GaugeChartProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference / 2;
  const strokeDashoffset = arcLength - (arcLength * normalizedValue) / 100;

  // Color mapping: >=80 Spring Green, >=50 Lime Yellow, <50 Crimson
  let strokeColor = "#31e992";
  if (normalizedValue >= 80) strokeColor = "#31e992";
  else if (normalizedValue >= 50) strokeColor = "#edfe5e";
  else strokeColor = "#bc3e3e";

  const valFontSize = Math.max(13, Math.round(size * 0.19));
  const labelFontSize = Math.max(7.5, Math.round(size * 0.075));

  return (
    <div className={cn("inline-flex flex-col items-center justify-center relative select-none shrink-0", className)}>
      <svg
        width={size}
        height={cy + strokeWidth + 4}
        viewBox={`0 0 ${size} ${cy + strokeWidth + 4}`}
        className="overflow-visible"
      >
        {/* Background Track Arc */}
        <path
          d={`M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
          fill="none"
          stroke="rgba(0, 0, 0, 0.15)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="dark:stroke-white/15"
        />

        {/* Indicator Value Arc */}
        <path
          d={`M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${cy}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={arcLength}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />

        {/* Mathematically Centered Score Value (Zero Arc Touch) */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fill="currentColor"
          className="font-mono font-extrabold text-black dark:text-white fill-black dark:fill-white"
          style={{ fontSize: `${valFontSize}px` }}
        >
          {normalizedValue}%
        </text>

        {/* Label Text */}
        {label && (
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            fill="currentColor"
            className="font-mono font-bold uppercase tracking-wider text-black/75 dark:text-white/75 fill-black/75 dark:fill-white/75"
            style={{ fontSize: `${labelFontSize}px` }}
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}
