"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { motion, AnimatePresence } from "motion/react";
import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

interface HoverCardContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const HoverCardContext = createContext<HoverCardContextType | null>(null);

export interface HoverCardProps {
  children: React.ReactNode;
  followCursor?: boolean | "x" | "y";
}

export function HoverCard({ children, followCursor = false }: HoverCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <HoverCardContext.Provider value={{ open, setOpen }}>
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="relative inline-block"
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  );
}

export interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

export function HoverCardTrigger({ asChild, children, className, ...props }: HoverCardTriggerProps) {
  return (
    <div className={cn("inline-block cursor-pointer", className)} {...props}>
      {children}
    </div>
  );
}

export interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  children: React.ReactNode;
}

export function HoverCardContent({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: HoverCardContentProps) {
  const context = useContext(HoverCardContext);
  if (!context) {
    throw new Error("HoverCardContent must be used inside HoverCard");
  }

  const { open } = context;

  const getPositionStyles = () => {
    switch (side) {
      case "top":
        return "bottom-full left-1/2 -translate-x-1/2 mb-2";
      case "left":
        return "right-full top-1/2 -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 -translate-y-1/2 ml-2";
      default:
        return "top-full left-1/2 -translate-x-1/2 mt-2";
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: side === "bottom" ? -4 : 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: side === "bottom" ? -4 : 4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn(
            "absolute z-50 rounded-xl border border-[#27272A] bg-[#111217] p-4 text-zinc-200 shadow-2xl outline-none min-w-[200px] pointer-events-none select-none",
            getPositionStyles(),
            className
          )}
          {...(props as any)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
