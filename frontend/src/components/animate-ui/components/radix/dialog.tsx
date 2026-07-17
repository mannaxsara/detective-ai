"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { motion, AnimatePresence } from "motion/react";
import React, { createContext, useContext } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const DialogOpenContext = createContext<boolean>(false);

export function Dialog({ children, ...props }: DialogPrimitive.Root.Props) {
  return (
    <DialogPrimitive.Root data-slot="dialog" {...props}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

export function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  from?: "top" | "bottom" | "left" | "right" | "center";
  showCloseButton?: boolean;
  children: React.ReactNode;
}

export function DialogContent({
  className,
  children,
  from = "center",
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  const getVariants = () => {
    switch (from) {
      case "top":
        return { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -20, opacity: 0 } };
      case "bottom":
        return { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 20, opacity: 0 } };
      case "left":
        return { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 } };
      case "right":
        return { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 20, opacity: 0 } };
      default:
        return { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 } };
    }
  };

  const variants = getVariants();

  return (
    <DialogPortal>
      <DialogPrimitive.Backdrop
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-150 data-closed:opacity-0"
      />
      <DialogPrimitive.Popup
        className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
        {...props}
      >
        <motion.div
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-xl border border-[#27272A] bg-[#111217] p-5 text-sm text-zinc-200 shadow-2xl outline-none sm:max-w-sm",
            className
          )}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 rounded-lg border border-transparent hover:border-[#27272A] hover:bg-[#18181B] text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </DialogPrimitive.Close>
          )}
        </motion.div>
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-4", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-bold text-zinc-100 uppercase tracking-wide", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-zinc-400 font-semibold leading-normal", className)} {...props} />;
}
