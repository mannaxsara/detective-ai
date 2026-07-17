"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - left,
      y: e.clientY - top,
    });
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "group/bento shadow-input row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-[#27272A] bg-[#111217]/40 p-4 transition duration-300 relative overflow-hidden hover:shadow-2xl hover:border-[#ea580c]/30 cursor-pointer",
        className,
      )}
    >
      {/* Interactive cursor tracking glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          background: `radial-gradient(180px circle at ${coords.x}px ${coords.y}px, rgba(234, 88, 12, 0.09), transparent 80%)`,
        }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        {header}
        <div className="transition duration-200 group-hover/bento:translate-x-1.5">
          {icon}
          <div className="mt-2 mb-1 font-sans font-bold text-zinc-200">
            {title}
          </div>
          <div className="font-sans text-xs font-semibold text-zinc-550 leading-normal">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};
