"use client";

import React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function AlertDialog({ children, ...props }: DialogPrimitive.Root.Props) {
  return (
    <DialogPrimitive.Root data-slot="alert-dialog" {...props}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function AlertDialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

export function AlertDialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  from?: "top" | "bottom" | "left" | "right" | "center";
  children: React.ReactNode;
}

export function AlertDialogContent({
  className,
  children,
  from = "center",
  ...props
}: AlertDialogContentProps) {
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
    <AlertDialogPortal>
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
        </motion.div>
      </DialogPrimitive.Popup>
    </AlertDialogPortal>
  );
}

export function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-4", className)} {...props} />;
}

export function AlertDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-bold text-zinc-100 uppercase tracking-wide", className)} {...props} />;
}

export function AlertDialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-zinc-400 font-semibold leading-normal", className)} {...props} />;
}

export function AlertDialogCancel({ ...props }: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      className="inline-flex h-9 items-center justify-center rounded-lg border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] px-4 text-xs font-bold text-zinc-300 hover:text-zinc-50 transition-colors cursor-pointer"
      {...props}
    />
  );
}

export function AlertDialogAction({ ...props }: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      className="inline-flex h-9 items-center justify-center rounded-lg bg-[#EF4444] hover:bg-red-700 px-4 text-xs font-bold text-white transition-colors cursor-pointer"
      {...props}
    />
  );
}
