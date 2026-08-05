"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface FunnelStage {
  label: string;
  value: number;
  displayValue: string;
}

interface FunnelChartProps {
  data: FunnelStage[];
  color?: string;
  layers?: number;
  edges?: 'curved' | 'straight';
  orientation?: 'horizontal' | 'vertical';
  gap?: number;
  staggerDelay?: number;
  showPercentage?: boolean;
  height?: number | string;
  className?: string;
}

export function FunnelChart({
  data,
  color = "#d8cfbc",
  layers = 3,
  edges = 'curved',
  orientation = 'horizontal',
  gap = 4,
  staggerDelay = 0.12,
  showPercentage = true,
  height = 200,
  className = "",
}: FunnelChartProps) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div className={cn("w-full flex items-center justify-between font-sans", className)} style={{ height, gap: `${gap}px` }}>
      {data.map((stage, idx) => {
        const ratio = maxVal > 0 ? stage.value / maxVal : 0;
        const prevRatio = idx > 0 && maxVal > 0 ? data[idx - 1].value / maxVal : 1;
        
        // Calculate conversion from previous
        const conversion = idx > 0 && data[idx - 1].value > 0 
          ? (stage.value / data[idx - 1].value) * 100 
          : null;

        return (
          <React.Fragment key={idx}>
            {/* Conversion Badge */}
            {idx > 0 && showPercentage && conversion !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * staggerDelay + 0.2 }}
                className="z-10 bg-muted/80 backdrop-blur text-foreground border border-border px-2 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap shadow-sm"
              >
                {conversion.toFixed(1)}%
              </motion.div>
            )}

            {/* Stage Segment */}
            <motion.div
              className="relative flex-1 h-full flex flex-col justify-center group"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * staggerDelay, type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="w-full relative flex items-center justify-center" style={{ height: '100%' }}>
                {Array.from({ length: layers }).map((_, lIdx) => {
                  const scaleY = 1 + (lIdx * 0.15); // Outer rings scale up slightly
                  const opacity = 1 - (lIdx * (1 / layers));
                  
                  // For a horizontal funnel, we clip paths. Here we use basic divs with bordered radius for "curved" look
                  const heightPercent = Math.max(10, ratio * 100);
                  
                  return (
                    <div
                      key={lIdx}
                      className="absolute left-0 right-0 m-auto transition-all duration-300"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: lIdx === 0 ? color : 'transparent',
                        border: lIdx > 0 ? `1px solid ${color}` : 'none',
                        opacity: opacity * (1 - (idx * 0.15)), // Dimming per stage
                        borderRadius: edges === 'curved' ? '12px' : '2px',
                        transform: `scaleY(${scaleY})`,
                        zIndex: layers - lIdx
                      }}
                    />
                  );
                })}
              </div>
              
              {/* Labels below */}
              <div className="absolute -bottom-8 left-0 w-full text-center">
                <div className="font-bold text-xs text-foreground truncate">{stage.label}</div>
                <div className="text-[10px] font-mono text-muted-foreground">{stage.displayValue}</div>
              </div>
            </motion.div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
