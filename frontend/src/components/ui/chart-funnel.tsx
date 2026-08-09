"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface FunnelStage {
  label: string;
  value: number;
  displayValue: string;
}

interface FunnelChartProps {
  data: FunnelStage[];
  height?: number | string;
  className?: string;
}

export function FunnelChart({
  data,
  className = "",
}: FunnelChartProps) {
  if (!data || data.length === 0) return null;

  const stageMeta = [
    { bg: "bg-[#edfe5e]", border: "border-black", text: "text-black", tag: "IDENTIFIED" },
    { bg: "bg-[#31e992]", border: "border-black", text: "text-black", tag: "SANITIZED" },
    { bg: "bg-[#edf0e9] dark:bg-[#262720]", border: "border-black/20 dark:border-white/20", text: "text-black dark:text-white", tag: "PENDING" },
  ];

  return (
    <div className={cn("w-full grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-left", className)}>
      {data.map((stage, idx) => {
        const meta = stageMeta[idx % stageMeta.length];
        
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className={`p-4 rounded-[14px] border ${meta.border} ${meta.bg} ${meta.text} flex flex-col justify-between space-y-3 shadow-[2px_2px_0px_#000000] relative overflow-hidden`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80">
                {stage.label}
              </span>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-black/20 bg-black/10 text-current">
                {meta.tag}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-mono font-extrabold tracking-tight">
                {stage.displayValue}
              </span>
              {idx < data.length - 1 && (
                <ArrowRight className="w-4 h-4 opacity-50 shrink-0 hidden sm:block" />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
