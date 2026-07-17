"use client";

import { motion } from "motion/react";
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-[#ea580c] focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-[#ea580c] text-zinc-950 hover:bg-[#f97316] font-bold shadow-[0_0_20px_rgba(234,88,12,0.15)]",
        outline: "border-[#27272A] bg-[#111217]/50 hover:bg-[#18181B] hover:border-[#ea580c]/40 text-zinc-300 hover:text-zinc-100",
        secondary: "bg-[#18181B] text-zinc-200 border border-[#27272A] hover:bg-[#27272A] hover:text-zinc-50",
        ghost: "text-zinc-400 hover:bg-[#18181B]/50 hover:text-zinc-100",
        destructive: "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 hover:bg-[#EF4444]/20",
        link: "text-[#ea580c] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-4 text-xs font-bold",
        xs: "h-6 gap-1 px-2 text-[10px] font-semibold rounded-md",
        sm: "h-8 gap-1.5 px-3 text-xs font-semibold rounded-md",
        lg: "h-11 gap-2 px-6 text-sm font-extrabold",
        icon: "size-9 rounded-lg flex items-center justify-center p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const { onDrag, ...motionProps } = props as any;
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(buttonVariants({ variant, size, className }))}
        {...motionProps}
      >
        {/* Subtle hover gradient shine inside the default button */}
        {variant === "default" && (
          <span className="absolute inset-0 w-[200%] h-full bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.25),55%,transparent)] bg-[length:200%_100%] animate-shimmer pointer-events-none z-0" />
        )}
        <span className="relative z-10 flex items-center justify-center gap-1.5">
          {children}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export { buttonVariants };
