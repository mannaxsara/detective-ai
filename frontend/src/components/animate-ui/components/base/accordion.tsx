"use client";

import { motion, AnimatePresence } from "motion/react";
import React, { createContext, useContext, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextType {
  activeValues: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  multiple?: boolean;
  defaultValue?: string[];
  children: React.ReactNode;
}

export function Accordion({
  multiple = false,
  defaultValue = [],
  children,
  className,
  ...props
}: AccordionProps) {
  const [activeValues, setActiveValues] = useState<string[]>(defaultValue);

  const toggleItem = (value: string) => {
    setActiveValues((prev) => {
      if (multiple) {
        return prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value];
      } else {
        return prev.includes(value) ? [] : [value];
      }
    });
  };

  return (
    <AccordionContext.Provider value={{ activeValues, toggleItem }}>
      <div className={cn("space-y-2", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextType {
  value: string;
}

const AccordionItemContext = createContext<AccordionItemContextType | null>(null);

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export function AccordionItem({
  value,
  children,
  className,
  ...props
}: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div
        className={cn(
          "border border-[#27272A] bg-[#111217]/40 rounded-xl overflow-hidden transition-all duration-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  showArrow?: boolean;
  children: React.ReactNode;
}

export function AccordionTrigger({
  showArrow = true,
  children,
  className,
  ...props
}: AccordionTriggerProps) {
  const accordionContext = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!accordionContext || !itemContext) {
    throw new Error("AccordionTrigger must be used inside Accordion and AccordionItem");
  }

  const { activeValues, toggleItem } = accordionContext;
  const { value } = itemContext;
  const isOpen = activeValues.includes(value);

  return (
    <button
      type="button"
      onClick={() => toggleItem(value)}
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 text-left text-xs font-bold text-zinc-200 hover:text-zinc-50 cursor-pointer select-none transition-colors",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {showArrow && (
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="text-zinc-500"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      )}
    </button>
  );
}

export interface AccordionPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  keepRendered?: boolean;
  children: React.ReactNode;
}

export function AccordionPanel({
  keepRendered = false,
  children,
  className,
  ...props
}: AccordionPanelProps) {
  const accordionContext = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!accordionContext || !itemContext) {
    throw new Error("AccordionPanel must be used inside Accordion and AccordionItem");
  }

  const { activeValues } = accordionContext;
  const { value } = itemContext;
  const isOpen = activeValues.includes(value);

  return (
    <AnimatePresence initial={false}>
      {(isOpen || keepRendered) && (
        <motion.div
          initial={isOpen ? { height: 0, opacity: 0 } : false}
          animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className={cn("px-4 pb-4 pt-1 text-[11px] text-zinc-400 font-semibold leading-relaxed border-t border-[#27272A]/50 bg-[#09090B]/10", className)} {...props}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
