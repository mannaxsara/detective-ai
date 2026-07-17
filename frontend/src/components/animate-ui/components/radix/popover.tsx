"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { motion, AnimatePresence } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";

export function Popover({ children, ...props }: PopoverPrimitive.Root.Props) {
  return (
    <PopoverPrimitive.Root data-slot="popover" {...props}>
      {children}
    </PopoverPrimitive.Root>
  );
}

export function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

export function PopoverPortal({ ...props }: PopoverPrimitive.Portal.Props) {
  return <PopoverPrimitive.Portal data-slot="popover-portal" {...props} />;
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  children: React.ReactNode;
}

export function PopoverContent({
  className,
  children,
  side = "bottom",
  sideOffset = 8,
  align = "center",
  alignOffset = 0,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPortal>
      <PopoverPrimitive.Popup
        className="z-50 focus:outline-none"
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: side === "bottom" ? -4 : 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: side === "bottom" ? -4 : 4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn(
            "rounded-xl border border-[#27272A] bg-[#111217] p-4 text-sm text-zinc-200 shadow-2xl outline-none sm:max-w-sm",
            className
          )}
        >
          {children}
        </motion.div>
      </PopoverPrimitive.Popup>
    </PopoverPortal>
  );
}
