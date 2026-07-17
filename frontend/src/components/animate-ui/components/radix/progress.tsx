"use client";

import { motion } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const cappedValue = Math.min(100, Math.max(0, value));

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-[#18181B] border border-[#27272A]",
          className
        )}
        {...props}
      >
        <motion.div
          className="h-full bg-[#ea580c]"
          initial={{ width: 0 }}
          animate={{ width: `${cappedValue}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";
export default Progress;
