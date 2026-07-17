"use client";

import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export const ArrowIcon = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "group flex items-center justify-center transition-all",
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <ChevronRight className="w-4 h-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
        <div className="absolute right-[11px] h-[2px] w-2 origin-right scale-x-0 rounded-[1px] bg-current transition-all duration-200 ease-out group-hover:scale-x-100 group-hover:right-[8px]"></div>
      </div>
    </div>
  );
};

export const MenuIcon = ({
  className,
  toggle,
  setToggle,
}: {
  className?: string;
  toggle: boolean;
  setToggle: (x: boolean) => void;
}) => {
  return (
    <div
      onClick={() => setToggle(!toggle)}
      className={cn(
        "group flex items-center justify-center cursor-pointer p-1.5 rounded-lg border border-[#27272A] bg-[#09090B] hover:bg-[#18181B] transition-colors",
        className,
      )}
    >
      <div className="relative grid size-3.5 items-center justify-center">
        <motion.div
          animate={{ y: toggle ? 0 : -4, rotate: toggle ? 45 : 0 }}
          className="absolute h-0.5 w-3.5 rounded-full bg-zinc-350"
        />
        <motion.div
          animate={{ opacity: toggle ? 0 : 1 }}
          transition={{ duration: 0.1 }}
          className="absolute h-0.5 w-3.5 rounded-full bg-zinc-350"
        />
        <motion.div
          animate={{ y: toggle ? 0 : 4, rotate: toggle ? -45 : 0 }}
          className="absolute h-0.5 w-3.5 rounded-full bg-zinc-350"
        />
      </div>
    </div>
  );
};

export const VolumeIcon = ({
  className,
  isMuted,
  setIsMuted,
}: {
  className?: string;
  isMuted: boolean;
  setIsMuted: (x: boolean) => void;
}) => {
  return (
    <div
      onClick={() => setIsMuted(!isMuted)}
      className={cn(
        "group flex cursor-pointer items-center justify-center p-1.5 rounded-lg border border-[#27272A] bg-[#09090B] hover:bg-[#18181B] transition-colors",
        className,
      )}
    >
      <motion.div
        initial={false}
        className="relative flex size-4 items-center justify-center"
        animate={{
          rotate: isMuted ? [0, -15, 5, -2, 0] : 0,
        }}
        transition={{ duration: 0.4 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 text-zinc-350"
        >
          <path
            fill="currentColor"
            stroke="none"
            d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"
          />

          <motion.g animate={{ opacity: isMuted ? 0 : 1 }}>
            <path
              fill="none"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke="currentColor"
              d="M16 9a5 5 0 0 1 0 6"
            />
            <path
              fill="none"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke="currentColor"
              d="M19.364 18.364a9 9 0 0 0 0-12.728"
            />
          </motion.g>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rotate-[-40deg] overflow-hidden">
            <motion.div
              animate={{ scaleY: isMuted ? 1 : 0 }}
              transition={{
                ease: "easeInOut",
                duration: isMuted ? 0.125 : 0.05,
                delay: isMuted ? 0.15 : 0,
              }}
              style={{
                transformOrigin: "top",
              }}
              className="h-[14px] w-fit rounded-full"
            >
              <div className="bg-[#09090B] flex h-full w-[2.5px] items-center justify-center rounded-full">
                <div className="bg-[#EF4444] h-full w-[1.5px] rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
