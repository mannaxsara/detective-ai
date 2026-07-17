"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { motion, AnimatePresence } from "motion/react";
import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<CheckboxPrimitive.Root.Props, "checked" | "onCheckedChange"> {
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean) => void;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, variant = "default", size = "default", ...props }, ref) => {
    const isChecked = checked === true || checked === "indeterminate";

    return (
      <CheckboxPrimitive.Root
        ref={ref}
        checked={isChecked}
        onCheckedChange={(checkedState) => {
          if (onCheckedChange) {
            onCheckedChange(checkedState === true);
          }
        }}
        className={cn(
          "peer flex items-center justify-center shrink-0 rounded border border-[#27272A] bg-[#09090B] text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea580c] disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer",
          size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4",
          isChecked && "bg-[#ea580c] border-[#ea580c] text-[#09090B]",
          className
        )}
        {...props}
      >
        <AnimatePresence initial={false}>
          {isChecked && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Check className={cn("stroke-[3.5]", size === "sm" ? "size-2.5" : size === "lg" ? "size-3.5" : "size-3")} />
            </motion.div>
          )}
        </AnimatePresence>
      </CheckboxPrimitive.Root>
    );
  }
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
