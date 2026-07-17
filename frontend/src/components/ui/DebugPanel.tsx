"use client";

import { useMotionValue } from "framer-motion";
import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const DebugPanel = ({
  className,
  ...props
}: Record<string, any> & { className?: string }) => {
  return (
    <div
      className={cn(
        "font-mono text-[9px] text-[#ea580c]",
        className,
      )}
    >
      {"{"}
      {Object.entries(props).map(([key, value]) => (
        <div key={key} className="ml-4 flex items-center gap-1">
          <span className="text-zinc-500">{key}:</span>
          {value && typeof value === "object" && "get" in value ? (
            <motion.span className="text-[#ea580c] font-bold">{value as any}</motion.span>
          ) : typeof value === "boolean" ? (
            <span className="text-[#10B981] font-bold">{value ? "true" : "false"}</span>
          ) : (
            <span className="text-zinc-300 font-semibold">{String(value)}</span>
          )}
          <span className="text-zinc-600">;</span>
        </div>
      ))}
      {"}"}
    </div>
  );
};

export const Skiper102 = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [count, setCount] = useState(0);
  const [keyPressed, setKeyPressed] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeyPressed(e.key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      onMouseMove={(e) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }}
      onClick={() => setCount((prev) => prev + 1)}
      className="flex size-full flex-col items-center justify-center p-6 border border-[#27272A] bg-[#111217] rounded-xl w-64 shadow-none"
    >
      <div className="mb-4 grid content-start justify-items-center gap-2 text-center">
        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
          Telemetry Panel
        </span>
      </div>
      <DebugPanel
        count={count}
        mouseX={mouseX}
        mouseY={mouseY}
        keyPressed={keyPressed || "None"}
      />
    </div>
  );
};
