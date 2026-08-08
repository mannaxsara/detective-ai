"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      icons={{
        success: (
          <CircleCheckIcon className="w-4 h-4 text-[#31e992] shrink-0" />
        ),
        info: (
          <InfoIcon className="w-4 h-4 text-[#edfe5e] shrink-0" />
        ),
        warning: (
          <TriangleAlertIcon className="w-4 h-4 text-amber-500 shrink-0" />
        ),
        error: (
          <OctagonXIcon className="w-4 h-4 text-[#bc3e3e] shrink-0" />
        ),
        loading: (
          <Loader2Icon className="w-4 h-4 text-[#edfe5e] animate-spin shrink-0" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group font-sans rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-[#181914] text-black dark:text-white shadow-2xl p-4 flex items-center gap-3 text-xs font-semibold",
          description: "text-black/60 dark:text-white/60 text-[11px] font-normal",
          actionButton: "bg-[#edfe5e] text-black font-mono font-bold text-xs px-3 py-1.5 rounded-lg border border-black/20",
          cancelButton: "bg-black/10 dark:bg-white/10 text-black dark:text-white font-mono text-xs px-3 py-1.5 rounded-lg",
          closeButton:
            "!left-auto !right-2 !top-2.5 !bg-transparent !border-0 !text-black/50 dark:!text-white/50 hover:!text-black dark:hover:!text-white transition-colors",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
